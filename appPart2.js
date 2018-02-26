var express = require('express');


var app = require('express')();

var swig = require('swig');
var consolidate = require('consolidate');

app.use(express.static(__dirname + '/public'));

// var engines = require('consolidate');

app.engine('html', consolidate.swig);

// configure Express
app.set('views', __dirname + '/public');
app.set('view engine', 'ejs');


var appKey = "YOUR-CLIENT-ID-KEY-HERE";
var appSecret = "YOUR-CLIENT-SECRET-HERE";

var SpotifyWebApi = require('spotify-web-api-node');

var SpotifyWebApi = require('spotify-web-api-node');

var scopes = ['user-read-private', 'user-read-email','user-library-read'],
    redirectUri = 'http://localhost:8888/callback',
    state = 'YOUR-STATE-HERE';

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
var spotifyApi = new SpotifyWebApi({
  redirectUri : redirectUri,
  clientId : appKey,
  clientSecret : appSecret
});


// Create the authorization URL
var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

console.log(authorizeURL);

app.use(express.static(__dirname + '/public'));


app.get('/', function(req, res){

  res.render('index.html');

});




app.get('/account', function(req, res){
  res.render('account.html');
});

app.listen(8888, function(){
  console.log('listening on *:8888');
});
