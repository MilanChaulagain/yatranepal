import express from "express";
import {
    checkAuth,
    forgotPassword,
    login,
    register,
    resetPassword,
    verifyOTP,
    resendOTP
} from "../controllers/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/login", login);
router.get("/", checkAuth);

export default router;