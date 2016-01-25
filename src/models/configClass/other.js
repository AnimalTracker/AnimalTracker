// Other Config Class initialisation --

var helper        = require('../../helpers/misc');

// -- Add members to the other configClass --

exports.populate = function(other) {

  var addMethods = function() {
  };

  other.transform = function(other) {
    var objects = this.transformRecordsIntoObjects(other);
    helper.arrayifyFunction(objects, addMethods);
    return objects;
  };
};