import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import app from "./app.js";
import { PORT, MONGO_URI } from "./config.js";

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

globalThis.io = io;

io.on("connection", socket => {
  console.log("New client connected:", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

const start = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("MongoDB connected");
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();

export { io };
