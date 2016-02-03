
var helper  = require('../../helpers/misc');

// -- Transformation methods --

exports.recordToObject = function (record,  obj) {
  obj[this.name + '_hidden'] = record[this.name];
};

exports.objectToRecord = function (obj,  record) {
  if(obj[this.name] && obj[this.name].length > 0)
    record[this.name] = helper.hash(obj[this.name]);
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
    data: this.name
  });
};

// -- Form methods --

exports.generateFormInputs = function(inputs, req) {
  var label = this.getLabel(req)
  inputs.push({
    type:         'password',
    label:        label,
    name:         this.name,
    placeholder:  label
  });
};

exports.generateFormOptions = function() {};