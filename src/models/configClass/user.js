// User Config Class initialisation --

var helper  = require('../../helpers/misc');
var db      = require('../../modules/database');
var jwt     = require('jwt-simple');
var secret  = require('config').get('secret_token');

// -- Add members to the user configClass --

exports.populate = function(User) {

  // -- DB to View --

  User.specificRecordToObject = function(record, obj, options) {

    // Generic properties/methods --
    User.genericRecordToObject(record, obj, options);

    // Test the password --
    obj.test = function(password) {
      return helper.hash(password) === this.password_hidden;
    };

    // Add the token --
    obj.apitoken = record.apitoken;

    return obj;
  };

  // -- View to DB --

  User.specificObjectToRecord = function(obj, record, options) {

    // Generic properties/methods --
    User.genericObjectToRecord(obj, record, options);

    // Add the token --
    record.apitoken = jwt.encode({ rid: obj.rid }, secret);

    return record;
  };

  // -- Additional Data Access Methods --

  User.getByUsername = function(username) {
    return db.select().from(this.name).where({active: true, username: username}).one()
      .then((item) => {
        return this.transformRecordsIntoObjects(item);
      });
  };
};