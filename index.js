const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const app = express();
const port = process.env.PORT || 8888;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.MDB_USER}:${process.env.MDB_PASS}@cluster0.o6whk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        const database = client.db('Travel');
        const ticketsCollection = database.collection('ticket');
        const tourguideCollection = database.collection('tourguide')
        const OrderCollection = database.collection('Order')

        // api tickets

        app.get('/ticket',async(req,res)=>{
            const cursor = ticketsCollection.find({});
            const tickets = await cursor.toArray();
            res.send(tickets);
        })

        // api tuorguide
        
        app.get('/tourguide',async(req,res)=>{
            const cursor = tourguideCollection.find({});
            const guide = await cursor.limit(3).toArray();
            res.send(guide)
        })

        app.get('/guide',async(req,res)=>{
            const cursor = tourguideCollection.find({});
            const guide = await cursor.toArray();
            res.send(guide)
        })

        app.get('/service/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)}
            const service = await ticketsCollection.findOne(query);
            res.json(service)
        })

        // api delete

        app.delete('/orders/:id',async(req,res)=>{
            const query = {_id: new ObjectId(req.params.id)}
            const result = await OrderCollection.deleteOne(query);
            res.json(result);
        })
        app.post('/orders', async(req,res)=>{
            const order = req.body;
            const result = await OrderCollection.insertOne(order)
            res.json(result);
        })
        app.get('/orders',async(req,res)=>{
            const cursor = OrderCollection.find({});
            const order = await cursor.toArray()
            res.send(order)
        })
    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir)

app.get('/',(req,res)=>{
    res.send('api server on')
})

app.listen(port,()=>{
    console.log('server is running',port);
})
