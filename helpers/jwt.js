const expressJwt = require('express-jwt')

function authJwt() {
  const secret = process.env.SECRET
  const api = process.env.API_URL

  return expressJwt({
    secret,
    algorithms: ['HS256'],
  }).unless({
    path: [
      {
        url: `${api}/products`,
        method: ['GET', 'OPTIONS'],
      },
      {
        url: `${api}/categories`,
        method: ['GET', 'OPTIONS'],
      },
      `${api}/users/login`,
      `${api}/users/register`,
    ],
  })
}

module.exports = authJwt
