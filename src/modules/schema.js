// Authentication initialisation --
// Based on Passport : http://passportjs.org/docs
// Based on OrientDB : http://orientdb.com/docs/last/Database-Security.html

var config = require('config');
var crypto = require('crypto');
var merge = require('merge');

var db = require('../modules/database.js');
var schema = config.get('data_schema');

var hash = function(value) {
  return crypto.createHash('sha256').update(value).digest('base64');
};

// -- Methods --

var isNotValid = function() {
  if(!schema.has('Animal')) {
    console.error('[schema] Missing "Animal" class list in config.');
    return true;
  }

  return false;
};

schema.getConfigClasses = function() {
  // Join schema.Animal with schema.Other and schema.User
  return merge(schema.Animal, schema.Other, { User: schema.User });
};

schema.getConfigClass = function(name) {
  if(name === 'User')
    return schema.User;
  else if(schema.Animal.hasOwnProperty(name))
    return schema.Animal[name];
  else if(schema.Other.hasOwnProperty(name))
    return schema.Other[name];
}

schema.forEachConfigClass = function(fn) {
  var list = schema.getConfigClasses();
  for(var m in list)
    if(list.hasOwnProperty(m))
      fn(list[m], m);
};

var init = function() {

  // Check for inconsistencies --
  if(isNotValid())
    return;

  // Prepare the schema --
  schema.forEachConfigClass(function(configClass, configClassName) {

    // Set the name --
    configClass.name = configClassName;

    // Add new methods --
    configClass.forEachProperty = function(fn) {
      var list = configClass.property;
      for(var m in list)
        if(list.hasOwnProperty(m))
          fn(list[m], m);
    };

    configClass.forEachProperty(function(property, propertyName) {

      // Set the name --
      property.name = propertyName;

      // Generate hash on property name --
      property.hash = hash(propertyName);
    });
  });
};

// -- Database creation --

var getPropertyFromType = function(property) {
  switch (property.type) {
    case 'date':
      return 'Date';
    case 'reference':
      return 'Link';
    case 'string':
    case 'password':
    case 'list':
    default:
      return 'String';
  }
};

var createDbClass = function(configClass, name) {
  return db.helper.createClass(name)
    .then(function() {
      var toCreate = [];

      configClass.forEachProperty(function(property) {
        toCreate.push({name: property.name, type: getPropertyFromType(property)});
      });

      return db.helper.createDbProperty(name, toCreate);
    });
};

// -- Module exports --

schema.init  = function(app) {
  init();
};

schema.populateDatabase = function() {
  var promise = db.ready;
  schema.forEachConfigClass(function(configClass) {
    promise = promise.then(function(){
      return createDbClass(configClass, configClass.name);
    });
  });

  return promise;
};

module.exports = schema;
