import { Listener, OrderCreatedEvent, Subjects } from '@microservice-auth/common';
import { Message } from 'node-nats-streaming'
import { queueGroupName as queueGroupNameString } from '../../constants'
import { expirationQueue } from '../../queues/expiration-queue'
export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated

  queueGroupName = queueGroupNameString

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime()
    console.log("waiting: ", delay)

    await expirationQueue.add({
      orderId: data.id,
    }, {
      delay
    })

    msg.ack()
  }
}