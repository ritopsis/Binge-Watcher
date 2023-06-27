import { checkifloggedin, getwatchlist } from "./requestFunctions.js";
import { createNavButton, add, remove } from "./createElements.js";

let watchlist = null;
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
          // true = serie -> get episodes
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
          // false = movie
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

  checkifloggedin(function (error, response) {
    if (error) {
      console.log("Error:", error);
      let nav = document.getElementById("nav_btn");
      createNavButton("Login", "register_login.html", nav);
      Promise.all([informationPromise])
        .then(([informationPromise]) => {
          addarticle(informationPromise);
          if (informationPromise.titleType.isSeries) {
            displaySeasonAndEpisode(null, content);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      let nav = document.getElementById("nav_btn");
      createNavButton("Profile", "myprofile.html", nav);
      createNavButton("Logout", "logout", nav);
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
          console.log("Both requests finished");
          watchlist = watchlistResult;
          addarticle(informationPromise);
          if (informationPromise.titleType.isSeries) {
            displaySeasonAndEpisode(watchlistResult.watchlist, content);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  });
};

function addarticle(content) {
  const articleElement = document.createElement("article");
  const title = content.titleText.text;

  let type = content.titleType.id.toLowerCase();
  type = type == "tvminiseries" || type == "tvseries" ? "tvseries" : "movies"; //Ternary Operator

  articleElement.id = content.id;
  articleElement.setAttribute("data-type", type);
  articleElement.setAttribute("data-name", title);

  const divWrapper = document.createElement("div");
  divWrapper.classList.add("main-article");

  // Create the image element
  const imageElement = document.createElement("img");
  imageElement.classList.add("articleimage");
  imageElement.src = content.primaryImage && content.primaryImage.url;
  imageElement.alt = "Movie Image";
  imageElement.loading = "lazy";

  // Add an onerror event to handle image loading failure
  imageElement.onerror = function () {
    imageElement.src = "./image/poster.png";
    imageElement.alt = "Alternative Image";
  };
  divWrapper.appendChild(imageElement);

  const divElement = document.createElement("div");

  // Create the title element
  const titleElement = document.createElement("h1");
  titleElement.id = "detailsTitle";
  titleElement.textContent = title;
  divElement.appendChild(titleElement);

  // create the release date element
  if (
    content.releaseDate &&
    content.releaseDate.month &&
    content.releaseDate.day &&
    content.releaseDate.year
  ) {
    const releaseDateElement = document.createElement("p");
    releaseDateElement.className = "release";
    releaseDateElement.textContent = `Release Date: ${content.releaseDate.month}/${content.releaseDate.day}/${content.releaseDate.year}`;
    divElement.appendChild(releaseDateElement);
  }

  // create the plot element
  if (content.plot) {
    const plotElement = document.createElement("p");
    plotElement.textContent = content.plot.plotText.plainText;
    divElement.appendChild(plotElement);
  }

  // create the movie details element
  const movieDetails = document.createElement("div");
  movieDetails.className = "movieDetails";
  divElement.appendChild(movieDetails);
  divWrapper.appendChild(divElement);

  // create the rating element
  const ratingDivElement = document.createElement("div");
  ratingDivElement.className = "rating";
  const ratingElement = document.createElement("p");
  console.log(content);
  ratingElement.textContent = content.ratingsSummary.aggregateRating
    ? content.ratingsSummary.aggregateRating
    : "0";
  ratingDivElement.appendChild(document.createTextNode("Rating:"));
  ratingDivElement.appendChild(ratingElement);
  divWrapper.appendChild(ratingDivElement);
  articleElement.appendChild(divWrapper);

  if (watchlist) {
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

  const seasonsContainer = document.createElement("div");
  seasonsContainer.id = "seasons-container";
  seasonsContainer.classList.add("seasons-container");
  seasonsContainer.scrollTop = seasonsContainer.scrollHeight;
  // Add the article element to the document
  const topMoviesElement = document.querySelector("main");
  articleElement.appendChild(seasonsContainer);
  topMoviesElement.appendChild(articleElement);
}

function displaySeasonAndEpisode(watchlist, data) {
  //get the main article
  const articleElement = document.querySelector("article");
  const id = articleElement.id;
  const title = articleElement.dataset.name;

  // create an object to store episodes by season
  const seasons = {};

  data.forEach((episode) => {
    const seasonNumber = episode.seasonNumber;
    const episodeNumber = episode.episodeNumber;
    episode["id"] = id;
    episode["title"] = title;

    if (!isNaN(seasonNumber) && !isNaN(episodeNumber)) {
      // check if the season exists in the seasons object, if not, create it
      if (!seasons.hasOwnProperty(seasonNumber)) {
        seasons[seasonNumber] = [];
      }

      // add the episode to the respective season
      seasons[seasonNumber].push(episode);
    }
  });

  // create the additional container
  const additionalContainer = document.createElement("div");
  additionalContainer.className = "additional-container";

  // iterate over the seasons and create the season tabs and episodes
  for (const seasonNumber in seasons) {
    const seasonElement = document.createElement("div");
    seasonElement.className = "season";

    // create a button for the season
    const seasonButton = document.createElement("button");
    seasonButton.textContent = `Season ${seasonNumber}`;
    seasonButton.setAttribute("data-bs-toggle", "collapse");
    seasonButton.setAttribute(
      "data-bs-target",
      `#season-${seasonNumber}-episodes`
    );
    seasonElement.appendChild(seasonButton);

    const episodesContainer = document.createElement("div");
    episodesContainer.className = "episodes-container collapse";
    episodesContainer.id = `season-${seasonNumber}-episodes`;

    // create episode elements for the current season
    seasons[seasonNumber].forEach((episode) => {
      const episodeElement = document.createElement("div");
      episodeElement.className = "episodes";
      const episodeH1 = document.createElement("h1");
      episodeH1.textContent = `Episode ${episode.episodeNumber}`;
      episodeElement.appendChild(episodeH1);

      if (watchlist) {
        const buttonElement = document.createElement("button");
        buttonElement.className = "watchedButton";
        episodeElement.appendChild(buttonElement);
        if (watchlist.tvseries[id]?.episode.hasOwnProperty(episode.tconst)) {
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
      }

      episodesContainer.appendChild(episodeElement);
    });

    seasonElement.appendChild(episodesContainer);
    additionalContainer.appendChild(seasonElement);
  }

  // append the additional container to the seasons-container
  document.getElementById("seasons-container").appendChild(additionalContainer);
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
