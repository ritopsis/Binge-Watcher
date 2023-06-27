import { checkifloggedin, getwatchlist } from "./requestFunctions.js";
import { createNavButton, add, remove } from "./createElements.js";

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
          const searchuser_data = JSON.parse(xhr.responseText);
          if (!searchuser_data.private) {
            const biography = document.getElementById("biography");
            if (searchuser_data["biography"]) {
              //If the User wrote a biography
              biography.textContent =
                "About me: " + searchuser_data["biography"];
            }
            const user = document.getElementById("user");
            const searchuser_watchlist = searchuser_data["watchlist"];
            user.textContent = usernameofsearch + "'s Watchlist";
            getwatchlist(function (error, response) {
              if (response) {
                const data = JSON.parse(response);
                const user_watchlist = data["watchlist"];
                console.log(user_watchlist);
                content(user_watchlist, searchuser_watchlist);
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

document.getElementById("search-button").addEventListener("click", function () {
  const searchinput = document
    .getElementById("searchuser-input")
    .value.toLowerCase();
  if (searchinput != username && searchinput != "") {
    location.href = "/userprofile.html?username=" + searchinput;
  }
});

function content(user_watchlist, searchuser_watchlist) {
  if (searchuser_watchlist) {
    if (
      searchuser_watchlist.tvseries &&
      Object.keys(searchuser_watchlist.tvseries).length > 0
    ) {
      // create and append h1 for "Series"
      const seriesHeader = document.createElement("h1");
      seriesHeader.textContent = "Series:";
      document.getElementById("series").appendChild(seriesHeader);

      const series = searchuser_watchlist.tvseries;
      for (let serieId in series) {
        addmedia(series[serieId].title, serieId, user_watchlist, ".series");
      }
    }
    if (
      searchuser_watchlist.movies &&
      Object.keys(searchuser_watchlist.movies).length > 0
    ) {
      // create and append h1 for "Movies"
      const moviesHeader = document.createElement("h1");
      moviesHeader.textContent = "Movies:";
      document.getElementById("movies").appendChild(moviesHeader);

      let movies = searchuser_watchlist.movies;
      for (let movieId in movies) {
        addmedia(movies[movieId].title, movieId, user_watchlist, ".movies");
      }
    }
  }
}

function addmedia(title, mediaId, user_watchlist, documentelement) {
  // check type movie or series
  const type = documentelement == ".movies" ? "movies" : "tvseries";

  // create an article element
  const articleElement = document.createElement("article");
  articleElement.id = mediaId;
  articleElement.setAttribute("data-type", type);
  articleElement.setAttribute("data-name", title);

  // create link element that leads to media_details.html with the mediaId
  const linkElement = document.createElement("a");
  linkElement.href = "/media_details.html?id=" + mediaId;

  // create h1 element for the media title
  const headingElement = document.createElement("h1");
  headingElement.textContent = title;

  linkElement.appendChild(headingElement); // make the title clickable
  articleElement.appendChild(linkElement);

  // check if the user is logged in to show the Add/Remove button
  if (user_watchlist) {
    // create button element for adding and removing media from the watchlist
    const buttonElement = document.createElement("button");
    // check if the mediaId is in the user's watchlist
    if (user_watchlist[type]?.hasOwnProperty(mediaId)) {
      buttonElement.textContent = "Remove";
      buttonElement.setAttribute("data-action", "remove");
    } else {
      buttonElement.textContent = "Add";
      buttonElement.setAttribute("data-action", "add");
    }
    // add event listener for the button
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
  // add the article element to the specified document element
  document.querySelector(documentelement).appendChild(articleElement);
}
