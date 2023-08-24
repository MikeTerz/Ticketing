import { Publisher,OrderCancelledEvent,Subjects } from "@temix/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
    readonly subject = Subjects.OrderCancelled;
}