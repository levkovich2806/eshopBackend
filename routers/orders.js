const { Order } = require('../models/order')
const { OrderItem } = require('../models/order-item')
const express = require('express')
const router = express.Router()

router.get(`/`, async (req, res) => {
  const orderList = await Order.find().populate('user', 'name').sort({ 'dateOrdered': -1 })

  if (!orderList) {
    res.status(500).json({ success: false })
  }

  res.send(orderList)
})

router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({
      path: 'orderItems',
      populate: {
        path: 'product',
        populate: 'category',
      },
    })

  if (!order) {
    res.status(500).json({ success: false })
  }

  res.send(order)
})

router.post('/', async (req, res) => {
  const orderItemsIdsResolved = await Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      })

      const result = await newOrderItem.save()
      return result._id
    })
  )

  const totalPrices = await Promise.all(
    orderItemsIdsResolved.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price')
      return orderItem.product.price * orderItem.quantity
    })
  )

  const totalPrice = totalPrices.reduce((acc, price) => acc + price, 0)

  const order = new Order({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice,
    user: req.body.user,
  })

  const result = await order.save()

  if (!result) {
    return res.status(400).send('the order cannot be created!')
  }

  res.send(result)
})

router.put('/:id', async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    {
      new: true,
    }
  )

  if (!order) {
    return res.status(400).send('the order cannot be updated')
  }

  res.status(200).send(order)
})

router.delete('/:id', (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then((order) => {
      if (order) {
        order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem)
        })

        return res.status(200).json({ success: true, message: 'the order is deleted!' })
      }

      return res.status(404).json({ success: false, message: 'order not found!' })
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err })
    })
})

module.exports = router
