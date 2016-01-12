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
  var result = schema.animal;
  return result;
};

var isNotValid = function() {
  if(!schema.has('animal')) {
    console.error('[schema] Missing "animal" class list.');
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

// -- Module requirements --

schema.init  = function(app) {
  init();
};

module.exports = schema;

