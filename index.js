const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const app = express();
const port = process.env.PORT || 8888;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o6whk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('Travel');
        const UserCollection = database.collection('users')
        const ticketsCollection = database.collection('ticket');
        const tourguideCollection = database.collection('tourguide');
        const OrderCollection = database.collection('Order');
        const ReviewCollection = database.collection('reviews');
        const BlogsCollection = database.collection('blog');

        // api tickets

        app.get('/ticket', async (req, res) => {
            const cursor = ticketsCollection.find({});
            const tickets = await cursor.toArray();
            res.json(tickets);
        })

        // api tuorguide

        app.get('/tourguide', async (req, res) => {
            const cursor = tourguideCollection.find({});
            const guide = await cursor.limit(3).toArray();
            res.json(guide)
        })

        app.get('/guide', async (req, res) => {
            const cursor = tourguideCollection.find({});
            const guide = await cursor.toArray();
            res.json(guide)
        })

        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await ticketsCollection.findOne(query);
            res.json(service)
        })

        // api delete
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await OrderCollection.insertOne(order)
            res.json(result);
        })
        app.get('/orders', async (req, res) => {
            const cursor = OrderCollection.find({});
            const order = await cursor.toArray()
            res.json(order)
        })
        app.delete('/orders/:id', async (req, res) => {
            const Id = req.params.id;
            const query = { _id: ObjectId(Id) };
            const result = await OrderCollection.deleteOne(query);
            res.json(result)
        })
        app.post('/users', async (req, res) => {
            const users = req.body;
            const result = await UserCollection.insertOne(users)
            res.json(result)
        })
        app.put('/users', async (req, res) => {
            const users = req.body;
            const filter = { email: users.email }
            const options = { upsert: true };
            const updateDoc = { $set: users }
            const result = await UserCollection.updateOne(filter, updateDoc, options)
            res.json(result);
        })
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await UserCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true
            }
            res.json({ admin: isAdmin });
        })
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } }
            const result = await UserCollection.updateOne(filter, updateDoc)
            res.json(result);
        })
        app.post('/review', async (req, res) => {
            const reviews = req.body;
            const result = await ReviewCollection.insertOne(reviews);
            res.json(result)
        })
        app.post('/blog', async (req, res) => {
            const blog = req.body;
            const result = await BlogsCollection.insertOne(blog);
            res.json(result)
        })
        app.get('/blog', async (req, res) => {
            const cursor = await BlogsCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let blog;
            const count = await cursor.count();
            if (page) {
                blog = await cursor.skip(page * size).limit(size).toArray();

            }
            else {
                blog = await cursor.toArray();
            }
            res.send({
                count,
                blog
            })
        })
        app.put('/blog', async (req, res) => {
            const id = req.body;
            const filter = { _id: id };
            const role = req.query.role;
            const updateDoc = { $set: { role: `${role}` } }
            const result = await BlogsCollection.updateOne(filter, updateDoc)
            res.json(result);
        })
        app.get('/blog/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await BlogsCollection.findOne(query);
            res.json(service)
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('api server on')
})

app.listen(port, () => {
    console.log('server is running', port);
})
