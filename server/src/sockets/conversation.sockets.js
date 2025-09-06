// import {
//   conversationRoom,
//   emitToUsers,
// } from "./helpers/registry.js";
// import { Conversation } from "../models/conversation.models.js";

// export const registerConversationHandlers = (io, socket) => {
//   const uid = socket.user._id.toString();

//   // join all conversation rooms user belongs to (on connect)
//   (async () => {
//     try {
//       const convos = await Conversation.find({
//         participants: uid,
//       }).select("_id");
//       convos.forEach((c) => socket.join(conversationRoom(c._id.toString())));
//     } catch {}
//   })();

//   // manually join a conversation (client-side after navigation)
//   socket.on("conversation:join", ({ conversationId }) => {
//     if (!conversationId) return;
//     socket.join(conversationRoom(conversationId));
//   });

//   // leave a conversation room
//   socket.on("conversation:leave", ({ conversationId }) => {
//     if (!conversationId) return;
//     socket.leave(conversationRoom(conversationId));
//   });
// };

// /** ------- helpers you can import inside controllers (optional) ------- **/

// export const notifyConversationCreated = (conversation, participantIds) => {
//   emitToUsers(participantIds, "conversation:created", { conversation });
// };
// export const notifyConversationUpdated = (conversation, participantIds) => {
//   emitToUsers(participantIds, "conversation:updated", { conversation });
// };
// export const notifyConversationDeleted = (conversationId, participantIds) => {
//   emitToUsers(participantIds, "conversation:deleted", { conversationId });
// };
