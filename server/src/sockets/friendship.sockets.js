import { emitToUser, getIO } from "./helpers/registry.helpers";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  getFriendList,
  getPendingFriendRequests,
  getSentFriendRequests,
  blockFriend,
  unblockFriend,
  getBlockedList,
} from "../controllers/friendship.controllers.js";

export const friendSocket = (io, socket) => {
    const me = socket.user;
    if (!me) {
        socket.disconnect(true);
        return;
    }
  // send friend request
  socket.on("friend:request", async ({ recipientUserId }, ack) => {
    try {
      const friendship = await sendFriendRequest(me._id, recipientUserId);
      // notify recipient
      emitToUser(friendship.recipient.toString(), "friend:incoming", {
        friendshipId: friendship._id,
        requester: {
          _id: me._id,
          name: me.name,
          userId: me.userId,
          status: me.status,
        },
      });
      ack?.({ ok: true, friendship });
    } catch (err) {
      ack?.({ ok: false, message: err.message || "Failed to send request" });
    }
  });
};
// import { emitToUser } from "./helpers/registry.js";

// // These helpers are designed to be called from your REST controllers
// // after DB success, e.g. notifyFriendRequest({ to: recipientId, ... })

// export const notifyFriendRequest = ({ toUserId, request }) => {
//   emitToUser(toUserId, "friend:request", { request });
// };

// export const notifyFriendAccepted = ({ userIdA, userIdB, friendship }) => {
//   // notify both users
//   emitToUser(userIdA, "friend:accepted", { friendship });
//   emitToUser(userIdB, "friend:accepted", { friendship });
// };

// export const notifyFriendRejected = ({ toUserId, friendshipId }) => {
//   emitToUser(toUserId, "friend:rejected", { friendshipId });
// };

// export const notifyFriendBlocked = ({ blockerId, blockedId, friendship }) => {
//   emitToUser(blockerId, "friend:blocked", { friendship });
//   emitToUser(blockedId, "friend:blocked", { friendship });
// };

// export const notifyFriendUnblocked = ({ blockerId, blockedId, friendship }) => {
//   emitToUser(blockerId, "friend:unblocked", { friendship });
//   emitToUser(blockedId, "friend:unblocked", { friendship });
// };

// // If you want to ALSO support socket-initiated friendship actions,
// // you can register listeners here (optional). For now we leave it REST-only.
// export const registerFriendshipHandlers = (io, socket) => {
//   // placeholder: no inbound events right now
// };
