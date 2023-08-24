import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';
import jwt from 'jsonwebtoken';
jest.mock('../nats-wrapper');

let mongo: any;
beforeAll(async () =>{
    process.env.JWT_KEY = 'asssssd';
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri,{});
});

beforeEach(async () =>{
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();

    for(let collection of collections){
        await collection.deleteMany({});
    }
});

afterAll(async () =>{
    if (mongo) {
        await mongo.stop();
    }
    await mongoose.connection.close();
});

declare global {
    var signin: (id?:string) => string[];
}

global.signin = () =>{
    // Build a JWT payload. {id, email, iat }
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com',
    };

    // Create the JWT
    const token = jwt.sign(payload,process.env.JWT_KEY!);

    // Build session object { "jwt", "MY_JWT"} and turn it into JSON
    const session = { jwt : token };
    const sessionJSON = JSON.stringify(session);

    // Encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    // return a string as the cookie session
    return [`session=${base64}`];

}