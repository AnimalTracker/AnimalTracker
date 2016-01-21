// Data access : User --
// Based on OrientDB : https://www.npmjs.com/package/orientjs
"use strict"

var path = require('path');
var crypto = require('crypto');
var db = require(path.resolve('./src/modules/database'));
var schema = require(path.resolve('./src/modules/schema'));
var User = schema.User;

var hash = function(value) {
  return crypto.createHash('sha256').update(value).digest('base64');
};

// -- Class --

var addMethods = function(obj) {
  obj.test = function(password) {
    return hash(password) === this.password_hidden;
  };
};

var Class = function(username, password) {

  this.username = username;
  this.password = password;

  User.addMethodsToObject(this);
  addMethods(this);
};

var transform = function(user) {
  var objects = User.transformRecordsIntoObjects(user);
  User.apply(objects, addMethods);
  return objects;
};

// -- Module exports --

exports.class = Class;

exports.createRecords = function(objects) {
  var records = User.transformObjectsIntoRecords(objects);
  return User.createRecordsInDb(records);
};

exports.createFromReqBody = function(body, configClass) {
  var records = configClass.populateRecordFromReq({}, body);
  return configClass.createRecordsInDb(records);
};

exports.updateFromReqBody = function(rid, body, configClass) {
  var record = configClass.populateRecordFromReq({}, body);
  return db.update(configClass.name).set(record).where({'@rid': rid}).one();
};


// Find User in OrientDB --

exports.getByUsername = function(username) {
  return db.select().from('User').where({active: true, username: username}).one()
    .then(transform);
};

exports.getByRid = function(rid) {
  return db.select().from('User').where({'@rid': rid}).one()
    .then(transform);
};

exports.getUsers = function() {
  return db.select().from('User').where({active: true}).all()
      .then(transform);
};

exports.deleteByRid = function(rid) {
  return db.update('User').set({active: false}).where({'@rid': rid}).one();
};
