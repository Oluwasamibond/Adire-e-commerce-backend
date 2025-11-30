import handleAsyncError from "../middleware/handleAsyncError.js";
import User from "../models/userModel.js";
import HandleError from "../utils/handleError.js";
import { sendToken } from "../utils/jwtToken.js";

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
})
