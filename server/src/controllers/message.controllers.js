import { Server } from "socket.io";
import http from "http";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Message } from "../models/message.models.js";
import { Conversation } from "../models/conversation.models.js";

const sendMessage = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(400, "User ID is required");

  const { conversationId, content } = req.body;
  if (!conversationId) throw new ApiError(400, "Conversation ID is required");
  if (!content.trim()) throw new ApiError(400, "Message content is required");

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new ApiError(404, "Conversation not found");

if (!conversation.participants.some(p => p.toString() === user._id.toString())) {
  throw new ApiError(403, "You are not a participant in this conversation");
}

  const message = await Message.create({
    conversation: conversationId,
    sender: user._id,
    content: content.trim(),
    messageType: "text",
  });

  conversation.lastMessage = message._id; // so conversation preview shows latest msg
  await conversation.save();

  // populate sender for response
  await message.populate("sender", "name userId");

  // emit via socket.io (later we’ll wire this up)
  // io.to(conversationId).emit("newMessage", message);

  return res
    .status(201)
    .json(
      new ApiResponse(
        { message, success: true },
        201,
        "Message sent successfully"
      )
    );
});

const getMessages = asyncHandler(async (req, res) => {
  const user = req.user;
  const { conversationId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100); // cap

  if (!user) throw new ApiError(400, "User required");
  if (!conversationId) throw new ApiError(400, "Conversation ID required");

  const conversation = await Conversation.findById(conversationId)
    .select("_id participants");
  if (!conversation) throw new ApiError(404, "Conversation not found");

  const isMember = conversation.participants
    .some(p => p.toString() === user._id.toString());
  if (!isMember) throw new ApiError(403, "Not a participant");

  const totalMessages = await Message.countDocuments({ conversation: conversationId });
  const totalPages = Math.ceil(totalMessages / limit) || 1;

  const messages = await Message.find({ conversation: conversationId })
    .populate("sender", "name userId")
    .sort({ createdAt: -1 })     // newest first (page 1 is newest)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return res.status(200).json(new ApiResponse({
    messages,
    pagination: {
      totalMessages,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
    }
  }, 200, "Messages retrieved"));
});



const markMessagesRead = asyncHandler(async (req, res) => {
  const user = req.user;
  const { conversationId } = req.params;
  const { uptoMessageId } = req.body || {};

  if (!user) throw new ApiError(400, "User required");
  if (!conversationId) throw new ApiError(400, "Conversation ID required");

  const conversation = await Conversation.findById(conversationId).select("_id participants");
  if (!conversation) throw new ApiError(404, "Conversation not found");

  const isMember = conversation.participants
    .some(p => p.toString() === user._id.toString());
  if (!isMember) throw new ApiError(403, "Not a participant");

  const query = {
    conversation: conversationId,
    sender: { $ne: user._id },
    readBy: { $ne: user._id },
  };

  if (uptoMessageId) {
    const uptoMsg = await Message.findById(uptoMessageId).select("createdAt conversation");
    if (!uptoMsg) throw new ApiError(404, "uptoMessageId not found");
    if (uptoMsg.conversation.toString() !== conversationId) {
      throw new ApiError(400, "Message does not belong to this conversation");
    }
    query.createdAt = { $lte: uptoMsg.createdAt };
  }

  const result = await Message.updateMany(query, { $addToSet: { readBy: user._id } });

  return res.status(200).json(
    new ApiResponse({ updated: result.modifiedCount }, 200, "Marked as read")
  );
});

export {
  sendMessage,
  getMessages,
  markMessagesRead
}