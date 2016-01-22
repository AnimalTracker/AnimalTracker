// Data access : Others --
// Based on OrientDB : https://www.npmjs.com/package/orientjs
"use strict"

var path = require('path');
var db = require(path.resolve('./src/modules/database'));
var schema = require(path.resolve('./src/modules/schema'));
var helper = require('../helpers/misc');

// -- Class --

var addMethods = function() {
};

var Class = function() {
};

var transform = function(other, configClass) {
  var objects = configClass.transformRecordsIntoObjects(other);
  helper.arrayifyFunction(objects, addMethods);
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

exports.deleteByRid = function(rid, configClass) {
  return db.update(configClass.name).set({active: false}).where({'@rid': rid}).one();
};
