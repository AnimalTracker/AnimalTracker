
var helper  = require('../../helpers/misc');

exports.recordToObject = function (record,  obj) {
  obj[this.name + '_hidden'] = record[this.name];
};

exports.objectToRecord = function (obj,  record) {
  record[this.name] = helper.hash(obj[this.name]);
};

exports.reqToRecord = function (body, record) {
  if(body[this.name] && body[this.name] != '')
    record[this.name] = helper.hash(body[this.name]);
};

exports.generateFormInputs = function(inputs, req) {
  var label = this.getLabel(req)
  inputs.push({
    type:         'password',
    label:        label,
    name:         this.name,
    placeholder:  label
  });
};