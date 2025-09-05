import { Server } from "socket.io";

let io = null;

const onlineUsers = new Map();

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized yet");
  return io;
};

export const initIO = (server, opts = {}) => {
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

export const userRoom = (userId) => `user:${userId}`;
export const conversationRoom = (conversationId) =>
  `conversation:${conversationId}`;
// Adds socket ID for a user
export const markOnline = (userId, socketId) => {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socketId);
};
// Removes socket ID, deletes user if no connections left
export const markOffline = (userId, socketId) => {
  const set = onlineUsers.get(userId);
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) onlineUsers.delete(userId);
};
// Quick check if user is currently online
export const isOnline = (userId) => onlineUsers.has(userId);

export const emitToUser = (userId, event, payload) => {
  getIO().to(userRoom(userId)).emit(event, payload);
};

export const emitToUsers = (userIds, event, payload) => {
  const rooms = userIds.map(userRoom);
  getIO().to(rooms).emit(event, payload);
};

export const emitToConversation = (conversationId, event, payload) => {
  getIO().to(conversationRoom(conversationId)).emit(event, payload);
};

// Returns a list of all online user IDs
export const getOnlineUsers = () => Array.from(onlineUsers.keys());
