
var express = require('express');
var path = require('path');

var app = express();
var route = {
  index:    require('./src/routes/index'),
  generic:  require('./src/routes/generic'),
  api:      require('./src/routes/api')
};
var module = {
  server:   require('./src/modules/server'),
  database: require('./src/modules/database'),
  schema:   require('./src/modules/schema'),
  view:     require('./src/modules/view'),
  i18n:     require('./src/modules/i18n')
};

// -- Views --

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// -- Early modules --

module.i18n.init(app);
module.database.init(app);
module.schema.init(app);
module.schema.ready.then(function() {

  module.auth = require('./src/modules/auth');
  module.auth.init(app);
  module.view.init(app);

  // -- Routes --

  app.use('/',        route.index);
  app.use('/api/v1',  route.api);
  app.use('/',        route.generic);

  // -- Modules --

  module.server.init(app);

});

// -- System events --

process.on('exit', function() {
  module.database.close();
});