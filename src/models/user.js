// Data access : User --
// Based on OrientDB : https://www.npmjs.com/package/orientjs
"use strict"

var path = require('path');
var crypto = require('crypto');
var db = require(path.resolve('./src/modules/database'));
var object = require(path.resolve('./src/models/object'));

var hash = function(value) {
  return crypto.createHash('sha256').update(value).digest('base64');
};

// -- Class --

var addMethods = function(obj) {
  obj.test = function(password) {
    return hash(password) === this.password;
  };
};

var Class = function(username, password) {

  this.username = username;
  this.password = password;

  object.helper.addMethodsToObject(this, 'User');
  addMethods(this);
};

var transform = function(user) {
  var objects = object.helper.transformRecordsIntoObjects(user, 'User');
  object.helper.apply(objects, addMethods);
  return objects;
};


// -- Module exports --

exports.class = Class;

exports.createRecords = function(objects) {
  var records = object.helper.transformObjectsIntoRecords(objects, 'User');
  return db.helper.createRecord('User', records);
};

// Find User in OrientDB --

exports.getByUsername = function(username) {
  return db.select().from('User').where({username: username}).one()
    .then(transform);
};

exports.getByRid = function(rid) {
  return db.select().from('User').where({'@rid': rid}).one()
    .then(transform);
};