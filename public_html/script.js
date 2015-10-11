var longitude;
var latitude;
var userDest;
var destLat;
var destLong;
var destLocation;
var platform;
var defaultLayers;
var map;
var behavior;
var ui;	
var locationsContainer;
var routeInstructionsContainer;
var route;
var total_time;
var total_distance;
var startTime;
var endTime;
var riskProbability;
var routeXYZ = [];
var crimeDistribution;
var polyline;
var group;

/**
 * A full list of available request parameters can be found in the Routing API documentation.
 * see:  http://developer.here.com/rest-apis/documentation/routing/topics/resource-calculate-route.html
 *
 * @param   {H.service.Platform} platform    A stub class to access HERE services
 */
function calculateRouteFromAtoB (platform) {
  var router = platform.getRoutingService(),
    routeRequestParams = {
      mode: 'shortest;pedestrian',
      representation: 'display',
      waypoint0: latitude + "," + longitude, // currentLocation
      waypoint1: destLat + "," + destLong,  // Destination
      routeattributes: 'waypoints,summary,shape,legs',
      maneuverattributes: 'direction,action'
    };


  router.calculateRoute(
    routeRequestParams,
    onSuccessCalculate,
    onError
  );
}

/**
 * This function will be called once the Routing REST API provides a response
 * @param  {Object} result          A JSONP object representing the calculated route
 *
 * see: http://developer.here.com/rest-apis/documentation/routing/topics/resource-type-calculate-route.html
 */
function onSuccessCalculate(result) {
  if (!result.response || !result.response.route || result.response.route.length == 0) {
	  $("#errorMessage").html("This location is not accessible by foot from your location.");
	  $("#errorModal").modal("toggle");
	  return;
  }
  var route = result.response.route[0];
 /*
  * The styling of the route response on the map is entirely under the developer's control.
  * A representitive styling can be found the full JS + HTML code of this example
  * in the functions below:
  */
  addRouteShapeToMap(route);
  addManueversToMap(route); //This function calls function that requests from server
  // ... etc.
}

/**
 * Creates a H.map.Polyline from the shape of the route and adds it to the map.
 * @param {Object} route A route as received from the H.service.RoutingService
 */
function addRouteShapeToMap(route){
  var strip = new H.geo.Strip(),
    routeShape = route.shape;

  routeShape.forEach(function(point) {
    var parts = point.split(',');
    strip.pushLatLngAlt(parts[0], parts[1]);
  });

	if (polyline)
	{
		map.removeObject(polyline);
	}
  polyline = new H.map.Polyline(strip, {
    style: {
      lineWidth: 4,
      strokeColor: 'rgba(0, 128, 255, 0.7)'
    }
  });
  
  // Add the polyline to the map
  map.addObject(polyline);
  // And zoom to its bounding rectangle
  map.setViewBounds(polyline.getBounds(), true);
}


/**
 * Creates a series of H.map.Marker points from the route and adds them to the map.
 * @param {Object} route  A route as received from the H.service.RoutingService
 */
function addManueversToMap(route){
  var svgMarkup = '<svg width="18" height="18" ' +
    'xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="8" cy="8" r="8" ' +
      'fill="#1b468d" stroke="white" stroke-width="1"  />' +
    '</svg>',
    dotIcon = new H.map.Icon(svgMarkup, {anchor: {x:8, y:8}}),
    i,
    j;
	
	if (group)
	{
		map.removeObject(group);
	}
    group = new H.map.Group();
	
  var d = new Date();
  var offset = d.getTimezoneOffset() * 60;
  var currentTime = (d.getTime()/ 1000.0 - offset) % 86400;
  console.log("Current Time: " + currentTime);
  // Add a marker for each maneuver
  for (i = 0;  i < route.leg.length; i += 1) {
    for (j = 0;  j < route.leg[i].maneuver.length; j += 1) {
      // Get the next maneuver.
      maneuver = route.leg[i].maneuver[j];
	  var tempObj = {lat: maneuver.position.latitude,
		lng: maneuver.position.longitude,
		time: currentTime + maneuver.travelTime
	  };
	  currentTime += maneuver.travelTime;
      // Add a marker to the maneuvers group
      var marker =  new H.map.Marker({
        lat: maneuver.position.latitude,
        lng: maneuver.position.longitude} ,
        {icon: dotIcon});
      marker.instruction = maneuver.instruction;
      group.addObject(marker);
	  routeXYZ[j] = tempObj;
    }
  }
  for (i = 0; i < routeXYZ.length; i++) {
	  console.log(routeXYZ[i]);
  }
  // Add the maneuvers group to the map
  total_time = route.summary.travelTime;
  startTime = (d.getTime() / 1000.0 - offset) % 86400; 
  endTime = (d.getTime() / 1000.0 - offset + total_time) % 86400; 
  total_distance = route.summary.distance / 1609.34;
  console.log("Distance: " + total_distance);
  console.log("Time: " + total_time);
  map.addObject(group);
  callServer();
}

Number.prototype.toMMSS = function () {
  return  Math.floor(this / 60)  +' minutes '+ (this % 60)  + ' seconds.';
}

/*Code below used to draw map and add markers*/

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
	if (destLocation) {
		map.removeObject(destLocation);
	}
	destLocation = new H.map.Marker(position);
	// Add the locations group to the map
	map.addObject(destLocation);
	map.setCenter({lat:destLat, lng:destLong});
	calculateRouteFromAtoB(platform);
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
 * This function will be called if a communication error occurs during the JSON-P request
 * @param  {Object} error  The error message received.
 */
function onError(error) {
  $("#errorMessage").html('Ooops!');
  $("#errorModal").modal("toggle");
  return;
}

/**
 * This function will be called once the Geocoder REST API provides a response
 * @param  {Object} result          A JSONP object representing the  location(s) found.
 *
 * see: http://developer.here.com/rest-apis/documentation/geocoder/topics/resource-type-response-geocode.html
 */
function onSuccess(result) {
  if (!result.response || !result.response.view || result.response.view.length == 0) {
	  $("#errorMessage").html("Invalid Location");
	  $("#errorModal").modal("toggle");
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
	console.log("Latitude: " + latitude + "Longitude: " + longitude);
	drawMap();
	addLocationDestination();
}

function error(err) {
  switch(error.code) {
        case error.PERMISSION_DENIED:
            $("#errorMessage").html("User denied the request for Geolocation.");
			$("#errorModal").modal("toggle");
            break;
        case error.POSITION_UNAVAILABLE:
            $("#errorMessage").html("Location information is unavailable.");
			$("#errorModal").modal("toggle");
            break;
        case error.TIMEOUT:
            $("#errorMessage").html("The request to get user location timed out.");
			$("#errorModal").modal("toggle");
            break;
        case error.UNKNOWN_ERROR:
            $("#errorMessage").html("An unknown error occurred.");
			$("#errorModal").modal("toggle");
            break;
    }
};

function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(savePosition, error);
	} else {
		$("#errorMessage").html("Geolocation is not supported by this browser.");
		$("#errorModal").modal("toggle");
		return;
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

	// Now use the map as required...
	map.setCenter({lat:latitude, lng:longitude});
	map.setZoom(14);
}

function callServer(){
	var i;
	//$("#probability").text("Low");
	$("#uber").slideToggle();
	
	$.post("http://crimerisk.azurewebsites.net/risk", JSON.stringify(routeXYZ), function(data) {
		console.log(data);
		crimeDistribution = data.crimes;
		riskProbability = data.risk;
		for(i = 0; i < crimeDistribution.length; i++) {
		if (crimeDistribution[i].Category == 'Property') {
			addCircleToMap(map, crimeDistribution[i].Latitude, crimeDistribution[i].Longitude, 'yellow');
		}
		if (crimeDistribution[i].Category == 'Person') {
			addCircleToMap(map, crimeDistribution[i].Latitude, crimeDistribution[i].Longitude, 'red');
		}
	}
	});
}

function addCircleToMap(map, latitude, longitude, color){
	if (color == 'yellow') {
		map.addObject(new H.map.Circle(
		{lat: latitude, lng: longitude},
			80,
			{
			  style: {
				strokeColor: 'rgba(255, 240, 31, 0.6)', // Color of the perimeter
				lineWidth: 1,
				fillColor: 'rgba(255, 240, 31, 0.5)'  // Color of the circle
			  }
			}
		));
	} else {
		map.addObject(new H.map.Circle(
		{lat: latitude, lng: longitude},
			80,
			{
			  style: {
				strokeColor: 'rgba(255, 30, 30, 0.6)', // Color of the perimeter
				lineWidth: 1,
				fillColor: 'rgba(255, 30, 30, 0.5)'  // Color of the circle
			  }
			}
		));
	}
}

$(document).ready(function() {
	console.log("The document loaded.");
	getLocation();
	$("#destination").keyup(function(event){
		if(event.keyCode == 13){
			$("#submit").click();
		}
	});
	$("#submit").click(function() {
		console.log("clicked button");
		userDest = destination.value;
		console.log($("#destination"));
		geocode(platform);
	});
	/*$("#switchMode").click(function() {
		console.log("switching modes...");
		$("#formPopup").popup("open");
		
	});*/
});
