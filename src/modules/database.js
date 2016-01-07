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
  password: getParam('password',  'yourpassword'),
  enableRIDBags: false
});

var dbname = getParam('dbname',  'genetracker');
var db = server.use(dbname);

// -- Module requirements --

db.init = function(app) {

};

db.close = function() {
  server.close();
};

db.server = server;

module.exports = db;