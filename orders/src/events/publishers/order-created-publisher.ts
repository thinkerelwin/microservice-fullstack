import {
  Publisher,
  OrderCreatedEvent,
  Subjects,
} from "@microservice-auth/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
