import { User } from "../models/user.models.js";
import { Friendship } from "../models/friendship.models.js";
import { Conversation } from "../models/conversation.models.js";
import { ApiError } from "../utils/ApiError.js";

// PRIVATE CONVERSATION
const createPrivateConversationService = async (userId, friendId) => {
  if (!friendId) throw new ApiError(400, "Friend ID is required");

  const friend = await User.findById(friendId);
  if (!friend) throw new ApiError(404, "Friend not found");
  if (userId.toString() === friend._id.toString()) {
    throw new ApiError(400, "You cannot chat with yourself");
  }

  const friendship = await Friendship.findOne({
    $or: [
      { requester: userId, recipient: friend._id, status: "accepted" },
      { requester: friend._id, recipient: userId, status: "accepted" },
    ],
  });
  if (!friendship)
    throw new ApiError(403, "You are not friends with this user");

  const pairKey = [userId.toString(), friend._id.toString()].sort().join(":");

  let conversation = await Conversation.findOne({ pairKey });
  if (conversation) return conversation;

  conversation = await Conversation.create({
    participants: [userId, friend._id],
    isGroup: false,
    pairKey,
  });
  if (!conversation)
    throw new ApiError(500, "Failed to create private conversation");

  return conversation;
};

// FETCH CONVERSATIONS
const getConversationsService = async (userId) => {
  return Conversation.find({ participants: userId })
    .populate("participants", "name userId")
    .populate("lastMessage")
    .sort({ updatedAt: -1 })
    .lean();
};

const getConversationByIdService = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId)
    .populate("participants", "name userId")
    .populate("lastMessage")
    .lean();

  if (!conversation) throw new ApiError(404, "Conversation not found");

  const isParticipant = conversation.participants.some(
    (p) => p._id.toString() === userId.toString()
  );
  if (!isParticipant)
    throw new ApiError(403, "Not a participant in this conversation");

  return conversation;
};

// GROUP CONVERSATION
const createGroupConversationService = async (
  userId,
  groupName,
  participants
) => {
  if (!participants || participants.length === 0) {
    throw new ApiError(400, "Participant IDs are required");
  }

  participants = participants.filter(
    (id) => id.toString() !== userId.toString()
  );

  const friends = await User.find({ _id: { $in: participants } });
  if (!friends.length) throw new ApiError(404, "Friends not found");

  for (const friend of friends) {
    const friendship = await Friendship.findOne({
      $or: [
        { requester: userId, recipient: friend._id, status: "accepted" },
        { requester: friend._id, recipient: userId, status: "accepted" },
      ],
    });
    if (!friendship) {
      throw new ApiError(
        403,
        `You can only add friends. ${friend.name} is not your friend.`
      );
    }
  }

  const allParticipants = [...new Set([userId, ...friends.map((f) => f._id)])];

  const conversation = await Conversation.create({
    participants: allParticipants,
    isGroup: true,
    groupName,
    admin: userId,
  });
  if (!conversation)
    throw new ApiError(500, "Failed to create group conversation");

  return conversation;
};

const addParticipantsToGroupService = async (
  userId,
  conversationId,
  participantIds
) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new ApiError(404, "Conversation not found");

  if (conversation.admin.toString() !== userId.toString()) {
    throw new ApiError(403, "Only admin can add participants");
  }

  if (!participantIds || participantIds.length === 0) {
    throw new ApiError(400, "Participants are required");
  }

  const participants = await User.find({ _id: { $in: participantIds } }).select(
    "_id name userId"
  );
  if (!participants.length) throw new ApiError(404, "Participants not found");

  for (const p of participants) {
    const friendship = await Friendship.findOne({
      $or: [
        { requester: userId, recipient: p._id, status: "accepted" },
        { requester: p._id, recipient: userId, status: "accepted" },
      ],
    });
    if (!friendship)
      throw new ApiError(403, `You can only add friends to the group`);
    if (
      conversation.participants.some((id) => id.toString() === p._id.toString())
    ) {
      throw new ApiError(400, `User ${p.name} is already in the group`);
    }
  }

  conversation.participants.push(...participants.map((p) => p._id));
  await conversation.save();
  return conversation;
};

const removeParticipantFromGroupService = async (
  userId,
  conversationId,
  participantId
) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new ApiError(404, "Conversation not found");

  if (conversation.admin.toString() !== userId.toString()) {
    throw new ApiError(403, "Only admin can remove a participant");
  }

  if (participantId.toString() === userId.toString()) {
    throw new ApiError(
      403,
      "Admin cannot remove themselves. Use leave group instead."
    );
  }

  if (
    !conversation.participants.some(
      (id) => id.toString() === participantId.toString()
    )
  ) {
    throw new ApiError(400, "Participant is not in the group");
  }

  await Conversation.findByIdAndUpdate(conversationId, {
    $pull: { participants: participantId },
  });

  const updatedConversation = await Conversation.findById(conversationId);
  if (!updatedConversation.participants.length) {
    await updatedConversation.deleteOne();
    return null; // deleted conversation
  }
  return updatedConversation;
};

const leaveGroupConversationService = async (userId, conversationId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new ApiError(404, "Conversation not found");

  if (
    !conversation.participants.some((id) => id.toString() === userId.toString())
  ) {
    throw new ApiError(400, "You are not a participant in this conversation");
  }

  await Conversation.findByIdAndUpdate(conversationId, {
    $pull: { participants: userId },
  });

  const updatedConversation = await Conversation.findById(conversationId);
  if (!updatedConversation.participants.length) {
    await updatedConversation.deleteOne();
    return null;
  }

  if (conversation.admin.toString() === userId.toString()) {
    updatedConversation.admin = updatedConversation.participants[0];
    await updatedConversation.save();
  }

  return updatedConversation;
};

const updateGroupNameService = async (userId, conversationId, newName) => {
  if (!newName.trim()) throw new ApiError(400, "New group name is required");

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new ApiError(404, "Conversation not found");

  if (conversation.admin.toString() !== userId.toString()) {
    throw new ApiError(403, "Only admin can update group name");
  }

  conversation.groupName = newName.trim();
  await conversation.save();
  return conversation;
};

const getGroupParticipantsService = async (userId, conversationId) => {
  const conversation = await Conversation.findById(conversationId)
    .populate("participants", "name userId status")
    .populate("admin", "name userId status");
  if (!conversation) throw new ApiError(404, "Conversation not found");

  const isParticipant = conversation.participants.some(
    (p) => p._id.toString() === userId.toString()
  );
  if (!isParticipant)
    throw new ApiError(403, "You are not a participant in this conversation");

  return {
    participants: conversation.participants,
    admin: conversation.admin,
  };
};

export {
  createPrivateConversationService,
  getConversationsService,
  getConversationByIdService,
  createGroupConversationService,
  addParticipantsToGroupService,
  removeParticipantFromGroupService,
  leaveGroupConversationService,
  updateGroupNameService,
  getGroupParticipantsService,
};
