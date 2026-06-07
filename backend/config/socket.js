// config/socket.js
// Singleton pattern to share Socket.IO instance across all modules.
// Set once in server.js, then getIO() in any controller.

let io = null;

const setIO = (ioInstance) => {
  io = ioInstance;
};

const getIO = () => io;

module.exports = { setIO, getIO };
