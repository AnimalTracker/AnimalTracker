// Config Class/Property initialisation --
"use strict"

var i18n = require('i18next');
var helper = require('../helpers/misc');
var path = require('path');

// -- Parse property folder --

var testFunction = function(methods, method, type) {
  if(!methods.hasOwnProperty(method)) {
    console.error('[schema] Missing ' + method + ' function in property type ' + type);
    return false;
  }
  return true;
};

var propertyMethods = {};
require('fs').readdirSync(path.resolve('./src/models/property/')).forEach(function(file) {
  var methods = require('./property/' + file);
  var type = file.substring(0,file.length - 3);

  testFunction(methods, 'recordToObject', type);
  testFunction(methods, 'objectToRecord', type);
  testFunction(methods, 'reqToRecord', type);
  testFunction(methods, 'generateFormInputs', type);
  testFunction(methods, 'generateFormOptions', type);

  propertyMethods[type] = methods;
});

// -- Add members to the property --

exports.populate = function(property, configClass, schema) {

  // Add methods --
  property.getLabel = function(req) {
    var ref = req || i18n;
    return ref.t('custom:' + configClass.name + '.property.' + this.name);
  };

  // Generate hash on property name --
  property.hash = helper.hash(property.name);

  // Get methods --

  if(!propertyMethods.hasOwnProperty(property.type)) {
    console.error('[schema] Property type ' + property.type + ' does not exist in the function list');
    return;
  }

  var methods = propertyMethods[property.type];

  // Specific initialisation code --
  if(methods.hasOwnProperty('init'))
    methods.init(property, configClass, schema);

  // Specific transformation code --

  property.recordToObject = methods.recordToObject;
  property.objectToRecord = methods.objectToRecord;
  property.reqToRecord = methods.reqToRecord;
  property.generateFormInputs = methods.generateFormInputs;
  property.generateFormOptions = methods.generateFormOptions;
};