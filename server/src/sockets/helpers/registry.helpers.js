// helpers/registry.helpers.js
import { Server } from "socket.io";

let io = null;
const onlineUsers = new Map(); // Map<userId, Set<socketId>>

export const initIO = (server, opts = {}) => {
  if (io) return io; // guard double init
  io = new Server(server, {
    cors: {
      origin: opts.origin || "*",
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 25000,
    pingInterval: 10000,
  });
  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized yet");
  return io;
};

// Rooms helpers
export const userRoom = (userId) => `user:${userId}`;
export const conversationRoom = (conversationId) => `conversation:${conversationId}`;

// presence helpers
export const markOnline = (userId, socketId) => {
  let set = onlineUsers.get(userId);
  const had = !!set && set.size > 0;
  if (!set) {
    set = new Set();
    onlineUsers.set(userId, set);
  }
  set.add(socketId);
  return { first: !had, size: set.size };
};

export const markOffline = (userId, socketId) => {
  const set = onlineUsers.get(userId);
  if (!set) return { last: true, size: 0 };
  set.delete(socketId);
  const size = set.size;
  if (size === 0) onlineUsers.delete(userId);
  return { last: size === 0, size };
};

export const isOnline = (userId) => onlineUsers.has(userId);
export const getOnlineUsers = () => Array.from(onlineUsers.keys());
export const getUserSockets = (userId) => onlineUsers.get(userId) || new Set();

// Emit helpers — prefer rooms (safer across cluster adapters); fallback to socket IDs
export const emitToUser = (userId, event, payload) => {
  try {
    // preferred: user rooms (requires socket.join(userRoom(userId)) on connect)
    getIO().to(userRoom(userId)).emit(event, payload);
  } catch (err) {
    // fallback: emit to stored socket ids (local instance only)
    const sockets = onlineUsers.get(userId);
    if (!sockets) return;
    sockets.forEach((sid) => getIO().to(sid).emit(event, payload));
  }
};

export const emitToUsers = (userIds, event, payload) => {
  userIds.forEach((id) => emitToUser(id, event, payload));
};

export const emitToConversation = (conversationId, event, payload) => {
  getIO().to(conversationRoom(conversationId)).emit(event, payload);
};
