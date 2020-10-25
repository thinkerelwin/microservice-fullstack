import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'

import { natsWrapper } from '../../../nats-wrapper'
import { OrderCreatedListener } from '../order-created-listener'
import { OrderCreatedEvent, OrderStatus } from '@microservice-auth/common'
import { PaymentOrder } from '../../../models/paymentsOrder'

async function setup() {
  const listener = new OrderCreatedListener(natsWrapper.client)

  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: 'gibberish',
    userId: 'blahblah',
    status: OrderStatus.Created,
    ticket: {
      id: 'blahblah',
      price: 12
    }
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg }
}

it("replicates the order info", async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  const order = await PaymentOrder.findById(data.id)

  expect(order!.price).toBe(data.ticket.price)
})

it("acks the message", async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})