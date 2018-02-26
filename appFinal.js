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


var appKey = "YOUR-CLIENT-ID-HERE";
var appSecret = "YOUR-CLIENT-SECRET-HERE";

var SpotifyWebApi = require('spotify-web-api-node');

// var SpotifyWebApi = require('spotify-web-api-node');

var scopes = ['user-read-private', 'user-read-email','user-library-read'],
    redirectUri = 'http://localhost:8888/callback',
    state = 'aaa';

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
var spotifyApi = new SpotifyWebApi({
  redirectUri : redirectUri,
  clientId : appKey,
  clientSecret : appSecret
});


// Create the authorization URL
var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

console.log(authorizeURL);


app.get('/', function(req, res){

  res.render('index.html');

});

app.get('/auth/spotify',function(req, res){
  console.log("going to authorizeURL");
  res.redirect(authorizeURL);
});


/* Handle authorization callback from Spotify */
app.get('/callback', function(req, res) {

  var code  = req.query.code;

  /* Get the access token! */
  spotifyApi.authorizationCodeGrant(code)
    .then(function(data) {

      console.log('The token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);
      console.log('The refresh token is ' + data.body['scope']);

      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);

      /* Redirecting back */
      res.redirect('/account');

    }, function(err) {
      res.status(err.code);
      res.send(err.message);
    }
  );
});



app.get('/account', function(req, res){

  spotifyApi.getMe()
    .then(function(dataAboutMe) {
      console.log('Some information about the authenticated user', dataAboutMe.body);

      // Get albums in the signed in user's Your Music library
      spotifyApi.getMySavedAlbums({
          limit : 1,
          offset: 0
        })
        .then(function(data) {
          // Output items
          console.log(data.body.items);
          res.render('account.html',{user: dataAboutMe.body, items: data.body.items});

        }, function(err) {
          console.log('Something went wrong!', err);
        });



    }, function(err) {
      console.log('Something went wrong!', err);
    });


});

app.listen(8888, function(){
  console.log('listening on *:8888');
});
