import jwt from "jsonwebtoken";
import { User } from "../../models/user.models.js";

const socketAuth = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) return next(new Error("Auth token missing"));

    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // try common places for user id in your JWT
    const candidate =
      payload?._id ||
      payload?.id ||
      payload?.authId ||
      payload?.user?._id ||
      payload?.userId;

    if (!candidate) return next(new Error("Invalid auth token"));

    const user = await User.findById(candidate).select("_id name userId status");
    if (!user) return next(new Error("User not found"));

    socket.user = {
      _id: user._id,
      name: user.name,
      userId: user.userId,
      status: user.status,
    };
    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
};

export { socketAuth };