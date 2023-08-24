import nats from 'node-nats-streaming';
console.clear();
import  {TicketCreatedPublisher} from './events/ticket-created-publisher';

const stan = nats.connect('ticketing','abc',{
    url: 'http://localhost:4222'
});

stan.on('connect', async () =>{
    console.log('Publisher connected to Nats server');

    /*const data = JSON.stringify({
        id: '123',
        title : 'concert',
        price : 20
    });

    stan.publish('ticket:created', data, () =>{
        console.log('Event pubished');
    });
    */
   const publisher = new TicketCreatedPublisher(stan);
   await publisher.publish({
    id: '123',
    title: 'Concert',
    price: 20
   });

});