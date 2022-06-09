const jwt = require('jsonwebtoken')

module.exports = (request, response, next) => {
  const auth = request.get('authorization')
  let token
  let decodedToken

  if (auth && auth.toLowerCase().startsWith('bearer')) {

    token = auth.substring(7)
    decodedToken = jwt.verify(token, process.env.SECRET)
  }

  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  next()
}