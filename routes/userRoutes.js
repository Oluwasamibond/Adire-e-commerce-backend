import express from "express";
import {
  getUserDetails,
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  updatePassword,
  updateProfile,
} from "../controller/userController.js";
import { verifyUserAuth } from "../middleware/userAuth.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/password/forgot", requestPasswordReset);
router.post("/password/reset/:token", resetPassword);
router.post("/profile", verifyUserAuth, getUserDetails);
router.post("/password/update", verifyUserAuth, updatePassword);
router.post("/profile/update", verifyUserAuth, updateProfile);

export default router;
