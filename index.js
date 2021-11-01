const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wipcb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('holiday_planners');
        const serviceCollection = database.collection('services');
        const bookingCollection = database.collection('bookings');

        //GET Services API
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });

        //GET bookings API
        app.get('/bookings', async (req, res) => {
            const cursor = bookingCollection.find({});
            const bookings = await cursor.toArray();
            res.send(bookings);
        });

        //GET Single Service
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const singleService = await serviceCollection.findOne(query);
            res.json(singleService);
        });

        //Add bookings API
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.json(result);
        });

        //Add services API
        app.post("/services", async (req, res) => {
            const service = await serviceCollection.insertOne(req.body);
            console.log(service);
            res.json(service);
        });

        //UPDATE status code
        app.put('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            console.log(req.body);
            console.log('updating user', id);

            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: req.body.status,
                },
            };
            const result = await bookingCollection.updateOne(
                query,
                updateDoc,
                options
            );
            res.json(result);
        });

        //DELETE bookings
        app.delete("/bookings/:id", async (req, res) => {
            const bookingId = req.params.id;
            const query = { _id: ObjectId(bookingId) };
            const result = await bookingCollection.deleteOne(query);
            console.log("Delete User", result);
            res.json(result);
        });
    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Holiday planner server is running');
});

app.listen(port, () => {
    console.log('server running at port', port);
});