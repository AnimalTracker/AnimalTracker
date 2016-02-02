// Config Class initialisation --

var i18n          = require('i18next');
var helper        = require('../helpers/misc');
var propertyModel = require('./property');

// -- Add members to the configClass --

exports.populate = function(configClass, schema) {

  // -- Attributes --
  configClass.propertyAlias = {};
  configClass.labelPath = 'custom:'+ configClass.name +'.name';

  // -- Primary Methods --
  configClass.forEachProperty = function(fn) {
    for(var m of this.property)
      fn(m);
  };

  // Add Property members/methods --
  configClass.forEachProperty(function(property) {
    // Set the alias --
    configClass.propertyAlias[property.name] = property;
  });
  configClass.forEachProperty(function(property) {
    propertyModel.populate(property, configClass, schema);
  });

  // -- Secondary Methods --

  configClass.getLabel = function(req, options) {
    var ref = req || i18n;
    return ref.t(this.labelPath, options);
  };

  configClass.getLabelPlural = function(req, options) {
    var ref = req || i18n;
    return ref.t(this.labelPath + '_plural', options);
  };

  // -- Transformation Methods --

  configClass.transformRecordsIntoObjects = function(records, options) {
    return helper.arrayifyFunction(records, (record) => {
      return this.specificRecordToObject(record, {}, options);
    });
  };

  configClass.transformObjectsIntoRecords = function(objects, options) {
    return helper.arrayifyFunction(objects, (obj) => {
      return this.specificObjectToRecord(obj, {}, options);
    });
  };


};