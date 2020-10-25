import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

import { OrderStatus } from '@microservice-auth/common'

interface PaymentOrderAttrs {
  id: string;
  status: OrderStatus;
  version: number;
  userId: string;
  price: number;
}

interface PaymentOrderDoc extends mongoose.Document {
  status: OrderStatus;
  version: number;
  userId: string;
  price: number;
}

interface OrderModel extends mongoose.Model<PaymentOrderDoc> {
  build(attrs: PaymentOrderAttrs): PaymentOrderDoc;
}

const paymentOrderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(OrderStatus)
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id
      delete ret._id
    }
  }
})

paymentOrderSchema.set("versionKey", 'version')
paymentOrderSchema.plugin(updateIfCurrentPlugin)

paymentOrderSchema.statics.build = (attrs: PaymentOrderAttrs) => {
  return new PaymentOrder({
    _id: attrs.id,
    version: attrs.version,
    price: attrs.price,
    userId: attrs.userId,
    status: attrs.status
  })
}

const PaymentOrder = mongoose.model<PaymentOrderDoc, OrderModel>('PaymentOrder', paymentOrderSchema)

export { PaymentOrder }