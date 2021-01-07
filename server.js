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
client.on('error', err => {throw err;});

// const { query } = require('express');


// Step 2:  Set up our application/Specify port
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

// Routes
app.get('/', homeHandler);
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.use('*', notFoundHandler);

function homeHandler(request, response) {
  response.status(200).send('');
}

function locationHandler(request, response) {//BUILD OUR REQUEST TO TALK TO LOCATIONIQ
  //Build request before we send it off to
  let city = request.query.city;
  let key = process.env.GEOCODE_API_KEY;
  const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
  console.log(url);
  superagent.get(url)
    .then(data => {
      const locationData = data.body[0];
      const location = new Location(city, locationData);
      response.status(200).send(location);
    })
    .catch(error => (console.log(error)));
}
// const promise1 = new Promise((resolve, reject) => {
//   throw 'Uh-oh!';
// });

// promise1.catch((error) => {
//   console.error(error);
// });


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
    }).catch( error => {
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


function Weather(result) {
  this.time = new Date(result.ts*1000).toDateString();
  this.forecast = result.weather.description;
}


function notFoundHandler(request, response) {
  response.status(404).send('huh?');
}


// Connect to DB and Start the Web Server
client.connect()
  .then( () => {
    app.listen(PORT, () => {
      console.log('Server up on', PORT);
      console.log(`${client.connectionParameters.database}`);
    });
  })
  .catch(err => {
    console.log('ERROR', err);
  });
// Listening on the correct port
// app.listen(PORT, () => {
//   console.log('Now listening on port', PORT);
// });
