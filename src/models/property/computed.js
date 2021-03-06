// Extends from property --

// -- Transformation methods --

exports.recordToObject = function (record,  obj) {
  if(this.subtype === 'reverse-reference')
    obj[this.name] = record[this.name];
};

exports.objectToRecord = function () {};

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
  inputs.push({
    type:         'label',
    label:        this.getLabel(req),
    name:         this.name
  });
};

exports.generateFormOptions = function() {};