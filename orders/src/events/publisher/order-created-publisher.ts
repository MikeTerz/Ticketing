import { Publisher,OrderCreatedEvent,Subjects } from "@temix/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}
