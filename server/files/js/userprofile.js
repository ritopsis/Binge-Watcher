import {
  checkifloggedin,
  getwatchlist,
  addWatchlist,
  removeWatchlist,
} from "./requestFunctions.js";

import { createNavButton } from "./createElements.js";
let watchlist = null;
let watchlistofuser = null;
let loggin = null;
let username = null;
window.onload = function () {
  checkifloggedin(function (error, response) {
    if (error) {
      window.location.href = "index.html";
    }
    if (response) {
      const urlParams = new URLSearchParams(window.location.search);
      const usernameofsearch = urlParams.get("username");
      username = response.toLowerCase();
      if (username == usernameofsearch && usernameofsearch) {
        window.location.href = "myprofile.html";
      }
      const nav = document.getElementById("nav_btn");
      createNavButton("Profile", "myprofile.html", nav);
      createNavButton("Logout", "logout", nav);
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        if (xhr.status === 200) {
          watchlistofuser = JSON.parse(xhr.responseText);
          if (!watchlistofuser.private) {
            const biography = document.getElementById("biography");
            if (watchlistofuser["biography"]) {
              //If the User wrote a biography
              biography.textContent =
                "About me: " + watchlistofuser["biography"];
            }
            const user = document.getElementById("user");
            user.textContent = usernameofsearch + "'s Watchlist";
            getwatchlist(null, function (error, response) {
              if (response) {
                watchlist = JSON.parse(response);
                loggin = true;
                content();
              } else {
              }
            });
          } else {
            const mainElement = document.querySelector("main");
            document.getElementById("watchlist_info").remove();
            let linkElement = document.createElement("h3");
            linkElement.textContent = "The user is private!";
            mainElement.appendChild(linkElement);
          }
        } else if (xhr.status === 404) {
          const mainElement = document.querySelector("main");
          document.getElementById("watchlist_info").remove();
          let linkElement = document.createElement("h3");
          linkElement.textContent = "There is no user with this username.";
          mainElement.appendChild(linkElement);
        } else {
        }
      };
      xhr.open("GET", "watchlist/" + usernameofsearch.toLowerCase(), true);
      xhr.send();
    }
  });
};

const searchButton = document.getElementById("search-button");
const searchuserinput = document.getElementById("searchuser-input");

searchButton.addEventListener("click", function () {
  const suserinput = searchuserinput.value;
  if (suserinput != username && suserinput != "") {
    location.href = "/userprofile.html?username=" + suserinput;
  } else {
  }
});

function content() {
  if (watchlistofuser) {
    if (watchlistofuser.watchlist.tvseries) {
      if (Object.keys(watchlistofuser.watchlist.tvseries).length > 0) {
        // Create and append h1 for Series
        const seriesHeader = document.createElement("h1");
        seriesHeader.textContent = "Series:";
        document.getElementById("series").appendChild(seriesHeader);
      }

      let tvseries = watchlistofuser.watchlist.tvseries;
      for (let serieId in tvseries) {
        addmedia(tvseries[serieId].title, serieId, null, ".series");
      }
    }
    if (watchlistofuser.watchlist.movies) {
      // Create and append h1 for Movies
      if (Object.keys(watchlistofuser.watchlist.movies).length) {
        const moviesHeader = document.createElement("h1");
        moviesHeader.textContent = "Movies:";
        document.getElementById("movies").appendChild(moviesHeader);
      }

      let movies = watchlistofuser.watchlist.movies;
      for (let movieId in movies) {
        addmedia(movies[movieId].title, movieId, null, ".movies");
      }
    }
  }
}

function addmedia(title, serieId, episode, documentelement) {
  const type = documentelement == ".movies" ? "movies" : "tvseries";
  const articleElement = document.createElement("article");
  articleElement.id = serieId;

  // Create the link element
  const linkElement = document.createElement("a");
  linkElement.href = "/media_details.html?id=" + serieId;

  // Create the heading element
  const headingElement = document.createElement("h1");
  headingElement.textContent = title;

  // Append the image and heading elements to the link element
  linkElement.appendChild(headingElement);

  if (episode) {
    const headingElement2 = document.createElement("h3");
    headingElement2.textContent = episode;
    linkElement.appendChild(headingElement2);
  }

  // Append the link element to the article element
  articleElement.appendChild(linkElement);

  if (loggin && watchlist) {
    const buttonElement = document.createElement("button");
    if (watchlist["watchlist"][type].hasOwnProperty(content.id)) {
      buttonElement.textContent = "Remove";
      buttonElement.setAttribute("data-action", "remove");
    } else {
      buttonElement.textContent = "Add";
      buttonElement.setAttribute("data-action", "add");
    }
    buttonElement.addEventListener("click", function () {
      const action = buttonElement.getAttribute("data-action");
      if (action === "add") {
        add(articleElement, buttonElement);
      } else {
        remove(articleElement, buttonElement);
      }
    });
    articleElement.appendChild(buttonElement);
  }

  // Add the article element to the document
  const topMoviesElement = document.querySelector(documentelement);
  topMoviesElement.appendChild(articleElement);
}

function add(article, button) {
  addWatchlist(article, function (error, response) {
    if (error) {
      // Handle error
    } else {
      button.textContent = "Remove";
      button.setAttribute("data-action", "remove"); // Change the action to "remove"
    }
  });
}

function remove(article, button) {
  removeWatchlist(article, function (error, response) {
    if (error) {
      // Handle error
    } else {
      button.textContent = "Add";
      button.setAttribute("data-action", "add"); // Change the action to "add"
    }
  });
}
