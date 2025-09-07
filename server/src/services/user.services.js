import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";

// Get user profile
const getUserService = async (authUser) => {
  if (!authUser) throw new ApiError(404, "User not found");

  const user = await User.findById(authUser._id).select(
    "-password -refreshToken"
  );
  if (!user) throw new ApiError(404, "User not found");

  return user;
};

// Update user profile
const updateUserService = async (authUser, { name, userId, password }) => {
  if (!authUser) throw new ApiError(404, "User not authenticated");

  const currentUser = await User.findById(authUser._id);
  if (!currentUser) throw new ApiError(404, "User not found");

  const changes = [];

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

  return { user: safeUser, changes };
};

// Delete user
const deleteUserService = async (authUser, password) => {
  if (!authUser) throw new ApiError(404, "User not found");

  const user = await User.findById(authUser._id);
  if (!user) throw new ApiError(404, "User not found");

  if (!password) throw new ApiError(400, "Password is required");

  const isMatch = await user.comparePassword(password.trim());
  if (!isMatch) throw new ApiError(401, "Invalid password");

  await user.deleteOne();
  return true;
};

// Search users
const searchUsersService = async (authUser, query) => {
  if (!authUser) throw new ApiError(404, "User not found");
  if (!query) throw new ApiError(400, "Search query is required");

  // Prevent regex injection
  const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const sanitizedQuery = escapeRegex(query.trim());
  const regex = new RegExp(sanitizedQuery, "i");

  const results = await User.find({
    _id: { $ne: authUser._id }, // exclude current user
    $or: [{ name: regex }, { userId: regex }],
  })
    .select("_id name userId")
    .sort({ userId: 1 })
    .limit(10);

  return results;
};

export {
  getUserService,
  updateUserService,
  deleteUserService,
  searchUsersService,
};
