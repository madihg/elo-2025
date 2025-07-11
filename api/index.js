const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let userCount = 0;

// Serve static files
app.use(express.static(path.join(__dirname, "../public")));

// Serve the word spreader at root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

// Serve how-do-you-home.html
app.get("/public/how-do-you-home.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/how-do-you-home.html"));
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("submitSentence", (sentence) => {
    io.emit("newSentence", sentence);
  });

  userCount++;
  io.emit("userCount", userCount);

  socket.on("disconnect", () => {
    userCount--;
    io.emit("userCount", userCount);
  });
});

// For Vercel serverless
if (process.env.NODE_ENV !== 'production') {
  server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
}

module.exports = app; 