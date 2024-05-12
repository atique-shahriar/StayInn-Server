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
    const userCollection = database.collection("users");
    const bookedCollection = database.collection("bookedRooms");

    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const mail = user.userEmail;
      const query = {userEmail: mail};
      const find = await userCollection.findOne(query);
      console.log("Find", find);
      if (!find) {
        const result = await userCollection.insertOne(user);
        res.send(result);
      }
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

    app.put("/room/:id", async (req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const updateAvailability = req.body;
      const spot = {
        $set: {
          availability: updateAvailability.isAvailable,
        },
      };
      const result = await roomCollection.updateOne(filter, spot, options);
      res.send(result);
    });

    // app.get("/roomsAvailable", async (req, res) => {
    //   const query = {availability: true};
    //   const options = {
    //     projection: {_id: 1, availability: 1, image: 1, price_per_night: 1},
    //   };

    //   const cursor = roomCollection.find(query, options);
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    // app.get("/roomsAvailable/ascending", async (req, res) => {
    //   const query = {availability: true};
    //   const options = {
    //     projection: {_id: 1, availability: 1, image: 1, price_per_night: 1},
    //   };
    //   const cursor = roomCollection
    //     .find(query, options)
    //     .sort({price_per_night: 1});
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    // app.get("/roomsAvailable/descending", async (req, res) => {
    //   const query = {availability: true};
    //   const options = {
    //     projection: {_id: 1, availability: 1, image: 1, price_per_night: 1},
    //   };
    //   const cursor = roomCollection
    //     .find(query, options)
    //     .sort({price_per_night: -1});
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    app.get("/roomsAvailable/:filter", async (req, res) => {
      const filtering = req.params.filter;

      const highestNumber = await roomCollection.findOne({}, {sort: {price_per_night: -1}});
      let min = 0,
        max = highestNumber.price_per_night;

      if (filtering.includes("-")) {
        [min, max] = filtering.split("-").map(Number);
      } else {
        min = parseInt(filtering);
      }
      console.log("Filter", filtering);
      console.log("Max, Min", max, min);
      const query = {availability: true};
      const options = {
        projection: {_id: 1, availability: 1, image: 1, price_per_night: 1},
      };

      let cursor = roomCollection.find(query, options);

      if (filtering != "all") {
        cursor = roomCollection.find(
          {
            ...query,
            price_per_night: {$gte: min, $lte: max},
          },
          options
        );
      }

      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/bookedRooms", async (req, res) => {
      const cursor = bookedCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/bookedRooms", async (req, res) => {
      const user = req.body;
      const result = await bookedCollection.insertOne(user);
      res.json(result);
    });

    app.put("/bookedRooms/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const updateDate = req.body;
      console.log("Update Date", updateDate.date);
      const spot = {
        $set: {
          date: updateDate.date,
        },
      };
      const result = await bookedCollection.updateOne(filter, spot, options);
      res.send(result);
    });

    app.delete("/bookedRooms/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await bookedCollection.deleteOne(query);
      res.send(result);
    });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:5000/`);
});
