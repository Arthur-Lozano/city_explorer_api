'use strict';


//Load environment variables from the .env file
require('dotenv').config();

// Step 1:  Bring in our modules/dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');


// Step 2:  Set up our application/Specify port
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

// Routes
app.get('/', homeHandler);
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
// app.get('/places', placesHandler);
// app.use('*', notFoundHandler);

function homeHandler(request, response) {
  response.status(200).send('hello hoobs');
}

function locationHandler(request, response) {//BUILD OUR REQUEST TO TALK TO LOCATIONIQ
  //Build request before we send it off to
  let city = request.query.city;
  //need API key we just put in env file and put it into our reuqest, call it variable called key
  let key = process.env.GEOCODE_API_KEY;
  const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
  superagent.get(url)
    .then(data => {
      // console.log(data.body);
      // Create our objects based on our constructor
      // console.log(data.body);
      const locationData = data.body[0];
      const location = new Location(city, locationData);
      response.status(200).send(location);
    });
}


function weatherHandler(request, response) {
  // This function will do two things:
  // request data from our files
  // tailor/normalize the data using a constructor
  // respond with the data (show up in the browser)
  let key = process.env.WEATHER_API_KEY;
  let city = request.query.city;
  const url = `https://api.weatherbit.io/v2.0/current?city=${city}&key=${key}`;
  superagent.get(url)
    .then(data => {
      console.log(data.body);
      // Create our objects based on our constructor
      // console.log(data.body);
      const weatherData = data.body[0];
      const weather = new Weather(city, weatherData);
      response.status(200).send(weather);
    });
}

// Constructors
function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
}

function Restaurant(entry) {
  this.restaurant = entry.restaurant.name;
  this.cuisines = entry.restaurant.cuisines;
  this.locality = entry.restaurant.location.locality;
}

function Weather(result) {
  this.time = result.ob_time;
  this.forecast = result.data.weather.description;
}
// Constructor
// function Location(city, geoData) {
//   this.search_query = city;
//   this.formatted_query = geoData[0].display_name;
//   this.latitude = geoData[0].lat;
//   this.longitude = geoData[0].lon;
// }



// Listening on the correct port
app.listen(PORT, () => {
  console.log('Now listening on port', PORT);
});
// using superagent to send GET request
// superagent.get(url);//making ansyrchnous call to API
//When the response comes back we get it in the form of a (PROMISE) ONECE IT RETURNS A PROMISE WE CAN DO THINGS WITH THAT STUFF OR DATA IN THE FORM OF CALLBACK FUNCTIOn
//   superagent.get(url)
//     .then(data =>)

// function Location(city, geoData) {
//   this.search_query = city;
//   this.formatted_query = geoData.display_name;
//   this.latitude = geoData.lat;
//   this.longitude = geoData.lon;
// }

// function locationHandler(request, response) {
//   // This function will do two things:
//   // request data from our files
//   // tailor/normalize the data using a constructor
//   // respond with the data (show up in the browser)
//   const location = require('./data/location.json');
//   const city = request.query.city;
//   const locationData = new Location(city, location);


// }
// function homeHandler(request, response) {
//   response.send('Hello World');
// }
// function notFoundHandler(request, response) {
//   response.send('404.  Sorry!');
// }
// function restaurantHandler(request, response) {
//   // This function will do two things:
//   // request data from our files
//   // tailor/normalize the data using a constructor
//   // respond with the data (show up in the browser)
//   const data = require('./data/restaurants.json');
//   const restaurantArr = [];
//   data.nearby_restaurants.forEach(restaurant => {
//     restaurantArr.push(new Restaurant(restaurant));
//   });
//   response.send(restaurantArr);
// }


// Constructor
// function Location(city, geoData) {
//   this.search_query = city;
//   this.formatted_query = geoData[0].display_name;
//   this.latitude = geoData[0].lat;
//   this.longitude = geoData[0].lon;
// }

// function Restaurant(result) {
//   this.restaurant = result.restaurant.name;
//   this.cuisines = result.restaurant.cuisines;
//   this.locality = result.restaurant.location.locality;
// }



// Start our server!
// app.listen(PORT, () => {
//   console.log(`Now listening on port, ${PORT}`);
// });







// Function Handlers
//Could also use arrow function to perform the callback function of location Handler
// app.get('/location', (request, response) => {
//   response.send('Hello World');
// });
// function locationHandler(request, response) {
//   // This function will do two things:
//   // request data from our files
//   // tailor/normalize the data using a constructor
//   // respond with the data (show up in the browser)
//   const location = require('./data/location.json');
//   const city = request.query.city;
//   const locationData = new Location(city, location);
//   response.send(locationData);// To send our new object to the browser

// }

// function weatherHandler(request, response) {
//   // This function will do two things:
//   // request data from our files
//   // tailor/normalize the data using a constructor
//   // respond with the data (show up in the browser)
//   const data = require('./data/weather.json');
//   const weathertArr = [];
//   data.data.forEach(weather => {
//     weathertArr.push(new Weather(weather));
//   });
//   response.send(weathertArr);
// }


// function notFoundHandler(request, response) {
//   response.send('status: 500, Sorry, something went wrong');
// }



// // Constructor
// function Location(city, geoData) {
//   this.search_query = city;
//   this.formatted_query = geoData[0].display_name;
//   this.latitude = geoData[0].lat;
//   this.longitude = geoData[0].lon;
// }

// function Weather(result) {
//   this.time = result.datetime;
//   this.forecast = result.weather.description;
// }


// Start our server!
// app.listen(PORT, () => {
//   console.log(`Now listening on port, ${PORT}`);
// });
