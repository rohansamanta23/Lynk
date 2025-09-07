import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  sendMessageService,
  getMessagesService,
  markMessagesReadService,
} from "../services/message.service.js";

// SEND MESSAGE
const sendMessage = asyncHandler(async (req, res) => {
  const message = await sendMessageService(req.user, req.body.conversationId, req.body.content);
  res
    .status(201)
    .json(new ApiResponse({ message, success: true }, 201, "Message sent successfully"));
});

// GET MESSAGES
const getMessages = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const result = await getMessagesService(req.user, req.params.conversationId, page, limit);

  res.status(200).json(new ApiResponse(result, 200, "Messages retrieved"));
});

// MARK READ
const markMessagesRead = asyncHandler(async (req, res) => {
  const updatedCount = await markMessagesReadService(
    req.user,
    req.params.conversationId,
    req.body?.uptoMessageId
  );

  res
    .status(200)
    .json(new ApiResponse({ updated: updatedCount }, 200, "Marked as read"));
});

export { sendMessage, getMessages, markMessagesRead };