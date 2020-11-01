import { Subjects, Publisher, PaymentCreatedEvent } from '@microservice-auth/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated
}