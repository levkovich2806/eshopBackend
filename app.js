const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
const authJwt = require('./helpers/jwt')
const errorHandler = require('./helpers/error.handler')
const { uploadPath } = require('./helpers/get-base-path')

require('dotenv/config')

const port = process.env.PORT || 3322

const productsRouter = require('./routers/products')
const categoriesRouter = require('./routers/categories')
const usersRouter = require('./routers/users')
const ordersRouter = require('./routers/orders')

app.use(cors())
app.options('*', cors())

//middleware
app.use(bodyParser.json())
app.use(morgan('tiny'))
app.use(authJwt())
app.use('/' + uploadPath, express.static(__dirname + '/' + uploadPath))
app.use(errorHandler)

const api = process.env.API_URL

// Routers
app.use(`${api}/products`, productsRouter)
app.use(`${api}/categories`, categoriesRouter)
app.use(`${api}/users`, usersRouter)
app.use(`${api}/orders`, ordersRouter)

mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'eshop-database',
  })
  .then(() => {
    console.log('Database Connection is ready...')
  })
  .catch((err) => {
    console.log(err)
  })

app.listen(port, () => {
  console.log(`Server is running http://localhost:${port}`, api)
})
