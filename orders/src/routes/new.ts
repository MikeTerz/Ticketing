import express, {Request,Response} from 'express';
import { requireAuth, validateRequest,NotFoundError,OrderStatus, BadRequestError } from '@temix/common';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { natsWrapper } from '../nats-wrapper';
import { OrderCreatedPublisher } from '../events/publisher/order-created-publisher';

const router = express.Router();
const EXPIRATION_WINDOW_SECONDS = 60*1;

router.post('/api/orders',requireAuth,[
    body('ticketId')
        .not()
        .isEmpty()
        .custom((input:string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('TicketId must be provided')
],validateRequest,
 async (req : Request,res: Response) =>{
    const { ticketId } = req.body;
    // Find the ticket the user is trying to order in DB.
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
        throw new NotFoundError();
    }
    // Make sure that this ticket in not already reserved.
    const isReserved = await ticket.isReserved();

    if (isReserved){
        throw new BadRequestError('Ticket is already reserved');
    }
    // Calculate an expiration data for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);
    
    // Build the order and save it to db.
    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt : expiration,
        ticket
    });

    await order.save();

    // Send an event that an order was created.
    new OrderCreatedPublisher(natsWrapper.client).publish({
        id : order.id,
        status : order.status,
        version: order.version,
        userId : order.userId,
        expiresAt : order.expiresAt.toISOString(),
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    })
    res.status(201).send(order);
});

export { router as newOrderRouter };