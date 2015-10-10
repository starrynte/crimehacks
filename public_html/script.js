var longitude;
var latitude;
var userDest;
var destLat;
var destLong;
var platform;
var defaultLayers;
var map;
var behavior;
var ui;	
var bubble;
var locationsContainer;

function addLocationsToMap(locations){
  var group = new  H.map.Group(),
    position;

  // Add a marker for each location found
    position = {
      lat: locations[0].location.displayPosition.latitude,
      lng: locations[0].location.displayPosition.longitude
    };
	destLat = locations[0].location.displayPosition.latitude;
	destLong = locations[0].location.displayPosition.longitude;
	console.log(destLat);
	console.log(destLong);
    var destLocation = new H.map.Marker(position);
	// Add the locations group to the map
	map.addObject(destLocation);
	map.setCenter({lat:destLat, lng:destLong});
	addLocationDestination();
}

/**
 * Calculates and displays the address details of 200 S Mathilda Ave, Sunnyvale, CA
 * based on a free-form text
 *
 *
 * A full list of available request parameters can be found in the Geocoder API documentation.
 * see: http://developer.here.com/rest-apis/documentation/geocoder/topics/resource-geocode.html
 *
 * @param   {H.service.Platform} platform    A stub class to access HERE services
 */
function geocode(platform) {
  var geocoder = platform.getGeocodingService(),
    geocodingParameters = {
      searchText: userDest,
      jsonattributes : 1
    };
  geocoder.geocode(
    geocodingParameters,
    onSuccess,
    onError
  );
}

/**
 * Opens/Closes a infobubble
 * @param  {H.geo.Point} position     The location on the map.
 * @param  {String} text              The contents of the infobubble.
 */
function openBubble(position, text){
 if(!bubble){
    bubble =  new H.ui.InfoBubble(
      position,
      {content: text});
    ui.addBubble(bubble);
  } else {
    bubble.setPosition(position);
    bubble.setContent(text);
    bubble.open();
  }
}

/**
 * This function will be called if a communication error occurs during the JSON-P request
 * @param  {Object} error  The error message received.
 */
function onError(error) {
  alert('Ooops!');
}

/**
 * This function will be called once the Geocoder REST API provides a response
 * @param  {Object} result          A JSONP object representing the  location(s) found.
 *
 * see: http://developer.here.com/rest-apis/documentation/geocoder/topics/resource-type-response-geocode.html
 */
function onSuccess(result) {
  if (result.response.view.length == 0) {
	  alert("Invalid Location");
	  return;
  }
  var locations = result.response.view[0].result;
 /*
  * The styling of the geocoding response on the map is entirely under the developer's control.
  * A representitive styling can be found the full JS + HTML code of this example
  * in the functions below:
  */
  addLocationsToMap(locations);
  // ... etc.
}

function addLocationDestination() {
	console.log(latitude);
	console.log(longitude);
	var currentLocation = new H.map.Marker({lat:latitude, lng:longitude});
	map.addObject(currentLocation);
}

function savePosition(position) {
	latitude = position.coords.latitude;
	longitude = position.coords.longitude;
	drawMap();
	geocode(platform);	
}

function error(err) {
  switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
};

function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(savePosition, error);
	} else {
		alert("Geolocation is not supported by this browser.");
	}
}

function drawMap() { //Map drawer from from HERE API
	//Step 1: initialize communication with the platform
	platform = new H.service.Platform({
	  app_id: 'YwBKSa4LgTkDaLDQDlG5',
	  app_code: 'WSJVRPNwLb01lnt8NnD_7g',
	  useCIT: true,
	  useHTTPS: true
	});
	defaultLayers = platform.createDefaultLayers();

	//Step 2: initialize a map  - not specificing a location will give a whole world view.
	map = new H.Map(document.getElementById('map'),
	  defaultLayers.normal.map);

	//Step 3: make the map interactive
	// MapEvents enables the event system
	// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
	behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

	// Create the default UI components
	ui = H.ui.UI.createDefault(map, defaultLayers);
	
	bubble;
	// Now use the map as required...
	map.setCenter({lat:latitude, lng:longitude});
	map.setZoom(14);
}

$(document).ready(function() {
	console.log("The document loaded.");
	$("#submit").click(function() {
		console.log("clicked button");
		userDest = $("#destination").value;
		console.log($("#destination"));
		getLocation();
	});	
});
