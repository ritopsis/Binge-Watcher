const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express(); //our server
const fs = require("fs"); //For file creation/reading
const session = require("express-session"); //library handles cookies and checking sessionid
const config = require(path.join(__dirname, "config.js"));
const registerPath = path.join("data", "registeredaccounts.json");
const userdataPath = path.join("data", "userdata.json");

// Serve static content in directory 'files'
app.use(express.static(path.join(__dirname, "files")));

app.use(bodyParser.json());

//middleware
app.use(
  session({
    secret: config.secret, // secret key used to sign the session ID cookie
    resave: false, // only saved session in session store if it was modified during the request
    saveUninitialized: false, //uninitialized sessions will not be saved in the session store
  })
);

// GET-Methods
const options = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": config.rapidMoviesdatabaseApiKey,
    "X-RapidAPI-Host": "moviesdatabase.p.rapidapi.com",
  },
};

app.get("/pop_media", function (req, res) {
  const totalMedia = req.query.limit; // number of medias we want to have
  const mediaList = req.query.list; // from a medialist (movielist,serielist)
  const URL = `https://moviesdatabase.p.rapidapi.com/titles/random?list=${mediaList}&limit=${totalMedia}`;
  fetch(URL, options)
    .then((response) => response.json())
    .then((data) => {
      const searchResults = data.results;
      res.send(searchResults);
    })
    .catch((error) => {
      console.log(error);
    });
});

app.get("/watchlist", isAuthenticated, function (req, res) {
  // retrieve the watchlist of the logged-in user
  readFile(userdataPath, (err, data) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    const jsonData = data;
    res.status(200).json(jsonData[req.session.username]);
  });
});

app.get("/watchlist/:userid", isAuthenticated, function (req, res) {
  // retrieve the watchlist of a user with username
  readFile(userdataPath, (err, data) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    const jsonData = data;
    if (jsonData[req.params.userid]) {
      res.status(200).json(jsonData[req.params.userid]);
    } else {
      res.sendStatus(404);
    }
  });
});

app.get("/details/:id", function (req, res) {
  // retrieve information about a media item (a movie or a serie)
  const detail = req.params.id;
  const URL =
    "https://moviesdatabase.p.rapidapi.com/titles/" +
    detail +
    "?info=base_info";

  fetch(URL, options)
    .then((response) => response.json())
    .then((data) => {
      const searchResults = data.results;
      res.send(searchResults);
    })
    .catch((error) => {
      console.log(error);
    });
});

app.get("/episodes/:seriesID", function (req, res) {
  // retrieve all episodes from a serie
  const seriesID = req.params.seriesID;
  const URL = "https://moviesdatabase.p.rapidapi.com/titles/series/" + seriesID;

  fetch(URL, options)
    .then((response) => response.json())
    .then((data) => {
      const searchResults = data.results;
      res.send(searchResults);
    })
    .catch((error) => {
      console.log(error);
    });
});

app.get("/titles/:input", function (req, res) {
  // retrieve media titles with provided search-input and media-type
  const searchinput = req.params.input;
  const searchtype = req.query.type;
  const searchsite = req.query.site;
  const URL = `https://moviesdatabase.p.rapidapi.com/titles/search/title/${encodeURIComponent(
    searchinput
  )}?page=${searchsite}&titleType=${searchtype}&limit=12`;

  fetch(URL, options)
    .then((response) => response.json())
    .then((data) => {
      res.send(data);
    })
    .catch((error) => {
      console.log(error);
    });
});

app.get("/loggedin", isAuthenticated, function (req, res) {
  // check if current user is logged-in
  res.status(200).json(req.session.username);
});

app.get("/logout", function (req, res) {
  // destroy session of logged-in user
  if (req.session.username) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error while destroying session:", err);
        res.status(500).send("Internal Server Error");
      } else {
        res.redirect("/");
      }
    });
  } else {
    res.redirect("/");
  }
});

// POST-Methods
app.post("/register", function (req, res) {
  const { username, password } = req.body;

  // Check if username and password is longer than 4 characters
  if (username.length >= 3 || password.length >= 3) {
    //check if username contains any special characters
    const specialChars = /[^a-zA-Z0-9]/;
    if (specialChars.test(username)) {
      res.status(400).send("Username should only contain letters and numbers.");
    }
  } else {
    res
      .status(400)
      .send("Both Username and Password must be at least 4 characters long.");
  }

  readFile(registerPath, (err, data) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    if (data[username]) {
      res
        .status(409)
        .send("Username is already taken. Please choose a different username.");
    } else {
      data[username] = password;
      writeFile(registerPath, data, (err) => {
        if (err) {
          console.error("Error:", err);
          res.status(500).send("Internal Server Error");
          return;
        }
        readFile(userdataPath, (err, userdata) => {
          if (err) {
            console.error("Error:", err);
            res.status(500).send("Internal Server Error");
            return;
          }
          userdata[username] = {
            private: false,
            biography: "",
            watchlist: { tvseries: {}, movies: {} },
          };
          writeFile(userdataPath, userdata, (err) => {
            if (err) {
              console.error("Error:", err);
              res.status(500).send("Internal Server Error");
              return;
            }
            res.status(200).send("User created");
          });
        });
      });
    }
  });
});

app.post("/login", function (req, res) {
  const { username, password } = req.body;
  readFile(registerPath, (err, data) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    const jsonData = data;
    if (jsonData[username] == password) {
      console.log("login success");
      req.session.username = username; //by adding an attribute to the session, it will be saved in the session store
      res.status(200).send("Login");
    } else {
      res.status(401).send("Incorrect username or password.");
    }
  });
});

app.post("/addwatchlist", isAuthenticated, function (req, res) {
  readFile(userdataPath, (err, data) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    const jsonData = data;
    const watchlist = jsonData[req.session.username].watchlist;
    const mediaID = req.body.id;
    const title = req.body.title;
    const type = req.body.type;
    console.log(type);

    if (type == "tvseries") {
      if (!watchlist.tvseries[mediaID]) {
        watchlist.tvseries[mediaID] = {};
        watchlist.tvseries[mediaID]["title"] = title;
        watchlist.tvseries[mediaID]["date"] = new Date().toISOString();
        watchlist.tvseries[mediaID]["episode"] = {};
      }
    } else {
      if (!watchlist.movies[mediaID]) {
        watchlist.movies[mediaID] = {};
        watchlist.movies[mediaID]["title"] = title;
        watchlist.movies[mediaID]["date"] = new Date().toISOString();
      }
    }
    writeFile(userdataPath, jsonData, (err) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      console.log("File saved successfully.");
      res.sendStatus(200);
    });
  });
});

app.post("/addepwatchlist", isAuthenticated, function (req, res) {
  readFile(userdataPath, (err, data) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    const jsonData = data;
    const watchlist = jsonData[req.session.username].watchlist;
    const mediaID = req.body.id;
    const episodeID = req.body.tconst;
    const title = req.body.title;

    if (watchlist.tvseries[mediaID]) {
      watchlist.tvseries[mediaID]["date"] = new Date().toISOString();
      watchlist.tvseries[mediaID]["episode"][episodeID] =
        req.body.seasonNumber + "-" + req.body.episodeNumber;
    } else {
      watchlist.tvseries[mediaID] = {};
      watchlist.tvseries[mediaID]["title"] = title;
      watchlist.tvseries[mediaID]["date"] = new Date().toISOString();
      watchlist.tvseries[mediaID]["episode"] = {};
      watchlist.tvseries[mediaID]["episode"][episodeID] =
        req.body.seasonNumber + "-" + req.body.episodeNumber;
    }
    writeFile(userdataPath, jsonData, (err) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
        return;
      } else {
        console.log("File saved successfully.");
        res.sendStatus(200);
      }
    });
  });
});

app.post("/recommends", isAuthenticated, function (req, res) {
  const URL = "https://chatgpt53.p.rapidapi.com/";
  const chatoption = {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": config.rapidChatGPTApiKey,
      "X-RapidAPI-Host": "chatgpt53.p.rapidapi.com",
    },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content:
            "Give me 5 " +
            req.body.type +
            "recommendations based on this" +
            req.body.mediaNames,
        },
      ],
    }),
  };

  fetch(URL, chatoption)
    .then((response) => response.json())
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((error) => {
      res.status(500).send("Internal Server Error");
      console.log(error);
    });
});

// PUT-Methods
app.put("/changebio", isAuthenticated, function (req, res) {
  const URL =
    "https://neutrinoapi-bad-word-filter.p.rapidapi.com/bad-word-filter";
  postoptions = {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "X-RapidAPI-Key": config.rapidBadWordFilterbaseApiKey,
      "X-RapidAPI-Host": "neutrinoapi-bad-word-filter.p.rapidapi.com",
    },
    body: new URLSearchParams({
      content: req.body.biography,
      "censor-character": "*",
    }),
  };
  fetch(URL, postoptions)
    .then((response) => response.json())
    .then((resdata) => {
      const text = resdata;
      readFile(userdataPath, (err, data) => {
        if (err) {
          console.error("Error:", err);
          res.status(500).send("Internal Server Error");
          return;
        }
        const jsonData = data;
        jsonData[req.session.username]["biography"] = text["censored-content"];
        writeFile(userdataPath, jsonData, (err) => {
          if (err) {
            console.error("Error:", err);
            res.status(500).send("Internal Server Error");
            return;
          }
          res.status(200).json(text);
        });
      });
    })
    .catch((error) => {
      res.status(500).send("Internal Server Error");
      console.log(error);
    });
});

// DELETE-Methods
app.delete("/removewatchlist", isAuthenticated, function (req, res) {
  readFile(userdataPath, (err, data) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    const jsonData = data;
    const watchlist = jsonData[req.session.username].watchlist;
    const id = req.body.id;
    if (watchlist.tvseries[id]) {
      delete watchlist.tvseries[id];
    } else {
      if (watchlist.movies[id]) {
        delete watchlist.movies[id];
      }
    }
    writeFile(userdataPath, jsonData, (err) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      console.log("File saved successfully.");
      res.sendStatus(200);
    });
  });
});

app.delete("/removeepwatchlist", isAuthenticated, function (req, res) {
  readFile(userdataPath, (err, data) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const jsonData = data;
    const watchlist = jsonData[req.session.username].watchlist;
    const id = req.body.id;
    const tconst = req.body.tconst;

    if (watchlist.tvseries[id]) {
      delete watchlist.tvseries[id]["episode"][tconst];

      writeFile(userdataPath, jsonData, (err) => {
        if (err) {
          console.error("Error:", err);
          res.status(500).send("Internal Server Error");
          return;
        }
        console.log("File saved successfully.");
        res.sendStatus(200);
      });
    } else {
      res.sendStatus(200); // Not found - means its already deleted :) idempotent
    }
  });
});

// PATCH-Methods
app.patch("/privacy", isAuthenticated, function (req, res) {
  const setting = req.body.settings;
  readFile(userdataPath, (err, data) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    const jsonData = data;
    jsonData[req.session.username].private = setting;
    writeFile(userdataPath, jsonData, (err) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      console.log("File saved successfully.");
      res.sendStatus(200);
    });
  });
});

// Functions
//Function for writing to a file
function writeFile(filename, jsonData, callback) {
  fs.writeFile(filename, JSON.stringify(jsonData, null, 2), "utf8", (err) => {
    //jsonData, null, 2 <- better formatting of json in registeredaccounts.json
    if (err) {
      console.error("Error:", err);
      callback(err);
      return;
    }
    console.log("File saved successfully.");
    callback(null);
  });
}

//Function for reading a file
function readFile(filePath, callback) {
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error:", err);
      callback(err, null);
      return;
    }
    if (data) {
      const jsonData = JSON.parse(data);
      callback(null, jsonData);
    } else {
      callback(null, {});
    }
  });
}

//Function to check if the user is logged in
function isAuthenticated(req, res, next) {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  if (req.session && req.session.username) {
    //Logged in
    next();
  } else {
    //Not logged in!
    res.status(401).send("Unauthorized");
  }
}

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.listen(3000);

console.log("Server now listening on http://localhost:3000/");
