const {
  addCategory,
  fetchCategories,
  createPost,
  fetchPosts,
  likePost,
  dislikePost,
} = require("../controllers/postsController");
const router = require("express").Router();

const auth = require("../middlewares/auth");
router.post("/addCategory", addCategory);
router.get("/fetchCategories", fetchCategories);
router.post("/createPost", auth, createPost);
router.post("/fetchPosts", auth, fetchPosts);
router.post("/likePost", auth, likePost);
router.post("/dislikePost", auth, dislikePost);

module.exports = router;
