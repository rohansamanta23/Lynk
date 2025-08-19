import { User } from "../models/user.models.js";
import { Friendship } from "../models/friendship.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const sendFriendRequest = asyncHandler(async (req, res) => {
  const authId = req.user;
  if (!authId) {
    throw new ApiError(404, "User not found");
  }
  const { recipientId } = req.body;
  if (!recipientId) {
    throw new ApiError(400, "Recipient ID is required");
  }
  if (recipientId.toString() === authId._id.toString()) {
    throw new ApiError(400, "You cannot send a friend request to yourself");
  }
  const recipient = await User.findOne({ userId: recipientId });
  if (!recipient) {
    throw new ApiError(404, "Recipient not found");
  }
  if (recipient._id.toString() === authId._id.toString()) {
    throw new ApiError(400, "You cannot send a friend request to yourself");
  }
  const existingFriendship = await Friendship.findOne({
    $or: [
      { requester: authId._id, recipient: recipient._id },
      { requester: recipient._id, recipient: authId._id },
    ],
  });
  if (existingFriendship) {
    if (existingFriendship.status.toString() === "accepted") {
      throw new ApiError(400, "You are already friends");
    }
    if (existingFriendship.status.toString() === "pending") {
      throw new ApiError(400, "Friend request already sent");
    }
    if (existingFriendship.status.toString() === "blocked") {
      // if I blocked them
      if (existingFriendship.blockedBy?.toString() === authId._id.toString())
        throw new ApiError(400, "You blocked this user. Unblock to continue.");
      // they blocked me
      throw new ApiError(403, "You are blocked by this user");
    }
  }
  const friendship = await Friendship.create({
    requester: authId._id,
    recipient: recipient._id,
  });
  if (!friendship) {
    throw new ApiError(500, "Failed to send friend request");
  }
  console.log("Friendship created:", friendship._id);
  res
    .status(201)
    .json(new ApiResponse(friendship, 201, "Friend request sent successfully"));
});

const cancelFriendRequest = asyncHandler(async (req, res) => {
  const authId = req.user;
  if (!authId) {
    throw new ApiError(404, "User not found");
  }
  const { friendshipId } = req.params;
  if (!friendshipId) {
    throw new ApiError(400, "Friendship ID is required");
  }
  const friendship = await Friendship.findById(friendshipId);
  if (!friendship) {
    throw new ApiError(404, "Friendship not found");
  }
  if (friendship.requester.toString() !== authId._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to cancel this friend request"
    );
  }
  if (friendship.status === "accepted") {
    throw new ApiError(400, "Friend request is already accepted");
  }
  if (friendship.status !== "pending") {
    throw new ApiError(400, "Friend request is not pending");
  }
  await friendship.deleteOne();
  console.log("Friendship canceled:", friendship._id);
  res
    .status(200)
    .json(
      new ApiResponse(
        { friendship, success: true },
        200,
        "Friend request canceled successfully"
      )
    );
});

const acceptFriendRequest = asyncHandler(async (req, res) => {
  const authId = req.user;
  if (!authId) {
    throw new ApiError(404, "User not found");
  }
  const { friendshipId } = req.params;
  if (!friendshipId) {
    throw new ApiError(400, "Friendship ID is required");
  }
  const friendship = await Friendship.findById(friendshipId);
  if (!friendship) {
    throw new ApiError(404, "Friendship not found");
  }
  if (friendship.recipient.toString() !== authId._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to accept this friend request"
    );
  }
  if (friendship.status === "blocked") {
    if (friendship.blockedBy?.toString() === authId._id.toString())
      throw new ApiError(400, "You blocked this user");
    throw new ApiError(403, "You are blocked by this user");
  } else if (friendship.status !== "pending") {
    throw new ApiError(400, "Friend request is not pending");
  }
  friendship.status = "accepted";
  await friendship.save();
  console.log("Friendship accepted:", friendship._id);
  res
    .status(200)
    .json(
      new ApiResponse(friendship, 200, "Friend request accepted successfully")
    );
});

const rejectFriendRequest = asyncHandler(async (req, res) => {
  const authId = req.user;
  if (!authId) {
    throw new ApiError(404, "User not found");
  }
  const { friendshipId } = req.params;
  if (!friendshipId) {
    throw new ApiError(400, "Friendship ID is required");
  }
  const friendship = await Friendship.findById(friendshipId);
  if (!friendship) {
    throw new ApiError(404, "Friendship not found");
  }
  if (friendship.recipient.toString() !== authId._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to reject this friend request"
    );
  }
  if (friendship.status === "blocked") {
    if (friendship.blockedBy?.toString() === authId._id.toString())
      throw new ApiError(400, "You blocked this user");
    throw new ApiError(403, "You are blocked by this user");
  }
  await friendship.deleteOne();
  console.log("Friendship rejected:", friendship._id);
  res
    .status(200)
    .json(
      new ApiResponse(
        { friendship, success: true },
        200,
        "Friend request rejected successfully"
      )
    );
});

const blockFriend = asyncHandler(async (req, res) => {
  const authId = req.user;
  if (!authId) {
    throw new ApiError(404, "User not found");
  }
  const { friendshipId } = req.params;
  if (!friendshipId) {
    throw new ApiError(400, "Friendship ID is required");
  }
  const friendship = await Friendship.findById(friendshipId);
  if (!friendship) {
    throw new ApiError(404, "Friendship not found");
  }
  if (
    friendship.requester.toString() !== authId._id.toString() &&
    friendship.recipient.toString() !== authId._id.toString()
  ) {
    throw new ApiError(403, "You are not authorized to block this user");
  }
  if (friendship.status === "blocked") {
    if (friendship.blockedBy?.toString() === authId._id.toString())
      throw new ApiError(400, "You already blocked this user");
    // other person already blocked you
    throw new ApiError(403, "You are blocked by this user");
  }
  friendship.prevStatus = friendship.status;
  friendship.status = "blocked";
  friendship.blockedBy = authId._id;
  await friendship.save();
  console.log("Friendship blocked:", friendship._id);
  res
    .status(200)
    .json(
      new ApiResponse(
        { friendship, success: true },
        200,
        "User blocked successfully"
      )
    );
});

const unblockFriend = asyncHandler(async (req, res) => {
  const authId = req.user;
  if (!authId) {
    throw new ApiError(404, "User not found");
  }
  const { friendshipId } = req.params;
  if (!friendshipId) {
    throw new ApiError(404, "No friendship found");
  }
  const friendship = await Friendship.findById(friendshipId);
  if (!friendship) {
    throw new ApiError(404, "Friendship not found");
  }
  if (friendship.status !== "blocked") {
    throw new ApiError(400, "Friendship is not blocked");
  }
  if (friendship.blockedBy?.toString() !== authId._id.toString()) {
    throw new ApiError(403, "Only the blocker can unblock");
  }
  if (friendship.prevStatus === "none") {
    await friendship.deleteOne();
  } else {
    friendship.status = friendship.prevStatus;
    friendship.prevStatus = null;
    friendship.blockedBy = null;
    await friendship.save();
  }
  console.log("Friendship unblocked:", friendship._id);
  res
    .status(200)
    .json(
      new ApiResponse(
        { friendship, success: true },
        200,
        "User unblocked successfully"
      )
    );
});

const removeFriend = asyncHandler(async (req, res) => {
  const authId = req.user;
  if (!authId) {
    throw new ApiError(404, "User not found");
  }
  const { friendshipId } = req.body;
  if (!friendshipId) {
    throw new ApiError(400, "Friendship ID is required");
  }
  const friendship = await Friendship.findById(friendshipId);
  if (!friendship) {
    throw new ApiError(404, "Friendship not found");
  }
  if (
    friendship.requester.toString() !== authId &&
    friendship.recipient.toString() !== authId
  ) {
    throw new ApiError(403, "You are not authorized to remove this friend");
  }
  if (
    friendship.status === "blocked" &&
    friendship.blockedBy?.toString() !== authId
  ) {
    throw new ApiError(403, "Only the blocker can delete a blocked friendship");
  }
  await friendship.deleteOne();
  console.log("Friendship removed:", friendship._id);
  res
    .status(200)
    .json(
      new ApiResponse(
        { friendship, success: true },
        200,
        "Friend removed successfully"
      )
    );
});

const getFriendList = asyncHandler(async (req, res) => {
  const authId = req.user;
  if (!authId) {
    throw new ApiError(404, "User not found");
  }
  const friendships = await Friendship.find({
    $or: [
      { requester: authId._id, status: "accepted" },
      { recipient: authId._id, status: "accepted" },
    ],
  }).populate("requester recipient", "name userId status");
  if (!friendships.length) {
    return res.status(200).json(new ApiResponse([], 200, "No friends found"));
  }
  //remove the logged in user
  const data = friendships.map((f) => ({
    friendshipId: f._id,
    friend: f.requester._id.toString() === authId._id.toString() ? f.recipient : f.requester,
  }));
  res
    .status(200)
    .json(new ApiResponse(data, 200, "Friend list retrieved successfully"));
});

const getPendingFriendRequests = asyncHandler(async (req, res) => {
  const authId = req.user;
  if (!authId) {
    throw new ApiError(404, "User not found");
  }
  const pendingRequests = await Friendship.find({
    recipient: authId._id,
    status: "pending",
  }).populate("requester", "name userId");
  if (!pendingRequests.length) {
    return res
      .status(200)
      .json(new ApiResponse([], 200, "No pending requests found"));
  }
  const data = pendingRequests.map((f) => ({
    friendshipId: f._id,
    requester: {
      _id: f.requester._id,
      name: f.requester.name,
      userId: f.requester.userId,
    },
  }));
  res
    .status(200)
    .json(
      new ApiResponse(
        data,
        200,
        "Pending friend requests retrieved successfully"
      )
    );
});

const getSentFriendRequests = asyncHandler(async (req, res) => {
  const authId = req.user;
  if (!authId) {
    throw new ApiError(404, "User not found");
  }
  const sentRequests = await Friendship.find({
    requester: authId,
    status: "pending",
  }).populate("recipient", "name userId");
  if (!sentRequests.length) {
    return res
      .status(200)
      .json(new ApiResponse([], 200, "No sent requests found"));
  }
  const data = sentRequests.map((f) => ({
    friendshipId: f._id,
    recipient: {
      _id: f.recipient._id,
      name: f.recipient.name,
      userId: f.recipient.userId,
    },
  }));
  res
    .status(200)
    .json(
      new ApiResponse(
        data,
        200,
        "Sent friend requests retrieved successfully"
      )
    );
});

const getBlockedList = asyncHandler(async (req, res) => {
  const authId = req.user;
  if (!authId) {
    throw new ApiError(404, "User not found");
  }
  const blockedFriends = await Friendship.find({
    $or: [
      { requester: authId, status: "blocked", blockedBy: authId },
      { recipient: authId, status: "blocked", blockedBy: authId },
    ],
  }).populate("requester recipient", "name userId");
  if (!blockedFriends || blockedFriends.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse([], 200, "No blocked friends found"));
  }
  const data = blockedFriends.map((f) => ({
    friendshipId: f._id,
    user: f.requester._id.toString() === authId._id.toString() ? f.recipient : f.requester
  }));

  res
    .status(200)
    .json(new ApiResponse(data, 200, "Blocked friends retrieved successfully"));
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
