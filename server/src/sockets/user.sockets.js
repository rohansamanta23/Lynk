import {
  markOnline,
  markOffline,
  userRoom,
} from "./helpers/registry.helpers.js";
import { userStatusUpdate } from "../services/user.services.js";

export const userSockets = (io, socket) => {
  const userId = socket.user.userId.toString();
  try {
    socket.join(userRoom(userId));

    const { first } = markOnline({ id: userId, socketId: socket.id });
    if (first) {
      // If you have a friend list service, get friend ids and notify those
      // const friends = await getFriendsIds(userId);
      // emitToUsers(friends, "presence:changed", { userId, online: true });
      // For a starter, you can broadcast globally (not recommended for large apps):
      io.emit("presence:changed", { id: userId, status: "online" });
      userStatusUpdate(socket.user, "online").catch((err) => {
        console.error(
          `[userSockets] Failed to update status in DB for user ${userId}:`,
          err
        );
      });

      console.log(`[userSockets] User ${userId} is online (first connection)`);
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
        io.emit("presence:changed", { id: userId, status: "offline" });
        userStatusUpdate(socket.user, "offline").catch((err) => {
          console.error(
            `[userSockets] Failed to update status in DB for user ${userId}:`,
            err
          );
        });

        console.log(
          `[userSockets] User ${userId} is offline (last disconnect)`
        );
      }
    } catch (err) {
      console.error(
        `[userSockets] Failed to mark user ${userId} offline:`,
        err
      );
    }
  });
};
