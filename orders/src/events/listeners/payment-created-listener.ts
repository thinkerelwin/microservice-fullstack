import { Subjects, Listener, PaymentCreatedEvent, OrderStatus } from '@microservice-auth/common'
import { Message } from 'node-nats-streaming'

import { queueGroupName as queueGroupNameString } from '../../constant'
import { Order } from '../../models/order'

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated
  queueGroupName = queueGroupNameString

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId)

    if (!order) {
      throw new Error("Order not found")
    }

    order.set({
      status: OrderStatus.Complete
    })

    await order.save()

    msg.ack()
  }
}