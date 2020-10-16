import mongoose from "mongoose";

import { Order } from "./order";
import { OrderStatus } from "@microservice-auth/common";

interface RelatedTicketAttrs {
  id: string;
  title: string;
  price: number;
}

export interface RelatedTicketDoc extends mongoose.Document {
  title: string;
  price: number;
  isReserved(): Promise<boolean>;
}

interface RelatedTicketModel extends mongoose.Model<RelatedTicketDoc> {
  build(attrs: RelatedTicketAttrs): RelatedTicketDoc;
}

const relatedTicketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

relatedTicketSchema.statics.build = ({ id, ...attrs }: RelatedTicketAttrs) => {
  return new RelatedTicket({
    _id: id,
    ...attrs,
  });
};

relatedTicketSchema.methods.isReserved = async function checkRserved() {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPatyment,
        OrderStatus.Complete,
      ],
    },
  });

  return Boolean(existingOrder);
};

const RelatedTicket = mongoose.model<RelatedTicketDoc, RelatedTicketModel>(
  "RelatedTicket",
  relatedTicketSchema
);

export { RelatedTicket };
