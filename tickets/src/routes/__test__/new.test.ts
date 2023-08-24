import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to /api/tickets for post requests', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({});
    
    expect(response.status).not.toEqual(404);
});

it('can only be access if the user is logged in', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({});
    
    expect(response.status).toEqual(401);
});

it('returns a status other than 401 if user is signed in', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie',global.signin())
        .send({});
    
    expect(response.status).not.toEqual(401);
});

it('returns error if invalid title is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie',global.signin())
        .send({
            title: '',
            price: 10
        }).expect(400);
    await request(app)
        .post('/api/tickets')
        .set('Cookie',global.signin())
        .send({
            price: 10
        }).expect(400);    
});

it('returns error if invalid price is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie',global.signin())
        .send({
            title: 'My Title',
            price: -10
        }).expect(400);
    await request(app)
        .post('/api/tickets')
        .set('Cookie',global.signin())
        .send({
            title: '',
        }).expect(400);
});

it('creates ticket with valid input', async () => {
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    const title = 'asdasd';
    await request(app)
        .post('/api/tickets')
        .set('Cookie',global.signin())
        .send({
            title,
            price: 20
        }).expect(201);
    
    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
});

it('publishes an event', async () =>{
    const title = 'asdasd';
    await request(app)
        .post('/api/tickets')
        .set('Cookie',global.signin())
        .send({
            title,
            price: 20
        }).expect(201);
    
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});