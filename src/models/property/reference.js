// Extends from property --
var db = require('../../modules/database');

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