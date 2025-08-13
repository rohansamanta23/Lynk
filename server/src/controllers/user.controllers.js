import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";

const getUser = asyncHandler(async (req, res) => {
  const userId = req.user;
  if (!userId) {
    throw new ApiError(404, "User not found");
  }
  const user = await User.findById(userId._id).select(
    "-password -refreshToken"
  );
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  console.log(`user retrieved: ${user._id}`);
  res
    .status(200)
    .json(new ApiResponse(user, 200, "User retrieved successfully"));
});

const updateUser = asyncHandler(async (req, res) => {
  const authUser = req.user;
  if (!authUser) {
    throw new ApiError(404, "User not authenticated");
  }

  const currentUser = await User.findById(authUser._id);
  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }

  const { name, userId, password } = req.body;
  const changes = []; // Track what got updated

  // Update name
  if (name?.trim()) {
    currentUser.name = name.trim();
    changes.push("Name updated");
  }

  // Update userId with uniqueness check
  if (userId?.trim()) {
    const existingUser = await User.findOne({
      userId: userId.trim().toLowerCase(),
    });
    if (
      existingUser &&
      existingUser._id.toString() !== currentUser._id.toString()
    ) {
      throw new ApiError(400, "User ID already exists");
    }
    currentUser.userId = userId.trim().toLowerCase();
    changes.push("User ID updated");
  }

  // Update password with validation
  if (password?.trim()) {
    if (password.trim().length < 6) {
      throw new ApiError(400, "Password must be at least 6 characters");
    }
    currentUser.password = password.trim();
    changes.push("Password updated");
  }

  await currentUser.save();

  const safeUser = await User.findById(currentUser._id).select(
    "-password -refreshToken"
  );
  console.log(`user updated: ${currentUser._id}`);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        safeUser,
        changes.length > 0 ? changes.join(", ") : "No changes made"
      )
    );
});

const deleteUser = asyncHandler(async (req, res) => {
  const authId = req.user;
  if (!authId) {
    throw new ApiError(404, "User not found");
  }
  const user = await User.findById(authId._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const { password } = req.body;
  if (!password) {
    throw new ApiError(400, "Password is required");
  }
  const isMatch = await user.comparePassword(password.trim());
  if (!isMatch) {
    throw new ApiError(401, "Invalid password");
  }
  await user.deleteOne();
  console.log(`user deleted: ${user._id}`);
  res
    .status(200)
    .clearCookie("refreshToken")
    .clearCookie("accessToken")
    .json(new ApiResponse(null, 200, "User deleted successfully"));
});

const searchUsers = asyncHandler(async (req, res) => {
  function escapeRegex(string) {
    // regexp injection prevention
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  const authUser = req.user;
  if (!authUser) {
    throw new ApiError(404, "User not found");
  }
  const { query } = req.query;
  if (!query) {
    throw new ApiError(400, "Search query is required");
  }
  const sanitizedQuery = escapeRegex(query.trim());
  const regex = new RegExp(sanitizedQuery.trim(), "i"); // case-insensitive partial match
  const results = await User.find({
    _id: { $ne: authUser._id }, // exclude the current user
    $or: [{ name: regex }, { userId: regex }],
  })
    .select("_id name userId")
    .sort({ userId: 1 })
    .limit(10);
  res
    .status(200)
    .json(new ApiResponse(results, 200, "Users retrieved successfully"));
});

export { getUser, updateUser, deleteUser, searchUsers };
