import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";

// Service: Register a new user
const registerUserService = async ({ name, userId, email, password }) => {
  if ([name, userId, email, password].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  if (!email.includes("@")) throw new ApiError(400, "Invalid email format");
  if (password.length < 6) throw new ApiError(400, "Password must be at least 6 characters long");
  if (userId.includes(" ")) throw new ApiError(400, "User ID must not contain spaces");

  const existingUser = await User.findOne({ userId });
  if (existingUser) throw new ApiError(400, "User ID already exists");

  const existingEmail = await User.findOne({ email });
  if (existingEmail) throw new ApiError(400, "Email already exists");

  const user = await User.create({
    name,
    userId: userId.toLowerCase(),
    email: email.toLowerCase(),
    password,
  });

  if (!user) throw new ApiError(500, "User registration failed");

  const userCreated = await User.findById(user._id).select("-password -refreshToken");
  if (!userCreated) throw new ApiError(500, "User registration failed");

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  return { user: userCreated, accessToken, refreshToken };
};

// Service: Login user
const loginUserService = async ({ identifier, password }) => {
  if (!identifier || !password) {
    throw new ApiError(400, "Email or User ID and password are required");
  }

  const user = await User.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { userId: identifier.toLowerCase() },
    ],
  });
  if (!user) throw new ApiError(401, "Invalid email or user ID");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, "Invalid password");

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const accessToken = loggedInUser.generateAccessToken();
  const refreshToken = loggedInUser.generateRefreshToken();

  loggedInUser.refreshToken = refreshToken;
  await loggedInUser.save();

  return { user: loggedInUser, accessToken, refreshToken };
};

// Service: Logout user
const logoutUserService = async (userId) => {
  const user = await User.findByIdAndUpdate(userId, { refreshToken: null });
  if (!user) throw new ApiError(404, "User not found");
  return true;
};

// Service: Refresh access token
const refreshAccessTokenService = async (refreshToken) => {
  if (!refreshToken) throw new ApiError(401, "Refresh token is required");

  let decodedToken;
  try {
    decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(403, "Invalid refresh token");
  }

  const user = await User.findById(decodedToken.id);
  if (!user) throw new ApiError(404, "User not found");

  if (user.refreshToken !== refreshToken) {
    throw new ApiError(403, "Refresh token expired or does not match");
  }

  const newAccessToken = user.generateAccessToken();
  return { accessToken: newAccessToken };
};

export {
  registerUserService,
  loginUserService,
  logoutUserService,
  refreshAccessTokenService,
};