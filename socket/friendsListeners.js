const initFriends = (socket, io, getSocketIdFromId) => {

  socket.on("friendRequest", (receiverUsername, senderId, senderUsername) => {
    User.findOne({ username: receiverUsername }).then((result) => {
      if (result) {
        const receiverSocketId = getSocketIdFromId(result._id.toString());

        if (receiverSocketId && socket.id !== receiverSocketId) {
          const friendRequest = {
            senderId,
            receiverId: result._id.toString(),
            senderUsername,
            type: 'friendRequest'
          }
          io.sockets.to(receiverSocketId).emit("friendRequest", friendRequest)
        }
      }
    })
  })
  socket.on("challengeFriend", (receiverId, senderId, senderUsername) => {

    const receiverSocketId = getSocketIdFromId(receiverId);

    if (receiverSocketId && socket.id !== receiverSocketId) {
      const challengeFriend = {
        senderId,
        receiverId,
        senderUsername,
        type: 'challenge'
      }
      io.sockets.to(receiverSocketId).emit("challengeFriend", challengeFriend)
    }

  })


}


module.exports = initFriends