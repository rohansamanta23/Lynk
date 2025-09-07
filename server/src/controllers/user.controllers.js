import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getUserService,
  updateUserService,
  deleteUserService,
  searchUsersService,
} from "../services/user.services.js";

// Get user
const getUser = asyncHandler(async (req, res) => {
  const user = await getUserService(req.user);
  res
    .status(200)
    .json(new ApiResponse(user, 200, "User retrieved successfully"));
});

// Update user
const updateUser = asyncHandler(async (req, res) => {
  const { user, changes } = await updateUserService(req.user, req.body);
  res
    .status(200)
    .json(
      new ApiResponse(
        user,
        200,
        changes.length > 0 ? changes.join(", ") : "No changes made"
      )
    );
});

// Delete user
const deleteUser = asyncHandler(async (req, res) => {
  await deleteUserService(req.user, req.body.password);
  res
    .status(200)
    .clearCookie("refreshToken")
    .clearCookie("accessToken")
    .json(new ApiResponse(null, 200, "User deleted successfully"));
});

// Search users
const searchUsers = asyncHandler(async (req, res) => {
  const results = await searchUsersService(req.user, req.query.query);
  res
    .status(200)
    .json(new ApiResponse(results, 200, "Users retrieved successfully"));
});

export { getUser, updateUser, deleteUser, searchUsers };
