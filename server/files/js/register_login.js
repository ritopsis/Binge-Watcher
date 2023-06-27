import { checkifloggedin } from "./requestFunctions.js";

window.onload = function () {
  checkifloggedin(function (err, response) {
    //if the user is logged -> go back to homepage!
    if (response) {
      window.location.href = "index.html";
    }
  });
};

//registerbutton
document
  .getElementById("registrationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form submission
    const messageElement = document.getElementById("register_message");

    // get the form values
    const username = document.getElementById("username").value.toLowerCase();
    const password = document.getElementById("password").value;

    // create object to hold the data
    if (validateUsernameAndPassword(username, password)) {
      const data = {
        username: username,
        password: password,
      };

      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        if (xhr.status === 200) {
          login(data);
        } else if (xhr.status === 409) {
          //409 -> Username is taken
          messageElement.textContent = xhr.responseText;
        } else if (xhr.status === 400) {
          messageElement.textContent = xhr.responseText;
        } else {
          console.log(xhr.status);
        }
      };
      xhr.open("POST", "register", true);
      xhr.setRequestHeader("Content-Type", "application/json"); //type of data being sent in the request body, specifies that the request body contains JSON data
      xhr.send(JSON.stringify(data));
    } else {
      messageElement.textContent =
        "Username should only contain letters and numbers. Both Username and Password must be at least 4 characters long.";
    }
  });

//loginbutton
document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // prevent form submission

    // get the form values
    const username = document
      .getElementById("login_username")
      .value.toLowerCase();
    const password = document.getElementById("login_password").value;

    // Create an object to hold the data
    const data = {
      username: username,
      password: password,
    };

    login(data);
  });

function login(data) {
  if (data) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (xhr.status === 200) {
        window.location.href = "index.html"; // login was successful -> go to homepage
      } else if (xhr.status === 401) {
        const messageElement = document.getElementById("login_message");
        messageElement.textContent = xhr.responseText;
        console.log(xhr.responseText);
      } else {
        console.log(xhr.status);
      }
    };
    xhr.open("POST", "login", true);
    xhr.setRequestHeader("Content-Type", "application/json"); //type of data being sent in the request body, specifies that the request body contains JSON data
    xhr.send(JSON.stringify(data));
  }
}

function validateUsernameAndPassword(username, password) {
  // check if username length is longer than 3 characters
  if (username.length <= 3 || password.length <= 3) {
    return false;
  }
  // check if username contains any special characters
  const specialChars = /[^a-zA-Z0-9]/;
  if (specialChars.test(username)) {
    return false;
  }
  return true;
}
