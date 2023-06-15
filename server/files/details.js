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
      //if titletypetext -> movie dann nix (layout für movie)
      //if titletypetext -> series dann episoden abfragen
      //einem request für /titles/series/{seriesId} -> bekomme list von episoden zurück
      //dann alle episoden in einem array übergeben an /titles/episode/{id} -> bekomme List mit mehr informationen zu jeder Episode zurück
      console.log(result);
    } else {
      console.log(xhr.status);
    }
  };
  xhr.open("GET", `/details/${id}`, true);
  xhr.send();
};
