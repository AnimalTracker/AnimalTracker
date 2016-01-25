// Extends from property --
var db = require('../../modules/database');

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