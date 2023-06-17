import { checkifloggedin } from "./user.js";
import { getwatchlist } from "./user.js";

window.onload = function () {
  const menuItems = document.getElementById("menuItems");
  checkifloggedin(function (error, response) {
    if (error) {
      console.log("Error:", error);
      menuItems.innerHTML += `<li><a href="register_login.html">Login</a></li>`;
    } else {
      console.log("Response:", response);
      menuItems.innerHTML += `<li><a href="myprofile.html">My Profile</a></li><li><a href="logout">Logout</a></li>`;
    }
  });
  const watchlistPromise = new Promise((resolve, reject) => {
    getwatchlist(function (error, response) {
      if (error) {
        console.log("Error:", error);
        reject(error);
      } else {
        console.log("Response:", response);
        resolve(JSON.parse(response));
      }
    });
  });

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const informationPromise = new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (xhr.status === 200) {
        const result = JSON.parse(xhr.responseText);
        if (result.titleType.isSeries) {
          displayDetails(result);
          // true = Serie, false = keine Serie sondern Film
          // Episoden abrufen
          const xhrEpisode = new XMLHttpRequest();
          xhrEpisode.onload = function () {
            if (xhrEpisode.status === 200) {
              const result2 = JSON.parse(xhrEpisode.responseText);
              console.log(result2);
              resolve(result2);
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
          displayDetails(result);
        }
      } else {
        console.log(xhr.status);
        reject(xhr.status);
      }
    };
    xhr.open("GET", `/details/${id}`, true);
    xhr.send();
  });

  Promise.all([watchlistPromise, informationPromise])
    .then(([watchlistResult, informationPromise]) => {
      console.log(watchlistResult);
      console.log(informationPromise);
      displaySeasonAndEpisode(watchlistResult.watchlist, informationPromise);
      // Perform your desired action here
      console.log("Both requests finished");
    })
    .catch((error) => {
      console.log(error);
    });
};

function displayDetails(content) {
  const mainElement = document.querySelector("main");
  mainElement.id = content.id;

  // Create elements for movie details
  const titleElement = document.createElement("h2");
  titleElement.textContent = content.titleText.text;

  const imageElement = document.createElement("img");
  imageElement.src = content.primaryImage.url;
  imageElement.alt = content.titleText.text;
  imageElement.width = 200;
  imageElement.height = 300;

  const plotElement = document.createElement("p");
  plotElement.textContent = content.plot.plotText.plainText;

  const ratingElement = document.createElement("p");
  ratingElement.textContent = `Rating: ${content.ratingsSummary.aggregateRating}`;

  const releaseDateElement = document.createElement("p");
  releaseDateElement.textContent = `Release Date: ${content.releaseDate.month}/${content.releaseDate.day}/${content.releaseDate.year}`;

  // Append movie details to the <main> element
  mainElement.appendChild(titleElement);
  mainElement.appendChild(imageElement);
  mainElement.appendChild(plotElement);
  mainElement.appendChild(ratingElement);
  mainElement.appendChild(releaseDateElement);
}
function displaySeasonAndEpisode(watchlist, data) {
  const mainElement = document.querySelector("main");
  const id = mainElement.id;

  data.forEach((episode) => {
    const seasonNumber = episode.seasonNumber;
    const episodeNumber = episode.episodeNumber;
    const episodeid = episode.tconst;

    if (!isNaN(seasonNumber) && !isNaN(episodeNumber)) {
      const episodeElement = document.createElement("div");
      episodeElement.textContent = `Season ${seasonNumber}, Episode ${episodeNumber}`;

      const buttonElement = document.createElement("button");
      episodeElement.appendChild(buttonElement);

      if (watchlist.tvseries[id].episode.hasOwnProperty(episodeid)) {
        console.log("geht");
        buttonElement.textContent = "Unwatched";
        buttonElement.addEventListener("click", removeEpWatchlist);
      } else {
        buttonElement.textContent = "Watched";
        buttonElement.addEventListener("click", addEpWatchlist);
      }

      episode["id"] = mainElement.id;

      function removeEpWatchlist() {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          if (xhr.status === 200) {
            buttonElement.textContent = "Watched";
            buttonElement.removeEventListener("click", removeEpWatchlist);
            buttonElement.addEventListener("click", addEpWatchlist);
          } else {
            console.log(xhr.status);
          }
        };

        xhr.open("DELETE", "removeepwatchlist", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(episode));
      }

      function addEpWatchlist() {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          if (xhr.status === 200) {
            buttonElement.textContent = "Unwatched";
            buttonElement.removeEventListener("click", addEpWatchlist);
            buttonElement.addEventListener("click", removeEpWatchlist);
          } else {
            console.log(xhr.status);
          }
        };

        xhr.open("POST", "addepwatchlist", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(episode));
      }
      mainElement.appendChild(episodeElement);
    }
  });
}
