import { emitToConversation, emitToUser, conversationRoom } from "./helpers/registry.helpers.js";
import { createMessageService, getMessagesService } from "../services/message.services.js";
import { getConversationByIdService } from "../services/conversation.services.js";

export const conversationSockets = (io, socket) => {
  const me = socket.user;
  if (!me) {
    socket.disconnect(true);
    return;
  }

  const myId = me._id.toString();

  // ---- join conversation room
  socket.on("conversation:join", async ({ conversationId }, ack) => {
    try {
      if (!conversationId) {
        return ack?.({ ok: false, message: "conversationId is required" });
      }

      const conversation = await getConversationByIdService(conversationId, myId);

      // Join the socket to this conversation's room
      const room = conversationRoom(conversationId);
      socket.join(room);

      ack?.({
        ok: true,
        message: `Joined conversation ${conversationId}`,
        conversationId,
      });
    } catch (err) {
      console.error("[conversationSocket][join] Failed:", err);
      ack?.({ ok: false, message: err.message || "Failed to join conversation" });
    }
  });

  // ---- leave conversation room (optional but clean)
  socket.on("conversation:leave", ({ conversationId }, ack) => {
    try {
      const room = conversationRoom(conversationId);
      socket.leave(room);
      ack?.({ ok: true, conversationId });
    } catch (err) {
      console.error("[conversationSocket][leave] Failed:", err);
      ack?.({ ok: false, message: err.message || "Failed to leave conversation" });
    }
  });

  // ---- fetch messages (for scrolling/chat opening)
  socket.on("conversation:messages", async ({ conversationId, limit = 20, skip = 0 }, ack) => {
    try {
      const messages = await getMessagesService(conversationId, myId, { limit, skip });
      ack?.({ ok: true, messages });
    } catch (err) {
      console.error("[conversationSocket][messages] Failed:", err);
      ack?.({ ok: false, message: err.message || "Failed to fetch messages" });
    }
  });

  // ---- send message (main real-time event)
  socket.on("conversation:message", async ({ conversationId, text }, ack) => {
    try {
      if (!conversationId || !text?.trim()) {
        return ack?.({ ok: false, message: "conversationId and text are required" });
      }

      // create the message via service
      const message = await createMessageService({
        conversationId,
        senderId: myId,
        text,
      });

      // populate needed fields for front-end
      const payload = {
        _id: String(message._id),
        text: message.text,
        sender: {
          _id: myId,
          name: me.name,
          userId: me.userId,
        },
        conversationId: String(conversationId),
        createdAt: message.createdAt,
      };

      // emit to all users in this conversation room
      emitToConversation(conversationId, "conversation:newMessage", payload);

      // also update conversation list (for future list auto-refresh)
      emitToConversation(conversationId, "conversation:updated", {
        conversationId,
        lastMessage: {
          text: message.text,
          sender: { _id: myId, name: me.name },
          createdAt: message.createdAt,
        },
      });

      ack?.({ ok: true, message: payload });
    } catch (err) {
      console.error("[conversationSocket][message] Failed:", err);
      ack?.({ ok: false, message: err.message || "Failed to send message" });
    }
  });
};
