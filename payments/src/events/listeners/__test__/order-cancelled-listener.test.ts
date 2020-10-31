import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { OrderStatus, OrderCancelledEvent } from '@microservice-auth/common'

import { OrderCancelledListener } from '../order-cancelled-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { PaymentOrder } from '../../../models/paymentsOrder'

async function setup() {
  const listener = new OrderCancelledListener(natsWrapper.client)

  const order = PaymentOrder.build({
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 10,
    userId: 'gibberish',
    version: 0
  })

  await order.save()

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: 'gibberish'
    }
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg, order }
}

it("update the status of the order", async () => {
  const { listener, data, msg, order } = await setup()

  await listener.onMessage(data, msg)

  const updatedOrder = await PaymentOrder.findById(order.id)

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it("acks the message", async () => {
  const { listener, data, msg, order } = await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})