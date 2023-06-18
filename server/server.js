const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const http = require("https");
const { stringify } = require("querystring");
const fs = require("fs"); //For file creation/reading
const session = require("express-session");
const registerPath = "data/registeredaccounts.json";
const userdataPath = "data/userdata.json";

app.use(bodyParser.json());
app.use(
  session({
    secret: "mysecret", // Secret key used to sign the session ID cookie
    resave: false, // Forces the session to be saved back to the session store, even if it wasn't modified during the request
    saveUninitialized: false, //uninitialized sessions will not be saved in the session store
  })
);

// Serve static content in directory 'files'
app.use(express.static(path.join(__dirname, "files")));

app.get("/movie", function (req, res) {
  const options = {
    method: "GET",
    hostname: "moviesdatabase.p.rapidapi.com",
    port: null,
    path: "/titles/random?startYear=2020&sort=year.incr&limit=5&list=most_pop_movies",
    headers: {
      "X-RapidAPI-Key": "76867fecdfmsh75cb9bf136a9876p14a9fejsn43dec68f9b54",
      "X-RapidAPI-Host": "moviesdatabase.p.rapidapi.com",
    },
  };
  http.get(options, (response) => {
    let data = "";
    response.on("data", (chunk) => {
      data += chunk;
    });

    response.on("end", () => {
      const jsonData = JSON.parse(data);
      const searchResults = jsonData.results;
      res.send(searchResults);
    });

    response.on("error", (error) => {
      //console.log(error);
    });
  });
});

app.get("/series", function (req, res) {
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "76867fecdfmsh75cb9bf136a9876p14a9fejsn43dec68f9b54",
      "X-RapidAPI-Host": "moviesdatabase.p.rapidapi.com",
    },
  };

  fetch(
    "https://moviesdatabase.p.rapidapi.com/titles/random?limit=5&list=most_pop_series",
    options
  )
    .then((response) => response.json())
    .then((data) => {
      const searchResults = data.results;
      res.send(searchResults);
    })
    .catch((error) => {
      console.log(error);
    });
});

app.get("/watchlist", function (req, res) {
  if (req.session.username) {
    fs.readFile(userdataPath, "utf-8", (err, data) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      const jsonData = JSON.parse(data);
      res.status(200).json(jsonData[req.session.username]);
    });
  } else {
    res.status(401).send("Unauthorized");
  }
});

app.get("/watchlist/:userid", function (req, res) {
  if (req.session.username) {
    fs.readFile(userdataPath, "utf-8", (err, data) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      const jsonData = JSON.parse(data);
      if (jsonData[req.params.userid]) {
        res.status(200).json(jsonData[req.params.userid]);
      } else {
        res.sendStatus(404);
      }
    });
  } else {
    res.status(401).send("Unauthorized");
  }
});

app.post("/addepwatchlist", function (req, res) {
  fs.readFile(userdataPath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    const jsonData = JSON.parse(data);
    if (req.session.username) {
      const watchlist = jsonData[req.session.username].watchlist;
      const id = req.body.id;
      const tconst = req.body.tconst;
      const title = req.body.title;

      if (watchlist.tvseries[id]) {
        watchlist.tvseries[id]["date"] = new Date().toISOString();
        watchlist.tvseries[id]["episode"][tconst] =
          req.body.seasonNumber + "-" + req.body.episodeNumber;
      } else {
        watchlist.tvseries[id] = {};
        watchlist.tvseries[id]["title"] = title;
        watchlist.tvseries[id]["date"] = new Date().toISOString();
        watchlist.tvseries[id]["episode"] = {};
        watchlist.tvseries[id]["episode"][tconst] =
          req.body.seasonNumber + "-" + req.body.episodeNumber;
      }

      fs.writeFile(
        userdataPath,
        JSON.stringify(jsonData, null, 2),
        "utf8",
        (err) => {
          if (err) {
            console.error("Error:", err);
            res.status(500).send("Internal Server Error");
            return;
          }
          console.log("File saved successfully.");
          res.sendStatus(200);
        }
      );
    } else {
      res.sendStatus(401);
    }
  });
});

app.delete("/removeepwatchlist", function (req, res) {
  fs.readFile(userdataPath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const jsonData = JSON.parse(data);
    if (req.session.username) {
      const watchlist = jsonData[req.session.username].watchlist;
      const id = req.body.id;
      const tconst = req.body.tconst;

      if (watchlist.tvseries[id]) {
        delete watchlist.tvseries[id]["episode"][tconst];

        fs.writeFile(
          userdataPath,
          JSON.stringify(jsonData, null, 2),
          "utf8",
          (err) => {
            if (err) {
              console.error("Error:", err);
              res.status(500).send("Internal Server Error");
              return;
            }
            console.log("File saved successfully.");
            res.sendStatus(200);
          }
        );
      } else {
        res.sendStatus(404); // Not found - tconst does not exist in the watchlist
      }
    } else {
      res.sendStatus(401); // Unauthorized
    }
  });
});

app.post("/register", function (req, res) {
  const { username, password } = req.body;

  fs.readFile(registerPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    let jsonData = {};
    if (data) {
      jsonData = JSON.parse(data);
    }

    if (jsonData[username]) {
      res.status(409).send("Username already taken");
    } else {
      jsonData[username] = password;
      writeinFile(registerPath, jsonData, (err) => {
        if (err) {
          console.error("Error:", err);
          res.status(500).send("Internal Server Error");
          return;
        }
        fs.readFile(userdataPath, "utf-8", (err, userdata) => {
          if (err) {
            console.error("Error:", err);
            res.status(500).send("Internal Server Error");
            return;
          }

          let userjsonData = {};
          if (userdata) {
            userjsonData = JSON.parse(userdata);
          }

          userjsonData[username] = {
            biography: "",
            watchlist: { tvseries: {}, movies: {} },
          };
          writeinFile(userdataPath, userjsonData, (err) => {
            if (err) {
              console.error("Error:", err);
              res.status(500).send("Internal Server Error");
              return;
            }
            console.log("User created");
            res.status(200).send("User created");
          });
        });
      });
    }
  });
});

function writeinFile(filename, jsonData, callback) {
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

app.post("/login", function (req, res) {
  const { username, password } = req.body;
  fs.readFile(registerPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    if (!data) {
      res.status(401).send("Wrong Username/Password!");
    } else {
      const jsonData = JSON.parse(data);
      if (jsonData[username] == password) {
        console.log("login success");
        req.session.username = username; //by adding an attribute to the session, it will be saved in the session store
        res.status(200).send("Login");
      } else {
        res.status(401).send("Wrong Username/Password!");
      }
    }
  });
});

app.get("/loggedin", function (req, res) {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");

  if (req.session.username) {
    // User is logged in
    res.status(200).send(req.session.username);
  } else {
    // User is not logged in
    res.status(401).send("Unauthorized");
  }
});
app.get("/logout", function (req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error while destroying session:", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.redirect("/");
    }
  });
});

app.get("/episodes/:seriesID", function (req, res) {
  //provides episode numbers and episode id's
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "76867fecdfmsh75cb9bf136a9876p14a9fejsn43dec68f9b54",
      "X-RapidAPI-Host": "moviesdatabase.p.rapidapi.com",
    },
  };
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

app.get("/details/:id", function (req, res) {
  //provides information about the movie/show
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "76867fecdfmsh75cb9bf136a9876p14a9fejsn43dec68f9b54",
      "X-RapidAPI-Host": "moviesdatabase.p.rapidapi.com",
    },
  };

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

app.get("/titles/:input", function (req, res) {
  const searchinput = req.params.input;
  const searchtype = req.query.type;
  const searchsite = req.query.site;
  //provides information about the movie/show
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "76867fecdfmsh75cb9bf136a9876p14a9fejsn43dec68f9b54",
      "X-RapidAPI-Host": "moviesdatabase.p.rapidapi.com",
    },
  };

  const URL = `https://moviesdatabase.p.rapidapi.com/titles/search/title/${encodeURIComponent(
    searchinput
  )}?page=${searchsite}&titleType=${searchtype}&limit=10`;
  fetch(URL, options)
    .then((response) => response.json())
    .then((data) => {
      //const searchResults = data.results;
      res.send(data);
    })
    .catch((error) => {
      console.log(error);
    });
});

app.post("/addwatchlist", function (req, res) {
  fs.readFile(userdataPath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    const jsonData = JSON.parse(data);
    if (req.session.username) {
      const watchlist = jsonData[req.session.username].watchlist;
      const id = req.body.id;
      const title = req.body.title;
      const type = req.body.type;
      console.log(type);

      if (type == "tvseries") {
        if (!watchlist.tvseries[id]) {
          watchlist.tvseries[id] = {};
          watchlist.tvseries[id]["title"] = title;
          watchlist.tvseries[id]["date"] = new Date().toISOString();
          watchlist.tvseries[id]["episode"] = {};
        }
      } else {
        if (!watchlist.movies[id]) {
          watchlist.movies[id] = {};
          watchlist.movies[id]["title"] = title;
          watchlist.movies[id]["date"] = new Date().toISOString();
        }
      }
      fs.writeFile(
        userdataPath,
        JSON.stringify(jsonData, null, 2),
        "utf8",
        (err) => {
          if (err) {
            console.error("Error:", err);
            res.status(500).send("Internal Server Error");
            return;
          }
          console.log("File saved successfully.");
          res.sendStatus(200);
        }
      );
    } else {
      res.sendStatus(401);
    }
  });
});

app.delete("/removewatchlist", function (req, res) {
  console.log("yuhu");
  fs.readFile(userdataPath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    const jsonData = JSON.parse(data);
    if (req.session.username) {
      const watchlist = jsonData[req.session.username].watchlist;
      const id = req.body.id;
      if (watchlist.tvseries[id]) {
        delete watchlist.tvseries[id];
      } else {
        if (watchlist.movies[id]) {
          delete watchlist.movies[id];
        }
      }
      fs.writeFile(
        userdataPath,
        JSON.stringify(jsonData, null, 2),
        "utf8",
        (err) => {
          if (err) {
            console.error("Error:", err);
            res.status(500).send("Internal Server Error");
            return;
          }
          console.log("File saved successfully.");
          res.sendStatus(200);
        }
      );
    } else {
      res.sendStatus(401);
    }
  });
});

app.put("/changebio", function (req, res) {
  fs.readFile(userdataPath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    const jsonData = JSON.parse(data);
    if (req.session.username) {
      jsonData[req.session.username]["biography"] = req.body.biography;

      fs.writeFile(
        userdataPath,
        JSON.stringify(jsonData, null, 2),
        "utf8",
        (err) => {
          if (err) {
            console.error("Error:", err);
            res.status(500).send("Internal Server Error");
            return;
          }
          console.log("File saved successfully.");
          res.sendStatus(200);
        }
      );
    } else {
      res.sendStatus(401);
    }
  });
});

app.listen(3000);

console.log("Server now listening on http://localhost:3000/");
