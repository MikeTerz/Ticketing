import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('returns 404 if the provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie',global.signin())
        .send({
            title: 'asdasd',
            price: 20
        }).expect(404);
});

it('returns 401 if the is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'asdasd',
            price: 20
        }).expect(401);
});

it('returns 401 if the user doesnt own the ticket', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie',global.signin())
        .send({
            title: 'asdasdasd',
            price: 20
        });

        await request(app)
            .put(`/api/tickets/${response.body.id}`)
            .set('Cookie',global.signin())
            .send({
                title: 'azzzz',
                price: 1000
            }).expect(401);
});

it('returns 400 if the user provided invalid title-price', async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie',cookie)
        .send({
            title: 'asdasdasd',
            price: 20
        });
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie',cookie)
        .send({
            title:'',
            price:20
        }).expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie',cookie)
        .send({
            title:'aaaa',
            price:-10
        }).expect(400);
});

it('updates the ticket providing valid inputs', async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie',cookie)
        .send({
            title: 'asdasdasd',
            price: 20
        });
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie',cookie)
        .send({
            title: 'Something',
            price: 10000
        }).expect(200);

        const ticketResp = await request(app)
            .get(`/api/tickets/${response.body.id}`)
            .send();
        expect(ticketResp.body.title).toEqual('Something');
        expect(ticketResp.body.price).toEqual(10000);
});

it('publishes an event', async () =>{
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie',cookie)
        .send({
            title: 'asdasdasd',
            price: 20
        });
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie',cookie)
        .send({
            title: 'Something',
            price: 10000
        }).expect(200);

        expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if ticket is reserved', async () =>{
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie',cookie)
        .send({
            title: 'asdasdasd',
            price: 20
        });

    //reserve the ticket
    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({orderId: new mongoose.Types.ObjectId().toHexString()});
    await ticket!.save();

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie',cookie)
        .send({
            title: 'Something',
            price: 10000
        }).expect(400);
})