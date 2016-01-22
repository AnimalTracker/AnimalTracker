// Config Class/Property initialisation --

var i18n    = require('i18next');
var helper  = require('../helpers/misc');

// -- Helpers methods --

var populateOption = function(option, property, configClass) {

  property.optionAlias[option.id] = option;

  option.getLabel = function(req) {
    var ref = req || i18n;
    return ref.t('custom:' + configClass.name + '.option.' + property.name + '.' + option.id);
  };
};

// -- Add members to the property --

exports.populate = function(property, configClass) {

  // Add methods --
  property.getLabel = function(req) {
    var ref = req || i18n;
    return ref.t('custom:' + configClass.name + '.property.' + this.name);
  };

  if(property.type === 'list') {
    property.forEachOption = function(fn) {
      for(var m of this.list)
        fn(m);
    };

    property.optionAlias = {};
    property.forEachOption(function(option) {
      populateOption(option, property, configClass);
    });

    property.getOptionLabel = function(optionName, req) {
      if(property.optionAlias.hasOwnProperty(optionName)) {
        return property.optionAlias[optionName].getLabel(req);
      }
      return "No label";
    }
  }

  // Generate hash on property name --
  property.hash = helper.hash(property.name);
};