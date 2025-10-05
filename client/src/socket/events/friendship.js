import { socket } from "../index.js";

// ---- send friend request
const sendFriendRequest = (recipientUserId, ack) => {
  // ...
  if (socket.connected) {
    socket.emit("friend:request", { recipientUserId }, (res) => {
      if (ack) ack(res);
    });
  } else {
    socket.connect();
    const onConnect = () => {
      // ...
      socket.emit("friend:request", { recipientUserId }, (res) => {
        if (ack) ack(res);
      });
      socket.off("connect", onConnect);
    };
    socket.on("connect", onConnect);
  }
};
// ---- cancel sent request
const cancelFriendRequest = (friendshipId, ack) => {
  if (socket.connected) {
    socket.emit("friend:cancel", { friendshipId }, (res) => {
      if (ack) ack(res);
    });
  } else {
    socket.connect();
    const onConnect = () => {
      // ...
      socket.emit("friend:cancel", { friendshipId }, (res) => {
        if (ack) ack(res);
      });
      socket.off("connect", onConnect);
    };
    socket.on("connect", onConnect);
  }
};
// ---- accept received request
const acceptFriendRequest = (friendshipId, ack) => {
  if (socket.connected) {
    socket.emit("friend:accept", { friendshipId }, (res) => {
      if (ack) ack(res);
    });
  } else {
    socket.connect();
    const onConnect = () => {
      // ...
      socket.emit("friend:accept", { friendshipId }, (res) => {
        if (ack) ack(res);
      });
      socket.off("connect", onConnect);
    };
    socket.on("connect", onConnect);
  }
};
// ---- reject received request
const rejectFriendRequest = (friendshipId, ack) => {
  if (socket.connected) {
    socket.emit("friend:reject", { friendshipId }, (res) => {
      if (ack) ack(res);
    });
  } else {
    socket.connect();
    const onConnect = () => {
      // ...
      socket.emit("friend:reject", { friendshipId }, (res) => {
        if (ack) ack(res);
      });
      socket.off("connect", onConnect);
    };
    socket.on("connect", onConnect);
  }
};
// ---- remove friend
const removeFriend = (friendshipId, ack) => {
  if (socket.connected) {
    socket.emit("friend:remove", { friendshipId }, (res) => {
      if (ack) ack(res);
    });
  } else {
    socket.connect();
    const onConnect = () => {
      socket.emit("friend:remove", { friendshipId }, (res) => {
        if (ack) ack(res);
      });
      socket.off("connect", onConnect);
    };
    socket.on("connect", onConnect);
  }
};

const listenFriendIncoming = (cb) => socket.on("friend:incoming", cb);
const stopListenFriendIncoming = (cb) => socket.off("friend:incoming", cb);

const listenFriendSent = (cb) => socket.on("friend:sent", cb);
const stopListenFriendSent = (cb) => socket.off("friend:sent", cb);

const listenFriendCancelled = (cb) => socket.on("friend:cancelled", cb);
const stopListenFriendCancelled = (cb) => socket.off("friend:cancelled", cb);

const listenFriendAccepted = (cb) => socket.on("friend:accepted", cb);
const stopListenFriendAccepted = (cb) => socket.off("friend:accepted", cb);

const listenFriendRejected = (cb) => socket.on("friend:rejected", cb);
const stopListenFriendRejected = (cb) => socket.off("friend:rejected", cb);

const listenFriendRemoved = (cb) => socket.on("friend:removed", cb);
const stopListenFriendRemoved = (cb) => socket.off("friend:removed", cb);

export {
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  listenFriendIncoming,
  stopListenFriendIncoming,
  listenFriendSent,
  stopListenFriendSent,
  listenFriendCancelled,
  stopListenFriendCancelled,
  listenFriendAccepted,
  stopListenFriendAccepted,
  listenFriendRejected,
  stopListenFriendRejected,
  listenFriendRemoved,
  stopListenFriendRemoved,
};
