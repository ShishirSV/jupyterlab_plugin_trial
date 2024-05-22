const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000; 
const uri = process.env.MONGODB_URI; 
const dbName = 'jupyter-stories'; 
const collectionName = 'stories'; 

const schema = {
    bsonType: "object",
    title: "stories",
    required: ["id"],
    properties: {
      id: { bsonType: "string", minLength: 1 },
      description: { bsonType: ["string", "null"] },
      acceptance_criteria: { bsonType: ["string", "null"] },
      workflow: { bsonType: ["string", "null"] },
      exception_workflow: { bsonType: ["string", "null"] },
      something_else: { bsonType: ["string", "null"] },
      status: { bsonType: ["string", "null"]}
    }

};

app.use(bodyParser.json());
app.use(cors());

app.post('/saveCellContent', async (req, res) => {
  const data = req.body;
  console.log(data);  
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db(dbName);
    

    // Setting schema
    database.command({
      collMod: collectionName,
      validator: { $jsonSchema: schema },
      validationLevel: "strict",
      validationAction: "error"
    });
    
    const collection = database.collection(collectionName);
    const result = await collection.insertOne(data);
    res.status(200).send(`Document inserted with _id: ${result.insertedId}`);

  } catch (err) {
    console.error('Error connecting to MongoDB or inserting document:', err);
    res.status(500).send('Internal Server Error');

  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
