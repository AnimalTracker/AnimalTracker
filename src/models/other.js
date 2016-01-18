// Data access : Others --
// Based on OrientDB : https://www.npmjs.com/package/orientjs
"use strict"

var path = require('path');
var db = require(path.resolve('./src/modules/database'));
var schema = require(path.resolve('./src/modules/schema'));

// -- Class --

var addMethods = function() {
};

var Class = function() {
};

var transform = function(other, configClass) {
  var objects = configClass.transformRecordsIntoObjects(other);
  configClass.apply(objects, addMethods);
  return objects;
};


// -- Module exports --

exports.class = Class;

exports.createRecords = function(objects, configClass) {
  var records = configClass.transformObjectsIntoRecords(objects);
  return configClass.createRecordsInDb(configClass, records);
};

// Find other in OrientDB --

exports.getByRid = function(rid, configClass) {
  return db.select().from(configClass.name).where({'@rid': rid}).one()
    .then(function(other) {
      return transform(other, configClass);
    });
};

exports.getOthers = function(configClass) {
  return db.select().from(configClass.name).where({active: true}).all()
      .then(function(other) {
        return transform(other, configClass);
      });
};
