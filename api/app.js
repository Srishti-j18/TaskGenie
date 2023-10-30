const express = require('express');
const app = express();

// Root Handlers

// list Routes
// Get list
// Propose : Get all lists


app.get('/lists', (req, res) => {
    res.send("Hello World");
    // We want to return an array of all the lists in the database
})
app.post('/lists', (req, res) => {
    res.send("Hello World");
    // We want to create a new list and return the new list document back
});

app.listen(3000, () => {
    console.log("Server is listening on port 3000");
})