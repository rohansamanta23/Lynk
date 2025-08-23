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
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!conversationId) throw new ApiError(400, "Conversation ID is required");

  const conversation = await Conversation.findById(conversationId).lean();
  if (!conversation) throw new ApiError(404, "Conversation not found");

  if (!conversation.participants.some(p => p.toString() === user._id.toString())) {
    throw new ApiError(403, "You are not a participant in this conversation");
  }

  const messages = await Message.find({ conversation: conversationId })
    .populate("sender", "userId name")
    .sort({ createdAt: -1 }) // newest first
    .skip(skip)
    .limit(limit)
    .lean();

  const totalMessages = await Message.countDocuments({ conversation: conversationId });
  const totalPages = Math.ceil(totalMessages / limit);

  res.status(200).json(
    new ApiResponse(
      {
        messages,
        pagination: {
          totalMessages,
          totalPages,
          currentPage: page,
          hasNextPage: page < totalPages,
        },
        success: true,
      },
      200,
      "Messages retrieved successfully"
    )
  );
});


const markMessageAsRead = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(400, "User ID is required");

  const { messageId } = req.body;
  if (!messageId) throw new ApiError(400, "Message ID is required");

  const message = await Message.findById(messageId);
  if (!message) throw new ApiError(404, "Message not found");

  // only participants can mark read
  const conversation = await Conversation.findById(message.conversation);
 if (!conversation.participants.some(p => p.toString() === user._id.toString())) {
    throw new ApiError(403, "You are not a participant in this conversation");
}

  // add user to readBy array if not already
  if (!message.readBy.some(r => r.toString() === user._id.toString())) {
    message.readBy.push(user._id);
    await message.save();
  }

  res.status(200).json(
    new ApiResponse(
      { message, success: true },
      200,
      "Message marked as read"
    )
  );
});
