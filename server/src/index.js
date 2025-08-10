import { createServer } from "http";
import { Server } from "socket.io";
import { app } from "./app.js";
import { connectDB } from "./db/index.db.js";
// import { privateChatSetup } from "./socket/privateChat.js";
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
  },
});

// privateChatSetup(io);

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