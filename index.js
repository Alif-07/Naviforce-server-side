const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fmqfn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

async function run() {
	try {
		await client.connect();

		const database = client.db('naviforce');
		const watchCollection = database.collection('watch');
		const orderCollection = database.collection('order');
		const usersCollection = database.collection('users');
		const reviewCollection = database.collection('review');

		//Get api
		app.get('/watch', async (req, res) => {
			const cursor = watchCollection.find({});
			const services = await cursor.toArray();
			res.send(services);
		});
		app.get('/order', async (req, res) => {
			const cursor = orderCollection.find({});
			const orders = await cursor.toArray();
			res.send(orders);
		});
		app.get('/users', async (req, res) => {
			const cursor = usersCollection.find({});
			const users = await cursor.toArray();
			res.json(users);
		});
		app.get('/review', async (req, res) => {
			const cursor = reviewCollection.find({});
			const users = await cursor.toArray();
			res.json(users);
		});
		//Post api
		app.post('/order', async (req, res) => {
			const service = req.body;

			const result = await orderCollection.insertOne(service);
			console.log(result);
			res.json(result);
		});
		app.post('/review', async (req, res) => {
			const service = req.body;

			const result = await reviewCollection.insertOne(service);
			console.log(result);
			res.json(result);
		});
		app.get('/user/:email', async (req, res) => {
			const email = req.params.email;
			const query = { email: email };
			const user = await usersCollection.findOne(query);
			let isAdmin = false;
			if (user?.role === 'admin') {
				isAdmin = true;
			}
			res.json({ admin: isAdmin });
		});
		app.post('/user', async (req, res) => {
			const user = req.body;
			const result = await usersCollection.insertOne(user);

			res.json(result);
		});
		app.put('/users/admin', async (req, res) => {
			const user = req.body;
			console.log(user);
			const filter = { email: user.email };
			const updateDoc = { $set: { role: 'admin' } };
			const result = await usersCollection.updateOne(filter, updateDoc);
			res.json(result);
		});
		app.delete('/order/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await orderCollection.deleteOne(query);
			res.json(result);
		});
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
