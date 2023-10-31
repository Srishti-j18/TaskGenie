const express = require('express');
const app = express();

const { mongoose } = require('./db/mongoose');
const bodyParser = require('body-parser');

// Load in the mongoose models
const { List, Task } = require('./db/models');

//Load middleware
app.use(bodyParser.json());



// Root Handlers

// list Routes
// Get list
// Propose : Get all lists


app.get('/lists', (req, res) => {
    // We want to return an array of all the lists in the database
    List.find({}).then((lists) => {
        res.send(lists);
    });
});

// Post /lists
// Purpose: Create a list
app.post('/lists', (req, res) => {
    // We want to create a new list and return the new list document back (which includes the Id)
    // The list information (fields) will be passed in via the JSON request body
    let title = req.body.title;

    let newList = new List({
        title
    });
    newList.save().then((listDoc) => {
        // the full list document is returned (incl. id)
        res.send(listDoc);
    })
});

// Post /lists/:id
// Purpose: Update a specific list
app.patch('/lists/:id', (req, res) => {
    // We want to update the specific list (list document with id in the URL) with the new values specified in the JSON body
    List.findOneAndUpdate({ _id: req.params.id }, {
        $set: req.body
    }).then(() => {
        res.sendStatus(200);
    });
});


// Post /lists/:id
// Purpose:  delete a specified list
app.delete('/lists/:id', (req, res) => {
    // We want to delete the specified list (document with id in the URL) 
    List.findOneAndDelete({
        _id: req.params.id
    }).then((removedListDoc) => {
        res.send(removedListDoc);
    });
});

app.listen(3000, () => {
    console.log("Server is listening on port 3000");
})