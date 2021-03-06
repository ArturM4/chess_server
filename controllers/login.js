const loginRouter = require('express').Router()
const User = require('../models/User');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

loginRouter.post('/', async (req, res, next) => {

  const { username, password } = req.body

  try {
    const user = await User.findOne({ username })
    if (user === null || !await bcrypt.compare(password, user.password))
      res.status(401).json({ error: 'Username or password invalid' })
    else {
      const token = jwt.sign({ username: user.username, id: user._id, }, process.env.SECRET)
      res.json({ info: user, token })
    }
  } catch (err) {
    next(err)
  }

});

module.exports = loginRouter
