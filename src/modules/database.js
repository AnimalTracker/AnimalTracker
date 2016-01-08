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

// -- Helpers --

var helpers = {};

helpers.notifyClassCreation = function (Class) {
  console.log('[orientjs] Class "' + Class.name + '" created.');
  return Class;
};

helpers.notifyPropertiesCreation = function() {
  console.log('[orientjs] Properties created.');
};

helpers.notifyRecordsCreation = function() {
  console.log('[orientjs] Records created.');
};

helpers.error = function(err) {
  console.log('[orientjs] ' + err);
};

helpers.createClass = function() {
  return db.class.create.apply(this, arguments).then(helpers.notifyClassCreation);
};

helpers.createProperty = function(className, arg) {
  return db.class.get(className).then(function(Class) {
    return Class.property.create(arg).then(helpers.notifyPropertiesCreation);
  });
};

helpers.createRecord = function(className, arg) {
  return db.class.get(className).then(function(Class) {
    return Class.create(arg).then(helpers.notifyRecordsCreation);
  });
};

// -- Check that no one of our variable will override db's ones --

var variables = ["ready", "init", "close", "srv", "helper"];
for(var variable of variables) {
  if(db.hasOwnProperty(variable)) {
    console.error('[app] db.' + variable + ' override in database.js');
  }
}

// -- Test query --

db.ready = server.list()
  .then(function() {
    console.info('[orientjs] Access to server: OK.');
  })
  .then(db.select().from('OUser').all()).then(function () {
    console.info('[orientjs] Access to database: ' + dbname);
  });

// -- Module requirements --

db.init = function(app) {

};

db.close = function() {
  server.close();
  console.info('[orientjs] Connection closed.');
};

db.srv = server;
db.helper = helpers;

module.exports = db;