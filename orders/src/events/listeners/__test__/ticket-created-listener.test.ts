import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { TicketCreatedEvent } from '@microservice-auth/common'
import { TicketCreatedListener } from '../ticket-created-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { RelatedTicket } from '../../../models/relatedTicket'

async function setup() {
  const listener = new TicketCreatedListener(natsWrapper.client)

  const data: TicketCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'festival',
    price: 10,
    version: 0,
    userId: mongoose.Types.ObjectId().toHexString()
  }

  // @ts-ignore
  const message: Message = {
    ack: jest.fn()
  }

  return { listener, data, message }
}

it("create and save a ticket", async () => {
  const { listener, data, message } = await setup()

  await listener.onMessage(data, message)

  const ticket = await RelatedTicket.findById(data.id)

  expect(ticket).toBeDefined()
  expect(ticket!.title).toBe(data.title)
  expect(ticket!.price).toBe(data.price)
})

it("acks the message", async () => {
  const { listener, data, message } = await setup()

  await listener.onMessage(data, message)

  expect(message.ack).toHaveBeenCalled()
})