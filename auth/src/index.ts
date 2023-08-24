import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
    console.log('Starting up...');
    if (!process.env.JWT_KEY){
        throw new Error('Undefined JWT token');
    }
    if (!process.env.MONGO_URI){
        throw new Error('Undefined MONGO URI');
    }
    try {
        await mongoose.connect(process.env.MONGO_URI,{
        });
    }catch(err){
        console.log(err);
    }
    console.log('Connected to MongoDB');
    app.listen(3000,() => {
        console.log('Listening on port 3000');
    });
};

start();



