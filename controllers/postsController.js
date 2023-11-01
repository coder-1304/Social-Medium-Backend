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

    function createQuery() {
      let query;

      if (filters === "all") {
        if (categories.length === 0) {
          if (interests === "all") {
            // Show all accessible posts
            query = {
              $or: [
                { public: true },
                {
                  authorUsername: { $in: req.user.friends },
                },
              ],
            };
          } else {
            // Show all posts in user's interests
            query = {
              $and: [
                { category: { $in: req.user.interests } },
                {
                  $or: [
                    { public: true },
                    {
                      authorUsername: { $in: req.user.friends },
                    },
                  ],
                },
              ],
            };
          }
        } else {
          // Show all but user specified some categories
          query = {
            $and: [
              {
                $or: [
                  { public: true },
                  {
                    authorUsername: { $in: req.user.friends },
                  },
                ],
              },
              { category: { $in: categories } },
            ],
          };
        }
      } else {
        if (categories.length === 0) {
          // Show only friends posts
          if (interests === "all") {
            // Show all posts of friends:
            query = {
              authorUsername: { $in: req.user.friends },
            };
          } else {
            // Show all posts of friends which is in user's interest categories:
            query = {
              $and: [
                { authorUsername: { $in: req.user.friends } },
                { category: { $in: req.user.interests } },
              ],
            };
          }
        } else {
          // Show only friends posts with the given categories
          query = {
            $and: [
              {
                authorUsername: { $in: req.user.friends },
              },

              { category: { $in: categories } },
            ],
          };
        }
      }
      return query;
    }
    // END===============================================================

    let filteredQuery = createQuery();

    console.log("FILTER QUERY: ");
    console.log(filteredQuery);

    // return res.end();
    const posts = await postModel.find(filteredQuery);

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

module.exports.addComment = async (req, res) => {
  try {
    let { postId, timestamp } = req.body;

    const post = await postModel.findOne({ _id: postId });
    const comment = {
      username: req.user.username,
      name: req.user.name,
      comment: req.body.comment,
      photo: req.user.avatar,
      timestamp: timestamp,
    };
    post.comments.push(comment);
    await post.save();

    if (req.user.username === post.authorUsername) {
      return res.status(200).json({
        success: true,
      });
    }

    const notification = `${req.user.name} commented "${req.body.comment}" on your post`;
    const newNotification = {
      notification: notification,
      notificationAbout: "comments",
      postId: postId,
    };
    const user = await User.findOne({ username: post.authorUsername });

    // let n = user.newNotifications;
    // n++;
    user.notifications.push(newNotification);
    user.newNotifications = user.newNotifications + 1;
    await user.save();

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

module.exports.getComments = async (req, res, next) => {
  try {
    console.log("Getting Comments...");
    let postId = req.params.postId;
    postId = postId.replace(/\s/g, "");
    const post = await postSchema.findOne({ _id: postId });
    console.log("Got Comments  " + post.comments);
    res.send(post.comments);
    res.end();
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};
module.exports.countPosts = async (req, res, next) => {
  try {
    const count = await postModel.countDocuments({});
    return res.status(200).json({
      success: true,
      count: count
    })

  } catch (error) {
    console.log(error);
    res.send(error);
  }
};


