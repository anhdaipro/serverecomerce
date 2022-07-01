const app = require('express')()
const http = require('http').createServer(app)
const socket = require("socket.io");
const cors = require("cors");
const io = socket(http, {
  cors: {
      origin: "*",
      methods:['GET','POST']
  }
}); 

app.use(cors());
const PORT = process.env.PORT || 5000;
let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

io.on('connection', socket => {
  console.log("New client connected" + socket.id); 
    
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });
  socket.on("broadcaster", () => {
    broadcaster = socket.id;
    socket.broadcast.emit("broadcaster");
  });
  
  socket.on("sendImage", (data) => {
    io.emit("messageimage", data);
  })
socket.on("sendFile", (data) => {
    io.emit("messagefile", data);
  })
socket.on("sendData", (data) => {
    io.emit("message", data);
  })


socket.on("addComment",(data)=>{
io.emit("comment",data)
})
socket.on("actionPost",(data)=>{
io.emit("post",data)
})
socket.on("sendNotifi", (listusers) => {
    io.emit("notifi", listusers);
  })
  socket.on("offer", (id, message) => {
    socket.to(id).emit("offer", socket.id, message);
  });
  socket.on("answer", (id, message) => {
    socket.to(id).emit("answer", socket.id, message);
  });
  socket.on("candidate", (id, message) => {
    socket.to(id).emit("candidate", socket.id, message);
  });
  socket.on("disconnect", () => {
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
})

http.listen(PORT, () => console.log(`Server is running on port ${PORT}`));