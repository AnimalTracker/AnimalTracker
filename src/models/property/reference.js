// Extends from property --
var db = require('../../modules/database');
var sprintf = require("sprintf-js").sprintf;

exports.init = function(property, configClass, schema) {
  property.reference = schema.getConfigClass(property.reference_to);
  if(!property.reference) {
    console.error('[schema] ConfigClass ' + property.reference_to + ' doesn\'t exists');
  }

  // Store reference into the configClass --
  if(!configClass.references)
    configClass.references = [];

  configClass.references.push({
    name: property.name
  });

  if(!this.property_to_display)
    return;
  else if(!Array.isArray(this.property_to_display))
    console.error('[schema] Property.property_to_display must be an array in ' +
      configClass.name + '.' + property.name);
}

exports.recordToObject = function (record,  obj) {
  obj[this.name] = db.helper.simplifyRid(record[this.name]);
  obj[this.name + '_label'] = obj[this.name];

  // Build the label --
  if(!this.property_to_display)
    return;

  var label = [];

  this.property_to_display.forEach((prop) => {
    var value = record[this.name + prop];
    if(value)
      label.push(value);
  });

  obj[this.name + '_label'] = label.join(' - ');
};

exports.objectToRecord = function (obj,  record) {
  record[this.name] = db.helper.unsimplifyAndRecordifyRid(obj[this.name]);
};

// Datatable JS options --

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
    data: this.name,
    type: 'reference',
    transform: sprintf('(function(row) { var rid=row.%s; return rid ? { href:"/%s/" + rid, label: row.%s_label } : null; })',
      this.name, this.reference.path, this.name)
  });
};

// Form JS options --

exports.generateFormInputs = function(inputs, req) {
  var label = this.getLabel(req)
  inputs.push({
    type:   'reference',
    label:  label,
    name:   this.name,
    id:     this.reference_to
  });
};

exports.generateFormOptions = function(options) {
  var path = this.reference.path;
  var item = {
    name: this.name,
    reference: this.reference.name,
    data: path,
    target: '/api/v1/' + path,
    property_to_display: this.property_to_display
  };

  options.references.push(item);
};