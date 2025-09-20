// import {
//   conversationRoom,
//   emitToConversation,
// } from "./helpers/registry.js";
// import { Conversation } from "../models/conversation.models.js";
// import { Message } from "../models/message.models.js";

// const assertParticipant = (conversation, userId) => {
//   const ok = conversation.participants.some(
//     (p) => p.toString() === userId.toString()
//   );
//   if (!ok) {
//     const err = new Error("Not a participant");
//     err.code = "NOT_PARTICIPANT";
//     throw err;
//   }
// };

// export const registerMessageHandlers = (io, socket) => {
//   const uid = socket.user._id.toString();

//   // typing indicator for a specific conversation
//   socket.on("message:typing", ({ conversationId, isTyping }) => {
//     if (!conversationId) return;
//     socket.to(conversationRoom(conversationId)).emit("message:typing", {
//       conversationId,
//       userId: uid,
//       isTyping: !!isTyping,
//     });
//   });

//   // send message
//   socket.on("message:send", async (payload = {}, ack = () => {}) => {
//     try {
//       const {
//         conversationId,
//         content,
//         attachments = [],
//         messageType = "text",
//       } = payload;

//       if (!conversationId || (!content && attachments.length === 0)) {
//         return ack({ ok: false, error: "Invalid payload" });
//       }

//       const convo = await Conversation.findById(conversationId).select(
//         "participants"
//       );
//       if (!convo) return ack({ ok: false, error: "Conversation not found" });

//       assertParticipant(convo, uid);

//       const doc = await Message.create({
//         conversation: conversationId,
//         sender: uid,
//         content: content || "",
//         attachments,
//         messageType,
//         readBy: [uid], // sender has "read" by default
//       });

//       // Populate minimal sender to broadcast
//       const populated = await Message.findById(doc._id)
//         .populate("sender", "name userId")
//         .lean();

//       // broadcast to the room (including sender's other tabs)
//       emitToConversation(conversationId, "message:new", { message: populated });

//       // ack back to the sending socket
//       ack({ ok: true, message: populated });
//     } catch (err) {
//       ack({ ok: false, error: err.message || "Failed to send" });
//     }
//   });

//   // mark seen (read receipts)
//   socket.on("message:seen", async (payload = {}, ack = () => {}) => {
//     try {
//       const { conversationId, messageIds = [] } = payload;
//       if (!conversationId) return ack({ ok: false, error: "conversationId required" });

//       const convo = await Conversation.findById(conversationId).select(
//         "participants"
//       );
//       if (!convo) return ack({ ok: false, error: "Conversation not found" });
//       assertParticipant(convo, uid);

//       // update specific messages OR all up to latest
//       let filter = { conversation: conversationId };
//       if (Array.isArray(messageIds) && messageIds.length > 0) {
//         filter._id = { $in: messageIds };
//       }

//       await Message.updateMany(filter, {
//         $addToSet: { readBy: uid },
//       });

//       emitToConversation(conversationId, "message:seen", {
//         conversationId,
//         by: uid,
//         messageIds: messageIds.length ? messageIds : undefined,
//       });

//       ack({ ok: true });
//     } catch (err) {
//       ack({ ok: false, error: err.message || "Failed to mark seen" });
//     }
//   });
// };
