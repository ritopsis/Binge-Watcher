let loggin = null;

window.onload = function () {
  const xhrlogin = new XMLHttpRequest();
  const menuItems = document.getElementById("menuItems");
  xhrlogin.onload = () => {
    if (xhrlogin.status === 200) {
      menuItems.innerHTML += `<li><a href="myprofile.html">My Profile</a></li><li><a href="logout">Logout</a></li>`;
      loggin = true;
      const url = new URL(location.href);
      const params = new URLSearchParams(url.search);
      if (params.has("page") && params.has("title")) {
        handleSearchRequest(params.get("title"), params.get("page"));
      }
    } else {
      loggin = false;
      menuItems.innerHTML += `<li><a href="register_login.html">Login</a></li>`;
      const url = new URL(location.href);
      const params = new URLSearchParams(url.search);
      if (params.has("page") && params.has("title")) {
        handleSearchRequest(params.get("title"), params.get("page"));
      }
    }
  };
  xhrlogin.open("GET", "loggedin");
  xhrlogin.send();

  //If query "page/title" exist than load data! -> else just do nothing
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
        addarticle(element, loggin);
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

  const url = new URL("/titles/" + title, location.href);
  url.searchParams.set("type", "tvSeries");
  url.searchParams.set("site", page);
  xhr.open("GET", url, true);
  xhr.send();
}

function addarticle(movie) {
  const articleElement = document.createElement("article");
  articleElement.id = movie.id;
  // Create the link element
  const linkElement = document.createElement("a");
  linkElement.href = "/details.html?id=" + movie.id;

  // Create the heading element
  const headingElement = document.createElement("h1");
  headingElement.textContent = movie.titleText.text;

  // Append the image and heading elements to the link element
  linkElement.appendChild(headingElement);

  if (loggin) {
    const buttonElement = document.createElement("button");
    buttonElement.textContent = "Add/Remove from Watchlist";
    articleElement.appendChild(buttonElement);
  }

  // Append the link element to the article element
  articleElement.appendChild(linkElement);

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
