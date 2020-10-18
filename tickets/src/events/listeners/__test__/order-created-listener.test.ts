import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { OrderCreatedEvent, OrderStatus } from '@microservice-auth/common'

import { OrderCreatedListener } from '../order-created-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Ticket } from '../../../models/ticket'



async function setup() {
  const listener = new OrderCreatedListener(natsWrapper.client)

  const ticket = Ticket.build({
    title: 'festival',
    price: 10,
    userId: 'blah'
  })

  await ticket.save()

  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: 'blah',
    expiresAt: 'bllah',
    version: 0,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  }

  // @ts-ignore
  const message: Message = {
    ack: jest.fn()
  }

  return { listener, ticket, data, message }
}

it('sets the userId of the ticket', async () => {
  const { listener, ticket, data, message } = await setup()

  await listener.onMessage(data, message)

  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket!.orderId).toBe(data.id)
})

it('calls the ack message', async () => {
  const { listener, ticket, data, message } = await setup()

  await listener.onMessage(data, message)

  expect(message.ack).toHaveBeenCalled()
})