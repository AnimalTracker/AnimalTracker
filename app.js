
var express = require('express');
var path = require('path');

var app = express();
var route = {
  index:    require('./src/routes/index'),
  users:    require('./src/routes/users'),
  api:      require('./src/routes/api')
};
var module = {
  server:   require('./src/modules/server'),
  database: require('./src/modules/database'),
  auth:     require('./src/modules/auth'),
  i18n:     require('./src/modules/i18n')
};

// -- Views --

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// -- Early modules --

module.database.init(app);
module.auth.init(app);
module.i18n.init(app);

// -- Routes --

app.use('/', route.index);
app.use('/user', route.users);
app.use('/api/v1', route.api);

// -- Modules --

module.server.init(app);

// -- System events --

process.on('exit', function(code) {
  module.database.close();
});