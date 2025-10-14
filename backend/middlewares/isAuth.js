import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const isAuth = async (req, res, next) => {
  try {
    // Extract token from cookies
    const { token } = req.cookies;

    // Validate token presence and type
    if (!token || typeof token !== "string") {
      console.warn("Auth failed: Token missing or not a string");
      return res.status(401).json({
        success: false,
        message: "Access denied. Token missing or invalid format.",
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("JWT verification error:", err.message);
      return res.status(403).json({
        success: false,
        message: "Access denied. Invalid token.",
      });
    }

    // Fetch user and attach to request
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      console.warn("Auth failed: User not found");
      return res.status(401).json({
        success: false,
        message: "Access denied. User not found.",
      });
    }

    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
    });
  }
};

export default isAuth;
