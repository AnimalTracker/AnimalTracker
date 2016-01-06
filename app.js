
var express = require('express');
var path = require('path');

var config = require('./src/config/controller');
var app = express();

// Setup views --
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Setup routes --
app.use('/',      require('./src/routes/index'));
app.use('/users', require('./src/routes/users'));

app.use(function(req, res, next) {
  console.error('404: ' + req.url);
  res.status(404).send('Not Found');
});

// Apply config (src/config/controller.js) --
config.apply(app);

// Start server --
var server = app.listen(config.getPort(), function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('[app] GeneTracker listening at http://%s:%s', host, port);
});
