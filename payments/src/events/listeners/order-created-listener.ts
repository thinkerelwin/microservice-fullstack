import { Message } from 'node-nats-streaming'

import { Listener, OrderCreatedEvent, Subjects } from '@microservice-auth/common'
import { queueGroupName as queueGroupNameString } from '../../constant'
import { PaymentOrder } from '../../models/paymentsOrder'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated

  queueGroupName = queueGroupNameString

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const order = PaymentOrder.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version
    })

    await order.save()

    msg.ack()
  }
}