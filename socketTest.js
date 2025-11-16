// client.js
const { io } = require("socket.io-client");
const socket = io("http://localhost:4000/chats");

socket.on("connect", () => {
  console.log("Connected to server:", socket.id);
  socket.emit("join:room", "4be3caaf-02c2-4cb0-9101-d08ba9e83b1f");
});

socket.on("message:send", (msg) => {
  console.log("Server says:", msg);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
