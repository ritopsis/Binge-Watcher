import {
  checkifloggedin,
  getwatchlist,
  addWatchlist,
  removeWatchlist,
} from "./user.js";
import { createNavButton } from "./createElements.js";

let watchlist = null;
let loggin = null;
let content = null;

window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const informationPromise = new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (xhr.status === 200) {
        const result = JSON.parse(xhr.responseText);
        if (result.titleType.isSeries) {
          // true = Serie, false = keine Serie sondern Film
          // Episoden abrufen
          const xhrEpisode = new XMLHttpRequest();
          xhrEpisode.onload = function () {
            if (xhrEpisode.status === 200) {
              const result2 = JSON.parse(xhrEpisode.responseText);
              content = result2;
              resolve(result);
            } else {
              console.log(xhrEpisode.status);
              reject(xhrEpisode.status);
            }
          };
          xhrEpisode.open("GET", `/episodes/${id}`, true);
          xhrEpisode.send();
        } else {
          // ist ein Film
          console.log(result);
          resolve(result);
        }
      } else {
        console.log(xhr.status);
        reject(xhr.status);
      }
    };
    xhr.open("GET", `/details/${id}`, true);
    xhr.send();
  });

  const menuItems = document.getElementById("menuItems");
  checkifloggedin(function (error, response) {
    if (error) {
      console.log("Error:", error);
      menuItems.innerHTML += `<li><a href="register_login.html">Login</a></li>`;
      Promise.all([informationPromise])
        .then(([informationPromise]) => {
          addarticle(informationPromise);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      loggin = true;
      menuItems.innerHTML += `<li><a href="myprofile.html">My Profile</a></li><li><a href="logout">Logout</a></li>`;

      const watchlistPromise = new Promise((resolve, reject) => {
        getwatchlist(function (error, response) {
          if (error) {
            console.log("Error:", error);
            reject(error);
          } else {
            resolve(JSON.parse(response));
          }
        });
      });

      Promise.all([watchlistPromise, informationPromise])
        .then(([watchlistResult, informationPromise]) => {
          watchlist = watchlistResult;
          addarticle(informationPromise);
          console.log(content);
          displaySeasonAndEpisode(watchlistResult.watchlist, content);
          // Perform your desired action here
          console.log("Both requests finished");
        })
        .catch((error) => {
          console.log(error);
        });
    }
  });
};

function addarticle(movie) {
  const articleElement = document.createElement("article");
  articleElement.id = movie.id;
  articleElement.setAttribute("data-type", movie.titleType.id.toLowerCase());
  articleElement.setAttribute("data-name", movie.titleText.text);
  // Create the link element
  const linkElement = document.createElement("a");
  linkElement.href = "/details.html?id=" + movie.id;

  // Create the image element
  const imageElement = document.createElement("img");
  imageElement.classList.add("articleimage");
  if (movie.primaryImage && movie.primaryImage.url) {
    imageElement.src = movie.primaryImage.url;
    imageElement.alt = "Movie Image";
  } else {
    imageElement.src =
      "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/fb3ef66312333.5691dd2253378.jpg";
    imageElement.loading = "lazy";
    imageElement.alt = "Alternative Image";
  }

  // Create the heading element
  const headingElement = document.createElement("h1");
  headingElement.textContent = movie.titleText.text;

  // Append the image and heading elements to the link element
  linkElement.appendChild(imageElement);
  linkElement.appendChild(headingElement);

  // Append the link element to the article element
  articleElement.appendChild(linkElement);

  if (loggin && watchlist) {
    const buttonElement = document.createElement("button");
    if (watchlist["watchlist"][movie.titleType.id]?.hasOwnProperty(movie.id)) {
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

  const plotElement = document.createElement("p");
  plotElement.textContent = movie.plot.plotText.plainText;

  const ratingElement = document.createElement("p");
  ratingElement.textContent = `Rating: ${movie.ratingsSummary.aggregateRating}`;

  const releaseDateElement = document.createElement("p");
  releaseDateElement.textContent = `Release Date: ${movie.releaseDate.month}/${movie.releaseDate.day}/${movie.releaseDate.year}`;

  articleElement.appendChild(plotElement);
  articleElement.appendChild(ratingElement);
  articleElement.appendChild(releaseDateElement);

  // Add the article element to the document
  const topMoviesElement = document.querySelector("main");
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
function displaySeasonAndEpisode(watchlist, data) {
  const articleElement = document.querySelector("article");
  console.log(articleElement);
  const id = articleElement.id;
  const title = articleElement.dataset.name;

  data.forEach((episode) => {
    const seasonNumber = episode.seasonNumber;
    const episodeNumber = episode.episodeNumber;
    const episodeid = episode.tconst;
    episode["id"] = id;
    episode["title"] = title;

    if (!isNaN(seasonNumber) && !isNaN(episodeNumber)) {
      const episodeElement = document.createElement("div");
      episodeElement.textContent = `Season ${seasonNumber}, Episode ${episodeNumber}`;

      const buttonElement = document.createElement("button");
      episodeElement.appendChild(buttonElement);
      if (watchlist.tvseries[id]?.episode.hasOwnProperty(episodeid)) {
        buttonElement.textContent = "Unwatched";
        buttonElement.setAttribute("data-action", "remove");
      } else {
        buttonElement.textContent = "Watched";
        buttonElement.setAttribute("data-action", "add");
      }

      buttonElement.addEventListener("click", function () {
        const action = buttonElement.getAttribute("data-action");
        if (action === "add") {
          addEpWatchlist(episode, buttonElement);
        } else {
          removeEpWatchlist(episode, buttonElement);
        }
      });

      articleElement.appendChild(episodeElement);
    }
  });
}

function removeEpWatchlist(episode, buttonElement) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status === 200) {
      buttonElement.textContent = "Watched";
      buttonElement.setAttribute("data-action", "add");
    } else {
      console.log(xhr.status);
    }
  };

  xhr.open("DELETE", "removeepwatchlist", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(episode));
}

function addEpWatchlist(episode, buttonElement) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status === 200) {
      buttonElement.textContent = "Unwatched";
      buttonElement.setAttribute("data-action", "remove");
    } else {
      console.log(xhr.status);
    }
  };

  xhr.open("POST", "addepwatchlist", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(episode));
}
