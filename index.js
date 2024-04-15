const socket = require("socket.io");
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const dotenv = require("dotenv");

dotenv.config();


const port = 8008;
const io = socket(server, {
  cors: {
    origin: ["*"]
  },
});

let users = [];

app.get("/", (req, res) => {
  res.send("Server is up and running");
});

// socket connection
io.on("connection", (socket) => {
  console.log(socket.id, "user connected");
  console.log("Socket connected");

  // for username
  socket.on("set-userName", ({ userName }) => {
    socket.userName = userName;
    console.log("userName", userName);
    socket.emit("userName", { userName: userName });

    // for joining message
    // for self
    socket.emit("infoMessage", {
      textMessage: "You joined the chat",
      infoMessage: true,
    });
    // for others
    socket.broadcast.emit("infoMessage", {
      textMessage: `${socket.userName ? userName : "A new user"
        } joined the chat`,
      infoMessage: true,
    });
    users = [...users, { userName: socket.userName, id: socket.id }];
  });

  // for message
  socket.on("message", ({ textMessage, userId, userName }) => {
    //for self
    socket.emit("message", {
      textMessage,
      userId,
      userName: userName === socket.userName ? "You" : userName,
      selfMessage: true,
      infoMessage: false,
    });
    // for others
    socket.broadcast.emit("message", {
      textMessage,
      userId,
      userName: userName,
      selfMessage: false,
      infoMessage: false,
    });
  });

  // socket disconncetion
  socket.on("disconnect", () => {
    console.log("User disconnected");
    socket.broadcast.emit("infoMessage", {
      textMessage: `${socket.userName} left the chat`,
      infoMessage: true,
    });
    users = users.filter((user) => user.id !== socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}/`);
});
