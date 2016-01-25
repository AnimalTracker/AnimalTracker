// Animal Config Class initialisation --

var helper       = require('../../helpers/misc');

// -- Add members to the animal configClass --

exports.populate = function(animal) {

  var addMethods = function() {
  };

  animal.transform = function(animal) {
    var objects = this.transformRecordsIntoObjects(animal);
    helper.arrayifyFunction(objects, addMethods);
    return objects;
  };
};