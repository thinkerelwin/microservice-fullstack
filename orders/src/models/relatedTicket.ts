import mongoose from "mongoose";
import {updateIfCurrentPlugin} from 'mongoose-update-if-current'

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
  version: number;
  isReserved(): Promise<boolean>;
}

interface RelatedTicketModel extends mongoose.Model<RelatedTicketDoc> {
  build(attrs: RelatedTicketAttrs): RelatedTicketDoc;
  findByEvent(event: {id: string, version: number}): Promise<RelatedTicketDoc | null>
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

relatedTicketSchema.set("versionKey", 'version')
relatedTicketSchema.plugin(updateIfCurrentPlugin)

relatedTicketSchema.statics.build = ({ id, ...attrs }: RelatedTicketAttrs) => {
  return new RelatedTicket({
    _id: id,
    ...attrs,
  });
};

relatedTicketSchema.statics.findByEvent = (event: {id: string, version: number}) => {
  return RelatedTicket.findOne({
    _id: event.id,
    version: event.version - 1
  })
}

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
