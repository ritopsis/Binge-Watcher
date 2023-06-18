import {
  checkifloggedin,
  getwatchlist,
  addWatchlist,
  removeWatchlist,
} from "./user.js";
import { createNavButton } from "./createElements.js";
let watchlist = null;
let loggin = null;

window.onload = function () {
  const menuItems = document.getElementById("menuItems");
  checkifloggedin(function (error, response) {
    if (error) {
      loggin = false;
      let nav = document.querySelector("nav");
      createNavButton("Login", "register_login.html", nav);
      const url = new URL(location.href);
      const params = new URLSearchParams(url.search);
      if (params.has("page") && params.has("title")) {
        handleSearchRequest(params.get("title"), params.get("page"));
      }
    }
    if (response) {
      let nav = document.querySelector("nav");
      createNavButton("My Profile", "myprofile.html", nav);
      createNavButton("Logout", "logout", nav);
      loggin = true;
      getwatchlist(function (error, response) {
        if (response) {
          watchlist = JSON.parse(response);
        }
        const url = new URL(location.href);
        const params = new URLSearchParams(url.search);
        if (params.has("page") && params.has("title")) {
          handleSearchRequest(params.get("title"), params.get("page"));
        }
      });
    }
  });
};

document.getElementById("search").addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent form submission
  //set params in the query
  const url = new URL(location.href);
  const params = new URLSearchParams(url.search);
  params.set("page", "1");
  params.set("title", document.getElementById("searchinput").value);
  url.search = params.toString();
  location.href = url;
});

function handleSearchRequest(title, page) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status === 200) {
      const sresult = JSON.parse(xhr.responseText);
      const result = sresult.results;
      const mainElement = document.querySelector("main");

      while (mainElement.firstChild) {
        mainElement.removeChild(mainElement.firstChild);
      }
      result.forEach((element) => {
        addarticle(element, type);
      });
      if (sresult.next) {
        if (Number(sresult.page) - 1 != 0) {
          createButton(Number(sresult.page) - 1);
        }
        createButton(Number(sresult.page) + 1);
      } else {
        if (Number(sresult.page) - 1 != 1) {
          createButton(Number(sresult.page) - 1);
          createButton(1);
        } else {
          createButton(1);
        }
      }
    } else {
    }
  };
  let type = null;
  if (location.pathname == "/movies.html") {
    type = "movie";
  } else if (location.pathname == "/series.html") {
    type = "tvSeries";
  }
  const url = new URL("/titles/" + title, location.href);
  url.searchParams.set("type", type);
  url.searchParams.set("site", page);
  xhr.open("GET", url, true);
  xhr.send();
}

function addarticle(movie, type) {
  if (type == "movie") {
    type = "movies";
  } else {
    type = "tvseries";
  }
  const articleElement = document.createElement("article");
  articleElement.id = movie.id;
  articleElement.setAttribute("type", type);
  // Create the link element
  const linkElement = document.createElement("a");
  linkElement.href = "/details.html?id=" + movie.id;

  // Create the heading element
  const headingElement = document.createElement("h1");
  headingElement.textContent = movie.titleText.text;

  // Append the image and heading elements to the link element
  linkElement.appendChild(headingElement);

  // Append the link element to the article element
  articleElement.appendChild(linkElement);

  if (loggin && watchlist) {
    const buttonElement = document.createElement("button");
    if (watchlist["watchlist"][type].hasOwnProperty(movie.id)) {
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
  const topMoviesElement = document.querySelector("main");
  topMoviesElement.appendChild(articleElement);
}
function createButton(text) {
  // Create a button element
  var button = document.createElement("button");
  button.textContent = "Seite: " + text;

  // Add a click event listener to the button
  button.addEventListener("click", function () {
    const url = new URL(location.href);
    const params = new URLSearchParams(url.search);
    params.set("page", Number(text));
    url.search = params.toString();
    location.href = url;
  });

  // Get the main element
  var mainElement = document.querySelector("main");

  // Append the button to the main element
  mainElement.appendChild(button);
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
