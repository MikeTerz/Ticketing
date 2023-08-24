import { Subjects, ExpirationCompleteEvent, Publisher } from "@temix/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}