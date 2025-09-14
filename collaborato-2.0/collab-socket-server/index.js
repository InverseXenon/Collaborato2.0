import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "https://your-frontend.vercel.app"],
    methods: ["GET", "POST"],
  },
});

// Track users per docId: { docId: Map<socket.id, userObj> }
const roomUsers = new Map();

io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  socket.on("join-doc", (docId, user) => {
    socket.join(docId);

    if (!roomUsers.has(docId)) roomUsers.set(docId, new Map());
    const map = roomUsers.get(docId);
    map.set(socket.id, user);

    io.to(docId).emit("presence", Array.from(map.values()));

    socket.on("typing", () => {
      socket.to(docId).emit("user-typing", { email: user.email });
    });

    // 🔥 NEW: broadcast quill deltas
    socket.on("send-delta", ({ docId, delta }) => {
      socket.to(docId).emit("receive-delta", { delta });
    });

    const leave = () => {
      map.delete(socket.id);
      io.to(docId).emit("presence", Array.from(map.values()));
    };

    socket.on("leave-doc", leave);
    socket.on("disconnect", leave);
  });
});

httpServer.listen(4000, () =>
  console.log("✅ Socket.io server running on http://localhost:4000")
);
