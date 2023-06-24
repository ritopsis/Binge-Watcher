import { checkifloggedin, getwatchlist } from "./user.js";

import { createNavButton, addarticle } from "./createElements.js";

let watchlist = null;
let loggin = null;
let totalMedia = 5;

window.onload = function () {
  const nav = document.getElementById("nav_btn");
  checkifloggedin(function (error, response) {
    if (error) {
      content();
      loggin = false;
      createNavButton("Login", "register_login.html", nav);
    }
    if (response) {
      getwatchlist(null, function (error, response) {
        if (response) {
          watchlist = JSON.parse(response);
          loggin = true;
          content();
          createNavButton("My Profile", "myprofile.html", nav);
          createNavButton("Logout", "logout", nav);
        } else {
        }
      });
    }
  });
};

function content() {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status === 200) {
      const result = JSON.parse(xhr.responseText);
      result.forEach((element) => {
        addarticle(element, ".topmovies", "movies", loggin, watchlist);
      });
    } else {
      document
        .querySelector("body")
        .append(
          `Daten konnten nicht geladen werden, Status ${xhr.status} - ${xhr.statusText}`
        );
    }
  };
  xhr.open("GET", `/pop_media?limit=${totalMedia}&list=top_rated_250`, true);
  xhr.send();

  const xhrShows = new XMLHttpRequest();
  xhrShows.onload = function () {
    if (xhrShows.status === 200) {
      const showsResult = JSON.parse(xhrShows.responseText);
      showsResult.forEach((element) => {
        addarticle(element, ".topseries", "tvseries", loggin, watchlist);
      });
    } else {
      document
        .querySelector("body")
        .append(
          `Show Daten konnten nicht geladen werden, Status ${xhrShows.status} - ${xhrShows.statusText}`
        );
    }
  };
  xhrShows.open(
    "GET",
    `/pop_media?limit=${totalMedia}&list=top_rated_series_250`,
    true
  );
  xhrShows.send();
}
