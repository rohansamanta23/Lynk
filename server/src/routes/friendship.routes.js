import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  getFriendList,
  getPendingFriendRequests,
  getSentFriendRequests,
  blockFriend,
  unblockFriend,
  getBlockedList
} from "../controllers/friendship.controllers.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);

router.post("/send", sendFriendRequest);
router.post("/:friendshipId/accept", acceptFriendRequest);
router.post("/:friendshipId/reject", rejectFriendRequest);
router.post("/:friendshipId/cancel", cancelFriendRequest);

router.delete("/:friendshipId/remove", removeFriend);

router.post("/:friendshipId/block", blockFriend);
router.post("/:friendshipId/unblock", unblockFriend);

router.get("/list", getFriendList);
router.get("/pending", getPendingFriendRequests);
router.get("/sent", getSentFriendRequests);
router.get("/blocked", getBlockedList);

export { router as friendshipRoutes };
