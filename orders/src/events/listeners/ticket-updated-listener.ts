import { Message } from "node-nats-streaming";
import {
  Subjects,
  Listener,
  TicketUpdatedEvent,
} from "@microservice-auth/common";

import { RelatedTicket } from "../../models/relatedTicket";
import { queueGroupName as queueGroupNameString } from "../../constant";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupNameString;

  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    const ticket = await RelatedTicket.findByEvent(data);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    ticket.set({ title: data.title, price: data.price });

    await ticket.save();

    msg.ack();
  }
}
