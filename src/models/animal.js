// Data access : Animals --
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

var transform = function(animal, type) {
  var objects = object.helper.transformRecordsIntoObjects(animal, type);
  object.helper.apply(objects, addMethods);
  return objects;
};


// -- Module exports --

exports.class = Class;

exports.createRecords = function(objects, type) {
  var records = object.helper.transformObjectsIntoRecords(objects, type);
  return db.helper.createRecord(type, records);
};

// Find animal in OrientDB --

exports.getByRid = function(rid, type) {
  return db.select().from(type).where({'@rid': rid}).one()
    .then(function(animal) {
      return transform(animal, type);
    });
};

exports.getAnimals = function(type) {
  return db.select().from(type).where({active: true}).all()
      .then(function(animal) {
        return transform(animal, type);
      });
};
