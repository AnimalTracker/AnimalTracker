// Data access : Others --
// Based on OrientDB : https://www.npmjs.com/package/orientjs
"use strict"

var path = require('path');
var db = require(path.resolve('./src/modules/database'));
var object = require(path.resolve('./src/models/object'));

// -- Class --

var addMethods = function() {
};

var Class = function() {
};

var transform = function(other, type) {
  var objects = object.helper.transformRecordsIntoObjects(other, type);
  object.helper.apply(objects, addMethods);
  return objects;
};


// -- Module exports --

exports.class = Class;

exports.createRecords = function(objects, type) {
  var records = object.helper.transformObjectsIntoRecords(objects, type);
  return db.helper.createRecord(type, records);
};

// Find other in OrientDB --

exports.getByRid = function(rid, type) {
  return db.select().from(type).where({'@rid': rid}).one()
    .then(function(other) {
      return transform(other, type);
    });
};

exports.getOthers = function(type) {
  return db.select().from(type).where({active: true}).all()
      .then(function(other) {
        return transform(other, type);
      });
};
