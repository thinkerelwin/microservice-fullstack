import request from 'supertest'
import mongoose from 'mongoose'
import { OrderStatus } from '@microservice-auth/common'

import { PaymentOrder } from '../../models/paymentsOrder'
import { Payment } from '../../models/payment'
import { app } from '../../app'
import { mockSignIn } from "../../test/setup";
import { stripe } from '../../stripe'

it('returns a 404 when purchasing an order that doesn\'t exist', async () => {
  const response = await request(app).post('/api/payments').set("Cookie", mockSignIn()).send({
    token: 'fake',
    orderId: mongoose.Types.ObjectId().toHexString()
  })

  expect(response.status).toBe(404)
})

it('returns a 401 when purchasing an order that doesn\'t belong to the user', async () => {
  const order = await PaymentOrder.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 10,
    status: OrderStatus.Created
  })

  await order.save()

  const response = await request(app).post('/api/payments').set("Cookie", mockSignIn()).send({
    token: 'fake',
    orderId: order.id
  })

  expect(response.status).toBe(401)
})

it('returns a 400 when purchasing an cancelled order', async () => {
  const userId = mongoose.Types.ObjectId().toHexString()

  const order = await PaymentOrder.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 10,
    status: OrderStatus.Cancelled
  })

  await order.save()

  const response = await request(app).post('/api/payments').set("Cookie", mockSignIn(userId)).send({
    token: 'fake',
    orderId: order.id
  })

  expect(response.status).toBe(400)
})

it("returns a 201 with valid inputs", async () => {
  const userId = mongoose.Types.ObjectId().toHexString()
  const price = Math.floor(Math.random() * 10000)
  const order = await PaymentOrder.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created
  })

  await order.save()

  const response = await request(app).post('/api/payments').set("Cookie", mockSignIn(userId)).send({
    token: 'tok_visa',
    orderId: order.id
  })

  expect(response.status).toBe(201)

  // reach out to the real stripe API
  const stripeCharges = await stripe.charges.list({ limit: 30 })
  const stripeCharge = stripeCharges.data.find(charge => {
    return charge.amount === price * 100
  })

  expect(stripeCharge).toBeDefined()
  expect(stripeCharge!.currency).toBe('usd')

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id
  })

  expect(payment).not.toBeNull()
})