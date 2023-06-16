window.onload = function () {
  const xhrlogin = new XMLHttpRequest();
  const menuItems = document.getElementById("menuItems");
  xhrlogin.onload = () => {
    if (xhrlogin.status === 200) {
      menuItems.innerHTML += `<li><a href="myprofile.html">My Profile</a></li><li><a href="logout">Logout</a></li>`;
      //request to get information about series from data
    } else {
      menuItems.innerHTML += `<li><a href="register_login.html">Login</a></li>`;
    }
  };
  xhrlogin.open("GET", "loggedin");
  xhrlogin.send();
  /*
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status === 200) {
      const result = JSON.parse(xhr.responseText);
      console.log(result);
    } else {
      console.log(xhr.status);
    }
  };
  xhr.open("GET", "watchlist");
  xhr.send();
  */
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status === 200) {
      const result = JSON.parse(xhr.responseText);
      if (result.titleType.isSeries) {
        displayDetails(result);
        // true = Serie, false = keine Serie sondern Film
        // Episoden abrufen
        const xhrEpisode = new XMLHttpRequest();
        xhrEpisode.onload = function () {
          if (xhrEpisode.status === 200) {
            const result2 = JSON.parse(xhrEpisode.responseText);
            displaySeasonAndEpisode(result2);
            console.log(result2);
          } else {
            console.log(xhrEpisode.status);
          }
        };
        xhrEpisode.open("GET", `/episodes/${id}`, true);
        xhrEpisode.send();
      } else {
        // ist ein Film
        console.log(result);
        displayDetails(result);
      }
      // einen Request für /titles/series/{seriesId} -> erhalte eine Liste von Episoden zurück
      // dann alle Episoden in einem Array an /titles/episode/{id} übergeben -> erhalte eine Liste mit weiteren Informationen zu jeder Episode zurück
    } else {
      console.log(xhr.status);
    }
  };
  xhr.open("GET", `/details/${id}`, true);
  xhr.send();
};

function displayDetails(content) {
  const mainElement = document.querySelector("main");

  // Create elements for movie details
  const titleElement = document.createElement("h2");
  titleElement.textContent = content.titleText.text;

  const imageElement = document.createElement("img");
  imageElement.src = content.primaryImage.url;
  imageElement.alt = content.titleText.text;
  imageElement.width = 200;
  imageElement.height = 300;

  const plotElement = document.createElement("p");
  plotElement.textContent = content.plot.plotText.plainText;

  const ratingElement = document.createElement("p");
  ratingElement.textContent = `Rating: ${content.ratingsSummary.aggregateRating}`;

  const releaseDateElement = document.createElement("p");
  releaseDateElement.textContent = `Release Date: ${content.releaseDate.month}/${content.releaseDate.day}/${content.releaseDate.year}`;

  // Append movie details to the <main> element
  mainElement.appendChild(titleElement);
  mainElement.appendChild(imageElement);
  mainElement.appendChild(plotElement);
  mainElement.appendChild(ratingElement);
  mainElement.appendChild(releaseDateElement);
}
function displaySeasonAndEpisode(data) {
  const mainElement = document.querySelector("main");

  data.forEach((episode) => {
    const seasonNumber = episode.seasonNumber;
    const episodeNumber = episode.episodeNumber;
    const episodeid = episode.tconst;
    if (!isNaN(seasonNumber)) {
      const episodeElement = document.createElement("div");
      episodeElement.textContent = `Season ${seasonNumber}, Episode ${episodeNumber}`;

      const buttonElement = document.createElement("button");
      buttonElement.textContent = "Play";
      buttonElement.addEventListener("click", () => {});

      episodeElement.appendChild(buttonElement);
      mainElement.appendChild(episodeElement);
    }
  });
}
