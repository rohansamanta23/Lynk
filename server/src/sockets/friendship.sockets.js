// import { emitToUser } from "./helpers/registry.js";

// // These helpers are designed to be called from your REST controllers
// // after DB success, e.g. notifyFriendRequest({ to: recipientId, ... })

// export const notifyFriendRequest = ({ toUserId, request }) => {
//   emitToUser(toUserId, "friend:request", { request });
// };

// export const notifyFriendAccepted = ({ userIdA, userIdB, friendship }) => {
//   // notify both users
//   emitToUser(userIdA, "friend:accepted", { friendship });
//   emitToUser(userIdB, "friend:accepted", { friendship });
// };

// export const notifyFriendRejected = ({ toUserId, friendshipId }) => {
//   emitToUser(toUserId, "friend:rejected", { friendshipId });
// };

// export const notifyFriendBlocked = ({ blockerId, blockedId, friendship }) => {
//   emitToUser(blockerId, "friend:blocked", { friendship });
//   emitToUser(blockedId, "friend:blocked", { friendship });
// };

// export const notifyFriendUnblocked = ({ blockerId, blockedId, friendship }) => {
//   emitToUser(blockerId, "friend:unblocked", { friendship });
//   emitToUser(blockedId, "friend:unblocked", { friendship });
// };

// // If you want to ALSO support socket-initiated friendship actions,
// // you can register listeners here (optional). For now we leave it REST-only.
// export const registerFriendshipHandlers = (io, socket) => {
//   // placeholder: no inbound events right now
// };
