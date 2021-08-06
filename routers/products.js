const express = require('express')
const {Product: Products} = require('../models/product')
const {Category} = require("../models/category");
const router = express.Router()
const mongoose = require('mongoose')

router.get(`/`, async (req, res) => {
  const productList = await Products.find() //.select('name image -_id')

  if (!productList) {
    res.status(500).json({
      success: false
    })
  }

  res.send(productList)
})

router.get(`/:id`, async (req, res) => {
  const product = await Products.findById(req.params.id).populate('category')

  if (!product) {
    res.status(500).json({
      success: false
    })
  }

  res.send(product)
})

router.post(`/`, async (req, res) => {
  const category = await Category.findById(req.body.category)

  if (!category) {
    return res.status(400).send({success: false, message: 'Invalid Category'})
  }

  const product = new Products({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: req.body.image,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  })

  const result = await product.save()

  if (!result) {
    return res.status(500).send({success: false, message: 'The product cannot be created'})
  }

  res.status(200).send({success: true, product: result})
})

router.put('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send({success: false, message: 'Invalid Product Id'})
  }

  const category = await Category.findById(req.body.category)

  if (!category) {
    return res.status(400).send({success: false, message: 'Invalid Category'})
  }

  const product = await Products.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: req.body.image,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  }, {
    new: true
  })

  if (!product) {
    return res.status(400).send('the product cannot be updated')
  }

  res.status(200).send(product)
})

router.delete('/:id', (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send({success: false, message: 'Invalid Product Id'})
  }

  Products.findByIdAndRemove(req.params.id).then(product => {
    if (product) {
      return res.status(200).json({success: true, message: 'the product is deleted!'})
    }

    return res.status(404).json({success: false, message: "product not found!"})
  }).catch(err => {
    return res.status(500).json({success: false, error: err})
  })
})

module.exports = router
