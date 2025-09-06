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

export const userRoom = (userId) => `user:${userId}`; //room for all devices of user

export const getUserSockets = (userId) => {
  //if user have multiple devices
  return onlineUsers.get(userId) || new Set();
};

//emit to all devices of user
export const emitToUser = (userId, event, data) => {
  const sockets = onlineUsers.get(userId);
  if (!sockets) return;
  sockets.forEach((socketId) => {
    getIO().to(socketId).emit(event, data);
  });
};

//emit to multiple users
export const emitToUsers = (userIds, event, data) => {
  userIds.forEach((userId) => {
    const sockets = onlineUsers.get(userId);
    if (!sockets) return;

    sockets.forEach((socketId) => {
      getIO().to(socketId).emit(event, data);
    });
  });
};

// export const conversationRoom = (conversationId) =>
//   `conversation:${conversationId}`;
// // Adds socket ID for a user
// export const markOnline = (userId, socketId) => {
//   if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
//   onlineUsers.get(userId).add(socketId);
// };
// // Removes socket ID, deletes user if no connections left
// export const markOffline = (userId, socketId) => {
//   const set = onlineUsers.get(userId);
//   if (!set) return;
//   set.delete(socketId);
//   if (set.size === 0) onlineUsers.delete(userId);
// };
// // Quick check if user is currently online
// export const isOnline = (userId) => onlineUsers.has(userId);

// export const emitToConversation = (conversationId, event, payload) => {
//   getIO().to(conversationRoom(conversationId)).emit(event, payload);
// };

// // Returns a list of all online user IDs
// export const getOnlineUsers = () => Array.from(onlineUsers.keys());
