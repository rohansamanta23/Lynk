import { User } from "../models/user.models.js";
import { Friendship } from "../models/friendship.models.js";
import { ApiError } from "../utils/ApiError.js";

// SEND REQUEST
const sendFriendRequestService = async (authUserId, recipientUserId) => {
  if (!recipientUserId) throw new ApiError(400, "Recipient ID is required");
  const recipient = await User.findOne({ userId: recipientUserId });
  if (!recipient) throw new ApiError(404, "Recipient not found");

  if (recipient._id.toString() === authUserId.toString()) {
    throw new ApiError(400, "You cannot send a friend request to yourself");
  }

  const existingFriendship = await Friendship.findOne({
    $or: [
      { requester: authUserId, recipient: recipient._id },
      { requester: recipient._id, recipient: authUserId },
    ],
  });

  if (existingFriendship) {
    if (existingFriendship.status === "accepted")
      throw new ApiError(400, "You are already friends");
    if (existingFriendship.status === "pending")
      throw new ApiError(400, "Friend request already sent");
    if (existingFriendship.status === "blocked") {
      if (existingFriendship.blockedBy?.toString() === authUserId.toString())
        throw new ApiError(400, "You blocked this user. Unblock to continue.");
      throw new ApiError(403, "You are blocked by this user");
    }
  }

  const friendship = await Friendship.create({
    requester: authUserId,
    recipient: recipient._id,
  });
  console.log(`Friend request sent: ${friendship._id}`);
  return friendship;
};

// CANCEL REQUEST
const cancelFriendRequestService = async (authUserId, friendshipId) => {
  console.log(
    `Cancelling friend request: ${friendshipId} for user: ${authUserId}`
  );
  const friendship = await Friendship.findById(friendshipId);
  if (!friendship) throw new ApiError(404, "Friendship not found");

  if (friendship.requester.toString() !== authUserId.toString())
    throw new ApiError(403, "You are not authorized to cancel this request");

  if (friendship.status === "accepted")
    throw new ApiError(400, "Friend request is already accepted");

  if (friendship.status !== "pending")
    throw new ApiError(400, "Friend request is not pending");
  await friendship.deleteOne();
  console.log(`Friend request cancelled: ${friendship._id}`);
  return friendship;
};

// ACCEPT REQUEST
const acceptFriendRequestService = async (authUserId, friendshipId) => {
  const friendship = await Friendship.findById(friendshipId);
  if (!friendship) throw new ApiError(404, "Friendship not found");

  if (friendship.recipient.toString() !== authUserId.toString())
    throw new ApiError(403, "You are not authorized to accept this request");

  if (friendship.status === "blocked") {
    if (friendship.blockedBy?.toString() === authUserId.toString())
      throw new ApiError(400, "You blocked this user");
    throw new ApiError(403, "You are blocked by this user");
  }

  if (friendship.status !== "pending")
    throw new ApiError(400, "Friend request is not pending");

  friendship.status = "accepted";
  await friendship.save();
  console.log(`Friend request accepted: ${friendship._id}`);
  return friendship;
};

// REJECT REQUEST
const rejectFriendRequestService = async (authUserId, friendshipId) => {
  const friendship = await Friendship.findById(friendshipId);
  if (!friendship) throw new ApiError(404, "Friendship not found");

  if (friendship.recipient.toString() !== authUserId.toString())
    throw new ApiError(403, "You are not authorized to reject this request");

  if (friendship.status === "blocked") {
    if (friendship.blockedBy?.toString() === authUserId.toString())
      throw new ApiError(400, "You blocked this user");
    throw new ApiError(403, "You are blocked by this user");
  }

  await friendship.deleteOne();
  console.log(`Friend request rejected: ${friendship._id}`);
  return friendship;
};

// BLOCK FRIEND
const blockFriendService = async (authUserId, friendshipId) => {
  const friendship = await Friendship.findById(friendshipId);
  if (!friendship) throw new ApiError(404, "Friendship not found");

  if (
    friendship.requester.toString() !== authUserId.toString() &&
    friendship.recipient.toString() !== authUserId.toString()
  ) {
    throw new ApiError(403, "You are not authorized to block this user");
  }

  if (friendship.status === "blocked") {
    if (friendship.blockedBy?.toString() === authUserId.toString())
      throw new ApiError(400, "You already blocked this user");
    throw new ApiError(403, "You are blocked by this user");
  }

  friendship.prevStatus = friendship.status;
  friendship.status = "blocked";
  friendship.blockedBy = authUserId;
  await friendship.save();
  return friendship;
};

// UNBLOCK FRIEND
const unblockFriendService = async (authUserId, friendshipId) => {
  const friendship = await Friendship.findById(friendshipId);
  if (!friendship) throw new ApiError(404, "Friendship not found");

  if (friendship.status !== "blocked")
    throw new ApiError(400, "Friend is not blocked");

  if (friendship.blockedBy?.toString() !== authUserId.toString())
    throw new ApiError(403, "Only the blocker can unblock");

  if (friendship.prevStatus === "none") {
    await friendship.deleteOne();
    return null;
  } else {
    friendship.status = friendship.prevStatus;
    friendship.prevStatus = null;
    friendship.blockedBy = null;
    await friendship.save();
    return friendship;
  }
};

// REMOVE FRIEND
const removeFriendService = async (authUserId, friendshipId) => {
  const friendship = await Friendship.findById(friendshipId);
  if (!friendship) throw new ApiError(404, "Friendship not found");

  if (
    friendship.requester.toString() !== authUserId.toString() &&
    friendship.recipient.toString() !== authUserId.toString()
  ) {
    throw new ApiError(403, "You are not authorized to remove this friend");
  }

  if (
    friendship.status === "blocked" &&
    friendship.blockedBy?.toString() !== authUserId.toString()
  ) {
    throw new ApiError(403, "Only the blocker can delete a blocked friendship");
  }

  await friendship.deleteOne();
  return friendship;
};

// GET FRIEND LIST
const getFriendListService = async (authUserId) => {
  const friendships = await Friendship.find({
    $or: [
      { requester: authUserId, status: "accepted" },
      { recipient: authUserId, status: "accepted" },
    ],
  }).populate("requester recipient", "name userId status");

  return friendships.map((f) => ({
    friendshipId: f._id,
    friend:
      f.requester._id.toString() === authUserId.toString()
        ? f.recipient
        : f.requester,
  }));
};

// GET PENDING
const getPendingFriendRequestsService = async (authUserId) => {
  const requests = await Friendship.find({
    recipient: authUserId,
    status: "pending",
  }).populate("requester", "name userId");

  return requests.map((f) => ({
    friendshipId: f._id,
    requester: f.requester,
  }));
};

// GET SENT
const getSentFriendRequestsService = async (authUserId) => {
  const requests = await Friendship.find({
    requester: authUserId,
    status: "pending",
  }).populate("recipient", "name userId");

  return requests.map((f) => ({
    friendshipId: f._id,
    recipient: f.recipient,
  }));
};

// GET BLOCKED LIST
const getBlockedListService = async (authUserId) => {
  const blocked = await Friendship.find({
    $or: [
      { requester: authUserId, status: "blocked", blockedBy: authUserId },
      { recipient: authUserId, status: "blocked", blockedBy: authUserId },
    ],
  }).populate("requester recipient", "name userId");

  return blocked.map((f) => ({
    friendshipId: f._id,
    user:
      f.requester._id.toString() === authUserId.toString()
        ? f.recipient
        : f.requester,
  }));
};

export {
  sendFriendRequestService,
  cancelFriendRequestService,
  acceptFriendRequestService,
  rejectFriendRequestService,
  getBlockedListService,
  getSentFriendRequestsService,
  getPendingFriendRequestsService,
  getFriendListService,
  removeFriendService,
  blockFriendService,
  unblockFriendService,
};
