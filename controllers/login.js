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
      userInfo = {
        username: user.username,
        id: user._id
      }
      const token = jwt.sign(userInfo, process.env.SECRET)
      res.json({ userInfo, token })
    }
  } catch (err) {
    next(err)
  }

});

module.exports = loginRouter
