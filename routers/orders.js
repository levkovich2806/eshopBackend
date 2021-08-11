const { Order } = require('../models/order')
const express = require('express')
const { OrderItem } = require('../models/order-item')
const router = express.Router()

router.get(`/`, async (req, res) => {
  const orderList = await Order.find()

  if (!orderList) {
    res.status(500).json({ success: false })
  }

  res.send(orderList)
})

router.post('/', async (req, res) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      })

      const result = await newOrderItem.save()
      return result._id
    })
  )

  const orderItemsIdsResolved = await orderItemsIds

  const order = new Order({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: req.body.totalPrice,
    user: req.body.user,
  })

  const result = await order.save()

  if (!result) {
    return res.status(400).send('the order cannot be created!')
  }

  res.send(result)
})

module.exports = router
