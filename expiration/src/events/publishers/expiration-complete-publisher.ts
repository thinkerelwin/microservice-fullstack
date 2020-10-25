import { Subjects, Publisher, ExpirationCompleteEvent } from '@microservice-auth/common'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete
}