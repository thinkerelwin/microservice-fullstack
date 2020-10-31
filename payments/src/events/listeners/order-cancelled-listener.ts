import { Message } from 'node-nats-streaming'

import { OrderCancelledEvent, Subjects, Listener, OrderStatus } from '@microservice-auth/common'
import { queueGroupName as queueGroupNameString } from '../../constant'
import { PaymentOrder } from '../../models/paymentsOrder'

export class OrderCancelledListener extends Listener<OrderCancelledEvent>{
  readonly subject = Subjects.OrderCancelled
  queueGroupName = queueGroupNameString

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const order = await PaymentOrder.findOne({
      _id: data.id,
      version: data.version - 1
    })

    if (!order) {
      throw new Error("Order not found")
    }

    order.set({ status: OrderStatus.Cancelled })

    await order.save()

    msg.ack()
  }
}