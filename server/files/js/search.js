import { checkifloggedin, getwatchlist } from "./requestFunctions.js";
import { createNavButton, add, remove } from "./createElements.js";

window.onload = function () {
  let loggin = null;
  let watchlist = null;

  checkifloggedin(function (error, response) {
    if (error) {
      loggin = false;
      let nav = document.getElementById("nav_btn");
      createNavButton("Login", "register_login.html", nav);
      const url = new URL(location.href);
      const params = new URLSearchParams(url.search);
      if (params.has("page") && params.has("title")) {
        handleSearchRequest(
          params.get("title"),
          params.get("page"),
          loggin,
          watchlist
        );
      }
    }
    if (response) {
      let nav = document.getElementById("nav_btn");
      createNavButton("Profile", "myprofile.html", nav);
      createNavButton("Logout", "logout", nav);
      loggin = true;
      getwatchlist(function (error, response) {
        if (response) {
          watchlist = JSON.parse(response);
        }
        const url = new URL(location.href);
        const params = new URLSearchParams(url.search);
        if (params.has("page") && params.has("title")) {
          handleSearchRequest(
            params.get("title"),
            params.get("page"),
            loggin,
            watchlist
          );
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

function handleSearchRequest(title, page, loggin, watchlist) {
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
        addarticle(element, type, loggin, watchlist);
      });

      if (sresult.entries != 0) {
        // entries are the amout of media that came back from the request
        if (Number(sresult.page) - 1 != 0) {
          // user is not at the first page
          createPagination("Back  ", Number(sresult.page) - 1, false); // creates "Previous"-Button with text: "Previous"
          createPagination(null, Number(sresult.page) - 1, false); // creates "Previous"-Button with text: previous Pagenumber
        }
        createPagination(null, Number(sresult.page), true); // current page

        if (sresult.next) {
          //there is a next page
          createPagination(null, Number(sresult.page) + 1, false); // next page with text: Pagenumber
          createPagination("Next  ", Number(sresult.page) + 1, false); // next page with text: "Next"
        } else if (Number(sresult.page) - 1 != 0) {
          // check again if we are not at the first page
          createPagination("First", 1); // with "First" go back to the first page
        }
      }
    } else {
    }
  };
  let type =
    location.pathname == "/movie_search.html"
      ? "movie"
      : location.pathname == "/serie_search.html"
      ? "tvSeries"
      : "";

  const url = new URL("/titles/" + title, location.href);
  url.searchParams.set("type", type);
  url.searchParams.set("site", page);
  xhr.open("GET", url, true);
  xhr.send();
}

function createPagination(text, sitenumber, highlight) {
  // create the list item element
  var listItem = document.createElement("li");
  // highlight true means the user is on that sitenumber currently
  listItem.className = highlight ? "page-item active" : "page-item";

  // create button element
  var button = document.createElement("button");
  button.className = "page-link";
  button.type = "button";

  // Append the button element to the list item element
  listItem.appendChild(button);

  //if there is text than use text else use the sitenumber as the button text
  button.textContent = text ? text : sitenumber;

  // Add a click event listener to the button
  button.addEventListener("click", function () {
    const url = new URL(location.href);
    const params = new URLSearchParams(url.search);
    params.set("page", Number(sitenumber));
    url.search = params.toString();
    location.href = url;
  });

  // Find the parent container
  var parentContainer = document.querySelector(".pagination");

  // Append the list item element to the parent container
  parentContainer.appendChild(listItem);
}

function addarticle(media, type, loggin, watchlist) {
  // check type movie or series
  type = type == "movie" ? "movies" : "tvseries";

  // create an article element
  const articleElement = document.createElement("article");
  articleElement.id = media.id;
  articleElement.setAttribute("data-type", type);

  // create link element that leads to media_details.html with the mediaId
  const linkElement = document.createElement("a");
  linkElement.href = "/media_details.html?id=" + media.id;

  // create the image element
  const imageElement = document.createElement("img");
  imageElement.classList.add("articleimage");
  imageElement.src = media.primaryImage && media.primaryImage.url;
  imageElement.alt = "Media Image";
  imageElement.loading = "lazy";

  // add onerror event to handle image loading failure
  imageElement.onerror = function () {
    imageElement.src = "./image/poster.png";
    imageElement.alt = "Alternative Image";
  };

  // create h1 element for the media title
  const h1Element = document.createElement("h1");
  h1Element.textContent = media.titleText.text;

  // title and image clickable
  linkElement.appendChild(imageElement);
  linkElement.appendChild(h1Element);

  articleElement.appendChild(linkElement);

  // check if the user is logged in to show the Add/Remove button
  if (loggin && watchlist) {
    const buttonElement = document.createElement("button");
    if (watchlist["watchlist"][type].hasOwnProperty(media.id)) {
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
  // add the article element to main
  const topMoviesElement = document.querySelector("main");
  topMoviesElement.appendChild(articleElement);
}
