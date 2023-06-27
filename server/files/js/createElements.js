import { addWatchlist, removeWatchlist } from "./requestFunctions.js";

export function createNavButton(text, link, navElement) {
  let listItem = document.createElement("li");
  let anchor = document.createElement("a");
  anchor.href = link;
  anchor.textContent = text;
  listItem.appendChild(anchor);
  navElement.appendChild(listItem);
}

export function addarticle(content, documentelement, type, user_watchlist) {
  const articleElement = document.createElement("article");
  articleElement.id = content.id;
  articleElement.setAttribute("data-type", type);

  // Create the link element
  const linkElement = document.createElement("a");
  linkElement.href = "/media_details.html?id=" + content.id;
  linkElement.setAttribute("id", "titleLink");

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

  // Create the Release Year element
  const releaseElement = document.createElement("h3");
  releaseElement.textContent = content.releaseYear.year;
  releaseElement.setAttribute("id", "toph2");

  // Create the heading element
  const headingElement = document.createElement("h1");
  headingElement.textContent = content.titleText.text;
  headingElement.setAttribute("id", "toph2");

  // Append the image and heading elements to the link element
  linkElement.appendChild(imageElement);
  linkElement.appendChild(releaseElement);
  linkElement.appendChild(headingElement);

  // Append the link element to the article element
  articleElement.appendChild(linkElement);

  if (user_watchlist) {
    const buttonElement = document.createElement("button");
    if (user_watchlist[type]?.hasOwnProperty(content.id)) {
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

export function add(article, button) {
  addWatchlist(article, function (error, response) {
    if (error) {
      console.error("Error adding to watchlist:", error);
    }
    if (response) {
      button.textContent = "Remove";
      button.setAttribute("data-action", "remove"); // change the action to "remove"
    }
  });
}

export function remove(article, button) {
  removeWatchlist(article, function (error, response) {
    if (error) {
      console.error("Error removing from watchlist:", error);
    }
    if (response) {
      button.textContent = "Add";
      button.setAttribute("data-action", "add"); // Change the action to "add"
    }
  });
}
