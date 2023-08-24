import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedEvent } from "@temix/common";
import mongoose from "mongoose";
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () =>{
    // create an nistance of the listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // create and save a ticket 
    const ticket = Ticket.build({
        id : new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price :20
    })
    await ticket.save();

    // create a fake data event
    const data : TicketUpdatedEvent['data'] = {
        title: 'asdasd',
        price: 100,
        id : ticket.id,
        version: ticket.version+1,
        userId: new mongoose.Types.ObjectId().toHexString()

    }
    // create a fake message object
    // @ts-ignore
    const msg : Message = {
        ack: jest.fn()
    };

    return { listener, data, msg, ticket};
}

it('finds, update, and save a ticket', async () =>{
    const { listener, data, msg, ticket} = await setup();

    await listener.onMessage(data,msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);

});

it('acks the message', async () =>{
    const { listener, data, msg, ticket} = await setup();

    await listener.onMessage(data,msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has wrong version', async () =>{
    const { listener, data, msg, ticket} = await setup();

    data.version = data.version+2;
    try{
        await listener.onMessage(data,msg);
    }catch(error){

    }
    expect(msg.ack).not.toHaveBeenCalled();
})