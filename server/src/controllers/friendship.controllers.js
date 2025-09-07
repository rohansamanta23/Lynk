import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  sendFriendRequestService,
  cancelFriendRequestService,
  acceptFriendRequestService,
  rejectFriendRequestService,
  blockFriendService,
  unblockFriendService,
  removeFriendService,
  getFriendListService,
  getPendingFriendRequestsService,
  getSentFriendRequestsService,
  getBlockedListService,
} from "../services/friendship.services.js";

const sendFriendRequest = asyncHandler(async (req, res) => {
  const friendship = await sendFriendRequestService(req.user._id, req.body.recipientId);
  res.status(201).json(new ApiResponse(friendship, 201, "Friend request sent successfully"));
});

const cancelFriendRequest = asyncHandler(async (req, res) => {
  const friendship = await cancelFriendRequestService(req.user._id, req.params.friendshipId);
  res.status(200).json(new ApiResponse(friendship, 200, "Friend request canceled successfully"));
});

const acceptFriendRequest = asyncHandler(async (req, res) => {
  const friendship = await acceptFriendRequestService(req.user._id, req.params.friendshipId);
  res.status(200).json(new ApiResponse(friendship, 200, "Friend request accepted successfully"));
});

const rejectFriendRequest = asyncHandler(async (req, res) => {
  const friendship = await rejectFriendRequestService(req.user._id, req.params.friendshipId);
  res.status(200).json(new ApiResponse(friendship, 200, "Friend request rejected successfully"));
});

const blockFriend = asyncHandler(async (req, res) => {
  const friendship = await blockFriendService(req.user._id, req.params.friendshipId);
  res.status(200).json(new ApiResponse(friendship, 200, "User blocked successfully"));
});

const unblockFriend = asyncHandler(async (req, res) => {
  const friendship = await unblockFriendService(req.user._id, req.params.friendshipId);
  res.status(200).json(new ApiResponse(friendship, 200, "User unblocked successfully"));
});

const removeFriend = asyncHandler(async (req, res) => {
  const friendship = await removeFriendService(req.user._id, req.body.friendshipId);
  res.status(200).json(new ApiResponse(friendship, 200, "Friend removed successfully"));
});

const getFriendList = asyncHandler(async (req, res) => {
  const list = await getFriendListService(req.user._id);
  res.status(200).json(new ApiResponse(list, 200, "Friend list retrieved successfully"));
});

const getPendingFriendRequests = asyncHandler(async (req, res) => {
  const list = await getPendingFriendRequestsService(req.user._id);
  res.status(200).json(new ApiResponse(list, 200, "Pending requests retrieved successfully"));
});

const getSentFriendRequests = asyncHandler(async (req, res) => {
  const list = await getSentFriendRequestsService(req.user._id);
  res.status(200).json(new ApiResponse(list, 200, "Sent requests retrieved successfully"));
});

const getBlockedList = asyncHandler(async (req, res) => {
  const list = await getBlockedListService(req.user._id);
  res.status(200).json(new ApiResponse(list, 200, "Blocked friends retrieved successfully"));
});

export {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  getFriendList,
  getPendingFriendRequests,
  getSentFriendRequests,
  blockFriend,
  unblockFriend,
  getBlockedList,
};
