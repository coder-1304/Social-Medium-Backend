const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const res = require('express/lib/response');

const categoryModel = new mongoose.Schema({
    category: {
        type: String,
        require: true
    },
    postsCount: {
        type: Number,
        default: 0
    }
})

const Category = new mongoose.model('Category', categoryModel);
module.exports = Category;