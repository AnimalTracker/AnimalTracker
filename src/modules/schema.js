// Authentication initialisation --
// Based on Passport : http://passportjs.org/docs
// Based on OrientDB : http://orientdb.com/docs/last/Database-Security.html

var config = require('config');
var crypto = require('crypto');

var db = require('../modules/database.js');
var schema = config.get('data_schema');

var hash = function(value) {
  return crypto.createHash('sha256').update(value).digest('base64');
}

// -- Methods --

schema.getClassList = function() {
  // Join schema.Animal with schema.Other and schema.User
  var result = schema.Animal;
  result.User = schema.User;

  var other = schema.Other;
  for(var m in other) {

    if (!other.hasOwnProperty(m))
      continue;

    result[m] = other[m];
  }

  return result;
};

var isNotValid = function() {
  if(!schema.has('Animal')) {
    console.error('[schema] Missing "Animal" class list.');
    return true;
  }

  return false;
};

var init = function() {

  // Check for inconsistencies --
  if(isNotValid())
    return;

  // Generate hash on property name --
  var list = schema.getClassList();
  for(var m in list) {

    if(!list.hasOwnProperty(m))
      continue;

    var model = list[m];
    var properties = model.property;

    for(var p in properties) {

      if(!properties.hasOwnProperty(p))
        continue;

      var prop = properties[p];
      prop.hash = hash(p);
    }
  }
};

// -- Database creation

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

var createClass = function(model, name) {
  return db.helper.createClass(name)
    .then(function() {
      var properties = model.property,
          toCreate = [];

      for(var p in properties) {
        if(!properties.hasOwnProperty(p))
          continue;

        var prop = properties[p];
        toCreate.push({name: p, type: getPropertyFromType(prop)});
      }
      return db.helper.createProperty(name, toCreate);
    });
};

// -- Module exports --

schema.init  = function(app) {
  init();
};

schema.listClass = function(fn) {
  var list = schema.getClassList();
  for(var m in list) {

    if(!list.hasOwnProperty(m))
      continue;

    fn(list[m], m);
  }
};

schema.populateDatabase = function() {
  var promise = db.ready;
  schema.listClass(function(model, name) {
    promise = promise.then(function(){
      return createClass(model, name);
    });
  });

  return promise;
};

module.exports = schema;
