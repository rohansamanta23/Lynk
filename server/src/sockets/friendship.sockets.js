import { emitToUser } from "./helpers/registry.helpers.js";
import {
  sendFriendRequestService,
  cancelFriendRequestService,
  acceptFriendRequestService,
  rejectFriendRequestService,
  removeFriendService,
  blockFriendService,
  unblockFriendService,
} from "../services/friendship.services.js";
import { createPrivateConversationService } from "../services/conversation.services.js";

export const friendSockets = (io, socket) => {
  const me = socket.user;
  if (!me) {
    socket.disconnect(true);
    return;
  }

  const myId = me._id.toString();

  // normalizes a friendship-like object to a predictable plain payload
  const normalize = (f) => ({
    _id: String(f._id),
    requester: String(f.requester),
    recipient: String(f.recipient),
    status: f.status,
  });

  // ---- send friend request
  socket.on("friend:request", async ({ recipientUserId }, ack) => {
    try {
      if (!recipientUserId) {
        return ack?.({ ok: false, message: "Recipient userId is required" });
      }

      const friendship = await sendFriendRequestService(myId, recipientUserId);
      const payload = normalize(friendship);

      // notify recipient only
      emitToUser(payload.recipient, "friend:incoming", {
        friendshipId: payload._id,
        requester: {
          _id: myId,
          name: me.name,
          userId: me.userId,
          status: me.status,
        },
      });

      ack?.({ ok: true, friendship: payload });
    } catch (err) {
      console.error("[friendSocket][friend:request] Failed:", err);
      ack?.({ ok: false, message: err.message || "Failed to send request" });
    }
  });

  // ---- cancel sent request
  // Note: service should return a snapshot (see suggestions below). We defensively normalize here.
  socket.on("friend:cancel", async ({ friendshipId }, ack) => {
    try {
      if (!friendshipId) {
        return ack?.({ ok: false, message: "friendshipId is required" });
      }

      const friendship = await cancelFriendRequestService(myId, friendshipId);
      if (!friendship) {
        return ack?.({ ok: false, message: "Friendship not found" });
      }

      const payload = normalize(friendship);

      // notify both sides (UI can decide what to do)
      emitToUser(payload.recipient, "friend:cancelled", {
        friendshipId: payload._id,
        requesterId: payload.requester,
      });
      emitToUser(payload.requester, "friend:cancelled", {
        friendshipId: payload._id,
        requesterId: payload.requester,
      });

      ack?.({ ok: true, friendshipId: payload._id });
    } catch (err) {
      console.error("[friendSocket][friend:cancel] Failed:", err);
      ack?.({ ok: false, message: err.message || "Failed to cancel request" });
    }
  });

  // ---- accept received request
  socket.on("friend:accept", async ({ friendshipId }, ack) => {
    try {
      if (!friendshipId) {
        return ack?.({ ok: false, message: "friendshipId is required" });
      }

      const friendship = await acceptFriendRequestService(myId, friendshipId);
      if (!friendship) {
        return ack?.({ ok: false, message: "Friendship not found" });
      }
      // create a private conversation between the two users
      const convo = await createPrivateConversationService(
        myId,
        friendship.requester.toString()
      );

      const friendshipPayload = normalize(friendship);
      const conversationPayload = {
        _id: String(convo._id),
        participants: convo.participants.map((p) => String(p)),
        isGroup: convo.isGroup,
        updatedAt: convo.updatedAt,
      };

      // notify both users
      emitToUser(friendshipPayload.requester, "friend:accepted", {
        friendship: friendshipPayload,
        conversation: conversationPayload,
      });
      emitToUser(friendshipPayload.recipient, "friend:accepted", {
        friendship: friendshipPayload,
        conversation: conversationPayload,
      });

      ack?.({ ok: true, friendship: friendshipPayload });
    } catch (err) {
      console.error("[friendSocket][friend:accept] Failed:", err);
      ack?.({ ok: false, message: err.message || "Failed to accept request" });
    }
  });

  // ---- reject received request
  socket.on("friend:reject", async ({ friendshipId }, ack) => {
    try {
      if (!friendshipId) {
        return ack?.({ ok: false, message: "friendshipId is required" });
      }

      const friendship = await rejectFriendRequestService(myId, friendshipId);
      if (!friendship) {
        return ack?.({ ok: false, message: "Friendship not found" });
      }

      const payload = normalize(friendship);

      // notify requester (and optionally recipient)
      emitToUser(payload.requester, "friend:rejected", {
        friendshipId: payload._id,
        recipientId: payload.recipient,
      });
      emitToUser(payload.recipient, "friend:rejected", {
        friendshipId: payload._id,
        recipientId: payload.recipient,
      });

      ack?.({ ok: true, friendshipId: payload._id });
    } catch (err) {
      console.error("[friendSocket][friend:reject] Failed:", err);
      ack?.({ ok: false, message: err.message || "Failed to reject request" });
    }
  });

  // ---- remove friend
  socket.on("friend:remove", async ({ friendshipId }, ack) => {
    try {
      if (!friendshipId) {
        return ack?.({ ok: false, message: "friendshipId is required" });
      }

      const friendship = await removeFriendService(myId, friendshipId);
      if (!friendship) {
        return ack?.({ ok: false, message: "Friendship not found" });
      }

      const payload = normalize(friendship);

      // notify both users that this friendship was removed
      emitToUser(payload.requester, "friend:removed", {
        friendshipId: payload._id,
        removedId: myId,
      });
      emitToUser(payload.recipient, "friend:removed", {
        friendshipId: payload._id,
        removedId: myId,
      });

      ack?.({ ok: true, friendshipId: payload._id });
    } catch (err) {
      console.error("[friendSocket][friend:remove] Failed:", err);
      ack?.({ ok: false, message: err.message || "Failed to remove friend" });
    }
  });

  // ---- block user
  socket.on("friend:block", async ({ friendshipId }, ack) => {
    try {
      if (!friendshipId) {
        return ack?.({ ok: false, message: "friendshipId is required" });
      }

      const friendship = await blockFriendService(myId, friendshipId);
      if (!friendship) {
        return ack?.({ ok: false, message: "Friendship not found" });
      }

      const payload = normalize(friendship);
      const blockedBy = myId;

      // notify the other user (the one who got blocked)
      const otherId =
        payload.requester === myId ? payload.recipient : payload.requester;
      emitToUser(otherId, "friend:blocked", { friendship: payload, blockedBy });

      ack?.({ ok: true, friendship: payload, blockedBy });
    } catch (err) {
      console.error("[friendSocket][friend:block] Failed:", err);
      ack?.({ ok: false, message: err.message || "Failed to block user" });
    }
  });

  // ---- unblock user
  socket.on("friend:unblock", async ({ friendshipId }, ack) => {
    try {
      if (!friendshipId) {
        return ack?.({ ok: false, message: "friendshipId is required" });
      }

      const friendship = await unblockFriendService(myId, friendshipId);
      if (!friendship) {
        return ack?.({ ok: false, message: "Friendship not found" });
      }

      const payload = normalize(friendship);
      const unblockedBy = myId;

      // notify the other user (the one who got unblocked)
      const otherId =
        payload.requester === myId ? payload.recipient : payload.requester;
      emitToUser(otherId, "friend:unblocked", {
        friendship: payload,
        unblockedBy,
      });

      ack?.({ ok: true, friendship: payload, unblockedBy });
    } catch (err) {
      console.error("[friendSocket][friend:unblock] Failed:", err);
      ack?.({ ok: false, message: err.message || "Failed to unblock user" });
    }
  });
};
