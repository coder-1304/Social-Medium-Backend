const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  username: {
    type: String,
    required: true,
    min: 3,
    max: 20,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    max: 50,
  },
  interests: {
    type: Array
  },
  password: {
    type: String,
    required: true,
    min: 8,
  },
  avatarImage: {
    type: String,
    default:
      "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg",
  },
  notifications: {
    type: Array,
  },
  newNotifications: {
    type: Number,
    default: 0,
  },
  friends: {
    type: Array,
  },
  friendReq: {
    type: Array,
  },
  token: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("Users", userSchema);
