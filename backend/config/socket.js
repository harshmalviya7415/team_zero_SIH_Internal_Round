const { Server } = require("socket.io");

const Printershopstatus = require("../models/printershopstatus");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
      ],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join_printer_room", async (printershopid) => {
      socket.printershopid = printershopid;
      socket.join(`printer_${printershopid}`);
      console.log(`Socket joined printer room: printer_${printershopid}`);

      try {
        await Printershopstatus.findOneAndUpdate(
          { printershopid },
          { status: "Active" },
          { upsert: true, new: true }
        );
        console.log(`Printer shop status set to Active for: ${printershopid}`);
         
        // Broadcast the real-time status change to all user dashboards
        io.emit("printer_status_changed", {
          printershopid,
          status: "Active"
        });
      } catch (error) {
        console.error("Error setting printer shop status to Active:", error);
      }
    });

    socket.on("disconnect", async () => {
      console.log("Socket disconnected:", socket.id);
      if (socket.printershopid) {
        try {
          await Printershopstatus.findOneAndUpdate(
            { printershopid: socket.printershopid },
            { status: "Inactive" },
            { new: true }
          );
          console.log(`Printer shop status set to Inactive for: ${socket.printershopid}`);

          // Broadcast the real-time status change to all user dashboards
          io.emit("printer_status_changed", {
            printershopid: socket.printershopid,
            status: "Inactive"
          });
        } catch (error) {
          console.error("Error setting printer shop status to Inactive:", error);
        }
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIO };
