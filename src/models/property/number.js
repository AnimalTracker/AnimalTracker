// Extends from property --

exports.init = function (property, configClass) {
  if(!property.apply)
    return;

  property.apply.forEach((target) => {
    var operations = target.value.split(' ');
    var result = [];

    operations.forEach((op) => {
      if(op == 'x') {
        op = 'number:x';
      }
      else if(op != '+' && op != '-') {
        var ref = configClass.propertyAlias[op];

        if(ref)
          op = ref.type + ':' + ref.name;
        else
          console.error('[schema] In ' + property.name + ', property ' + op + ' in ' + configClass.name + ' does not exists');
      }

      result.push(op);
    });

    target.value = result.join(' ');

    var targetRef = configClass.propertyAlias[target.on];

    if(targetRef)
      target.type = targetRef.type;
    else
      console.error('[schema] In ' + property.name + ', property ' + target.on + ' in ' + configClass.name + ' does not exists');
  });
};

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
    type:         'number',
    label:        label,
    name:         this.name,
    placeholder:  label
  });
};

exports.generateFormOptions = function(options) {
  if(this.apply)
    options.applyOperations.push({
      name: this.name,
      apply: this.apply
    });
};