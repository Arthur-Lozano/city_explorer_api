
'use strict';

// Step 1:  Bring in our modules/dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Step 2:  Set up our application
const app = express();
const PORT = process.env.PORT;
app.use(cors());

// Routes
// app.get('/', homeHandler);
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
// app.get('/restaurants', restaurantHandler);
app.use('*', notFoundHandler);
app.get('/',(request, response)=>{
  response.send('Hello Hoob');
});




// Function Handlers
//Could also use arrow function to perform the callback function of location Handler
// app.get('/location', (request, response) => {
//   response.send('Hello World');
// });
function locationHandler(request, response) {
  // This function will do two things:
  // request data from our files
  // tailor/normalize the data using a constructor
  // respond with the data (show up in the browser)
  const location = require('./data/location.json');
  const city = request.query.city;
  const locationData = new Location(city, location);
  response.send(locationData);// To send our new object to the browser

}

function weatherHandler(request, response) {
  // This function will do two things:
  // request data from our files
  // tailor/normalize the data using a constructor
  // respond with the data (show up in the browser)
  const data = require('./data/weather.json');
  const weathertArr = [];
  data.data.forEach(weather => {
    weathertArr.push(new Weather(weather));
  });
  response.send(weathertArr);
}


function notFoundHandler(request, response) {
  response.send('status: 500, Sorry, something went wrong');
}



// Constructor
function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}

function Weather(result) {
  this.time = result.datetime;
  this.forecast = result.weather.description;
}


// Start our server!
app.listen(PORT, () => {
  console.log(`Now listening on port, ${PORT}`);
});
