var http = require('http');
var https = require('https');
var url = require('url');
var path = require('path');
var fs = require('fs');
var port = process.env.PORT || 1337;

function uberAuth(startLat, startLon, endLat, endLon)
{
	
	var options = {
		url : 'https://login.uber.com/oauth/v2/authorize',
		path : '?client_id=eqbu1gmgdi06UcBxzCdJZMu3Dyv_sLHg&response_type=code&scope=request'
	};
	
	var req = https.request(options, function(res) {
		console.log("Got response: " + res.statusCode);
		
		res.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
			//console.log(chunk);
		});
	  	res.on('end', function() {
	    	console.log('No more data in response.');
	  	});
		
	}).on('error', function(e) {
  		console.log("Got error: " + e.message);
	});
	
	req.end();
	
}

function getUberAPI(response, startLat, startLon, endLat, endLon)
{
	console.log('Called getUberAPI');
	
	var uberData = '';
	
	var clientId = 'eqbu1gmgdi06UcBxzCdJZMu3Dyv_sLHg';
	var serverToken = 'jNkZ-AAtZeBUQ9ssmhGY7n-TaGYI6C83JdoX8ZLp';
	var productPath = '/v1/products';
	var rideReqPath = '/v1/requests';
	var testRideReqPath = '/sandbox/requests/asdf123'
	var testBaseUrl = 'https://sandbox-api.uber.com/v1';
	var baseUrl = 'api.uber.com';
	
	function constructProductPath(latitude, longitude) {
		return productPath + '?server_token=' + serverToken + '&latitude=' + latitude + '&longitude=' + longitude;
	};
	
	function constructRideReqPath(productId, startLat, startLon, endLat, endLon)
	{
		return rideReqPath + '?server_token=' + serverToken + '&product_id=' + productId +
		  '&start_latitude=' + startLat + '&start_longitude=' + startLon + 
		  '&end_latitude=' + endLat + '&end_longitude=' + endLon;
	}
	
	function testRideReq()
	{
		var options = {
			hostname : testBaseUrl,
			//path : constructProductPath(startLat, startLon),
			path : testRideReqPath, //constructRideReqPath(uberProdId, startLat, startLon, endLat, endLon),
			method: "PUT",
			headers : {
				Authorization : 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZXMiOlsicmVxdWVzdCJdLCJzdWIiOiJiOGI3MWE3Zi05MDMzLTRhOTMtOWE5Zi05NjU2MzU5NDViYWIiLCJpc3MiOiJ1YmVyLXVzMSIsImp0aSI6ImJiYjg3OTc0LWM5NjItNDMxYy1iMDJlLWFiZDRhZmM0MTMzYSIsImV4cCI6MTQ0NzEyMzk1MiwiaWF0IjoxNDQ0NTMxOTUyLCJ1YWN0IjoiaWxpd0NMd3hsYWRlTFRyU1BGb1cyWVNhVUExOHo4IiwibmJmIjoxNDQ0NTMxODYyLCJhdWQiOiJlcWJ1MWdtZ2RpMDZVY0J4ekNkSlpNdTNEeXZfc0xIZyJ9.eMQRy5mJ-rCQoIXZCJRHMOkio7Rhyc1fwYngw16QVbUibHCpc5mbanrTEd-zVcQCog58jsI2pK53IK6JV0lOyJqf9J6NgxQnFPRhKNGOns3xPs9lI0s7hnuzukbG1IQTX3YXhpIUQFUZToJqhkSi1wTPOiCnGDC89n_Jic2TUWv1rKNb18jXsRbS8gfnCx1u4eDcHbhucVxVYDIYQhaBPsUEvC4i3zY57fREIY4L151ZCF-IuCrDYWMQoyi8_hV3tHsYBIMd8aB5iwVlnefena9E4vWgXiB1y7xN0IrmZNigz575mYzBccfye4TcFRv7t5zOvXAUBsKrBHKX-9-k0A',
				'Content-Type' : 'application/json'
			}
		};
		console.log(options);
		var req = https.request(options, function(res) {
			console.log("TESTRideReq got response: " + res.statusCode);
			
			res.on('data', function (chunk) {
				console.log('BODY: ' + chunk);
				//console.log(chunk);
				var rideData = chunk;
				response.write(JSON.stringify(rideData));
			});
		  	res.on('end', function() {
		    	console.log('No more data in response.');
		  	});
			
		}).on('error', function(e) {
	  		console.log("Got error: " + e.message);
		});
		
		var post_data = {
			"product_id" : productId,
			"start_latitude" : startLat,
			"start_longitude" : startLon,
			"end_latitude" : endLat,
			"end_longitude" : endLon,
			scope : 'request'
		};
		
		req.write(JSON.stringify(post_data));
		req.end();
	}
	
	function requestRide(productId)
	{
		//Request Ride
		
		var options = {
			hostname : baseUrl,
			path : rideReqPath, //constructRideReqPath(uberProdId, startLat, startLon, endLat, endLon),
			method: "POST",
			headers : {
				Authorization : 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZXMiOlsicmVxdWVzdCJdLCJzdWIiOiJiOGI3MWE3Zi05MDMzLTRhOTMtOWE5Zi05NjU2MzU5NDViYWIiLCJpc3MiOiJ1YmVyLXVzMSIsImp0aSI6ImJiYjg3OTc0LWM5NjItNDMxYy1iMDJlLWFiZDRhZmM0MTMzYSIsImV4cCI6MTQ0NzEyMzk1MiwiaWF0IjoxNDQ0NTMxOTUyLCJ1YWN0IjoiaWxpd0NMd3hsYWRlTFRyU1BGb1cyWVNhVUExOHo4IiwibmJmIjoxNDQ0NTMxODYyLCJhdWQiOiJlcWJ1MWdtZ2RpMDZVY0J4ekNkSlpNdTNEeXZfc0xIZyJ9.eMQRy5mJ-rCQoIXZCJRHMOkio7Rhyc1fwYngw16QVbUibHCpc5mbanrTEd-zVcQCog58jsI2pK53IK6JV0lOyJqf9J6NgxQnFPRhKNGOns3xPs9lI0s7hnuzukbG1IQTX3YXhpIUQFUZToJqhkSi1wTPOiCnGDC89n_Jic2TUWv1rKNb18jXsRbS8gfnCx1u4eDcHbhucVxVYDIYQhaBPsUEvC4i3zY57fREIY4L151ZCF-IuCrDYWMQoyi8_hV3tHsYBIMd8aB5iwVlnefena9E4vWgXiB1y7xN0IrmZNigz575mYzBccfye4TcFRv7t5zOvXAUBsKrBHKX-9-k0A',
				'Content-Type' : 'application/json'
			}
		};
		
		console.log(options);
		
		var req = https.request(options, function(res) {
			console.log("RideReq got response: " + res.statusCode);
			
			res.on('data', function (chunk) {
				//console.log('BODY: ' + chunk);
				//console.log(chunk);
				var rideData = chunk;
				response.write(JSON.stringify(rideData));
			});
		  	res.on('end', function() {
		    	console.log('No more data in response.');
		  	});
			
		}).on('error', function(e) {
	  		console.log("Got error: " + e.message);
		});
		
		var post_data = {
			"product_id" : productId,
			"start_latitude" : startLat,
			"start_longitude" : startLon,
			"end_latitude" : endLat,
			"end_longitude" : endLon,
			scope : 'request'
		};
		
		console.log ('post_data = ' + JSON.stringify(post_data));
		
		req.write(JSON.stringify(post_data));
		req.end();
	}//End RideReq
	
	//var accessToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZXMiOlsicmVxdWVzdCJdLCJzdWIiOiJiOGI3MWE3Zi05MDMzLTRhOTMtOWE5Zi05NjU2MzU5NDViYWIiLCJpc3MiOiJ1YmVyLXVzMSIsImp0aSI6ImJiYjg3OTc0LWM5NjItNDMxYy1iMDJlLWFiZDRhZmM0MTMzYSIsImV4cCI6MTQ0NzEyMzk1MiwiaWF0IjoxNDQ0NTMxOTUyLCJ1YWN0IjoiaWxpd0NMd3hsYWRlTFRyU1BGb1cyWVNhVUExOHo4IiwibmJmIjoxNDQ0NTMxODYyLCJhdWQiOiJlcWJ1MWdtZ2RpMDZVY0J4ekNkSlpNdTNEeXZfc0xIZyJ9.eMQRy5mJ-rCQoIXZCJRHMOkio7Rhyc1fwYngw16QVbUibHCpc5mbanrTEd-zVcQCog58jsI2pK53IK6JV0lOyJqf9J6NgxQnFPRhKNGOns3xPs9lI0s7hnuzukbG1IQTX3YXhpIUQFUZToJqhkSi1wTPOiCnGDC89n_Jic2TUWv1rKNb18jXsRbS8gfnCx1u4eDcHbhucVxVYDIYQhaBPsUEvC4i3zY57fREIY4L151ZCF-IuCrDYWMQoyi8_hV3tHsYBIMd8aB5iwVlnefena9E4vWgXiB1y7xN0IrmZNigz575mYzBccfye4TcFRv7t5zOvXAUBsKrBHKX-9-k0A";
	
	//var latitude = 37.7759792;
	//var longitude = -122.41823;
	
	//var uberProdId = '04a497f5-380d-47f2-bf1b-ad4cfdcb51f2';
	
	
	//Berkeley     : 37.8711835,-122.2590498,17.74
	//Haas Pavilion: 37.8683763,-122.2625845,16.76
	
	
	
	//Get product
	var productId = '';
	
	var prodOptions = {
		hostname : baseUrl,
		path : constructProductPath(startLat, startLon)
	};
	
	var prodReq = https.request(prodOptions, function(res) {
		console.log("Product got response: " + res.statusCode);
		
		res.on('data', function (chunk) {
			//console.log('BODY: ' + chunk);
			productId = JSON.parse(chunk)['products'][0]['product_id'];
			console.log('id = ' + productId);
			
			//productId = '04a497f5-380d-47f2-bf1b-ad4cfdcb51f2' //TEST
			
			requestRide(productId);
			//testRideReq();
			response.end();
		});
	  	res.on('end', function() {
	    	console.log('No more data in response.');
	  	});
		
	}).on('error', function(e) {
  		console.log("Got error: " + e.message);
	});
	
	prodReq.end();
	
	


};

var mimeTypes = {
	'.html': 'text/html',
	'.htm': 'text/html',
	'.css': 'text/css',
	'.js': 'text/javascript'
};

http.createServer(function(req, res) { //request, response
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  
  var uri = url.parse(req.url);
  console.log(uri);
  res.write('D:<');
  //var filename = path.join(process.cwd(), uri);
  var filename = 'asdf';
  fs.stat(filename, function(err, stat) {
	  if (err == null) {
		  // File exists.
		  console.log('Found file ' + filename);
		  var mime = mimeTypes[path.extname(filename)];
		  res.writeHead(200, mime);
		  fs.createReadStream(filename).pipe(res);
	  } else {
		  console.log('Could not find file ' + filename);
	  }
  });
  
  //console.log(req);
  //console.log(req);
  
  //req["query"];
  
  var startLat = 37.8683763;
  var startLon = -122.2625845;
  var endLat = 37.8711835;
  var endLon = -122.2590498;
  
  var data = getUberAPI(res, startLat, startLon, endLat, endLon);
  
  
  
  //uberAuth(startLat, startLon, endLat, endLon);
  
  res.end();
}).listen(port);