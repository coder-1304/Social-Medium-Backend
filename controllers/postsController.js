const postModel = require("../models/postModel");
const categoryModel = require("../models/postCategoryModel");
const User = require("../models/userModel");

module.exports.createPost = async (req, res) => {
  try {
    console.log(req.body);
    let { caption, imageUrl, category, public } = req.body;
    // if (!caption || !imageUrl) {
    //   return res.status(400).json({
    //     success: false,
    //     msg: "Please fill all fields",
    //   });
    // }

    const filter = { category: category };

    const update = {
      $inc: { postsCount: 1 },
    };

    const options = {
      new: true,
    };
    await categoryModel.findOneAndUpdate(filter, update, options);

    if (public) {
      public = true;
    } else {
      public = false;
    }
    // console.log("1")

    const postData = new postModel({
      caption: caption,
      imageUrl: imageUrl,
      public: public,
      category: category,
      authorUsername: req.user.username,
      authorName: req.user.name,
      authorAvatar: req.user.avatarImage,
      likes: [],
      dislikes: [],
      comments: [],
    });
    // console.log("2")

    await postData.save();
    // console.log("3")

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      msg: "Internal Server Error",
    });
  }
};

module.exports.addCategory = async (req, res) => {
  try {
    const categories = req.body.categories;

    await categories.forEach((category) => {
      const newCategory = new categoryModel({
        category: category,
      });
      newCategory.save();
    });

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
module.exports.fetchCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find();

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports.fetchPosts = async (req, res) => {
  try {
    const { filters, interests, categories } = req.body;
    console.log(req.body);

    let allFilters = {};
    let filtersQueries = [];

    async function filtersQuery() {
      if (filters === "all") {
        let query = {
          public: true,
        };
        return query;
        // filtersQueries.push(query);
      } else {
        let query = {
          authorUsername: { $in: req.user.friends },
        };
        // filtersQueries.push(query);
        return query;
      }
    }
    async function interestsQuery() {
      if (categories.length === 0) {
        if (interests == "interest") {
          let query = {
            category: { $in: req.user.interests },
          };
          // filtersQueries.push(query);
          return query;
        } else {
        }
      } else {
        let query = {
          category: { $in: categories },
        };
        // filtersQueries.push(query);
        return query;
      }
    }
    const q1 = await filtersQuery();
    const q2 = await interestsQuery();
    if (q1) {
      filtersQueries.push(q1);
    }
    if (q2) {
      filtersQueries.push(q2);
    }

    console.log("FILTER QUERY: " + filtersQueries.length);
    console.log(filtersQueries);

    // return res.end();
    const posts = await postModel.find({
      $and: filtersQueries,
    });

    return res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
module.exports.likePost = async (req, res) => {
  try {
    // console.log("Liking Post");
    let _id = req.body._id;
    // postId = postId.replace(/\s/g, "");
    // console.log("Post Id is" + postId);

    const post = await postModel.findOne({ _id: _id });
    if (!post.likes.includes(req.user.username)) {
      post.likes.push(req.user.username);
      await post.save();
      // res.json({})
    } else {
      console.log(`${req.user.username} already exists in the likes array.`);
      return res.status(200).json({
        success: true,
      });
    }

    if (post.dislikes.includes(req.user.username)) {
      const result = await postModel.updateOne(
        { _id: _id },
        { $pull: { dislikes: req.user.username } }
      );
      console.log(result);
    }

    // console.log(req.user.username + "---" + post.authorUsername);
    // console.log(req.user.username == post.authorUsername);
    if (req.user.username == post.authorUsername) {
      return res.status(200).json({
        success: true,
      });
    }

    const notification = `${req.user.name} liked your post`;
    const newNotification = {
      notification: notification,
      notificationAbout: post.content,
      postId: _id,
    };
    // const user = await User.findOne({ username: post.authorUsername });
    // console.log(typeof user.newNotifications);
    // let n = user.newNotifications;
    // n++;
    req.user.newNotification = req.user.newNotification + 1;
    req.user.notifications.push(newNotification);
    // req.user.newNotifications = n;
    req.user.save();
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
module.exports.dislikePost = async (req, res) => {
  try {
    let _id = req.body._id;
    const post = await postModel.findOne({ _id });
    if (!post.dislikes.includes(req.user.username)) {
      post.dislikes.push(req.user.username);
      await post.save();
    } else {
      return res.status(200).json({
        success: true,
      });
    }

    if (post.likes.includes(req.user.username)) {
      await postModel.updateOne(
        { _id: _id },
        { $pull: { likes: req.user.username } }
      );
    }
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
