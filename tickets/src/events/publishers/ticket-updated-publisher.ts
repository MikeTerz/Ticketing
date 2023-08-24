import { Publisher, Subjects, TicketUpdatedEvent } from '@temix/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
};
