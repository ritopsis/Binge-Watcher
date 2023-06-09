const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const http = require("https");
const { stringify } = require("querystring");

// Parse urlencoded bodies
app.use(bodyParser.json());

// Serve static content in directory 'files'
app.use(express.static(path.join(__dirname, "files")));

app.get("/movie", function(req,res){ //kleine Probe mit https://rapidapi.com/SAdrian/api/moviesdatabase/
    
    const options = {
        method: 'GET',
        hostname: 'moviesdatabase.p.rapidapi.com',
        port: null,
        path: '/titles/random?startYear=2020&sort=year.incr&limit=5&list=most_pop_movies',
        headers: {
            'X-RapidAPI-Key': '820810d92fmsh47306384f1838ccp1ad0a6jsnb891ca3b29ec',
            'X-RapidAPI-Host': 'moviesdatabase.p.rapidapi.com'
        }
      };
http.get(options, (response) => {

    let data = "";
    response.on('data', (chunk) => {
        data += chunk;
    });

    response.on('end', () => {
    const jsonData = JSON.parse(data);
    const searchResults = jsonData.results;
    console.log(searchResults);
    res.send(searchResults);
    });

    response.on('error', (error) => {
        console.log(error);
    });
});
})

app.get("/series", function(req, res){
    
})


app.listen(3000);


console.log("Server now listening on http://localhost:3000/");