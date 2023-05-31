const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();

// Parse urlencoded bodies
app.use(bodyParser.json());

// Serve static content in directory 'files'
app.use(express.static(path.join(__dirname, "files")));



app.listen(3000);


console.log("Server now listening on http://localhost:3000/");