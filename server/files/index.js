window.onload = function () {
  const xhrlogin = new XMLHttpRequest();
  const menuItems = document.getElementById("menuItems");
  xhrlogin.onload = function () {
    if (xhrlogin.status === 200) {
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
      const loginLink = document.createElement("li");
      const loginLinkAnchor = document.createElement("a");
      loginLinkAnchor.href = "register_login.html";
      loginLinkAnchor.textContent = "Login";
      loginLink.appendChild(loginLinkAnchor);
      menuItems.appendChild(loginLink);
    }
  };
  xhrlogin.open("GET", "loggedin");
  xhrlogin.send();

  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status === 200) {
      const result = JSON.parse(xhr.responseText);
      result.forEach((element) => {
        addarticle(element, ".topmovies");
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
        addarticle(element, ".topseries");
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
};

function addarticle(movie, documentelement) {
  const articleElement = document.createElement("article");
  articleElement.id = movie.id;
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
  //console.log(imageElement.src);

  // Create the heading element
  const headingElement = document.createElement("h1");
  headingElement.textContent = movie.titleText.text;

  // Append the image and heading elements to the link element
  linkElement.appendChild(imageElement);
  linkElement.appendChild(headingElement);

  // Append the link element to the article element
  articleElement.appendChild(linkElement);

  // Add the article element to the document
  const topMoviesElement = document.querySelector(documentelement);
  topMoviesElement.appendChild(articleElement);
}
