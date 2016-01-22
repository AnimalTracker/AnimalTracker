// Extends from property --

exports.recordToObject = function (record,  obj) {
  obj[this.name] = record[this.name];
};

exports.objectToRecord = function (obj,  record) {
  record[this.name] = obj[this.name] === '' ? null : obj[this.name];
};

exports.reqToRecord = function (body, record) {
  record[this.name] = body[this.name] === '' ? null : body[this.name];
};

exports.generateFormInputs = function(inputs, req) {
  var label = this.getLabel(req)
  inputs.push({
    type:         'text',
    label:        label,
    name:         this.name,
    placeholder:  label
  });
};