import { Message } from "../models/message.models.js";
import { Conversation } from "../models/conversation.models.js";
import { ApiError } from "../utils/ApiError.js";

// SEND MESSAGE
const sendMessageService = async (user, conversationId, content) => {
  if (!user) throw new ApiError(400, "User ID is required");
  if (!conversationId) throw new ApiError(400, "Conversation ID is required");
  if (!content.trim()) throw new ApiError(400, "Message content is required");

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new ApiError(404, "Conversation not found");

  if (!conversation.participants.some((p) => p.toString() === user._id.toString())) {
    throw new ApiError(403, "You are not a participant in this conversation");
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: user._id,
    content: content.trim(),
    messageType: "text",
  });

  conversation.lastMessage = message._id;
  await conversation.save();

  await message.populate("sender", "name userId");
  return message;
};

// GET MESSAGES
const getMessagesService = async (user, conversationId, page = 1, limit = 20) => {
  if (!user) throw new ApiError(400, "User required");
  if (!conversationId) throw new ApiError(400, "Conversation ID required");

  const conversation = await Conversation.findById(conversationId).select("_id participants");
  if (!conversation) throw new ApiError(404, "Conversation not found");

  const isMember = conversation.participants.some(
    (p) => p.toString() === user._id.toString()
  );
  if (!isMember) throw new ApiError(403, "Not a participant");

  limit = Math.min(limit, 100); // cap to 100
  const totalMessages = await Message.countDocuments({ conversation: conversationId });
  const totalPages = Math.ceil(totalMessages / limit) || 1;

  const messages = await Message.find({ conversation: conversationId })
    .populate("sender", "name userId")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return {
    messages,
    pagination: {
      totalMessages,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
    },
  };
};

// MARK READ
const markMessagesReadService = async (user, conversationId, uptoMessageId) => {
  if (!user) throw new ApiError(400, "User required");
  if (!conversationId) throw new ApiError(400, "Conversation ID required");

  const conversation = await Conversation.findById(conversationId).select("_id participants");
  if (!conversation) throw new ApiError(404, "Conversation not found");

  const isMember = conversation.participants.some(
    (p) => p.toString() === user._id.toString()
  );
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
  return result.modifiedCount;
};

export {
    sendMessageService,
    getMessagesService,
    markMessagesReadService,
}