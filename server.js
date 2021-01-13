'use strict';


//Load environment variables from the .env file
require('dotenv').config();

// Step 1:  Bring in our modules/dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

// Database Connection Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => { throw err; });

// const { query } = require('express');


// Step 2:  Set up our application/Specify port
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

// Routes
app.get('/', homeHandler);
app.get('/location', locationHandler);
app.get('/movies', moviesHandler);
// app.get('/yelp', yelpHandler);
app.get('/weather', weatherHandler);
app.use('*', notFoundHandler);

function homeHandler(request, response) {
  response.status(200).send('');
}


//Movie API
function moviesHandler(request, response) {//BUILD OUR REQUEST TO TALK TO MOVIEAPI
  //Build request before we send it off to
  let city = request.query.search_query;
  let key = process.env.MOVIE_API_KEY;
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${city}`;

  superagent.get(url)//Talking to Api

    .then(data => {
      let movieInfo = data.body.results.map(vid => {
        let baseUrl = 'https://image.tmdb.org/t/p/w300';
        let filePath = data.body.poster_path;
        let imageLink = baseUrl + filePath;

        return new Movies(vid, imageLink);
      });
      response.status(200).send(movieInfo);
    })
    .catch(err => {
      response.status(500).json('Good to go');
      console.log(err);
    });

}
function locationHandler(request, response) {//BUILD OUR REQUEST TO TALK TO LOCATIONIQ
  //Build request before we send it off to
  let city = request.query.city;
  let key = process.env.GEOCODE_API_KEY;
  const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
  let SQL = 'SELECT * FROM cityexplorer WHERE search_query = $1';
  let movieQuery = [city];
  client.query(SQL, movieQuery)
    .then(results => {
      if (results.rowCount) {// how we know if it is in the database
        response.status(200).json(results.rows[0]);//if rowcount is greater then zero it will execute 48 and send data from database
      } else {
        superagent.get(url)
          .then(data => {
            const locationData = data.body[0];
            const location = new Location(city, locationData);
            console.log('hi');

            let SQL = 'INSERT INTO cityexplorer (search_query, formatted_query,latitude,longitude ) VALUES ($1, $2, $3, $4)';// Referencing columns
            let locValues = [location.search_query, location.formatted_query, location.latitude, location.longitude];
            client.query(SQL, locValues)
              .then(() => {
                response.status(200).json(location);
              })
              .catch(error => {
                console.log('ERROR', error);
                response.status(500).send('So sorry, something went wrong.');
              });
          })
          .catch(error => (console.log(error)));
      }
    })
    .catch(error => {
      console.log('ERROR', error);
      response.status(500).send('So sorry, something went wrong.');
    });
}

// function yelpHandler(request, response) {
//   let location = request.query.location;
//   let key = process.env.YELP_API_KEY;
//   let lat = request.query.latitude;
//   let lon = request.query.longitude;
//   // console.log(lat);
//   const url = `https://api.yelp.com/v3/businesses/search?location=${location}`;
//   console.log(url);response
//   superagent.get(url)
//     .then(value => {
//       const yelpData = value.body.data.map(current => {
//         return new Weather(current);
//       });
//       response.status(200).send(yelpData);
//     }).catch(error => {
//       console.log('ERROR', error);
//       response.status(500).send('So sorry, something went wrong.');
//     });
// }

function weatherHandler(request, response) {
  let key = process.env.WEATHER_API_KEY;
  let lat = request.query.latitude;
  let lon = request.query.longitude;
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?key=${key}&lat=${lat}&lon=${lon}&days=8`;
  superagent.get(url)
    .then(value => {
      const weatherData = value.body.data.map(current => {
        return new Weather(current);
      });
      response.status(200).send(weatherData);
    }).catch(error => {
      console.log('ERROR', error);
      response.status(500).send('So sorry, something went wrong.');
    });
}

// Constructors
function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
}

// Yelp
// function Food(result){
//   this.name = result.name;
//   this.image_url = result.image_url;
//   this.price = result.price;
//   this.rating = result.rating;
//   this.url = result.url;
// }
function Weather(result) {
  this.time = new Date(result.ts * 1000).toDateString();
  this.forecast = result.weather.description;
}


//Movie
function Movies(result) {
  // Based off movie object
  this.title = result.original_title;
  this.overview = result.overview;
  this.average_votes = result.vote_average;
  this.total_votes = result.vote_count;
  this.image_url = result.poster_path;
  this.popularity = result.popularity;
  this.released_on = result.release_date;
}
function notFoundHandler(request, response) {
  response.status(404).send('huh?');
}


// Connect to DB and Start the Web Server
client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log('Server up on', PORT);
      console.log(`Connected to database ${client.connectionParameters.database}`);
    });
  })
  .catch(err => {
    console.log('ERROR', err);
  });