const express = require('express')
const {Product: Products} = require('../models/product')
const router = express.Router()

router.get(`/`, async (req, res) => {
  const productList = await Products.find()

  if (!productList) {
    res.status(500).json({
      success: false
    })
  }

  res.send(productList)
})

router.post(`/`, (req, res) => {
  const product = new Products({
    name: req.body.name,
    image: req.body.image,
    countInStock: req.body.countInStock
  })

  product.save().then((result) => {
    res.status(201).json(result)
  }).catch((error) => {
    res.status(500).json({
      error,
      success: false
    })
  })
})

module.exports = router
