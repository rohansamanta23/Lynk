import {
  markOnline,
  markOffline,
  userRoom,
} from "./helpers/registry.helpers.js";

export const userSockets = (io, socket) => {
  const userId = socket.user._id.toString();
  try {
    // join canonical user room (so we can simply io.to(userRoom(userId)).emit(...))
    socket.join(userRoom(userId));

    const { first } = markOnline(userId, socket.id);
    if (first) {
      // If you have a friend list service, get friend ids and notify those
      // const friends = await getFriendsIds(userId);
      // emitToUsers(friends, "presence:changed", { userId, online: true });
      // For a starter, you can broadcast globally (not recommended for large apps):
      io.emit("presence:changed", { userId, online: true });
    }
  } catch (err) {
    console.error(`[userSockets] Failed to mark user ${userId} online:`, err);
  }
  socket.on("disconnect", () => {
    try {
      const { last } = markOffline(userId, socket.id);
      if (last) {
        // notify friends *only on last disconnect* (not every tab)
        // const friends = await getFriendsIds(userId);
        // emitToUsers(friends, "presence:changed", { userId, online: false });
        io.emit("presence:changed", { userId, online: false });
      }
    } catch (err) {
      console.error(
        `[userSockets] Failed to mark user ${userId} offline:`,
        err
      );
    }
  });
};

// // Update profile
// socket.on("user:update", async (payload, ack) => {
//   const { name, userId, password } = payload || {};
//   if (!name?.trim() && !userId?.trim() && !password?.trim()) {
//     ack?.({ ok: false, error: "Invalid payload" });
//     return;
//   }
//   try {
//     const updatedUser = await updateUserService(me, payload);
//     // Only notify friends if name or userId is updated
//     if (payload.name?.trim() || payload.userId?.trim()) {
//       const friendsList = await getFriendListService(me);
//       const friendIds = friendsList.map((f) => f.friend._id.toString());
//       emitToUsers(friendIds, "user:updated", {
//         user: {
//           _id: updatedUser.user._id,
//           name: updatedUser.user.name,
//           userId: updatedUser.user.userId,
//         },
//       });
//     }
//     ack?.({ ok: true, user: updatedUser.user, changes: updatedUser.changes });
//   } catch (err) {
//     ack?.({ ok: false, error: err.message || "Failed to update user" });
//   }
// });
