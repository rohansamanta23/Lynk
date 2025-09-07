import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  registerUserService,
  loginUserService,
  logoutUserService,
  refreshAccessTokenService,
} from "../services/auth.services.js";

// Register
const registerUser = asyncHandler(async (req, res) => {
  const { name, userId, email, password } = req.body;
  const { user, accessToken, refreshToken } = await registerUserService({
    name,
    userId,
    email,
    password,
  });

  const options = { httpOnly: true, secure: true };
  res
    .status(201)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse({ user }, 201, "User registered successfully"));
});

// Login
const loginUser = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const { user, accessToken, refreshToken } = await loginUserService({
    identifier,
    password,
  });

  const options = { httpOnly: true, secure: true };
  res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse({ user }, 200, "User logged in successfully"));
});

// Logout
const logoutUser = asyncHandler(async (req, res) => {
  const user = req.user;
  await logoutUserService(user._id);

  res
    .status(200)
    .clearCookie("refreshToken")
    .clearCookie("accessToken")
    .json(new ApiResponse(null, 200, "User logged out successfully"));
});

// Refresh Token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  const { accessToken } = await refreshAccessTokenService(refreshToken);

  const options = { httpOnly: true, secure: true };
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse({ accessToken }, 200, "Access token refreshed successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
};