import { initIO } from "./helpers/registry.js";
import { socketAuth } from "./helpers/auth.js";
import { registerUserHandlers } from "./user.sockets.js";
import { registerConversationHandlers } from "./conversation.sockets.js";
import { registerMessageHandlers } from "./message.sockets.js";
import { registerFriendshipHandlers } from "./friendship.sockets.js";

export const attachSocket = (server, { origin } = {}) => {
  const io = initIO(server, { origin });

  // auth middleware
  io.use(socketAuth);

  io.on("connection", (socket) => {
    // attach all domain handlers
    registerUserHandlers(io, socket);
    registerConversationHandlers(io, socket);
    registerMessageHandlers(io, socket);
    registerFriendshipHandlers(io, socket);

    // small ping-pong healthcheck
    socket.on("ping:client", () => socket.emit("ping:server", { t: Date.now() }));
  });

  return io;
};
