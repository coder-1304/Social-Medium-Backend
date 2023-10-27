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
  fetchProfileDetails
} = require("../controllers/userController");

const auth = require("../middlewares/auth");

const router = require("express").Router();

// For files:
// const { upload, uploadMultiple } = require("../middlewares/multer.js");

// const { getStorage, ref, uploadBytesResumable } = require("firebase/storage");
// const {
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
// } = require("firebase/auth");
// const { firebaseAuth } = require("../config/firebase.config");

// const { Storage } = require("@google-cloud/storage");
// const generateUrl = require("../urlGenerator.js");

// Routings:

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

// async function uploadImage(file, quantity) {
//   const storageFB = getStorage();

//   await signInWithEmailAndPassword(
//     firebaseAuth,
//     process.env.FIREBASE_USER,
//     process.env.FIREBASE_AUTH
//   );

//   if (quantity === "single") {
//     const dateTime = Date.now();
//     const fileName = `images/${dateTime}`;
//     const storageRef = ref(storageFB, fileName);
//     const metadata = {
//       contentType: file.type,
//     };
//     await uploadBytesResumable(storageRef, file.buffer, metadata);
//     return dateTime;
//   }

//   if (quantity === "multiple") {
//     for (let i = 0; i < file.images.length; i++) {
//       const dateTime = Date.now();
//       const fileName = `images/${dateTime}`;
//       const storageRef = ref(storageFB, fileName);
//       const metadata = {
//         contentType: file.images[i].mimetype,
//       };

//       const saveImage = await Image.create({ imageUrl: fileName });
//       file.item.imageId.push({ _id: saveImage._id });
//       await file.item.save();

//       await uploadBytesResumable(storageRef, file.images[i].buffer, metadata);
//     }
//     return;
//   }
// }

// router.post("/testing", upload, async (req, res) => {
//   const file = {
//     type: req.file.mimetype,
//     buffer: req.file.buffer,
//   };
//   try {
//     const buildImage = await uploadImage(file, "single");
//     const imageUrl = await generateUrl(buildImage);
//     return res.status(200).json({
//       success: true,
//       imageName: imageUrl,
//     });
//   } catch (err) {
//     console.log(err);
//   }
// });

module.exports = router;
