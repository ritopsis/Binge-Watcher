import {
  checkifloggedin,
  getwatchlist,
  addWatchlist,
  removeWatchlist,
} from "./user.js";

let watchlist = null;
let loggin = null;

window.onload = function () {
  const menuItems = document.getElementById("menuItems");
  checkifloggedin(function (error, response) {
    if (error) {
      content();
      loggin = false;
      const loginLink = document.createElement("li");
      const loginLinkAnchor = document.createElement("a");
      loginLinkAnchor.href = "register_login.html";
      loginLinkAnchor.textContent = "Login";
      loginLink.appendChild(loginLinkAnchor);
      menuItems.appendChild(loginLink);
    }
    if (response) {
      getwatchlist(function (error, response) {
        if (response) {
          watchlist = JSON.parse(response);
          loggin = true;
          content();
          const myProfileLink = document.createElement("li");
          const myProfileAnchor = document.createElement("a");
          myProfileAnchor.href = "myprofile.html";
          myProfileAnchor.textContent = "My Profile";
          myProfileLink.appendChild(myProfileAnchor);

          const logoutLink = document.createElement("li");
          const logutLinkAnchor = document.createElement("a");
          logutLinkAnchor.href = "logout";
          logutLinkAnchor.textContent = "Logout";
          logoutLink.appendChild(logutLinkAnchor);
          menuItems.appendChild(myProfileLink);
          menuItems.appendChild(logoutLink);
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
        addarticle(element, ".topmovies", "movies");
      });
    } else {
      document
        .querySelector("body")
        .append(
          `Daten konnten nicht geladen werden, Status ${xhr.status} - ${xhr.statusText}`
        );
    }
  };
  xhr.open("GET", "movie", true);
  xhr.send();

  const xhrShows = new XMLHttpRequest();
  xhrShows.onload = function () {
    if (xhrShows.status === 200) {
      const showsResult = JSON.parse(xhrShows.responseText);
      showsResult.forEach((element) => {
        addarticle(element, ".topseries", "tvseries");
      });
    } else {
      document
        .querySelector("body")
        .append(
          `Show Daten konnten nicht geladen werden, Status ${xhrShows.status} - ${xhrShows.statusText}`
        );
    }
  };
  xhrShows.open("GET", "series", true);
  xhrShows.send();
}

function addarticle(movie, documentelement, type) {
  const articleElement = document.createElement("article");
  articleElement.id = movie.id;
  articleElement.setAttribute("type", type);

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
