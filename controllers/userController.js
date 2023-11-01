const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const postModel = require("../models/postModel");

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

    req.user = user;

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
      interests: [],
    });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllFriends = async (req, res, next) => {
  try {
    const users = await User.find({
      username: {
        $in: req.user.friends,
      },
    }).select(["email", "username", "name", "avatarImage", "_id"]);
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
      return res.status(400).json({ success: false });
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

module.exports.fetchRequests = async (req, res, next) => {
  try {
    const result = await User.find({
      username: {
        $in: req.user.friendReq,
      },
    }).select("name username avatarImage");
    return res.status(200).json({
      success: true,
      result,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.addFriend = async (req, res, next) => {
  console.log("ADDING");
  try {
    let fUsername = req.params.username;
    let myUsername = req.user.username;
    if (fUsername == myUsername) {
      return res.end();
    }

    //add me to friend's list
    let searchUser = await User.findOne({ username: fUsername });
    let friends = searchUser.friends;
    friends.push(req.user.username);
    searchUser.friends = friends;
    searchUser.save();

    let currFriends = req.user.friends;
    currFriends.push(fUsername);
    let friendReq = req.user.friendReq;
    for (let i = 0; i < friendReq.length; i++) {
      if (friendReq[i] == fUsername) {
        friendReq.splice(i, 1);
        break;
      }
    }
    req.user.friendReq = friendReq;
    req.user.save();

    // Adding Notification
    const notification = `${myUsername} accepted your friend request`;
    const newNotification = {
      notification: notification,
      notificationAbout: "",
      postId: "Na",
    };
    const user = await User.findOne({ username: fUsername });
    let n = user.newNotifications;
    n++;
    user.newNotifications = n;
    user.notifications.push(newNotification);
    user.save();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports.changeProfilePhoto = async (req, res, next) => {
  try {
    // console.log("CHANGING")
    req.user.avatarImage = req.body.imageUrl;
    await req.user.save();

    postModel.updateMany(
      { authorUsername: req.user.username },
      { $set: { authorAvatar: req.body.imageUrl } },
      (err, result) => {
        if (err) {
          console.error(err);
        } else {
          console.log(`Updated ${result.modifiedCount} documents.`);
        }
      }
    );

    return res.status(200).json({
      success: true,
    });
  } catch (ex) {
    res.status(400).json({ success: false });
    next(ex);
  }
};
module.exports.fetchInterests = async (req, res, next) => {
  try {
    const interests = await req.user.interests;
    return res.status(200).json({
      success: true,
      interests,
    });
  } catch (ex) {
    res.status(500).json({ success: false });
    next(ex);
  }
};
module.exports.updateInterests = async (req, res, next) => {
  try {
    const interests = req.body.interests;
    req.user.interests = interests;
    req.user.save();
    return res.status(200).json({
      success: true,
    });
  } catch (ex) {
    res.status(500).json({ success: false });
    next(ex);
  }
};

module.exports.fetchProfileDetails = async (req, res, next) => {
  try {
    const username = req.query.username;
    // console.log(req.user.friends.includes(username));
    console.log(username);
    if (req.user.username !== username) {
      if (!req.user.friends.includes(username)) {
        const result = await postModel.find({authorUsername: username,public:true});
        const count = await postModel.countDocuments({ authorUsername: username,public:true });
        const user = await User.findOne({ username });
        // console.log(count);
        let reqSent = false;
        if(user.friendReq.includes(req.user.username)){
          reqSent=true;
        }
        return res.status(200).json({
          success: true,
          username: user.username,
          name: user.name,
          avatarImage: user.avatarImage,
          categories: user.interests,
          posts: result,
          postsCount: count,
          isFriend: false,
          reqSent: reqSent
        });
      }
    }
    const result = await postModel.find({ authorUsername: username });
    const user = await User.findOne({ username });
    return res.status(200).json({
      success: true,
      username: user.username,
      name: user.name,
      avatarImage: user.avatarImage,
      categories: user.interests,
      posts: result,
      postsCount: result.length,
      isFriend: true
    });
  } catch (ex) {
    res.status(500).json({ success: false });
    next(ex);
  }
};

module.exports.fetchUserDetails = async (req, res, next) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username });
    return res.status(200).json({
      success: true,
      imageUrl: user.avatarImage,
    });
  } catch (ex) {
    res.status(500).json({ success: false });
    next(ex);
  }
};
