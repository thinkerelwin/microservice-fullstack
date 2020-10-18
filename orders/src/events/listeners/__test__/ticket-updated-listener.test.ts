import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { TicketUpdatedListener } from '../ticket-updated-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { RelatedTicket } from '../../../models/relatedTicket'
import { TicketUpdatedEvent } from '@microservice-auth/common'

async function setup() {
  const listener = new TicketUpdatedListener(natsWrapper.client)

  const ticket = RelatedTicket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'festival',
    price: 10
  })

  await ticket.save()

  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    title: 'revised title',
    price: 1000,
    version: ticket.version + 1,
    userId: 'blahblah'
  }

  // @ts-ignore
  const message: Message = {
    ack: jest.fn()
  }

  return { ticket, listener, data, message }
}

it('finds , updates, and save a ticket', async () => {
  const { ticket, listener, data, message } = await setup()

  await listener.onMessage(data, message)

  const updatedTicket = await RelatedTicket.findById(ticket.id)

  expect(updatedTicket!.title).toBe(data.title)
  expect(updatedTicket!.price).toBe(data.price)
  expect(updatedTicket!.version).toBe(data.version)
})

it('acks the message', async () => {
  const { listener, data, message } = await setup()

  await listener.onMessage(data, message)

  expect(message.ack).toHaveBeenCalled();
})

it('doesn\'t call ack if the event has a skipped version number', async () => {
  const { listener, data, message } = await setup()

  data.version = 5

  try {
    await listener.onMessage(data, message)
  } catch (error) {

  }

  expect(message.ack).not.toHaveBeenCalled()
})