import {
  checkifloggedin,
  getwatchlist,
  addWatchlist,
  removeWatchlist,
} from "./user.js";
import { createNavButton } from "./createElements.js";
let watchlist = null;
let loggin = null;
let username = null;
window.onload = function () {
  checkifloggedin(function (error, response) {
    if (error) {
      window.location.href = "index.html";
    }
    if (response) {
      username = response;
      getwatchlist(null, function (error, response) {
        if (response) {
          watchlist = JSON.parse(response);
          const biographyInput = document.getElementById("biography-input");
          biographyInput.textContent = watchlist["biography"];
          loggin = true;
          content();
          let nav = document.getElementById("nav_btn");
          createNavButton("My Profile", "myprofile.html", nav);
          createNavButton("Logout", "logout", nav);
        } else {
        }
      });
    }
  });
};

const saveButton = document.getElementById("save-biography-button");
const biographyInput = document.getElementById("biography-input");

saveButton.addEventListener("click", function () {
  const newBiography = biographyInput.value;
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status === 200) {
      console.log(xhr.responseText);
      const result = JSON.parse(xhr.responseText);
      biographyInput.value = result["censored-content"];
    } else {
    }
  };
  const data = {
    biography: newBiography,
  };
  xhr.open("PUT", "/changebio", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(data));
});

const searchButton = document.getElementById("search-button");
const searchuserinput = document.getElementById("searchuser-input");

searchButton.addEventListener("click", function () {
  const suserinput = searchuserinput.value;
  if (suserinput != username && suserinput) {
    location.href = "/usersite.html?username=" + suserinput;
  }
});

function content() {
  const userElement = document.getElementById("user");
  userElement.textContent = "Your Watchlist: " + username;
  if (watchlist && loggin) {
    if (watchlist.watchlist.tvseries) {
      if (Object.keys(watchlist.watchlist.tvseries).length > 0) {
        // Create and append h1 for Series
        const seriesHeader = document.createElement("h1");
        seriesHeader.textContent = "Series:";
        document.getElementById("series").appendChild(seriesHeader);
      }

      let tvseries = watchlist.watchlist.tvseries;

      const sortedSeries = Object.entries(tvseries)
        .sort(([, a], [, b]) => new Date(b.date) - new Date(a.date))
        .map(([key, value]) => ({ id: key, ...value }));

      console.log(sortedSeries);

      for (let serieId in sortedSeries) {
        let highestEpisode = null;

        for (let episodeId in sortedSeries[serieId].episode) {
          const episode = sortedSeries[serieId].episode[episodeId];
          const episodeParts = episode.split("-");
          const season = parseInt(episodeParts[0]);
          const episodeNumber = parseInt(episodeParts[1]);

          if (
            !highestEpisode ||
            season > highestEpisode.season ||
            (season === highestEpisode.season &&
              episodeNumber > highestEpisode.episodeNumber)
          ) {
            highestEpisode = {
              season: season,
              episodeNumber: episodeNumber,
              episodeId: episodeId,
            };
          }
        }
        if (highestEpisode) {
          addseries(
            sortedSeries[serieId].title,
            sortedSeries[serieId].id,
            highestEpisode.season + "-" + highestEpisode.episodeNumber,
            ".series"
          );
        } else {
          addseries(
            sortedSeries[serieId].title,
            sortedSeries[serieId].id,
            null,
            ".series"
          );
        }
      }
    }
    if (watchlist.watchlist.movies) {
      // Create and append h1 for Movies
      if (Object.keys(watchlist.watchlist.movies).length) {
        const moviesHeader = document.createElement("h1");
        moviesHeader.textContent = "Movies:";
        document.getElementById("movies").appendChild(moviesHeader);
      }

      let movies = watchlist.watchlist.movies;
      const sortedMovies = Object.entries(movies)
        .sort(([, a], [, b]) => new Date(b.date) - new Date(a.date))
        .map(([key, value]) => ({ id: key, ...value }));
      for (let movieId in sortedMovies) {
        addseries(
          sortedMovies[movieId].title,
          sortedMovies[movieId].id,
          null,
          ".movies"
        );
      }
    }
  }
}

function addseries(title, serieId, episode, documentelement) {
  const articleElement = document.createElement("article");
  articleElement.id = serieId;

  // Create the link element
  const linkElement = document.createElement("a");
  linkElement.href = "/details.html?id=" + serieId;

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
    buttonElement.textContent = "Remove";
    buttonElement.setAttribute("data-action", "remove");
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
