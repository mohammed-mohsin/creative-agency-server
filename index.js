const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const { ObjectID } = require('mongodb');
const fileUpload = require('express-fileupload');
const { MongoClient } = require('mongodb');
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4trjz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload());

const port = 5000;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const serviceCollection = client.db("creativeAgency").collection("services");
    const ordersCollection = client.db("creativeAgency").collection("orders");
    const feedbacksCollection = client.db("creativeAgency").collection("feedbacks");
    const adminCollection = client.db("creativeAgency").collection("admin");

    app.get('/', (req, res) => {
        res.send("Creative Agency")
    })


    app.post('/addService', (req, res) => {
        const file = req.files.icon;
        const title = req.body.title;
        const description = req.body.description;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var icon = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollection.insertOne({ description, title, icon })
            .then(result => {
                res.send(result.insertedCount > 0);
            })

    })


    app.get('/services', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })

    })

    app.post('/addOrder', (req, res) => {
        const order = req.body;

        ordersCollection.insertOne(order)
            .then(result => {
                res.send(result.insertedCount > 0);
            })

    })


    app.get('/orders', (req, res) => {
        ordersCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })

    })


    app.get('/userOrders', (req, res) => {

        ordersCollection.find({ email: req.query.email })
            .toArray((err, documents) => {
                res.send(documents);
            })

    })


    app.post('/addFeedback', (req, res) => {
        const feedback = req.body;

        feedbacksCollection.insertOne(feedback)
            .then(result => {
                res.send(result.insertedCount > 0);
            })

    })

    app.get('/feedbacks', (req, res) => {
        feedbacksCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })

    })




    app.post('/addAdmin', (req, res) => {
        const admin = req.body;

        adminCollection.insertOne(admin)
            .then(result => {
                res.send(result.insertedCount > 0);
            })

    })

    app.get('/admin', (req, res) => {
        const email = req.query.email;
        console.log(email)
        adminCollection.find({ email })
            .toArray((err, documents) => {
                res.send(documents)
                console.log(documents)
            })
    })







    app.patch('/update/:id', (req, res) => {
        ordersCollection.updateOne({ _id: ObjectID(req.params.id) }, {
            $set: { status: req.body.status }
        })
            .then(result => { { console.log(result) } }
            )
    })


})



app.listen(process.env.PORT || port)