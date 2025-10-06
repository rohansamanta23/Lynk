import { socket } from "../index.js";

const listenPresenceChanged = (cb) => {
  if (socket) {
    socket.on("presence:changed", cb);
  }
};

const stopListenPresenceChanged = (cb) => {
  if (socket) {
    socket.off("presence:changed", cb);
  }
};

export { listenPresenceChanged, stopListenPresenceChanged };
