const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const http = require("https");
const { stringify } = require("querystring");
const fs = require('fs'); //For file creation/reading

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
            'X-RapidAPI-Key': '76867fecdfmsh75cb9bf136a9876p14a9fejsn43dec68f9b54',
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
    //console.log(searchResults);
    res.send(searchResults);

    });

    response.on('error', (error) => {
        //console.log(error);
    });
});

})

/*app.get("/series", function(req, res) {
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': '76867fecdfmsh75cb9bf136a9876p14a9fejsn43dec68f9b54',
        'X-RapidAPI-Host': 'moviesdatabase.p.rapidapi.com'
      }
    };
  
    fetch('https://moviesdatabase.p.rapidapi.com/titles/random?limit=5&list=most_pop_series', options)
      .then(response => response.json())
      .then(data => {
        const searchResults = data.results;
        console.log(searchResults);
        res.send(searchResults);
      })
      .catch(error => {
        console.log(error);
      });
  });
*/

 app.get("/series", function(req, res){
    const options = {
        method: 'GET',
        hostname: 'moviesdatabase.p.rapidapi.com',
        port: null,
        path: '/titles/random?limit=5&list=most_pop_series',
        headers: {
            'X-RapidAPI-Key': '76867fecdfmsh75cb9bf136a9876p14a9fejsn43dec68f9b54',
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
    //console.log(searchResults);
    res.send(searchResults);
    });

    response.on('error', (error) => {
        console.log(error);
    });
});
})

// Define the JSON file path
const filePath = 'data/registeredaccounts.json';


app.post("/register", function(req, res){
  const { username, password } = req.body;

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    const jsonData = JSON.parse(data);
    if(jsonData[username]) //jsonData[username] -> undefined -> false (falsy)
    {
      res.status(409).send('Username already taken'); //Status 409 is conflict
    }
    else //username doesn't exist
    {
      jsonData[username] = password; //Add username as key and password as value into the jsonData
      createFile(username);
      fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', err => {//jsonData, null, 2 <- better formatting of json in registeredaccounts.json
        if (err) {
          console.error('Error:', err);
          return;
        }
        console.log('File saved successfully.');
        res.status(200).send('User created'); 
      }); 
    }
  });
});

app.post("/login", function(req, res){
const { username, password } = req.body;
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    const jsonData = JSON.parse(data);
    if(jsonData[username] == password)
    {
      console.log("login success");
      res.status(200).send('Login');
    }
    else
    {
      res.status(401).send('Wrong Username/Password!');
    }
  });
});

function createFile(filename)
{
  fs.writeFile("data/userdata/"+filename + ".json", "{ }", 'utf8', (err) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    console.log('JSON file created successfully.');
  });
}

app.listen(3000);


console.log("Server now listening on http://localhost:3000/");