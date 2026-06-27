const jwt = require("jsonwebtoken");
const userModel = require("../model/userModel");

const secretKey = "sfsdgfhjklkadfgshljh";

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // console.log("Authorization Header:", authHeader);

    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization header not found",
      });
    }

    const token = authHeader.split(" ")[1];

    // console.log("Token:", token);

    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const decode = jwt.verify(token, secretKey);

    const userDetail = await userModel.findOne({
      email: decode.email,
    });

    if (!userDetail) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    req.user = userDetail;

    next();
  } catch (error) {
    console.log(error);
    
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};