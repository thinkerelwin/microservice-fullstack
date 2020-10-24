import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'

import { OrderCancelledEvent } from '@microservice-auth/common'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCancelledListener } from "../order-cancelled-listener";
import { Ticket } from '../../../models/ticket'

async function setup() {
  const listener = new OrderCancelledListener(natsWrapper.client)

  const orderId = mongoose.Types.ObjectId().toHexString()
  const ticket = Ticket.build({
    title: 'festival',
    price: 10,
    userId: 'gibberish'
  })

  ticket.set({ orderId })
  await ticket.save()

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id
    }
  }

  // @ts-ignore
  const message: Message = {
    ack: jest.fn()
  }

  return { message, data, ticket, orderId, listener }
}

it('update the event, publishes an event, and acks the message', async () => {
  const { message, data, ticket, orderId, listener } = await setup()

  await listener.onMessage(data, message)

  const updatedTicket = await Ticket.findById(ticket.id)
  expect(updatedTicket!.orderId).not.toBeDefined()
  expect(message.ack).toHaveBeenCalled()
  expect(natsWrapper.client.publish).toHaveBeenCalled()
})