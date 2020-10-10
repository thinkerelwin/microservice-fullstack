import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from "@microservice-auth/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
