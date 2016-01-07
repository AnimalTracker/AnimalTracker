// Database initialisation --
// Based on orientjs : https://www.npmjs.com/package/orientjs

var config  = require('config');
var OrientDB = require('orientjs');

// -- Methods --

var getParam = function(id, defaultValue) {
  if(config.has('database') && config.get('database').has(id))
    return config.get('database').get(id);

  console.log('[config] no database.'+ id +' field, fallback to default');
  return defaultValue;
};

// -- Fields --

var server = OrientDB({
  host:     getParam('host',      'localhost'),
  port:     getParam('port',      2424),
  username: getParam('username',  'root'),
  password: getParam('password',  'yourpassword')
});

// -- Module requirements --

server.init = function(app) {

};

server.close = function() {
  server.close();
};

module.exports = server;