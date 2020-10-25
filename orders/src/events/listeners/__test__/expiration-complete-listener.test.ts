import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { OrderStatus, ExpirationCompleteEvent } from '@microservice-auth/common'

import { ExpirationCompleteListener } from '../expiration-complete-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Order } from '../../../models/order'
import { RelatedTicket } from '../../../models/relatedTicket'

async function setup() {
  const listener = new ExpirationCompleteListener(natsWrapper.client)

  const ticket = RelatedTicket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'festival',
    price: 10
  })

  await ticket.save()

  const order = Order.build({
    status: OrderStatus.Created,
    userId: 'gibberish',
    expiresAt: new Date(),
    ticket
  })

  await order.save()

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, order, ticket, data, msg }
}

it("update the order status to cancelled", async () => {
  const { listener, order, data, msg } = await setup()

  await listener.onMessage(data, msg)

  const updatedOrder = await Order.findById(order.id)

  expect(updatedOrder!.status).toBe(OrderStatus.Cancelled)
})

it("emit an orderCancelled event", async () => {
  const { listener, order, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(natsWrapper.client.publish).toHaveBeenCalled()

  const paramsData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])

  expect(paramsData.id).toBe(order.id)
})

it("ack the message", async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})