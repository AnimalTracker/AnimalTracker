
var express = require('express');
var path = require('path');

var app = express();
var route = {
  index:    require('./src/routes/index'),
  users:    require('./src/routes/users'),
  animals:  require('./src/routes/animals'),
  others:   require('./src/routes/others'),
  api:      require('./src/routes/api')
};
var module = {
  server:   require('./src/modules/server'),
  database: require('./src/modules/database'),
  schema:   require('./src/modules/schema'),
  view:     require('./src/modules/view'),
  auth:     require('./src/modules/auth'),
  i18n:     require('./src/modules/i18n')
};

// -- Views --

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// -- Early modules --

module.i18n.init(app);
module.database.init(app);
module.schema.init(app);
module.view.init(app);
module.auth.init(app);

// -- Routes --

app.use('/',        route.index);
app.use('/users',   route.users);
app.use('/animals', route.animals);
app.use('/others',  route.others);
app.use('/api/v1',  route.api);

// -- Modules --

module.server.init(app);

// -- System events --

process.on('exit', function(code) {
  module.database.close();
});