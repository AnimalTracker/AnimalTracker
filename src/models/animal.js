// Data access : Animals --
// Based on OrientDB : https://www.npmjs.com/package/orientjs
"use strict"

var path = require('path');
var db = require(path.resolve('./src/modules/database'));

// -- Class --

var addMethods = function() {
};

var Class = function() {
};

var transform = function(animal, configClass) {
  var objects = configClass.transformRecordsIntoObjects(animal);
  configClass.apply(objects, addMethods);
  return objects;
};


// -- Module exports --

exports.class = Class;

exports.createRecords = function(objects, configClass) {
  var records = configClass.transformObjectsIntoRecords(objects);
  return configClass.createRecordsInDb(records);
};

exports.createFromReqBody = function(body, configClass) {
  var records = configClass.populateRecordFromReq({}, body);
  return configClass.createRecordsInDb(records);
};

exports.updateFromReqBody = function(rid, body, configClass) {
  var record = configClass.populateRecordFromReq({}, body);
  return db.update(configClass.name).set(record).where({'@rid': rid}).one();
};

// Find animal in OrientDB --

exports.getByRid = function(rid, configClass) {
  return db.select().from(configClass.name).where({'@rid': rid}).one()
    .then(function(animal) {
      return transform(animal, configClass);
    });
};

exports.getAnimals = function(configClass) {
  return db.select().from(configClass.name).where({active: true}).all()
      .then(function(animal) {
        return transform(animal, configClass);
      });
};

exports.deleteByRid = function(rid, configClass) {
  return db.update(configClass.name).set({active: false}).where({'@rid': rid}).one();
};