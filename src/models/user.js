// Data access : User --
// Based on OrientDB : https://www.npmjs.com/package/orientjs
"use strict"

var path = require('path');
var db = require(path.resolve('./src/modules/database'));

// -- Methods --

var transformObject = function(item) {
  item.password_alt = item.password;
  item.status = 'ACTIVE';
  return item;
};

// -- Class --

var Class = function(name, password) {

  this.name = name;
  this.password = password;

  this.save = function() {
    return exports.createRecords(transformObject({
      name: this.name,
      password: this.password
    }));
  };
};

// -- Module exports --

exports.class = Class;

exports.createRecords = function(records) {
  if(Array.isArray(records))
    records.forEach(transformObject);
  else
    records = transformObject(records);

  return db.helper.createRecord('User', records);
};
