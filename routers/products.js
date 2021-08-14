const express = require('express')
const { Product } = require('../models/product')
const { Category } = require('../models/category')
const { uploadPath, getBaseUploadPath } = require('../helpers/get-base-path')
const router = express.Router()
const mongoose = require('mongoose')
const multer = require('multer')

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file)
    const isValid = FILE_TYPE_MAP[file.mimetype]
    const uploadError = !isValid ? new Error('invalid error type') : null
    cb(uploadError, uploadPath)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const extension = FILE_TYPE_MAP[file.mimetype]
    cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`)
  },
})

const uploadOptions = multer({ storage: storage })

router.get(`/`, async (req, res) => {
  let filter = {}

  if (req.query.categories) {
    filter.category = req.query.categories.split(',')
  }

  const productList = await Product.find(filter).populate('category') //.select('name image -_id')

  if (!productList) {
    res.status(500).json({
      success: false,
    })
  }

  res.send(productList)
})

router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category')

  if (!product) {
    res.status(500).json({
      success: false,
    })
  }

  res.send(product)
})

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
  const category = await Category.findById(req.body.category)
  if (!category) {
    return res.status(400).send({ success: false, message: 'Invalid Category' })
  }

  const file = req.file
  if (!file) {
    return res.status(400).send({ success: false, message: 'No image in the request' })
  }

  const fileName = req.file.filename
  const basePath = getBaseUploadPath(req)

  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
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
    return res.status(500).send({ success: false, message: 'The product cannot be created' })
  }

  res.status(200).send({ success: true, product: result })
})

router.put('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send({ success: false, message: 'Invalid Product Id' })
  }

  const category = await Category.findById(req.body.category)

  if (!category) {
    return res.status(400).send({ success: false, message: 'Invalid Category' })
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
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
    },
    {
      new: true,
    }
  )

  if (!product) {
    return res.status(400).send('the product cannot be updated')
  }

  res.status(200).send(product)
})

router.delete('/:id', (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res.status(200).json({ success: true, message: 'the product is deleted!' })
      }

      return res.status(404).json({ success: false, message: 'product not found!' })
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err })
    })
})

router.get('/get/count', async (req, res) => {
  const productCount = await Product.countDocuments((count) => count)

  if (!productCount) {
    res.status(500).json({
      success: false,
    })
  }

  res.send({ count: productCount })
})

router.get('/get/featured/:count?', async (req, res) => {
  const count = req.params.count || 0
  const products = await Product.find({ isFeatured: true }).limit(+count)

  if (!products) {
    res.status(500).json({
      success: false,
    })
  }

  res.send(products)
})

router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send({ success: false, message: 'Invalid Product Id' })
  }

  const basePath = getBaseUploadPath(req)
  const imagesPaths = (req.files || []).map((file) => `${basePath}${file.filename}`)

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      images: imagesPaths,
    },
    {
      new: true,
    }
  )

  if (!product) {
    return res.status(400).send('the product cannot be updated')
  }

  res.status(200).send(product)
})

module.exports = router
