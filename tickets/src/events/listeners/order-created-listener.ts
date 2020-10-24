import { Message } from 'node-nats-streaming'
import { Listener, OrderCreatedEvent, Subjects } from '@microservice-auth/common'
import { queueGroupName as queueGroupNameString } from '../../constants'
import { Ticket } from '../../models/ticket'
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher'

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
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId,
    })
    // ack the message
    message.ack()
  }
}