const jwt = require("jsonwebtoken");
// const User = require('../schema/schema');
const User = require("../models/userModel");
// const path = require('path')

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      // If the Authorization header is missing, respond with an error
      return res.status(statusCodes[9]).json({
        success: false,
        erroCode: 9,
        message: "Authentication Failed: Header Must be provided",
      });
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(" ")[1];
    let verifyUser;
    try {
      verifyUser = jwt.verify(token, process.env.JWTSECRETKEY);
      // print(verifyUser);
    } catch (error) {
      return res.status(401).json({
        success: false,
        erroCode: 10,
        message: "Verification Failed",
      });
    }

    const user = await User.findOne({ _id: verifyUser._id }); //getting all the information of user from the database
    // console.log(user);
    console.log(user.name + " & " + user.email);
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.log(error);
    return res.status(statusCodes[10]).json({
      success: false,
      statusCode: 10,
      message: statusCodes[10],
    });
  }
};

module.exports = auth;
