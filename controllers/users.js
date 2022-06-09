const usersRouter = require('express').Router()
const User = require('../models/User');
const bcrypt = require('bcrypt')

usersRouter.get('/', (req, res) => {
  if (req.query.populated && req.query.populated === 'true') {
    User.find({}).populate('friends').then((result) => {
      res.json(result)
    })
  } else {
    User.find({}).then((result) => {
      res.json(result)
    })
  }
})

usersRouter.get('/sorted', (req, res) => {
  User.find({}).sort({ elo: -1 }).then((result) => {
    res.json(result)
  })
})


usersRouter.get('/:id', (req, res, next) => {
  const id = req.params.id

  const user = User.findById(id).populate('friends').then((result) => {
    res.json(result)
  }).catch((err) => {
    next(err)
  })

});

usersRouter.delete('/:id', (req, res, next) => {
  const id = req.params.id
  User.findByIdAndDelete(id).then((result) => {
    res.status(204).end()
  }).catch((err) => {
    next(err)
  })

});

usersRouter.delete('/', (req, res, next) => {
  User.deleteMany({}).then((result) => {
    res.status(204).end()
  }).catch((err) => {
    next(err)
  })

});

usersRouter.put('/:id', (req, res) => {
  const id = req.params.id
  const userInfo = req.body

  User.findByIdAndUpdate(id, userInfo, { new: true }).then(result => {
    res.json(result)
  })

});

usersRouter.post('/', async (req, res, next) => {

  const { username, password } = req.body
  try {
    if (username.length < 1 || password.length < 6) {
      res.status(400).json({ error: 'Incorrect format of username or password' }).end()
      return;
    }

    encryptedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({
      username,
      password: encryptedPassword,
      elo: 0,
      friends: []
    })

    const userCreated = await newUser.save()

    res.json(userCreated)
  } catch (err) {
    next(err)
  }

});

usersRouter.post('/friends', async (req, res, next) => {
  const { senderId, receiverId } = req.body
  try {
    const sender = await User.findById(senderId)
    const receiver = await User.findById(receiverId)

    if (!sender.friends.includes(receiver._id) && !receiver.friends.includes(sender._id)) {
      sender.friends = sender.friends.concat(receiver._id)
      receiver.friends = receiver.friends.concat(sender._id)

      await sender.save()
      await receiver.save()
    }

    res.status(200).end()
  } catch (err) {
    next(err)
  }
});

usersRouter.post('/:id/purchase/:item', async (req, res, next) => {
  const id = req.params.id
  const item = req.params.item

  try {
    const user = await User.findById(id)

    if (!user.itemsPurchased.includes(item) && user.coins >= 100) {
      user.itemsPurchased = user.itemsPurchased.concat(item)
      user.coins -= 100

      await user.save()
      res.status(200).json(user).end()

    } else {
      res.status(403).json({ error: 'insufficient coins' }).end()
    }

  } catch (err) {
    next(err)
  }
});

module.exports = usersRouter