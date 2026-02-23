const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let rooms = {};

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("createRoom", (roomId, playerName) => {
    rooms[roomId] = { players: [playerName], board: Array(9).fill("") };
    socket.join(roomId);
    io.to(roomId).emit("roomUpdate", rooms[roomId]);
  });

  socket.on("joinRoom", (roomId, playerName) => {
    if (rooms[roomId] && rooms[roomId].players.length < 2) {
      rooms[roomId].players.push(playerName);
      socket.join(roomId);
      io.to(roomId).emit("roomUpdate", rooms[roomId]);
    } else {
      socket.emit("errorMsg", "Room full or not found");
    }
  });

  socket.on("makeMove", (roomId, index, player) => {
    if (rooms[roomId]) {
      rooms[roomId].board[index] = player;
      io.to(roomId).emit("boardUpdate", rooms[roomId].board);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
