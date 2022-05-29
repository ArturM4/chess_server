const mongoose = require('mongoose')
const connectionString = process.env.MONGODB_CONNECTION_STRING

function connectDB() {

  mongoose.connect(connectionString)
    .then(() => {
      console.log('DB Connection')
    }).catch(err => {
      console.error(err)
    })

  process.on('uncaughtException', error => {
    console.error(error)
    mongoose.disconnect()
  })

}

module.exports = connectDB
