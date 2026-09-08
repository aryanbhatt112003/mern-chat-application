const { Server } = require("socket.io");

const userSocketMap = {};

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap[userId] = socket.id;
    }

    console.log("Connected Users:", userSocketMap);

    io.emit("onlineUsers",
      Object.keys(userSocketMap)
    );

    socket.on("typing", ({ senderId, receiverId }) => {
  const receiverSocketId = userSocketMap[receiverId];

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("typing", {
      senderId,
    });
  }
});

    socket.on("disconnect", () => {
      const userId = Object.keys(userSocketMap).find(
        (key) => userSocketMap[key] === socket.id
      );

      if (userId) {
        delete userSocketMap[userId];
      }

      console.log("Connected Users:", userSocketMap);

      io.emit("onlineUsers",
        Object.keys(userSocketMap)
      );
    });
  });
};

module.exports = {
  initializeSocket,
  getIO: () => io,
  userSocketMap,
};