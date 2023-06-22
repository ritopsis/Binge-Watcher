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
      const urlParams = new URLSearchParams(window.location.search);
      const usernameofsearch = urlParams.get("username");
      username = response;
      if (username == usernameofsearch && usernameofsearch) {
        window.location.href = "myprofile.html";
      }
      let nav = document.querySelector("nav");
      createNavButton("My Profile", "myprofile.html", nav);
      createNavButton("Logout", "logout", nav);
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        if (xhr.status === 200) {
          watchlist = JSON.parse(xhr.responseText);
          const biography = document.getElementById("biography");
          if (watchlist["biography"]) {
            //If the User wrote a biography
            biography.textContent = "About me: " + watchlist["biography"];
          }
          const user = document.getElementById("user");
          user.textContent = usernameofsearch + "'s Watchlist";
          loggin = true;
          content();
        } else if (xhr.status === 404) {
          const mainElement = document.querySelector("main");
          const elementsToDelete = Array.from(mainElement.children).filter(
            (child) => {
              return !child.classList.contains("searchuser");
            }
          );

          // Remove each element
          elementsToDelete.forEach((element) => {
            mainElement.removeChild(element);
          });
          let linkElement = document.createElement("h1");
          linkElement.textContent = "NOT FOUND!";
          mainElement.appendChild(linkElement);
        } else {
        }
      };
      xhr.open("GET", "watchlist/" + usernameofsearch, true);
      xhr.send();
    }
  });
};

const searchButton = document.getElementById("search-button");
const searchuserinput = document.getElementById("searchuser-input");

searchButton.addEventListener("click", function () {
  const suserinput = searchuserinput.value;
  if (suserinput != username && suserinput != "") {
    location.href = "/usersite.html?username=" + suserinput;
  } else {
  }
});

function content() {
  console.log(watchlist.watchlist.tvseries);
  console.log(watchlist.watchlist.movies);
  if (watchlist && loggin) {
    if (watchlist.watchlist.tvseries) {
      let tvseries = watchlist.watchlist.tvseries;
      console.log(tvseries);
      for (let serieId in tvseries) {
        console.log(tvseries[serieId].title);
        addarticle(tvseries[serieId].title, serieId, ".series");
      }
    }
    if (watchlist.watchlist.movies) {
      let movies = watchlist.watchlist.movies;
      for (let movieId in movies) {
        console.log(movies[movieId].title);
        addarticle(movies[movieId].title, movieId, ".movies");
      }
    }
  }
}

function addarticle(title, contendid, documentelement) {
  const articleElement = document.createElement("article");
  articleElement.id = contendid;

  // Create the link element
  const linkElement = document.createElement("a");
  linkElement.href = "/details.html?id=" + contendid;

  // Create the heading element
  const headingElement = document.createElement("h1");
  headingElement.textContent = title;

  // Append the image and heading elements to the link element
  linkElement.appendChild(headingElement);

  // Append the link element to the article element
  articleElement.appendChild(linkElement);

  // Add the article element to the document
  const topMoviesElement = document.querySelector(documentelement);
  topMoviesElement.appendChild(articleElement);
}
