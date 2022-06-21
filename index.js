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

const addUser = (user, socketId) => {
users=users.map(item=>{
    if(item.socketId==socketId){
      return({...item,user:{...item.user,online:false,timeoff:new Date()}})
    }
    return({...item})
  })
  !users.some((item) => item.user.id === user.id) &&
    users.push({ user, socketId });
users.map(item=>{
    if(item.user.id==user.id){
      return({...item,user:{...item.user,online:true}})
    }
    return({...item})
  })
};

const removeUser = (socketId) => {
  users=users.map(item=>{
    if(item.socketId==socketId){
      return({...item,user:{...item.user,online:false,timeoff:new Date()}})
    }
    return({...item})
  })
};

io.on('connection', socket => {
  console.log("New client connected" + socket.id); 
    
  socket.on("addUser", (user) => {
    addUser(user, socket.id);
    io.emit("getUsers", users);
  });
  socket.on("broadcaster", () => {
    broadcaster = socket.id;
    socket.broadcast.emit("broadcaster");
  });
  
  socket.on("sendData", (data) => {
    io.emit("message", data);
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