const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socketio = require("socket.io");
var path = require('path');

app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/build/index.html'));
});

const io = socketio(server)

let currentGames = {};

io.on("connection", socket => {

  socket.on("createGame", (id) => {
    let game = {
      gameId: id,
      playerIds: [socket.id],
      creatorIsWhite: true
    }
    currentGames[id] = game
  })

  socket.on("joinGame", (id) => {
    if (currentGames[id]?.playerIds) {
      if (currentGames[id].playerIds.length < 2 && !currentGames[id].playerIds.includes(socket.id)) {
        currentGames[id].playerIds.push(socket.id)
        if (currentGames[id].playerIds.length === 2) {
          io.sockets.to(currentGames[id].playerIds[0]).emit("gameInit", currentGames[id].creatorIsWhite)
          io.sockets.to(currentGames[id].playerIds[1]).emit("gameInit", !currentGames[id].creatorIsWhite)
        }
      } else if (currentGames[id].playerIds.length === 2 && currentGames[id].playerIds.includes(socket.id)) {
        if (socket.id === currentGames[id].playerIds[0])
          socket.emit("gameInit", currentGames[id].creatorIsWhite)
        else
          socket.emit("gameInit", !currentGames[id].creatorIsWhite)
      }
    }
  })

  socket.on("doMove", (id, move) => {
    if (currentGames[id]) {
      otherPlayerId = currentGames[id].playerIds.find(playerId => playerId !== socket.id)
      io.sockets.to(otherPlayerId).emit("moveDone", move)
    }
  })

})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => console.log("Servidor inicialitzat"))