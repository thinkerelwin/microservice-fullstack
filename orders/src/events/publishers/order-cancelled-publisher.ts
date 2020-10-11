import {
  Publisher,
  OrderCancelledEvent,
  Subjects,
} from "@microservice-auth/common";

export class OrderCancelldPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
