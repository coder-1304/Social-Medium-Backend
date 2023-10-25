const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    delete user.password;

    req.user=user;

    console.log("SIGNING JWT");
    const token = await jwt.sign({ username }, process.env.JWTSECRETKEY, {
      expiresIn: "300h",
    });
    console.log("SIGNED JWT");
    req.user.token = token;
    req.user.save();
    return res.json({ status: true, user });
  } catch (ex) {
    console.log(ex);
    next(ex);
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign({ username }, process.env.JWTSECRETKEY, {
      expiresIn: "300h",
    });
    const user = await User.create({
      name,
      email,
      username,
      token,
      password: hashedPassword,
    });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);
    // console.log(users);
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.logOut = (req, res, next) => {
  try {
    if (!req.params.id) return res.json({ msg: "User id is required " });
    onlineUsers.delete(req.params.id);
    return res.status(200).send();
  } catch (ex) {
    next(ex);
  }
};

module.exports.searchUsers = async (req, res, next) => {
  try {
    // console.log("Searching");
    const text = req.params.text;
    const results = await User.find({
      $or: [
        { name: { $regex: text, $options: "i" } },
        { username: { $regex: text, $options: "i" } },
      ],
    }).select("name username avatarImage");

    return res.status(200).json({
      success: true,
      results,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.sendFriendRequest = async (req, res, next) => {
  try {
    const username = req.params.username;
    if (req.user.username == username || req.user.friends.includes(username)) {
      return res.status(400).json({success:false})
    }
    const searchUser = await User.findOne({ username: username });
    let requests = searchUser.friendReq;
    if (!requests.includes(req.user.username)) {
      requests.push(req.user.username);
      searchUser.friendReq = requests;
      searchUser.save();
    }

    // Adding Notification
    const notification = `${req.user.username} sent you a friend request`;
    const newNotification = {
      notification: notification,
      notificationAbout: "",
      postId: "",
    };
    const user = await User.findOne({ username: username });
    let n = user.newNotifications;
    n++;
    user.newNotifications = n;
    user.notifications.push(newNotification);
    user.save();
    // res.end();
    return res.status(200).json({
      success: true,
    });
  } catch (ex) {
    next(ex);
  }
};
