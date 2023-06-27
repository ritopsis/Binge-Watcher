import { checkifloggedin, getwatchlist } from "./requestFunctions.js";
import { createNavButton, addarticle } from "./createElements.js";

window.onload = function () {
  // code to be executed after the page has fully loaded
  // able to access elements and resources of the page here
  const nav = document.getElementById("nav_btn");
  checkifloggedin(function (error, response) {
    if (error) {
      // user is not logged in
      content();
      createNavButton("Login", "register_login.html", nav);
    }
    if (response) {
      getwatchlist(function (error, response) {
        if (error) {
          console.error("Failed to retrieve watchlist:", error);
        }
        if (response) {
          const data = JSON.parse(response);
          const user_watchlist = data["watchlist"];
          content(user_watchlist);
          createNavButton("Profile", "myprofile.html", nav);
          createNavButton("Logout", "logout", nav);
        } else {
        }
      });
    }
  });
};

function content(user_watchlist) {
  let totalMedia = 5;
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status === 200) {
      const result = JSON.parse(xhr.responseText);
      result.forEach((element) => {
        addarticle(element, ".topmovies", "movies", user_watchlist);
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
        addarticle(element, ".topseries", "tvseries", user_watchlist);
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
