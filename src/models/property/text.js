// Extends from property --

// -- Transformation methods --

exports.recordToObject = function (record,  obj) {
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