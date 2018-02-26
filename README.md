# SpotifyAPI-Walkthrough

Walkthrough to help with the troubles I came across using: 

[This repo](https://github.com/thelinmichael/spotify-web-api-node) about [this npm package](https://www.npmjs.com/package/spotify-web-api-node)

## Basics

First, we are starting with the simple [app.js](https://github.com/njw275/SpotifyAPI-Walkthrough/blob/master/app.js) file.
This application is run using Node.js 

In our application, we are using express, swig, and consolidate. These are already in the app.js file, but in order to use them we must install them in terminal first. 

> $ npm install consolidate
> $ npm install swig

Note: Right now, this does not matter but later on it will be an important note. We are setting the view engine to ejs which stands for embedded javaScript. We are using this instead of html so that later we can populate our pages with data collected from the Spotify API. 


We have 2 pages for the application at the start, namely: [oldi](https://github.com/njw275/SpotifyAPI-Walkthrough/blob/master/public/oldi.html) and [account](https://github.com/njw275/SpotifyAPI-Walkthrough/blob/master/public/account.html) found in the public folder 

And finally the app is listening on 8888.

So, when we run the application through terminal:

> $ node app.js 

we get the original home page or oldi.html page:

![image of original oldi.html page when node is run on terminal](https://github.com/njw275/SpotifyAPI-Walkthrough/blob/master/images/originalHomePage.png)

Now that we have a simple node app running, we need to create a spotify application from the [Developer's Page](https://beta.developer.spotify.com/dashboard/login).

## Adding the Spotify API 

From here, you need to log in and create an app. Once you have given the app a name and created it, you will see the applications page.

![Picture of applications page on Spotify](https://github.com/njw275/SpotifyAPI-Walkthrough/blob/master/images/clickForSecret.png)
In the picture above, click show Client Secret and you will see both you Client ID and Client Secret:

![Picture of applications page with Client ID and Client Secret](https://github.com/njw275/SpotifyAPI-Walkthrough/blob/master/images/showSecret.png)
The Client ID and Client Secret are blocked out because you want to keep these secret, but you will need to record these values and put them as variables in your app.js file.

> var appKey = "YOUR-CLIENT-ID-KEY-HERE";
> var appSecret = "YOUR-CLIENT-SECRET-HERE";

After this, we will add the npm-api that we are using to connect with Spotify to the same app.js file. Also, we will be creating variables for scopes, redirectUri, clientId, and state:

scopes: List to specify what data your application wants to access (Here we are going to use read private and read email for access to the user's information and library read for access to the user's saved tracks. There are plenty more scopes as you can see at Spotify's [Using Scopes Page](https://developer.spotify.com/web-api/using-scopes/)
redirectUri: where we want to redirect the user when they are verified (for now we will have it as localhost:8888/callback)
clientId: already have it - its the appKey variable we made above
state: "Optional, but strongly recommended. The state can be useful for correlating requests and responses. Because your redirect_uri can be guessed, using a state value can increase your assurance that an incoming connection is the result of an authentication request. If you generate a random string or encode the hash of some client state (e.g., a cookie) in this state variable, you can validate the response to additionally ensure that the request and response originated in the same browser. This provides protection against attacks such as cross-site request forgery." - Spotify's [definition](https://developer.spotify.com/web-api/authorization-guide/)

> var SpotifyWebApi = require('spotify-web-api-node');
> var scopes = ['user-read-private', 'user-read-email','user-library-read'],
>   redirectUri = 'http://localhost:8888/callback',
>   clientId = appKey,
>   state = 'YOUR-STATE-HERE';

Next, we need to create a new SpotifyWebApi object to be able to interact with the web API itself. Here, the var is created with credentials from above, namely the redirectUri, clientId, and clientSecret:

> var spotifyApi = new SpotifyWebApi({
>   redirectUri : redirectUri,
>   clientId : appKey,
>   clientSecret : appSecret
> });

Then, we create the authorization URL (where the user gets sent to, so that our app can verify them) and we console log this url just so we can see its working:

> var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
> console.log(authorizeURL);

Okay, so lets stop here for a minute and test what we have. Looking specifically at running appPart2.js (the node app with everything we have done so far) We should have the same home page as before when we run the application, but what should be new to us is a logged statement on the terminal of a URL.

## Working with Spotify's Callback URL 

First, we need to do something with this URL. When are we going to go to this URL? The answer to that is whenever we need to authorize them. So, to start we are going to make a new route for the app to go authorize the user:

> app.get('/auth/spotify',function(req, res){
>   res.redirect(authorizeURL);
> });

Above, when the user goes to the route '/auth/spotify' we will redirect them to the URL we made early with our keys and scopes. Now, how will we get the user to get to this route? We need to make a log in button for the user! Lets add one to our home page, in index.html

> <a href='/auth/spotify'>Click Here to Log In to Spotify!</a>

Next, is most likely the **most** important part of creating this web app. We need to create a route for the callback from Spotify. This route is called after the user goes to the authorization url. In app.js:

> app.get('/callback', function(req, res) {
> });

In this route, we will need to get the authorization code from Spotify:

> var code  = req.query.code;

With this code, we can use the method authorizationCodeGrant from the Spotify API we are using: 

> spotifyApi.authorizationCodeGrant(code)
>    .then(function(data) {
>
>      console.log('The token expires in ' + data.body['expires_in']);
>      console.log('The access token is ' + data.body['access_token']);
>      console.log('The refresh token is ' + data.body['scope']);
>
>      spotifyApi.setAccessToken(data.body['access_token']);
>      spotifyApi.setRefreshToken(data.body['refresh_token']);
>
>      /* Redirecting back */
>      res.redirect('/account');
>
>    }, function(err) {
>      res.status(err.code);
>      res.send(err.message);
>    }
>  );

Above, we are using the code to retreive an Access Token. We need this token for any queries we are going to do. At the end of this method, we are going to redirect the user to the account page. 

See all of what we have done so far in: appPart3.js | index.html | account.html 

![Photo of account page redirect](https://github.com/njw275/SpotifyAPI-Walkthrough/blob/master/images/blankAccountsPage.png)

In the photo above is the blank information account page. We have successfully made an authorization and had the user log in! Now lets populate the account page with data!

## Using the API to make Queries & Display the retrieved data

Now, its time to look over the [Spotify Web API Documentation](https://www.npmjs.com/package/spotify-web-api-node). In this documentation, you can find the queries that you want to use for your own specific site. In this example we will be using: 

* spotifyApi.getMe()
* spotifyApi.getMySavedAlbums()

Note: Remember! Different queries require different scopes! Visit: https://developer.spotify.com/web-api/endpoint-reference/ , click on the endpoint/query you want to use, click on the "Try It" button, and finally click on the "Get OAuth Token". In the popup, you will see which specific scopes you will need to use this endpoint. 

For example, getMe and getMySavedAlbums require the following scopes:

* user-read-private
* user-read-birthdate (if we want their birthday) 
* user-read-email
* user-library-read

As you can see, with these two methods we are good to go because these are the scopes we set before!

So, lets get to implementing the methods! 

>  spotifyApi.getMe()
>    .then(function(dataAboutMe) {
>      console.log('Some information about the authenticated user', dataAboutMe.body);
>
>      // Get albums in the signed in user's Your Music library
>      spotifyApi.getMySavedAlbums({
>          limit : 1,
>          offset: 0
>        })
>        .then(function(data) {
>          // Output items
>          console.log(data.body.items);
>          res.render('account.html',{user: dataAboutMe.body, items: data.body.items});
>
>        }, function(err) {
>          console.log('Something went wrong!', err);
>        });
>
>
>
>    }, function(err) {
>      console.log('Something went wrong!', err);
>    });

Above, we are implementing the getMySavedAlbums method nested inside the getMe method. With both of these methods called, we are going to now put the data we receive back onto the accounts page. This is where the embedded js comes into play. When we render account.html we are also sending two objects: 1. user (the information back from getMe and 2. items (the information back from getMySavedAlbums)

In accounts.html we need to accommodate for this data coming into the page. We need to change:

> <p>ID:</p>
> <p>One Saved Album:</p>
    
to look like: 

> <p>ID: {{user.id}}</p>
> <p>One Saved Album: {{items[0].album.name}}</p>

The {{ }} is the embedded js. Here we are simply taking the user's id (from getMe) and the name of the album (from getMySavedAlbums)

Note: the name before the . in the embedded js is what we sent over from the app.js. The information after the . such as "id" or "album.name" comes from the data itself. Its a good idea to keep those console.log(data) statements in at first so you can see what all is returned in the terminal. That way you can see which variables that are returned you want to use to populate your account page.

Now, when we run the final product: 

appFinal.js | account.html | index.html

we can see that data is populating the account page!







