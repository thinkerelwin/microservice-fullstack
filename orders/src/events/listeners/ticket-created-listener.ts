import { Message } from "node-nats-streaming";
import {
  Subjects,
  Listener,
  TicketCreatedEvent,
} from "@microservice-auth/common";

import { RelatedTicket } from "../../models/relatedTicket";
import { queueGroupName as queueGroupNameString } from "../../constant";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = queueGroupNameString;

  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    const { id, title, price } = data;
    const ticket = RelatedTicket.build({
      id,
      title,
      price,
    });

    await ticket.save();

    msg.ack();
  }
}
