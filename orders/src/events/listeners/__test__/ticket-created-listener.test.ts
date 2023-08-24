import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedEvent } from "@temix/common";
import mongoose from "mongoose";
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () =>{
    // create an nistance of the listener
    const listener = new TicketCreatedListener(natsWrapper.client);
    // create a fake data event
    const data : TicketCreatedEvent['data'] = {
        title: 'Concert',
        price: 100,
        id : new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: new mongoose.Types.ObjectId().toHexString()

    }
    // create a fake message object
    // @ts-ignore
    const msg : Message = {
        ack: jest.fn()
    };

    return { listener, data, msg};
}

it('creates and saves a ticket', async () => {
    const { listener, data, msg} = await setup();

    // call the onMessage fucntion with the data + message object
    await listener.onMessage(data,msg);

    // write assertions to make sure a ticket was create
    const ticket = await Ticket.findById(data.id);

    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async () => {
    const { listener, data, msg} = await setup();

    //call the onMessage function with the data + message object
    await listener.onMessage(data, msg);

    //write assertions to make sure ack was callled
    expect(msg.ack).toHaveBeenCalled();
});