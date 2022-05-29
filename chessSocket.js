const { v4: uuid } = require('uuid');

let currentGames = {}
let searchingGames = {
  bullet: [],
  blitz: [],
  rapid: [],
  classic: []
}

const initChessSocket = (socket, io) => {
  socket.on("createGame", (id) => {
    let game = {
      gameId: id,
      playerIds: [socket.id],
      creatorIsWhite: true
    }
    currentGames[id] = game
  })

  socket.on("searchGame", (mode) => {

    if (searchingGames[mode].length === 0)
      searchingGames[mode].push(socket.id)
    else {
      playerSearching = searchingGames[mode].pop()
      createGame([playerSearching, socket.id], mode)
    }
  })

  socket.on("joinGame", (id) => {
    if (currentGames[id]?.playerIds) {
      if (currentGames[id].playerIds.length < 2 && !currentGames[id].playerIds.includes(socket.id)) {
        currentGames[id].playerIds.push(socket.id)
        if (currentGames[id].playerIds.length === 2) {
          io.sockets.to(currentGames[id].playerIds[0]).emit("gameInit", currentGames[id].creatorIsWhite, currentGames[id].mode)
          io.sockets.to(currentGames[id].playerIds[1]).emit("gameInit", !currentGames[id].creatorIsWhite, currentGames[id].mode)
        }
      } else if (currentGames[id].playerIds.length === 2 && currentGames[id].playerIds.includes(socket.id)) {
        if (socket.id === currentGames[id].playerIds[0])
          socket.emit("gameInit", currentGames[id].creatorIsWhite, currentGames[id].mode)
        else
          socket.emit("gameInit", !currentGames[id].creatorIsWhite, currentGames[id].mode)
      }
    }
  })

  socket.on("doMove", (id, move, time) => {
    if (currentGames[id] && currentGames[id].playerIds.includes(socket.id)) {
      otherPlayerId = currentGames[id].playerIds.find(playerId => playerId !== socket.id)
      io.sockets.to(otherPlayerId).emit("moveDone", move, time)
    }
  })

  socket.on("receivedMove", (id) => {
    if (currentGames[id] && currentGames[id].playerIds.includes(socket.id)) {
      otherPlayerId = currentGames[id].playerIds.find(playerId => playerId !== socket.id)
      io.sockets.to(otherPlayerId).emit("oppponentReceivedMove")
    }
  })

  socket.on("cancelSearch", () => {
    cancelSearch(socket.id)
  })

  socket.on("disconnect", () => {
    cancelSearch(socket.id)
  })

  function createGame(ids, mode) {

    let id = uuid()
    let game = {
      gameId: id,
      playerIds: ids,
      creatorIsWhite: true,
      mode
    }
    currentGames[id] = game
    io.sockets.to(currentGames[id].playerIds[0]).emit("gameInit", id)
    io.sockets.to(currentGames[id].playerIds[1]).emit("gameInit", id)
  }

  function cancelSearch(id) {
    Object.keys(searchingGames).forEach(function (key) {
      var index = searchingGames[key].indexOf(id);
      if (index > -1) {
        searchingGames[key].splice(index, 1);
      }
    });
  }
}



module.exports = initChessSocket