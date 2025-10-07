import { createServer } from "http";
import { app } from "./app.js";
import { connectDB } from "./db/index.db.js";
import { attachSocket } from "./sockets/index.sockets.js";
import { User } from "./models/user.models.js";

const httpServer = createServer(app);
const io = attachSocket(httpServer, {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
});

// ✅ Socket connection test
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    httpServer.listen(process.env.PORT, "0.0.0.0", () => {
      console.log(`Server is running on http://localhost:${process.env.PORT}`);
      console.log("Socket.IO server is running");
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  });

async function gracefulShutdown() {
  try {
    console.log("\n[Graceful Shutdown] Setting all users offline...");
    await User.updateMany({}, { status: "offline" });
    console.log("[Graceful Shutdown] All users set to offline.");
  } catch (err) {
    console.error("[Graceful Shutdown] Error setting users offline:", err);
  } finally {
    process.exit(0);
  }
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
