const mongoose = require('mongoose')
const { Schema, model } = mongoose

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  elo: Number,
  coins: Number,
  config: {
    pieces: String,
    board: String,
  },
  itemsPurchased: [String],
  friends: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'
  }]
})

userSchema.set('toJSON', {
  transform: (doc, obj) => {
    obj.id = obj._id
    delete obj._id
    delete obj.__v
    delete obj.password
  }
})

const User = model('User', userSchema)

module.exports = User