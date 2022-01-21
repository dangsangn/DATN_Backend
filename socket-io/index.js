const server = require("../index.js");
//socket io
const socket = require("socket.io");
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const users = [];
//add a user
const addUser = (userId, socketId) => {
  userId && !users.some((user) => user.userId === userId) && users.push({ userId, socketId });
};

//remove a user
const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

//get a user
const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  //when a connection
  // console.log("connection: ", socket);

  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    const receiver = getUser(receiverId);
    io.to(receiver?.socketId).emit("getMessage", { senderId, message });
    console.log(message);
  });

  //when disconnect a user
  socket.on("disconection", (userId) => {
    removeUser(userId);
    io.emit("getUsers", users);
  });
});

module.exports = io;
