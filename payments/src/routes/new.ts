import express, { Request, Response } from 'express'
import { body } from 'express-validator'

import { natsWrapper } from '../nats-wrapper'
import { stripe } from '../stripe'
import { requireAuth, validateRequest, BadRequestError, NotFoundError, NotAuthorizedError, OrderStatus } from '@microservice-auth/common'

import { PaymentOrder } from '../models/paymentsOrder'
import { Payment } from '../models/payment'
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher'

const router = express.Router()

router.post('/api/payments', requireAuth, [
  body('token').not().isEmpty(), body('orderId').not().isEmpty()
], validateRequest, async (req: Request, res: Response) => {
  const { token, orderId } = req.body

  const order = await PaymentOrder.findById(orderId)

  if (!order) {
    throw new NotFoundError()
  }

  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError()
  }

  if (order.status === OrderStatus.Cancelled) {
    throw new BadRequestError('Can\'t pay for an cancelled order')
  }

  const charge = await stripe.charges.create({
    currency: 'usd',
    amount: order.price * 100,
    source: token,
  })

  const payment = Payment.build({
    orderId,
    stripeId: charge.id
  })

  await payment.save()

  new PaymentCreatedPublisher(natsWrapper.client).publish({
    id: payment.id,
    orderId: payment.orderId,
    stripeId: payment.stripeId
  })

  res.status(201).send({ id: payment.id })
})

export { router as createChargeRouter }