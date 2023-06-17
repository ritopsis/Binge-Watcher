window.onload = function () {
  const xhrlogin = new XMLHttpRequest();
  const menuItems = document.getElementById("menuItems");
  xhrlogin.onload = () => {
    if (xhrlogin.status === 200) {
      menuItems.innerHTML += `<li><a href="myprofile.html">My Profile</a></li><li><a href="logout">Logout</a></li>`;
    } else {
      menuItems.innerHTML += `<li><a href="register_login.html">Login</a></li>`;
    }
  };
  xhrlogin.open("GET", "loggedin");
  xhrlogin.send();
};

document.getElementById("search").addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent form submission
  handleSearchRequest(1);
});

function handleSearchRequest(page) {
  const input = document.getElementById("searchinput").value;
  console.log(input);
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
        addarticle(element);
      });
      if (sresult.next) {
        createButton(Number(sresult.page) + 1);
      } else {
        createButton(1);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
    }
  };

  const url = new URL("/titles/" + input, location.href);
  url.searchParams.set("type", "movie");
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
  const topMoviesElement = document.querySelector("main");
  topMoviesElement.appendChild(articleElement);
}
function createButton(text) {
  // Create a button element
  var button = document.createElement("button");
  button.textContent = text;

  // Add a click event listener to the button
  button.addEventListener("click", function () {
    handleSearchRequest(Number(text));
  });

  // Get the main element
  var mainElement = document.querySelector("main");

  // Append the button to the main element
  mainElement.appendChild(button);
}
