import express from "express";
import { loginUser, logoutUser, registerUser, requestPasswordReset, resetPassword } from "../controller/userController.js";
const router = express.Router();

router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/logout", logoutUser)
router.post("/password/forgot", requestPasswordReset)
router.put("/password/reset/:token", resetPassword)

export default router;