const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const fileRoutes = require("./routes/fileupload")
const postRoutes = require("./routes/post")
const app = express();
const socket = require("socket.io");
require("dotenv").config();
require("./tasks/cronApiCall")

app.use(cors());
app.use(express.json());
// console.log(process.env.MONGO_URL);

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.error("DB Connection Error:", err);
  });

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/posts", postRoutes);

app.get("/",(req,res)=>{
  res.send("Hello from Server")
})

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
const io = socket(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    console.log("DATA");
    console.log(onlineUsers);
    console.log("MSG:")
    console.log(data);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});
// global.onlineUsers = new Map();

// io.on("connection", (socket) => {
//   console.log(`Socket connected: ${socket.id}`);

//   socket.on("add-user", (userId) => {
//     console.log(`User added: ${userId}, Socket ID: ${socket.id}`);
//     onlineUsers.set(userId, socket.id);
//   });

//   socket.on("send-msg", (data) => {
//     console.log("Received message data:", data);

//     const senderSocketId = onlineUsers.get(data.from);
//     const receiverSocketId = onlineUsers.get(data.to);

//     console.log("Sender Socket ID:", senderSocketId);
//     console.log("Receiver Socket ID:", receiverSocketId);

//     if (receiverSocketId) {
//       socket.to(receiverSocketId).emit("msg-receive", data.msg);
//       console.log("Message sent to receiver:", data.to);
//     } else {
//       console.log("Receiver not found:", data.to);
//     }
//   });

//   socket.on("disconnect", () => {
//     // Remove disconnected user from onlineUsers
//     onlineUsers.forEach((value, key) => {
//       if (value === socket.id) {
//         onlineUsers.delete(key);
//         console.log(`User disconnected: ${key}`);
//       }
//     });
//   });
// });
