// Extends from property --
var i18n = require('i18next');

exports.init = function (property, configClass) {
  property.forEachOption = function(fn) {
    for(var m of this.list)
      fn(m);
  };

  // Populate options --
  property.optionAlias = {};
  property.forEachOption(function(option) {

    property.optionAlias[option.id] = option;

    option.getLabel = function(req) {
      var ref = req || i18n;
      return ref.t('custom:' + configClass.name + '.option.' + property.name + '.' + option.id);
    };
  });

  property.getOptionLabel = function(optionName, req) {
    if(this.optionAlias.hasOwnProperty(optionName)) {
      return this.optionAlias[optionName].getLabel(req);
    }
    return "No label";
  };
};

// -- Transformation methods --

exports.recordToObject = function (record,  obj, options) {
  obj[this.name + '_label'] = this.getOptionLabel(record[this.name], options.req);
  obj[this.name] = record[this.name];
};

exports.objectToRecord = function (obj,  record) {
  record[this.name] = obj[this.name] === '' ? null : obj[this.name];
};

// -- Datatable methods --

exports.generateDTLocals = function(columns, req) {
  // Add the column --
  columns.push({
    name: this.name,
    label: this.getLabel(req)
  });
};

exports.generateDTOptions = function(options) {
  // Add the js def for the column --
  options.push({
    targets: this.name,
    data: this.name + '_label'
  });
};

// -- Form methods --

exports.generateFormInputs = function(inputs, req) {
  var input = {
    type:     'select',
    label:    this.getLabel(req),
    name:     this.name,
    options:  []
  };

  this.forEachOption(function(option) {
    input.options.push({
      value: option.id,
      text: option.getLabel(req)
    });
  });

  inputs.push(input);
};

exports.generateFormOptions = function() {};