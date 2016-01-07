
var express = require('express');
var path = require('path');

var app = express();
var route = {
  index: require('./src/routes/index'),
  users: require('./src/routes/users')
};
var module = {
  server:   require('./src/modules/server'),
  database: require('./src/modules/database')
};

// Setup views --
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Setup routes --
app.use('/', route.index);
app.use('/users', route.users);

// 404 Error --
app.use(function(req, res, next) {
  console.error('404: ' + req.url);
  res.status(404).send('Not Found');
});

// Setup modules --
module.database.init(app);
module.server.init(app);

