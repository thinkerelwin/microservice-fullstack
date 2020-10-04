import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from "@microservice-auth/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
