const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let userCount = 0;

app.use(express.static("public")); // Serve static files from 'public' directory

// Serve the word spreader at root
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("submitSentence", (sentence) => {
    // Broadcast the sentence to all clients, including the sender
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
