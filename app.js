
var express = require('express');
var path = require('path');

var app = express();
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

  // Secondary modules --
  module.auth = require('./src/modules/auth');
  module.auth.init(app);
  module.view.init(app);

  // Routes --
  app.use('/',        require('./src/routes/index'));
  app.use('/api/v1',  require('./src/routes/api'));
  app.use('/reports', require('./src/routes/report'));
  app.use('/',        require('./src/routes/generic'));

  // Start the server --
  module.server.init(app);
});

// -- System events --

var onExit = function() {
  console.log('[app] Stopping ');
  module.database.close();
};

// Handle PM2 stop signal --
process.on('SIGINT', function() {
  onExit();
  setTimeout(function() { process.exit(0); }, 300);
});
