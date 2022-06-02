const { v4: uuid } = require('uuid');

let currentGames = {}
let searchingGames = {
  bullet: [],
  blitz: [],
  rapid: [],
  classic: []
}

const initChess = (socket, io, getSocketIdFromId) => {

  socket.on("createGame", (senderId, receiverId) => {
    const senderSocketId = getSocketIdFromId(senderId);
    const receiverSocketId = getSocketIdFromId(receiverId);

    createGame([senderSocketId, receiverSocketId])
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
    if (currentGames[id]?.playerIds && currentGames[id].playerIds.includes(socket.id)) {
      if (currentGames[id].playersReady < 2) {
        currentGames[id].playersReady++
        if (currentGames[id].playersReady === 2) {
          io.sockets.to(currentGames[id].playerIds[0]).emit("gameInit", currentGames[id].creatorIsWhite, currentGames[id].mode)
          io.sockets.to(currentGames[id].playerIds[1]).emit("gameInit", !currentGames[id].creatorIsWhite, currentGames[id].mode)
        }
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
      playersReady: 0,
      mode
    }
    currentGames[id] = game
    io.sockets.to(currentGames[id].playerIds[0]).emit("gameCreated", id)
    io.sockets.to(currentGames[id].playerIds[1]).emit("gameCreated", id)
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



module.exports = initChess