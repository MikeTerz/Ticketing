import { Publisher, Subjects, TicketCreatedEvent } from '@temix/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
};
