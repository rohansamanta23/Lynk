import { initIO } from "./helpers/registry.helpers.js";
import { socketAuth } from "./helpers/auth.helpers.js";
import { userSockets } from "./user.sockets.js";
import { friendSockets } from "./friendship.sockets.js";

export const attachSocket = (server, { origin } = {}) => {
  const io = initIO(server, { origin });

  // auth middleware
  io.use(socketAuth);

  io.on("connection", (socket) => {
    const userId = socket.user?._id?.toString();
    if (!userId) {
      socket.disconnect(true);
      return;
    }

    // attach all domain handlers
    userSockets(io, socket);
    friendSockets(io, socket);

    // small ping-pong healthcheck
    // socket.on("ping:client", () => {
    //   socket.emit("ping:server", { t: Date.now() });
    // });
  });
  return io;
};
