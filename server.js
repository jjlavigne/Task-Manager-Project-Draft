const express = require('express');     // Import express
const app = express();                  // Create express object
const mongoose = require('mongoose');
const cors = require('cors');           // handle Cross-Origin Requests
// const fs = require('fs').promises;      // Create a file stream
const path = require('path');           // Create a file path to read and write to data.json file
const port = 3000;                      // Define port for server

// Middleware to parse JSON 
app.use(express.json());

app.use(cors());

// app.options("*", cors()); // enable pre-flight across-the-board
app.use(express.static(path.join(__dirname, 'public')));

// Path to the JSON data file
const dataFilePath = path.join(__dirname, 'data.json');

let newRecord = {              // This object template is used to arrange all fields in the proper order for Post
  Id: 0,
  name: '',
  username: '',
  email: '',
  address: {
    street: '',
    suite: '',
    city: '',
    zipcode: '',
      geo: {
        lat: '',
        lng: '',
      },
  },
  phone: '',
  website: '',
  company: {
    name: '',
    catchPhrase: '',
    bs: ''
  }
};

const userSchema = new mongoose.Schema({
  Id: Number,
  name: String,
  username: String,
  email: String,
  address: {
    street: String,
    suite: String,
    city: String,
    zipcode: String,
    geo: {
      lat: String,
      lng: String,
    },
  },
  phone: String,
  website: String,
  company: {
    name: String,
    catchPhrase: String,
    bs: String
  }
}, {
  versionKey: false  // disables __v
});


// MongoDB Atlas connection
const mongoURI = 'Enter Connection String Here';

mongoose.connect(mongoURI)
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema
// const userSchema = new mongoose.Schema(newRecord);

const User = mongoose.model('User', userSchema);

// Utility to deep merge objects
function deepMerge(target, updates) {

  for (const key in updates) 
    if ( updates[key] instanceof Object ) 
      deepMerge(target[key], updates[key]);
    else 
      target[key] = updates[key];
};

// Renumbers all record ids after a deleted record
async function updateRecordIds(users, id) {
  deletedId = id;
  userLength = await User.countDocuments();

  for (let currentId = deletedId; currentId <= userLength; currentId++) { 
    const user = await User.find().skip(currentId - 1).limit(1).exec();
    await User.updateOne({ _id: user[0]._id }, { $set: {Id: currentId} });
  }
};

// Process GET for all user
app.get('/users', async (req, res) => {
  try {
    
    const users = await User.find();
    res.json(users);

  } catch (error) {
    res.status(500).json({ error: 'Failed to read data' }); // Catch any errors
  }
});

// Process GET for single user by id
app.get('/users/:id', async (req, res) => {                
  try {
    const user = await User.findOne({ Id: parseInt(req.params.id) }, { _id: 0 });
    res.json(user);

  } catch (error) {
    res.status(500).json({ error: 'Failed to read data' }); // Catch any errors
  }
});

// Process POST for new user
app.post('/users', async (req, res) => {
  try {

  deepMerge(newRecord, req.body);                                   // copy all key fields from req.body to newRecord object template in correct order
  newRecord.Id = await User.countDocuments() + 1;                         // Find the ID of the next user and  assign to new record
  const user = await User.create(newRecord);

  // await user.save();
  res.json(user);

  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: 'Failed to save data', details: error.message });
  }
});

// Process put by id
app.put('/users/:id', async (req, res) => {                
  try {

    const data = await fs.readFile(dataFilePath, 'utf8');              // Read all records from json data file
    const users = JSON.parse(data);                                    // convert records to non stringified json, similar to js object
    const user = users.find(thisUser => thisUser.id === parseInt(req.params.id));   // Get record with the requested id

    if (user) {
      
      deepMerge(user, req.body);                                            // copy all key fields from req.body to existing record with corresponding id
      await fs.writeFile(dataFilePath, JSON.stringify(users, null, 2), 'utf8');     // Write entire data file back to data.json file
      res.status(200).json(user);                                           // If record exists, send back to client

    } else {
      res.status(404).json({ error: 'record not found' });            // Error, record not found
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read data' });           // Catch any error
  }
});

// Process put by id
app.patch('/users/:id', async (req, res) => {                
  try {

    const data = await fs.readFile(dataFilePath, 'utf8');              // Read all records from json data file
    const users = JSON.parse(data);                                    // convert records to non stringified json, similar to js object
    const user = users.find(thisUser => thisUser.id === parseInt(req.params.id));   // Get record with the requested ID

    if (user) {
      
      deepMerge(user, req.body);                                            // copy only key fields that were sent in req.body, leaving existing fields as they are
      await fs.writeFile(dataFilePath, JSON.stringify(users, null, 2), 'utf8');     // Write entire data file back to data.json file
      res.status(200).json(user);                                           // If record exists, send back to client

    } else {
      res.status(404).json({ error: 'record not found' });            // Error, record not found
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read data' });           // Catch any error
  }
});

// Process GET for single user by id
app.delete('/users/:id', async (req, res) => {                
  try { 

    const user = await User.findOne({Id: parseInt(req.params.id)});

    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.deleteOne(); 
    updateRecordIds(User.find(), parseInt(req.params.id));                             // Renumbers all record ids after a deleted record
    res.status(200).json(user);                                                 // If record exists, send back to client

  }
  catch (error) {
    res.status(500).json({ error: 'Failed to read data' });           // Catch any error
  }
});

// Start the server at port 3000
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
