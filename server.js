require('dotenv').config()

const express = require('express');
const cors = require('cors')
const http = require('http');


const app = express();
const server = http.createServer(app);
const socketio = require("socket.io");
var path = require('path');
const connectDB = require('./mongodb')
const handleError = require('./middleware/handleError');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const initChessSocket = require('./chessSocket');
const User = require('./models/User');

connectDB()

app.use(cors())
app.use(express.json())

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.use(handleError)

app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/build/index.html'));
});

const io = socketio(server)

let onlineLoggedUsers = {}
io.on("connection", socket => {
  initChessSocket(socket, io)


  socket.on("userLogged", (userId) => {
    onlineLoggedUsers[socket.id] = userId
  })

  socket.on("userLogout", (userId) => {
    delete onlineLoggedUsers[socket.id]
  })

  socket.on("disconnect", () => {
    delete onlineLoggedUsers[socket.id]
  })

  socket.on("friendRequest", (receiverUsername, senderId, senderUsername) => {
    User.findOne({ username: receiverUsername }).then((result) => {
      if (result) {
        Object.keys(onlineLoggedUsers).find(key => onlineLoggedUsers[key] === result._id.toString());

        const receiverSocketId = Object.keys(onlineLoggedUsers).find(key => onlineLoggedUsers[key] === result._id.toString());

        if (receiverSocketId && socket.id !== receiverSocketId) {
          const friendRequest = {
            senderId,
            receiverId: result._id.toString(),
            senderUsername
          }
          io.sockets.to(receiverSocketId).emit("friendRequest", friendRequest)
        }
      }
    })
  })

})


const PORT = process.env.PORT
server.listen(PORT, () => console.log("Servidor inicialitzat"))