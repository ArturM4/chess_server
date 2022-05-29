const usersRouter = require('express').Router()
const User = require('../models/User');
const bcrypt = require('bcrypt')

usersRouter.get('/', (req, res) => {
  User.find({}).then((result) => {
    res.json(result)
  })
})

usersRouter.get('/:id', (req, res, next) => {
  const id = req.params.id

  const user = User.findById(id).then((result) => {
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
    if (username.length < 1 || password.length < 6)
      res.status(400).json({ error: 'Incorrect format of username or password' }).end()

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

module.exports = usersRouter