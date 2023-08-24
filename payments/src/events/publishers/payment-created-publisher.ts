import { Subjects, Publisher, PaymentCreatedEvent } from '@temix/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
    readonly subject = Subjects.PaymentCreated;
}