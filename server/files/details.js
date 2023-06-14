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
      console.log(xhr.responseText);
    } else {
      console.log(xhr.status);
    }
  };
  xhr.open("GET", "watchlist");
  xhr.send();
  */
};
