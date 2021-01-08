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
app.get('/weather', weatherHandler);
// Add
// app.get('/add', (request, response) => {
//   let search_query = request.query.search_query;
//   let formated_query = request.query.formatted_query;
//   let latitude = request.query.latitude;
//   let longitude = request.query.longitude;
//   // Reference columns in database
//   let SQL = 'INSERT INTO cityexplore (search_query, formated_query,latitude,longitude ) VALUES ($1, $2, $3, $4) RETURNING *';// Referencing columns
//   let locValues = [search_query, formated_query, latitude, longitude];
//   client.query(SQL, locValues)
//   console.log(locValues)
//     .then(results => {
//       response.status(200).json(results);
//     })
//     .catch(error => {
//       console.log('ERROR', error);
//       response.status(500).send('So sorry, something went wrong.');
//     });
// });


app.use('*', notFoundHandler);

function homeHandler(request, response) {
  response.status(200).send('');
}

function locationHandler(request, response) {//BUILD OUR REQUEST TO TALK TO LOCATIONIQ
  //Build request before we send it off to
  let city = request.query.city;
  let key = process.env.GEOCODE_API_KEY;
  const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
  let SQL = 'SELECT * FROM cityexplorer WHERE search_query = $1';
  let cityQuery = [city];
  client.query(SQL, cityQuery)
    .then(results => {
      if (results.rowCount) {
        response.status(200).json(results.rows[0]);
      } else {
        console.log(url);
        superagent.get(url)
          .then(data => {
            const locationData = data.body[0];
            const location = new Location(city, locationData);
            console.log('hi');

            let SQL = 'INSERT INTO cityexplorer (search_query, formated_query,latitude,longitude ) VALUES ($1, $2, $3, $4) RETURNING *';// Referencing columns
            let locValues = [location.search_query, location.formated_query, location.latitude, location.longitude];
            client.query(SQL, locValues)
            console.log(locValues)
              .then(results => {
                response.status(200).json(results);
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


function Weather(result) {
  this.time = new Date(result.ts * 1000).toDateString();
  this.forecast = result.weather.description;
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
// Listening on the correct port
// app.listen(PORT, () => {
//   console.log('Now listening on port', PORT);
// });
