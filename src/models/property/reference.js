// Extends from property --
var db = require('../../modules/database');
var sprintf = require("sprintf-js").sprintf;

exports.init = function(property, configClass, schema) {
  property.reference = schema.getConfigClass(property.reference_to);
  if(!property.reference) {
    console.error('[schema] ConfigClass ' + property.reference_to + ' doesn\'t exists');
  }
}

exports.recordToObject = function (record,  obj) {
  obj[this.name] = db.helper.simplifyRid(record[this.name]);
};

exports.objectToRecord = function (obj,  record) {
  record[this.name] = db.helper.unsimplifyAndRecordifyRid(obj[this.name]);
};

exports.reqToRecord = function (body, record) {
  record[this.name] = db.helper.unsimplifyAndRecordifyRid(body[this.name]);
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
    transform: sprintf('(function(row) { var rid=row.%s; return rid ? { href:"/%s/" + rid, label: rid } : null; })',
      this.name, this.reference.path)
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
    name: this.reference.name,
    data: path,
    target: '/api/v1/' + path
  };

  options.references.push(item);
};