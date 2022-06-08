const { v4: uuid } = require('uuid');
const User = require('../models/User');

let currentGames = {}
let searchingGames = {
  ranked: {
    bullet: [],
    blitz: [],
    rapid: [],
    classic: []
  },
  casual: {
    bullet: [],
    blitz: [],
    rapid: [],
    classic: []
  },

}

const initChess = (socket, io, getSocketIdFromId, getIdFromSocketId) => {

  socket.on("createGame", (senderId, receiverId) => {
    const senderSocketId = getSocketIdFromId(senderId);
    const receiverSocketId = getSocketIdFromId(receiverId);

    createGame([senderSocketId, receiverSocketId])
  })

  socket.on("searchGame", (mode, ranked) => {
    if (searchingGames[ranked][mode].length === 0)
      searchingGames[ranked][mode].push(socket.id)
    else {
      playerSearching = searchingGames[ranked][mode].pop()
      createGame([playerSearching, socket.id], mode, ranked)
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

  socket.on("gameEnded", (id, result, yourId) => {

    if (currentGames[id] && currentGames[id].ranked === 'ranked' && currentGames[id].ended === false) {
      opponentId = currentGames[id].bbddIds.find(playerId => playerId !== yourId)

      if (yourId && opponentId) {
        if (result === 'win') {
          changeElo(yourId, 25)
          changeElo(opponentId, -25)
        } else if (result === 'loss') {
          changeElo(yourId, -25)
          changeElo(opponentId, 25)
        }
      }
      currentGames[id].ended = true
    } else if (currentGames[id].ended === true) {
      delete currentGames[id]
    }
  })


  socket.on("cancelSearch", () => {
    cancelSearch(socket.id)
  })

  socket.on("disconnect", () => {
    cancelSearch(socket.id)
  })

  async function changeElo(id, eloToChange) {
    const user = await User.findById(id)
    if (user) {
      const newElo = (user.elo + eloToChange >= 0) ? (user.elo + eloToChange) : 0
      await User.findByIdAndUpdate(id, { elo: newElo })
    }
  }

  function createGame(ids, mode, ranked) {
    let id = uuid()
    let game;
    if (ranked === 'ranked') {
      let bbddIds = [getIdFromSocketId(ids[0]), getIdFromSocketId(ids[1])]
      game = {
        gameId: id,
        playerIds: ids,
        bbddIds,
        creatorIsWhite: true,
        playersReady: 0,
        mode,
        ranked,
        ended: false
      }
    } else {
      game = {
        gameId: id,
        playerIds: ids,
        creatorIsWhite: true,
        playersReady: 0,
        mode,
        ranked
      }
    }
    currentGames[id] = game
    io.sockets.to(currentGames[id].playerIds[0]).emit("gameCreated", id)
    io.sockets.to(currentGames[id].playerIds[1]).emit("gameCreated", id)
  }

  function cancelSearch(id) {
    Object.keys(searchingGames).forEach(function (rank) {
      Object.keys(searchingGames[rank]).forEach(function (mode) {
        var index = searchingGames[rank][mode].indexOf(id);
        if (index > -1) {
          searchingGames[rank][mode].splice(index, 1);
        }
      });
    });
  }
}



module.exports = initChess