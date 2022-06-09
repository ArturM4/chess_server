module.exports = (err, req, res, next) => {

  if (err.name === 'CastError')
    res.status(400).end()
  else if (err.name === 'MongoServerError' && err.code === 11000)
    res.status(400).json({ error: 'Username already exists' }).end()
  else {
    console.log(err)
    res.status(500).end()
  }
}