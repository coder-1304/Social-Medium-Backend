const {
  login,
  register,
  getAllFriends,
  setAvatar,
  logOut,
  searchUsers,
  sendFriendRequest,
  fetchRequests,
  addFriend,
  changeProfilePhoto,
  fetchInterests,
  updateInterests,
  fetchProfileDetails,
  fetchUserDetails
} = require("../controllers/userController");

const auth = require("../middlewares/auth");

const router = require("express").Router();

// Routings:

router.post("/", (req,res)=>{
  res.send("HELLO FROM SERVER");
});
router.post("/login", login);
router.post("/register", register);
router.get("/allFriends",auth, getAllFriends);
router.post("/setavatar/:id", setAvatar);
router.get("/logout/:id", logOut);
router.get("/searchUsers/:text", searchUsers);
router.get("/sendFriendRequest/:username",auth, sendFriendRequest);
router.get("/fetchRequests",auth, fetchRequests);
router.get("/addFriend/:username",auth, addFriend);
router.post("/changeProfilePhoto",auth, changeProfilePhoto);
router.get("/fetchInterests",auth, fetchInterests);
router.post("/updateInterests",auth, updateInterests);
router.get("/fetchProfileDetails",auth, fetchProfileDetails);
router.get("/fetchUserDetails/:username",auth, fetchUserDetails);



module.exports = router;
