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

app.use(bodyParser.json());
app.use(cors());

app.post('/saveCellContent', async (req, res) => {
  const { cellContent } = req.body;

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const result = await collection.insertOne({ cellContent });
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
