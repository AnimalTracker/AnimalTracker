
var express = require('express');
var path = require('path');

var app = express();
var route = {
  index: require('./src/routes/index'),
  users: require('./src/routes/users')
};
var module = {
  server:   require('./src/modules/server'),
  database: require('./src/modules/database'),
  auth: require('./src/modules/auth')
};

// -- Views --

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// -- Early modules --

module.database.init(app);
module.auth.init(app);

// -- Routes --

app.use('/', route.index);
app.use('/users', route.users);

// -- Modules --

module.server.init(app);

// -- System events --

process.on('exit', function(code) {
  module.database.close();
});