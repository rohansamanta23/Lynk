import {
  sendMessage,
  getMessages,
  markMessagesRead
} from "../controllers/message.controllers.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);

router.route("/:conversationId/messages").get(getMessages).post(sendMessage);
router.route("/:conversationId/messages/read").post(markMessagesRead);

export { router as messageRoutes };