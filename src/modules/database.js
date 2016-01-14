// Database initialisation --
// Based on orientjs : https://www.npmjs.com/package/orientjs

var config  = require('config');
var OrientDB = require('orientjs');

var schema = require('../modules/schema');
var helper = {};

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

// -- Notify methods --

helper.notifyClassCreation = function (Class) {
  console.log('[orientjs] Class "' + Class.name + '" created.');
  return Class;
};

helper.notifyPropertiesCreation = function() {
  console.log('[orientjs] Properties created.');
};

helper.notifyRecordsCreation = function() {
  console.log('[orientjs] Records created.');
};

helper.error = function(err) {
  console.log('[orientjs] ' + err);
};

// -- Database creation methods --

var getPropertyFromType = function(property) {
  switch (property.type) {
    case 'date':
      return 'Date';
    case 'reference':
      return 'Link';
    case 'text':
    case 'password':
    case 'list':
    default:
      return 'String';
  }
};


helper.createDbClass = function() {
  return db.class.create.apply(this, arguments).then(helper.notifyClassCreation);
};

helper.createDbClassAndProperties = function(configClass, name) {
  return db.helper.createDbClass(name)
    .then(function() {
      var toCreate = [];

      configClass.forEachProperty(function(property) {
        toCreate.push({name: property.name, type: getPropertyFromType(property)});
      });

      toCreate.push({name: 'active', type: 'Boolean'});

      return db.helper.createDbProperty(name, toCreate);
    });
};

helper.createDbProperty = function(className, arg) {
  return db.class.get(className).then(function(Class) {
    return Class.property.create(arg).then(helper.notifyPropertiesCreation);
  });
};

helper.populateDatabase = function() {
  var promise = db.ready;
  schema.forEachConfigClass(function(configClass) {
    promise = promise.then(function(){
      return helper.createDbClassAndProperties(configClass, configClass.name);
    });
  });

  return promise;
};

// -- Records methods --

helper.createRecord = function(className, arg) {
  return db.class.get(className).then(function(Class) {
    return Class.create(arg).then(helper.notifyRecordsCreation);
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
db.helper = helper;

module.exports = db;
