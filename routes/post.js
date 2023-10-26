const { addCategory,fetchCategories,createPost,fetchPosts } = require("../controllers/postsController");
const router = require("express").Router();


const auth = require("../middlewares/auth")
router.post("/addCategory", addCategory);
router.get("/fetchCategories", fetchCategories);
router.post("/createPost",auth, createPost);
router.post("/fetchPosts",auth, fetchPosts);

module.exports = router;
