import {
  Publisher,
  OrderCancelledEvent,
  Subjects,
} from "@microservice-auth/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
