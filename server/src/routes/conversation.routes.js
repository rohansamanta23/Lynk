import {
  getGroupParticipants,
  removeParticipantFromGroup,
  leaveGroupConversation,
  updateGroupName,
  addParticipantToGroup,
  createGroupConversation,
  getConversationsById,
  getConversations,
  createPrivateConversation,
} from "../controllers/conversation.controllers.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);

router.route("/private").post(createPrivateConversation);
router.route("/group").post(createGroupConversation);
router.route("/group/:conversationId/participants").post(addParticipantToGroup);
router.route("/group/:conversationId/leave").post(leaveGroupConversation);

router.route("/").get(getConversations);
router.route("/:conversationId").get(getConversationsById);
router.route("/group/:conversationId/participants").get(getGroupParticipants);

router.route("/group/:conversationId/participants/:userId").delete(removeParticipantFromGroup);

router.route("/group/:conversationId/name").put(updateGroupName);
