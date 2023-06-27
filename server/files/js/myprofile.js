import { checkifloggedin, getwatchlist } from "./requestFunctions.js";
import { createNavButton, add, remove } from "./createElements.js";
let watchlist = null;
let username = null;
window.onload = function () {
  checkifloggedin(function (error, response) {
    if (error) {
      window.location.href = "index.html";
    }
    if (response) {
      username = response;
      getwatchlist(function (error, response) {
        if (response) {
          const data = JSON.parse(response);
          const user_watchlist = data["watchlist"];
          watchlist = user_watchlist;
          document.getElementById("set-privacy-button").textContent =
            user_watchlist.private ? "Set public" : "Set private";
          document.getElementById("biography-input").textContent =
            data["biography"];
          content(user_watchlist);
          const nav = document.getElementById("nav_btn");
          createNavButton("Profile", "myprofile.html", nav);
          createNavButton("Logout", "logout", nav);
        } else {
        }
      });
    }
  });
};

document
  .getElementById("recommend-movies")
  .addEventListener("click", function (event) {
    event.preventDefault();
    this.disable = true;
    recommend("movies", this);
  });

document
  .getElementById("recommend-tvseries")
  .addEventListener("click", function (event) {
    event.preventDefault();
    this.disable = true;
    recommend("tvseries", this);
  });

document
  .getElementById("set-privacy-button")
  .addEventListener("click", function () {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (xhr.status === 200) {
        document.getElementById("set-privacy-button").textContent = setting
          ? "Set public"
          : "Set private";
      } else {
      }
    };
    let setting = this.textContent == "Set public" ? false : true;
    const data = {
      settings: setting,
    };
    xhr.open("PATCH", "/privacy", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));
  });

const saveButton = document.getElementById("save-biography-button");
const biographyInput = document.getElementById("biography-input");

saveButton.addEventListener("click", function () {
  const newBiography = biographyInput.value;
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status === 200) {
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

document.getElementById("search-button").addEventListener("click", function () {
  const suserinput = document
    .getElementById("searchuser-input")
    .value.toLowerCase();
  if (suserinput != username && suserinput) {
    location.href = "/userprofile.html?username=" + suserinput;
  }
});

function content(user_watchlist) {
  const userElement = document.getElementById("user");
  userElement.textContent = "Your Watchlist: " + username;
  if (user_watchlist) {
    if (user_watchlist.tvseries) {
      if (Object.keys(user_watchlist.tvseries).length > 0) {
        // Create and append h1 for Series
        const seriesHeader = document.createElement("h1");
        seriesHeader.textContent = "Series:";
        document.getElementById("series").appendChild(seriesHeader);
      }

      let tvseries = user_watchlist.tvseries;

      const sortedSeries = Object.entries(tvseries)
        .sort(([, a], [, b]) => new Date(b.date) - new Date(a.date))
        .map(([key, value]) => ({ id: key, ...value }));

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
          addmedia(
            sortedSeries[serieId].title,
            sortedSeries[serieId].id,
            highestEpisode.season + "-" + highestEpisode.episodeNumber,
            ".series",
            user_watchlist
          );
        } else {
          addmedia(
            sortedSeries[serieId].title,
            sortedSeries[serieId].id,
            null,
            ".series",
            user_watchlist
          );
        }
      }
    }
    if (user_watchlist.movies) {
      // Create and append h1 for Movies
      if (Object.keys(user_watchlist.movies).length) {
        const moviesHeader = document.createElement("h1");
        moviesHeader.textContent = "Movies:";
        document.getElementById("movies").appendChild(moviesHeader);
      }

      const movies = user_watchlist.movies;
      const sortedMovies = Object.entries(movies)
        .sort(([, a], [, b]) => new Date(b.date) - new Date(a.date))
        .map(([key, value]) => ({ id: key, ...value }));
      for (let movieId in sortedMovies) {
        addmedia(
          sortedMovies[movieId].title,
          sortedMovies[movieId].id,
          null,
          ".movies",
          user_watchlist
        );
      }
    }
  }
}

function addmedia(title, serieId, episode, documentelement) {
  const type = documentelement == ".movies" ? "movies" : "tvseries";
  const articleElement = document.createElement("article");
  articleElement.id = serieId;
  articleElement.setAttribute("data-type", type);
  articleElement.setAttribute("data-name", title);
  // Create the link element
  const linkElement = document.createElement("a");
  linkElement.href = "/media_details.html?id=" + serieId;

  // Create the heading element
  const headingElement = document.createElement("h1");
  headingElement.textContent = title;

  // Append the image and heading elements to the link element
  linkElement.appendChild(headingElement);

  if (type == "tvseries") {
    const headingElement2 = document.createElement("h3");
    headingElement2.textContent = episode
      ? "Last watched: " + episode
      : "Not started";
    linkElement.appendChild(headingElement2);
  }
  // Append the link element to the article element
  articleElement.appendChild(linkElement);

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

  // Add the article element to the document
  const topMoviesElement = document.querySelector(documentelement);
  topMoviesElement.appendChild(articleElement);
}

function recommend(type, buttenElement) {
  const aitextboxeElement = document.getElementById("ai-output");
  if (watchlist) {
    let content = "";
    if (type == "tvseries") {
      if (watchlist.tvseries) {
        let tvseries = watchlist.tvseries;
        for (let serieId in tvseries) {
          content += tvseries[serieId].title + " , ";
        }
      }
    } else {
      if (watchlist.movies) {
        let movies = watchlist.movies;
        for (let movieId in movies) {
          content += movies[movieId].title + " , ";
        }
      }
    }

    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (xhr.status === 200) {
        buttenElement.disable = false;
        const result = JSON.parse(xhr.responseText);
        aitextboxeElement.textContent = result.choices[0].message.content;
      } else {
        console.error(xhr.status);
      }
    };
    const data = {
      type: type,
      mediaNames: content,
    };
    xhr.open("POST", "recommends", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    aitextboxeElement.textContent = "Loading...";
    xhr.send(JSON.stringify(data));
  }
}
