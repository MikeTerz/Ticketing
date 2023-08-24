import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { Order } from '../../../models/order';
import mongoose from 'mongoose';
import { OrderStatus,ExpirationCompleteEvent } from '@temix/common';
import { Message } from 'node-nats-streaming';

const setup = async () =>{
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    const ticket = Ticket.build({
        title : 'Concert',
        id : new mongoose.Types.ObjectId().toHexString(),
        price : 200
    })
    await ticket.save();

    const order = Order.build({
        userId : 'abc',
        expiresAt : new Date(),
        status : OrderStatus.Created,
        ticket
    });
    await order.save();

    const data : ExpirationCompleteEvent['data'] = {
        orderId : order.id
    };

    // @ts-ignore
    const msg: Message = {
        ack : jest.fn()
    };

    return { ticket, order, data, msg,listener };
}

it('updates the order status to cancelled', async () =>{
    const { order, data, msg, listener} = await setup();
    
    await listener.onMessage(data,msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
})

it('emits an OrderCancelled event', async() =>{
    const { order, data, msg, listener} = await setup();
    
    await listener.onMessage(data,msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(eventData.id).toEqual(order.id);

})

it('acks the message', async () =>{
    const {data, msg, listener} = await setup();
    
    await listener.onMessage(data,msg);

    expect(msg.ack).toHaveBeenCalled();
})