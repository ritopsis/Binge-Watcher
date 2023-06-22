import { addWatchlist, removeWatchlist } from "./user.js";

export function createNavButton(text, link, navElement) {
  let listItem = document.createElement("li");
  listItem.classList.add("btn", "btn-outline-light");
  let anchor = document.createElement("a");
  anchor.href = link;
  anchor.textContent = text;
  listItem.appendChild(anchor);
  navElement.appendChild(listItem);
}

export function addarticle(content, documentelement, type, loggin, watchlist) {
  const articleElement = document.createElement("article");
  articleElement.id = content.id;
  articleElement.setAttribute("data-type", type);
  // Create the link element
  const linkElement = document.createElement("a");
  linkElement.href = "/details.html?id=" + content.id;
  linkElement.setAttribute("id", "titleLink");

  // Create the image element
  const imageElement = document.createElement("img");
  imageElement.classList.add("articleimage");
  if (content.primaryImage && content.primaryImage.url) {
    imageElement.src = content.primaryImage.url;
    imageElement.alt = "Movie Image";
  } else {
    imageElement.src =
      "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/fb3ef66312333.5691dd2253378.jpg";
    imageElement.loading = "lazy";
    imageElement.alt = "Alternative Image";
  }

  // Create the heading element
  const headingElement = document.createElement("h1");
  headingElement.textContent = content.titleText.text;
  headingElement.setAttribute("id", "toph2");

  // Append the image and heading elements to the link element
  linkElement.appendChild(imageElement);
  linkElement.appendChild(headingElement);

  // Append the link element to the article element
  articleElement.appendChild(linkElement);

  if (loggin && watchlist) {
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
