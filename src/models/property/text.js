// Extends from property --

var _ = require('lodash');

// -- Transformation methods --

exports.recordToObject = function (record,  obj) {
  obj[this.name] = record[this.name];
};

var regex = /<(\d*)>/g;
exports.objectToRecord = function (obj,  record, options) {
  var value = obj[this.name];
  record[this.name] = value === '' ? null : value;

  // Auto numbering system --
  if(value != null) {

    // For each match --
    var match = regex.exec(value);
    while(match) {
      var nb = _.parseInt(match[1]);

      // Modify the current item (remove < & >) --
      record[this.name] = record[this.name].replace(match[0], nb);

      // If autoNumbering is active, increase the number --
      if(options && options.autoNumbering)
        obj[this.name] = obj[this.name].replace(match[0], '<' + (nb+1) + '>');

      match = regex.exec(value);
    }
  }
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
  // Add the Jade def for the input --
  var label = this.getLabel(req)
  inputs.push({
    type:         'text',
    label:        label,
    name:         this.name,
    placeholder:  label
  });
};

exports.generateFormOptions = function(options) {
  if (this.display_only)
    options.displayOnly.push({name: this.name, condition: this.display_only});
};