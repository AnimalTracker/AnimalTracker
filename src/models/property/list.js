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

exports.recordToObject = function (record,  obj, req) {
  obj[this.name + '_label'] = this.getOptionLabel(record[this.name], req);
  obj[this.name] = record[this.name];
};

exports.objectToRecord = function (obj,  record) {
  record[this.name] = obj[this.name] === '' ? null : obj[this.name];
};

exports.reqToRecord = function (body, record) {
  record[this.name] = body[this.name] === '' ? null : body[this.name];
};

exports.generateFormInputs = function(inputs, req) {
  var input = {
    type:     'select',
    label:    this.getLabel(req),
    name:     this.name,
    options:  []
  };

  if(this.allow_empty) {
    input.options.push({
      value: '',
      text: ''
    });
  }

  this.forEachOption(function(option) {
    input.options.push({
      value: option.id,
      text: option.getLabel(req)
    });
  });

  inputs.push(input);
};