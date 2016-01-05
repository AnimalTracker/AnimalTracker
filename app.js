
var express = require('express');
var app = express();
var path = require('path');

var routes = require('./src/routes/index');
var users = require('./src/routes/users');

// Setup views --
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'dist')));

// Setup routes --
app.use('/', routes);
app.use('/users', users);

app.use(function(req, res, next) {
  console.error('404: ' + req.url);
  res.status(404).send('Not Found');
});

// Start server --
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

// Live reload --
var livereload = require('livereload');
serverLr = livereload.createServer();
serverLr.watch(__dirname + '/dist');
