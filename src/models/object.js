// Data access : Object base --
// Based on OrientDB : https://www.npmjs.com/package/orientjs
"use strict"

var path    = require('path');
var crypto  = require('crypto');
var db      = require(path.resolve('./src/modules/database'));
var schema  = require(path.resolve('./src/modules/schema'));
var helper  = {};

var password = function(value) {
  return crypto.createHash('sha256').update(value).digest('base64');
};

// -- Methods --

helper.populateObject = function(obj, record, configClassName) {

  var configClass = schema.getConfigClass(configClassName);

  configClass.forEachProperty(function(property) {
    switch(property.type)
    {
      case 'string':
        obj[property.name] = record[property.name];
        break;
      case 'password':
        obj[property.name] = record[property.name];
        break;
      case 'date':
        obj[property.name] = record[property.name];
        break;
      case 'list':
        obj[property.name] = '';
        break;
      case 'reference':
        obj[property.name] = '';
        break;
      default:
        obj[property.name] = record[property.name];
        break;
    }
  });

  // Other properties --
  obj.rid = record['@rid'];

  return obj;
};

helper.populateRecord = function(record, obj, configClassName) {

  var configClass = schema.getConfigClass(configClassName);

  configClass.forEachProperty(function(property) {
    switch(property.type)
    {
      case 'string':
        record[property.name] = obj[property.name];
        break;
      case 'password':
        record[property.name] = password(obj[property.name]);
        break;
      case 'date':
        record[property.name] = obj[property.name];
        break;
      case 'list':
        record[property.name] = '';
        break;
      case 'reference':
        record[property.name] = '';
        break;
      default:
        record[property.name] = obj[property.name];
        break;
    }
  });

  return record;
};

helper.addMethodsToObject = function(obj, configClassName) {

  obj.save = function() {
    var record = {};
    helper.populateRecord(record, this, configClassName);
    db.helper.createRecord(configClassName, this);
  };

};

helper.constructObjectFromRecord = function(obj, record, configClassName) {
  helper.populateObject(obj, record, configClassName);
  helper.addMethodsToObject(obj, configClassName);
  return obj;
};

helper.transformRecordsIntoObjects = function(records, configClassName) {

  if(Array.isArray(records)) {
    var list = [];

    records.forEach(function(record) {
      list.push(helper.constructObjectFromRecord({}, record, configClassName));
    });

    return list;
  }
  else if(records) {
    return helper.constructObjectFromRecord({}, records, configClassName);
  }
  else {
    return null;
  }
};

helper.transformObjectsIntoRecords = function(objects, configClassName) {

  if(Array.isArray(objects)) {
    var list = [];

    objects.forEach(function(object) {
      list.push(helper.populateRecord({}, object, configClassName));
    });

    return list;
  }
  else if(objects) {
    return helper.populateRecord({}, objects, configClassName);
  }
  else {
    return null;
  }
};

helper.apply = function(objects, fn) {
  if(Array.isArray(objects)) {
    objects.forEach(function(object) {
      fn(object);
    });

    return objects;
  }
  else if(objects) {
    return fn(objects);
  }
  else {
    return null;
  }
};

// -- Module exports --

exports.helper = helper;
