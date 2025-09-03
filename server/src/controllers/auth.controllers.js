import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";

const registerUser = asyncHandler(async (req, res) => {
  const { name, userId, email, password } = req.body;
  console.log(req.body);
  if (
    [name, userId, email, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }
  if (!email.includes("@")) {
    throw new ApiError(400, "Invalid email format");
  }
  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters long");
  }
  if (userId.includes(" ")) {
    throw new ApiError(400, "User ID must not contain spaces");
  }
  const existingUser = await User.findOne({ userId });
  if (existingUser) {
    throw new ApiError(400, "User ID already exists");
  }
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new ApiError(400, "Email already exists");
  }
  const user = await User.create({
    name,
    userId: userId.toLowerCase(),
    email: email.toLowerCase(),
    password,
  });

  if (!user) {
    throw new ApiError(500, "User registration failed");
  }
  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!userCreated) {
    throw new ApiError(500, "User registration failed");
  }
  console.log(`User created: ${userCreated._id}`);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(201)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        { user: userCreated },
        201,
        "User registered successfully"
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  console.log(`Login attempt for user: ${identifier}`);
  if (!identifier || !password) {
    throw new ApiError(400, "Email or User ID and password are required");
  }

  const user = await User.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { userId: identifier.toLowerCase() },
    ],
  });
  if (!user) {
    throw new ApiError(401, "Invalid email or user ID");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid password");
  }
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const accessToken = loggedInUser.generateAccessToken();
  const refreshToken = loggedInUser.generateRefreshToken();

  loggedInUser.refreshToken = refreshToken;
  await loggedInUser.save();

  console.log(`User logged in: ${loggedInUser._id}`);

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        { user: loggedInUser },
        200,
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "User not authenticated");
  }
  await User.findByIdAndUpdate(user._id, { refreshToken: null });
  console.log(`User logged out: ${user._id}`);
  return res
    .status(200)
    .clearCookie("refreshToken")
    .clearCookie("accessToken")
    .json(new ApiResponse(null, 200, "User logged out successfully"));
});

const refreshAccessToken = async function (req, res) {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(403, "Invalid refresh token");
  }
  if (!decodedToken) {
    throw new ApiError(403, "Invalid refresh token");
  }
  const user = await User.findById(decodedToken.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (user.refreshToken !== refreshToken) {
    throw new ApiError(403, "Refresh token expired or does not match");
  }
  const newAccessToken = user.generateAccessToken();
  console.log(`Access token refreshed: ${user._id}`);
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", newAccessToken, options)
    .json(
      new ApiResponse(
        { accessToken: newAccessToken },
        200,
        "Access token refreshed successfully"
      )
    );
};

export { registerUser, loginUser, logoutUser, refreshAccessToken };
