import express from "express"
import {googleSignup, login, logOut, resetPassword, sendOtp, signUp, verifyOtp, checkAuth } from "../controllers/authController.js"
import isAuth from "../middlewares/isAuth.js"

const authRouter = express.Router()

authRouter.post("/signup",signUp)

authRouter.post("/login",login)
authRouter.get("/logout",logOut)
authRouter.post("/googlesignup",googleSignup)
authRouter.post("/sendotp",sendOtp)
authRouter.post("/verifyotp",verifyOtp)
authRouter.post("/resetpassword",resetPassword)

// Protected route to check authentication status
authRouter.get("/check", isAuth, checkAuth)

export default authRouter