window.onload = function () {


    };
    document.getElementById('registrationForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission
      
        // Get the form values
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
      
        // Create an object to hold the data
        var data = {
          username: username,
          password: password
        };
      
        // Send the data to the server using an HTTP POST request
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (xhr.status === 200) {         
              console.log(xhr.status);
            } else if (xhr.status === 409)
            {
              console.log(xhr.responseText) //Username is taken
            }
            else
            {
              console.log(xhr.status);
            }
          };
          xhr.open("POST", "register");
          xhr.setRequestHeader("Content-Type", "application/json"); //type of data being sent in the request body,  specifies that the request body contains JSON data
          xhr.send(JSON.stringify(data));
      });
      document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission
      
        // Get the form values
        var username = document.getElementById('lusername').value;
        var password = document.getElementById('lpassword').value;
      
        // Create an object to hold the data
        var data = {
          username: username,
          password: password
        };
      
        // Send the data to the server using an HTTP POST request
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (xhr.status === 200) {         
              console.log(xhr.status);
            }
          else if (xhr.status === 401)
          {
            console.log(xhr.responseText) //Wrong Username/Password
          }
          else
          {
            console.log(xhr.status)
          }
          };
          xhr.open("POST", "login");
          xhr.setRequestHeader("Content-Type", "application/json"); //type of data being sent in the request body,  specifies that the request body contains JSON data
          xhr.send(JSON.stringify(data));
      });