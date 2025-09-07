import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createPrivateConversationService,
  getConversationsService,
  getConversationByIdService,
  createGroupConversationService,
  addParticipantsToGroupService,
  removeParticipantFromGroupService,
  leaveGroupConversationService,
  updateGroupNameService,
  getGroupParticipantsService,
} from "../services/conversation.services.js";

// PRIVATE
const createPrivateConversation = asyncHandler(async (req, res) => {
  const conversation = await createPrivateConversationService(req.user._id, req.body.friendId);
  res.status(201).json(new ApiResponse(conversation, 201, "Private conversation created"));
});

const getConversations = asyncHandler(async (req, res) => {
  const conversations = await getConversationsService(req.user._id);
  res.status(200).json(
    new ApiResponse(
      conversations,
      200,
      conversations.length ? "Conversations retrieved" : "No conversations found"
    )
  );
});

const getConversationsById = asyncHandler(async (req, res) => {
  const conversation = await getConversationByIdService(req.params.conversationId, req.user._id);
  res.status(200).json(new ApiResponse(conversation, 200, "Conversation retrieved"));
});

// GROUP
const createGroupConversation = asyncHandler(async (req, res) => {
  const conversation = await createGroupConversationService(
    req.user._id,
    req.body.groupName,
    req.body.participants
  );
  res.status(201).json(new ApiResponse(conversation, 201, "Group conversation created"));
});

const addParticipantToGroup = asyncHandler(async (req, res) => {
  const conversation = await addParticipantsToGroupService(
    req.user._id,
    req.params.conversationId,
    req.body.participantIds
  );
  res.status(200).json(new ApiResponse(conversation, 200, "Participants added"));
});

const removeParticipantFromGroup = asyncHandler(async (req, res) => {
  const updatedConversation = await removeParticipantFromGroupService(
    req.user._id,
    req.params.conversationId,
    req.params.participantId
  );
  if (!updatedConversation) {
    res.status(200).json(new ApiResponse(null, 200, "Conversation deleted as no participants left"));
  } else {
    res.status(200).json(new ApiResponse(updatedConversation, 200, "Participant removed"));
  }
});

const leaveGroupConversation = asyncHandler(async (req, res) => {
  const updatedConversation = await leaveGroupConversationService(req.user._id, req.params.conversationId);
  if (!updatedConversation) {
    res.status(200).json(new ApiResponse(null, 200, "Conversation deleted as no participants left"));
  } else {
    res.status(200).json(new ApiResponse(updatedConversation, 200, "Left group successfully"));
  }
});

const updateGroupName = asyncHandler(async (req, res) => {
  const conversation = await updateGroupNameService(
    req.user._id,
    req.params.conversationId,
    req.body.newName
  );
  res.status(200).json(new ApiResponse(conversation, 200, "Group name updated"));
});

const getGroupParticipants = asyncHandler(async (req, res) => {
  const result = await getGroupParticipantsService(req.user._id, req.params.conversationId);
  res.status(200).json(new ApiResponse(result, 200, "Group participants fetched"));
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
