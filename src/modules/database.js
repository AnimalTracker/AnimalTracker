// Database initialisation --
// Based on orientjs : https://www.npmjs.com/package/orientjs

var config  = require('config');
var OrientDB = require('orientjs');

// -- Fields --

var server = undefined;

// -- Methods --

var getParam = function(id, defaultValue) {
  if(config.has('database') && config.get('database').has(id))
    return config.get('database').get(id);

  console.log('[config] no database.'+ id +' field, fallback to default');
  return defaultValue;
};

// -- Module requirements --

exports.init = function(app) {
  server = OrientDB({
    host:     getParam('host',      'localhost'),
    port:     getParam('port',      2424),
    username: getParam('username',  'root'),
    password: getParam('password',  'yourpassword')
  });

  server.list()
    .then(function (dbs) {
      console.log('[orientdb] There are ' + dbs.length + ' databases on the server.');
    });
};

exports.close = function() {
  server.close();
};