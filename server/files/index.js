window.onload = function () {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          result.forEach(element => {
            addmovie(element);
          });
          console.log(result);

        } else 
        {
          document.querySelector("body").append(`Daten konnten nicht geladen werden, Status ${xhr.status} - ${xhr.statusText}`);
        }
      };
      xhr.open("GET", "movie");
      xhr.send();
  };

function addmovie(movie){
    const articleElement = document.createElement('article');
    articleElement.id = movie.id;
    // Create the link element
    const linkElement = document.createElement('a');
    linkElement.href = movie.id;

    // Create the image element
    const imageElement = document.createElement('img');
    imageElement.classList.add('articleimage');
    if (movie.primaryImage && movie.primaryImage.url) {
      imageElement.src = movie.primaryImage.url;
      imageElement.alt = 'Movie Image';
    } else {
        console.log("help");
      imageElement.src = 'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/fb3ef66312333.5691dd2253378.jpg';
      imageElement.alt = 'Alternative Image';
    }
    console.log(imageElement.src);
    
    // Create the heading element
    const headingElement = document.createElement('h1');
    headingElement.textContent = movie.titleText.text;
    
    // Append the image and heading elements to the link element
    linkElement.appendChild(imageElement);
    linkElement.appendChild(headingElement);
    
    // Append the link element to the article element
    articleElement.appendChild(linkElement);
    
    // Add the article element to the document
    const topMoviesElement = document.querySelector('.topmovies');
    topMoviesElement.appendChild(articleElement);
}
  