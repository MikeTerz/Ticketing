import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order,OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

it('marks an order as canceled', async () => {
    // create a ticket
    const ticket = Ticket.build({
        title: 'Concert',
        price: 20,
        id : new mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save();

    // make a request to create an order
    const user = global.signin();
    const { body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie',user)
        .send({ticketId: ticket.id})
        .expect(201);

    // make a request to cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie',user)
        .send()
        .expect(204);

    // expect that it is canceled
    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an order cancelled event', async () =>{
    const ticket = Ticket.build({
        title: 'Concert',
        price: 20,
        id : new mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save();

    // make a request to create an order
    const user = global.signin();
    const { body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie',user)
        .send({ticketId: ticket.id})
        .expect(201);

    // make a request to cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie',user)
        .send()
        .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();  
})