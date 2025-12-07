import handleAsyncError from "../middleware/handleAsyncError.js";
import User from "../models/userModel.js";
import HandleError from "../utils/handleError.js";
import { sendToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";

// Register User
export const registerUser = handleAsyncError(async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: "this is a sample id",
        url: "profilepicUrl",
      },
    });
    sendToken(user, 200, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Login User
export const loginUser = handleAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password is provided by user
  if (!email || !password) {
    return next(new HandleError("Please enter email & password", 400));
  }
  // Finding user in database
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new HandleError("Invalid email or password", 401));
  }
  const isPasswordMatched = await user.verifyPassword(password);

  if (!isPasswordMatched) {
    return next(new HandleError("Invalid email or password", 401));
  }
  sendToken(user, 200, res);
});

// Logout User
export const logoutUser = handleAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// Forgot Password
export const requestPasswordReset = handleAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new HandleError("User not found with this email", 404));
  }
  let resetToken;
  try {
    resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });
  } catch (error) {
    return next(new HandleError(error.message, 500));
  }

  const resetPasswordURL = `http://localhost:8000/api/users/password/reset/${resetToken}`;
  const message = `Your password reset token is as follow:\n\n${resetPasswordURL}\n\nIf you have not requested this email, then ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Adire By Mkz Password Recovery`,
      message: message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new HandleError(error.message, 500));
  }
});

//Reset Password
export const resetPassword = handleAsyncError(async (req, res, next) => {
  console.log(req.params.token);
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new HandleError(
        "Password reset token is invalid or has been expired",
        400
      )
    );
  }
  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return next(new HandleError("Password does not match", 400));
  }
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendToken(user, 200, res);
});

// Get user details
export const getUserDetails = handleAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

// Update user password
export const updatePassword = handleAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  const user = await User.findById(req.user.id).select("+password");
  const isPasswordMatched = await user.verifyPassword(oldPassword);
  if (!isPasswordMatched) {
    return next(new HandleError("Old password is incorrect", 400));
  }
  if (newPassword !== confirmNewPassword) {
    return next(new HandleError("Password does not match", 400));
  }
  user.password = newPassword;
  await user.save();
  sendToken(user, 200, res);
});

// Updating user profile
export const updateProfile = handleAsyncError(async (req, res, next) => {
  const { name, email } = req.body;
  const updateUserDetails = {
    name,
    email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, updateUserDetails, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});

// Admin - Getting user information
export const getUsersList = handleAsyncError(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});

// Admin - Getting single user details
export const getSingleUser = handleAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new HandleError(`User doesn't exist with this id: ${req.params.id}`, 404));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

// Admin - Chaning user role 
export const updateUserRole = handleAsyncError(async (req, res, next) => {
  const {role} = req.body;
  const updateUserDetails = {
    role,
  };
  const user = await User.findByIdAndUpdate(req.params.id, updateUserDetails, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new HandleError("User doesn't exist", 404));
  }
  res.status(200).json({
    success: true,
    message: "User role updated successfully",
    user,
  });
})

// Admin - Delete user profile
export const deleteUserProfile = handleAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new HandleError("User doesn't exist", 404));
  }
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  }); 
})

