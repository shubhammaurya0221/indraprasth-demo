import { genToken } from "../configs/token.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import sendMail from "../configs/Mail.js";

// ======================= SIGNUP =======================
export const signUp = async (req, res) => {
  try {
    let { name, email, password, role, inviteCode } = req.body;

    // Check if user already exists
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }

    // Validate password
    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Please enter a strong password (min 8 chars)" });
    }

    // Validate educator invite code
    if (role === "educator") {
      const expectedInviteCode = process.env.TEACHER_SECRET_CODE;
      if (!expectedInviteCode) {
        return res.status(500).json({ message: "Teacher signup not properly configured" });
      }
      if (inviteCode !== expectedInviteCode) {
        return res.status(403).json({ message: "Not authorized to signup as educator" });
      }
    }

    // Validate roles
    const validRoles = ["student", "educator"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // Default role = student
    if (!role) role = "student";

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashPassword,
      role,
    });

    // Generate token
    

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      photoUrl: user.photoUrl,
    });
  } catch (error) {
    console.error("signUp error:", error);
    return res.status(500).json({ message: `SignUp Error: ${error.message}` });
  }
};

// ======================= LOGIN =======================
const genToken = (userId, role) => {
  return jwt.sign(
    { _id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Generate JWT token
    const token = genToken(user._id, user.role);

    // Set cookie securely
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true on Render
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Send user data
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      photoUrl: user.photoUrl
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: `Login Error: ${error.message}` });
  }
};

// ======================= LOGOUT =======================
export const logOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });
    return res.status(200).json({ message: "Logout successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Logout Error: ${error.message}` });
  }
};

// ======================= GOOGLE SIGNUP =======================
export const googleSignup = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, role });
    }

    const token = genToken(user._id, user.role);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      photoUrl: user.photoUrl,
    });
  } catch (error) {
    console.error("googleSignup error:", error);
    return res.status(500).json({ message: `Google Signup Error: ${error.message}` });
  }
};

// ======================= SEND OTP =======================
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    user.isOtpVerifed = false;

    await user.save();
    await sendMail(email, otp).catch(err => console.error("Mail send failed:", err));

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("sendOtp error:", error);
    return res.status(500).json({ message: `Send OTP Error: ${error.message}` });
  }
};

// ======================= VERIFY OTP =======================
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (
      !user ||
      !user.resetOtp ||
      user.resetOtp !== otp ||
      !user.otpExpires ||
      user.otpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isOtpVerifed = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("verifyOtp error:", error);
    return res.status(500).json({ message: `Verify OTP Error: ${error.message}` });
  }
};

// ======================= RESET PASSWORD =======================
export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isOtpVerifed) {
      return res.status(400).json({ message: "OTP verification required before reset" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    user.password = hashPassword;
    user.isOtpVerifed = false;

    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({ message: `Reset Password Error: ${error.message}` });
  }
};

// ======================= CHECK AUTH =======================
export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      authenticated: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photoUrl: user.photoUrl,
      },
    });
  } catch (error) {
    console.error("checkAuth error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication check failed",
      error: error.message,
    });
  }
};
