import { Message } from 'node-nats-streaming'
import { Listener, OrderCreatedEvent, Subjects } from '@microservice-auth/common'
import { queueGroupName as queueGroupNameString } from '../../constants'
import { Ticket } from '../../models/ticket'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;

  queueGroupName = queueGroupNameString

  async onMessage(data: OrderCreatedEvent['data'], message: Message) {
    // find the ticket for order to reserve
    const ticket = await Ticket.findById(data.ticket.id)
    // if no ticket, throw error
    if (!ticket) throw new Error("Ticket not found")
    // mark the ticket as being reserved by setting its orderId property
    ticket.set({ orderId: data.id })
    // save the ticket
    await ticket.save()
    // ack the message
    message.ack()
  }
}