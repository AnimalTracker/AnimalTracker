
var express = require('express');
var path = require('path');

var app = express();
var route = {
  index: require('./src/routes/index'),
  users: require('./src/routes/users'),
  error: require('./src/routes/error')
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
app.use(route.error);

// Setup modules --
module.database.init(app);
module.server.init(app);

