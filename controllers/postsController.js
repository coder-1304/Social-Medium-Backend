const postModel = require("../models/postModel");
const categoryModel = require("../models/postCategoryModel");

module.exports.createPost = async (req, res) => {
  try {
    console.log(req.body);
    let { caption, imageUrl, category, public } = req.body;
    if (!caption || !imageUrl) {
      return res.status(400).json({
        success: false,
        msg: "Please fill all fields",
      });
    }

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
    await postData.save();
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
    const posts = await postModel.find();

    return res.status(200).json({
      success: true,
      posts
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
