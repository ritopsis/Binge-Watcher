export function checkifloggedin(callback) {
  //check if session is in session store (user logged in)
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status === 200) {
      callback(null, xhr.responseText);
    } else {
      callback("Error: " + xhr.status, null);
    }
  };
  xhr.open("GET", "loggedin", true);
  xhr.send();
}
export function getwatchlist(username, callback) {
  if (username) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (xhr.status === 200) {
        callback(null, xhr.responseText);
      } else {
        callback("Error: " + xhr.status, null);
      }
    };
    xhr.open("GET", `watchlist/${username}`, true);
    xhr.send();
  } else {
    //get watchlist of the loggedin user (identification: session)
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (xhr.status === 200) {
        callback(null, xhr.responseText);
      } else {
        callback("Error: " + xhr.status, null);
      }
    };
    xhr.open("GET", "watchlist", true);
    xhr.send();
  }
}

export function addWatchlist(article, callback) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status === 200) {
      callback(null, xhr.responseText);
    } else {
      callback("Error: " + xhr.status, null);
    }
  };
  const data = {
    title: article.querySelector("h1").textContent,
    id: article.id,
    type: article.dataset.type,
  };
  xhr.open("POST", "addwatchlist", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(data));
}
export function removeWatchlist(article, callback) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status === 200) {
      callback(null, xhr.responseText);
    } else {
      callback("Error: " + xhr.status, null);
    }
  };
  const data = {
    id: article.id,
  };
  xhr.open("DELETE", "removewatchlist", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(data));
}
