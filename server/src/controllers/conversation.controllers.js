import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { Friendship } from "../models/friendship.models.js";
import { Conversation } from "../models/conversation.models.js";

const createPrivateConversation = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(400, "User ID is required");
  }
  const { friendId } = req.body;
  if (!friendId) {
    throw new ApiError(400, "Friend ID is required");
  }
  const friend = await User.findById(friendId);
  if (!friend) {
    throw new ApiError(404, "User or Friend not found");
  }
  if (user._id.toString() === friend._id.toString()) {
    throw new ApiError(400, "You cannot chat with yourself");
  }
  const friendship = await Friendship.findOne({
    $or: [
      { requester: user._id, recipient: friend._id, status: "accepted" },
      { requester: friend._id, recipient: user._id, status: "accepted" },
    ],
  });
  if (!friendship) {
    throw new ApiError(404, "Friendship not found");
  }
  const pairKey = [user._id.toString(), friend._id.toString()].sort().join(":");
  const existingConversation = await Conversation.findOne({ pairKey });
  if (existingConversation) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          existingConversation,
          200,
          "Private conversation already exists"
        )
      );
  }
  const conversation = await Conversation.create({
    participants: [user._id, friend._id],
    isGroup: false,
    pairKey,
  });
  if (!conversation) {
    throw new ApiError(500, "Failed to create private conversation");
  }

  res
    .status(201)
    .json(new ApiResponse(conversation, 201, "Private conversation created"));
});

const getConversations = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(400, "User ID is required");
  }
  const conversations = await Conversation.find({
    participants: user._id,
  })
    .populate("participants", "name userId")
    .populate("lastMessage")
    .sort({ updatedAt: -1 })
    .lean();
  if (!conversations || conversations.length === 0) {
    res.status(200).json(new ApiResponse(null, 200, "No conversations found"));
  } else {
    res
      .status(200)
      .json(new ApiResponse(conversations, 200, "Conversations retrieved"));
  }
});

const getConversationsById = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(400, "User ID is required");
  }
  const { conversationId } = req.params;
  if (!conversationId) {
    throw new ApiError(400, "Conversation ID is required");
  }
  const conversation = await Conversation.findById(conversationId)
    .populate("participants", "name userId")
    .populate("lastMessage")
    .lean();
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }
  if (
    !conversation.participants.some(
      (p) => p._id.toString() === user._id.toString()
    )
  ) {
    throw new ApiError(403, "You are not a participant in this conversation");
  }
  res
    .status(200)
    .json(new ApiResponse(conversation, 200, "Conversation retrieved"));
});

//

const createGroupConversation = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(400, "User ID is required");
  }
  let { groupName, participants } = req.body;
  if (!participants || participants.length === 0) {
    throw new ApiError(400, "Participant IDs are required");
  }
  participants = participants.filter(
    (id) => id.toString() !== user._id.toString()
  );
  const friends = await User.find({ _id: { $in: participants } });
  if (!friends || friends.length === 0) {
    throw new ApiError(404, "Friends not found");
  }
  for (const friend of friends) {
    const userFriend = await Friendship.findOne({
      $or: [
        { requester: user._id, recipient: friend._id, status: "accepted" },
        { requester: friend._id, recipient: user._id, status: "accepted" },
      ],
    });
    if (!userFriend) {
      console.log(friend);
      throw new ApiError(
        403,
        "You can only create group conversations with friends"
      );
    }
  }
  const allParticipants = [
    ...new Set([user._id, ...friends.map((f) => f._id)]),
  ];
  const conversation = await Conversation.create({
    participants: allParticipants,
    isGroup: true,
    groupName,
    admin: user._id,
  });
  if (!conversation) {
    throw new ApiError(500, "Failed to create group conversation");
  }

  res
    .status(201)
    .json(new ApiResponse(conversation, 201, "Group conversation created"));
});

const addParticipantToGroup = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(400, "User ID is required");
  }
  const { conversationId } = req.params;
  const { participantIds } = req.body;
  if (!conversationId) {
    throw new ApiError(400, "Conversation ID is required");
  }
  const conversation = await Conversation.findById(conversationId); //find the convo
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }
  if (conversation.admin.toString() !== user._id.toString()) {
    //admin check
    throw new ApiError(403, "Only admin can add participants");
  }
  if (!participantIds || participantIds.length === 0) {
    throw new ApiError(400, "Participants are required");
  }
  const participants = await User.find({ _id: { $in: participantIds } }).select(
    "_id name userId"
  ); //find all the participants
  if (!participants || participants.length === 0) {
    throw new ApiError(404, "Participants not found");
  }
  //check if the participants are friends
  for (const p of participants) {
    const userFriend = await Friendship.findOne({
      $or: [
        { requester: user._id, recipient: p._id, status: "accepted" },
        { requester: p._id, recipient: user._id, status: "accepted" },
      ],
    });
    if (!userFriend) {
      throw new ApiError(403, `You can only add friends to the group`);
    }
  }
  participants.forEach((p) => {
    if (
      conversation.participants.some((id) => id.toString() === p._id.toString())
    ) {
      throw new ApiError(400, `User ${p.name} is already in the group`);
    }
  });
  console.log(`hit`);
  participants.forEach((p) => {
    conversation.participants.push(p._id);
  });
  await conversation.save();
  res
    .status(200)
    .json(
      new ApiResponse({ conversation, success: true }, 200, "Participant added")
    );
});

const removeParticipantFromGroup = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(400, "User ID is required");
  }
  const { conversationId, participantId } = req.params;
  console.log(conversationId, participantId);
  if (!conversationId) {
    throw new ApiError(400, "Conversation ID is required");
  }
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }
  if (!participantId) {
    throw new ApiError(400, "Participant ID is required");
  }
  const participant = await User.findById(participantId).select("_id name");
  if (!participant) {
    throw new ApiError(404, "Participant not found");
  }
  const isAdmin = conversation.admin.toString() === user._id.toString();
  const isSelf = participant._id.toString() === user._id.toString();
  if (!isAdmin) {
    throw new ApiError(403, "Only admin can remove a participant");
  }
  if (isSelf) {
    throw new ApiError(403, "You cannot remove yourself"); //this option only be availabe in leave group
  }
  //check if the participant is in the conversation or not
  for (const p of conversation.participants) {
    if (p.toString() !== participant._id.toString()) {
      break;
    }
    throw new ApiError(400, "Participant is not in the conversation");
  }

  await Conversation.findByIdAndUpdate(conversationId, {
    $pull: { participants: participant._id },
  });
  const updatedConversation = await Conversation.findById(conversationId);
  if (updatedConversation.participants.length) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          { updatedConversation, success: true },
          200,
          "Participant removed successfully"
        )
      );
  } else {
    await updatedConversation.deleteOne();
    return res
      .status(200)
      .json(
        new ApiResponse(
          { success: true },
          200,
          "Conversation deleted as no participants left"
        )
      );
  }
});

const leaveGroupConversation = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(400, "User ID is required");
  }
  const { conversationId } = req.params;
  if (!conversationId) {
    throw new ApiError(400, "Conversation ID is required");
  }
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }
  for (const p of conversation.participants) {
    if (p.toString() === user._id.toString()) {
      break;
    }
    throw new ApiError(400, "You are not a participant in this conversation");
  }
  const isAdmin = conversation.admin.toString() === user._id.toString();
  await Conversation.findByIdAndUpdate(conversationId, {
    $pull: { participants: user._id },
  });
  const updatedConversation = await Conversation.findById(conversationId);
  if (isAdmin) {
    if (updatedConversation.participants.length) {
      updatedConversation.admin = updatedConversation.participants[0];
      await updatedConversation.save();
    } else {
      await updatedConversation.deleteOne();
      return res
        .status(200)
        .json(
          new ApiResponse(
            { success: true },
            200,
            "Conversation deleted as no participants left"
          )
        );
    }
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        { conversation: updatedConversation, success: true },
        200,
        "Left group successfully"
      )
    );
});

const updateGroupName = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(400, "User ID is required");
  }
  const { conversationId } = req.params;
  const { newName } = req.body;
  if (!conversationId) {
    throw new ApiError(400, "Conversation ID is required");
  }
  if (!newName.trim()) {
    throw new ApiError(400, "New group name is required");
  }
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }
  const isAdmin = conversation.admin.toString() === user._id.toString();
  if (!isAdmin) {
    throw new ApiError(403, "Only admin can update group name");
  }
  if (conversation.groupName === newName.trim()) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          { conversation, success: true },
          200,
          "Group name unchanged (same as before)"
        )
      );
  }
  conversation.groupName = newName.trim();
  await conversation.save();
  res
    .status(200)
    .json(
      new ApiResponse(
        { conversation, success: true },
        200,
        "Group name updated successfully"
      )
    );
});

const getGroupParticipants = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(400, "User ID is required");
  }
  const { conversationId } = req.params;
  if (!conversationId) {
    throw new ApiError(400, "Conversation ID is required");
  }
  const conversation = await Conversation.findById(conversationId)
    .populate("participants", "name userId status")
    .populate("admin", "name userId status");
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }
  const isParticipant = conversation.participants.some(
    (p) => p._id.toString() === user._id.toString()
  );
  console.log(conversation.participants);
  if (!isParticipant) {
    throw new ApiError(400, "You are not a participant in this conversation");
  }
  res.status(200).json(
    new ApiResponse(
      {
        participants: conversation.participants,
        admin: conversation.admin,
        success: true,
      },
      200,
      "Group participants fetched successfully"
    )
  );
});

export {
  getGroupParticipants,
  removeParticipantFromGroup,
  leaveGroupConversation,
  updateGroupName,
  addParticipantToGroup,
  createGroupConversation,
  getConversationsById,
  getConversations,
  createPrivateConversation,
};
