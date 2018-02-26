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


app.get('/', function(req, res){

  res.render('index.html');

});




app.get('/account', function(req, res){
  res.render('account.html');
});

app.listen(8888, function(){
  console.log('listening on *:8888');
});
