import { Listener, OrderCreatedEvent, Subjects } from '@microservice-auth/common';
import { Message } from 'node-nats-streaming'
import { queueGroupName as queueGroupNameString } from '../../constants'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated

  queueGroupName = queueGroupNameString

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {

  }
}