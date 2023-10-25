const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const res = require('express/lib/response');

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        require: true
    },
    image: {
        type: String,
        default: ""
    },
    photo: {
        type: String
    },
    authorUsername: {
        type: String,
        require: true
    },
    authorName: {
        type: String,
        require: true
    },
    authorAvatar: {
        type: String,
        require: true
    },
    likes: {
        type: Array,
    },
    dislikes: {
        type: Array,
    },
    comments: {
        type: Array
    },
})

const Post = new mongoose.model('Post', postSchema);
module.exports = Post;