const express = require("express");
var cors = require("cors");
const {MongoClient, ServerApiVersion, ObjectId} = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vbl1j76.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    // await client.db("admin").command({ ping: 1 });
    const database = client.db("stayInn");
    const roomCollection = database.collection("rooms");

    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    app.get("/rooms", async (req, res) => {
      const cursor = roomCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/room/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await roomCollection.findOne(query);
      res.send(result);
    });

    app.get("/roomsAvailable", async (req, res) => {
      const query = {availability: true};
      const options = {
        projection: {_id: 1, availability: 1, image: 1, price_per_night: 1},
      };

      const cursor = roomCollection.find(query, options);
      const result = await cursor.toArray();
      res.send(result);
    });

   

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:5000/`);
});
