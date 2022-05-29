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





io.on("connection", socket => {
  initChessSocket(socket, io)
})


const PORT = process.env.PORT
server.listen(PORT, () => console.log("Servidor inicialitzat"))