import {
  emitToUsers,
  markOnline,
  markOffline,
  userRoom,
} from "./helpers/registry.helpers.js";
import { Friendship } from "../models/friendship.models.js";

// find all accepted-friends for a user
const friendIdsOf = async (userId) => {
  const links = await Friendship.find({
    status: "accepted",
    $or: [{ requester: userId }, { recipient: userId }],
  }).select("requester recipient");
  return links.map((f) =>
    f.requester.toString() === userId.toString() ? f.recipient : f.requester
  );
};

export const registerUserHandlers = (io, socket) => {
  const uid = socket.user._id.toString();

  // join personal room for targeted emits
  socket.join(userRoom(uid));

  // presence: mark online and notify friends
  markOnline(uid, socket.id);

  (async () => {
    try {
      const friends = await friendIdsOf(uid);
      emitToUsers(
        friends,
        "user:online",
        { userId: uid }
      );
    } catch {}
  })();

  // optional: user-typing (global channel)
  socket.on("user:typing", (payload = {}) => {
    // e.g. payload = { isTyping: true }
    socket.broadcast.emit("user:typing", {
      userId: uid,
      isTyping: !!payload.isTyping,
    });
  });

  socket.on("disconnect", async () => {
    markOffline(uid, socket.id);

    // if fully offline (no more sockets), notify friends
    try {
      const friends = await friendIdsOf(uid);
      emitToUsers(
        friends,
        "user:offline",
        { userId: uid }
      );
    } catch {}
  });
};
