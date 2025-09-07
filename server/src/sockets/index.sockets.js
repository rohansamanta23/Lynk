import {
  initIO,
  userRoom,
  markOnline,
  markOffline,
  emitToUser,
} from "./helpers//registry.helpers.js";
import { socketAuth } from "./helpers/auth.helpers.js";

export const attachSocket = (server, { origin } = {}) => {
  const io = initIO(server, { origin });
  // auth middleware
  io.use(socketAuth);

  io.on("connection", (socket) => {
    const userId = socket.user?._id?.toString();
    if (!userId) {
      // no user attached by auth — disconnect
      socket.disconnect(true);
      return;
    }

    // join canonical user room (so we can simply io.to(userRoom(userId)).emit(...))
    socket.join(userRoom(userId));
    const { first } = markOnline(userId, socket.id);
    // notify friends *only on first connection* (not every tab)
    if (first) {
      // If you have a friend list service, get friend ids and notify those
      // const friends = await getFriendsIds(userId);
      // emitToUsers(friends, "presence:changed", { userId, online: true });
      // For a starter, you can broadcast globally (not recommended for large apps):
      io.emit("presence:changed", { userId, online: true });
    }
    // attach all domain handlers

    // small ping-pong healthcheck
    // socket.on("ping:client", () => {
    //   socket.emit("ping:server", { t: Date.now() });
    // });
    socket.on("disconnect", () => {
      const { last } = markOffline(userId, socket.id);
      if (last) {
        // notify friends *only on last disconnect* (not every tab)
        // const friends = await getFriendsIds(userId);
        // emitToUsers(friends, "presence:changed", { userId, online: false });
        io.emit("presence:changed", { userId, online: false });
      }
    });
  });
  return io;
};
