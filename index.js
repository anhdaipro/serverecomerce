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
io.on('connection', socket => {
  console.log("New client connected" + socket.id); 
    socket.on('stream', data=> {
    // send stream back to room
      socket.broadcast.emit('live',{data});
  });
  socket.on("broadcaster", () => {
    broadcaster = socket.id;
    socket.broadcast.emit("broadcaster");
  });
  socket.on("watcher", () => {
    socket.broadcast.emit("watch", socket.id);
  });
  socket.on("sendData", (data) => {
    io.emit("message", {data});
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
    console.log("Client disconnected"); // Khi client disconnect thì log ra terminal.
  });
})

http.listen(PORT, () => console.log(`Server is running on port ${PORT}`));