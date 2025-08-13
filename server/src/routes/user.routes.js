import { Router } from "express";
import {
  getUser,
  updateUser,
  deleteUser,
   searchUsers,
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();

router
  .route("/me")
  .get(verifyJWT, getUser)
  .patch(verifyJWT, updateUser)
  .delete(verifyJWT, deleteUser);

router.route("/search").get(verifyJWT, searchUsers);

export { router as userRouters };
