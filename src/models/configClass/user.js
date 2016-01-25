// User Config Class initialisation --

var helper  = require('../../helpers/misc');
var db      = require('../../modules/database');

// -- Add members to the user configClass --

exports.populate = function(user) {

  var addMethods = function(obj) {
    obj.test = function(password) {
      return helper.hash(password) === this.password_hidden;
    };
  };

  user.transform = function(user) {
    var objects = this.transformRecordsIntoObjects(user);
    helper.arrayifyFunction(objects, addMethods);
    return objects;
  };

  user.getByUsername = function(username) {
    return db.select().from(this.name).where({active: true, username: username}).one()
      .then((item) => {
        return this.transform(item);
      });
  };

};