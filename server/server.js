const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const http = require("https");

// Parse urlencoded bodies
app.use(bodyParser.json());

// Serve static content in directory 'files'
app.use(express.static(path.join(__dirname, "files")));

app.get("/movie", function(req,res){ //kleine Probe mit https://rapidapi.com/SAdrian/api/moviesdatabase/
    
    const options = {
        host: 'moviesdatabase.p.rapidapi.com',
        path: '/titles/episode/tt12785836',
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
    console.log(searchResults.primaryImage.url);

    });

    response.on('error', (error) => {
        console.log(error);
    });
});

})

app.listen(3000);


console.log("Server now listening on http://localhost:3000/");