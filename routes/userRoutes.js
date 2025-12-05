import express from "express";
import {
  getSingleUser,
  getUserDetails,
  getUsersList,
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  updatePassword,
  updateProfile,
} from "../controller/userController.js";
import { roleBasedAccess, verifyUserAuth } from "../middleware/userAuth.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/password/forgot", requestPasswordReset);
router.post("/password/reset/:token", resetPassword);
router.post("/profile", verifyUserAuth, getUserDetails);
router.post("/password/update", verifyUserAuth, updatePassword);
router.post("/profile/update", verifyUserAuth, updateProfile);

// Admin routes can be added here
router.get("/admin/users", verifyUserAuth, roleBasedAccess("admin"), getUsersList) 
router.get("/admin/user/:id", verifyUserAuth, roleBasedAccess("admin"), getSingleUser)

export default router;
