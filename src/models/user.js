// Data access : User --
// Based on OrientDB : https://www.npmjs.com/package/orientjs

var path = require('path');
var db = require(path.resolve('./src/modules/database'));

// Module methods --

exports.createClass = function() {
  return db.helper.createClass('User', 'OUser');
};

exports.createProperties = function() {
  return db.helper.createProperty('User', [{
    name: 'password_alt',
    type: 'String'
  }, {
    name: 'display_name',
    type: 'String'
  }]);
};

exports.createRecords = function(records) {
  records.forEach(function(item) {
    item.password_alt = item.password;
    item.status = 'ACTIVE';
  });

  return db.helper.createRecord('User', records);
};





