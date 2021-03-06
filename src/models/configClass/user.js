// User Config Class initialisation --

var helper  = require('../../helpers/misc');
var db      = require('../../modules/database');
var jwt     = require('jwt-simple');
var Promise = require('bluebird');
var secret  = require('config').get('secret_token');
var _       = require('lodash');

// -- Add members to the user configClass --

exports.populate = function(User) {

  // -- DB to View --

  User.specificRecordToObject = function(record, obj, options) {

    // Generic properties/methods --
    User.genericRecordToObject(record, obj, options);

    // Test the password --
    var password_hidden = obj.password_hidden;
    obj.password_hidden = false;

    obj.test = function(password) {
      return helper.hash(password) === password_hidden;
    };

    // Add the token --
    obj.apitoken = record.apitoken;

    return obj;
  };

  // -- View to DB --

  User.specificObjectToRecord = function(obj, record, options) {

    // Generic properties/methods --
    User.genericObjectToRecord(obj, record, options);

    return record;
  };

  User.specificSelectParams = function() {
    return User.genericSelectParams();
  };

  User.postCreate = function(results) {

    var promises = [];
    for(var record of results) {

      // Add the token --
      var update = {};
      update.apitoken = jwt.encode({ rid: record.rid }, secret);

      promises.push(db.update(this.name).set(update).where({'@rid': record['@rid']}).one()
        .catch(db.helper.onError));
    }

    return Promise.all(promises).then(() => { return results; });
  };

  // -- Additional Data Access Methods --

  User.getByUsername = function(username, options) {
    return db.select().from(this.name).where({active: true, username: username}).one()
      .catch(_.partialRight(db.helper.onError, 'on User.getByUsername'))
      .then((item) => {
        return this.transformRecordsIntoObjects(item, options);
      });
  };

  // -- Rights locals for views --

  User.populateRights = function(req, options) {
    /* Require the following options format:
     * { editBypass: true|false }
     */
    options = options || {};

    // Boolean containing whether each level is reached or not --
    var admin = req.user.role === 'admin';
    var project_manager = admin || req.user.role === 'project_manager' || options.editBypass;
    var viewer = admin || project_manager;

    return {
      admin: admin,
      project_manager: project_manager,
      viewer: viewer,
      rid: req.user.rid,
      username: req.user.username,
      apitoken: req.user.apitoken
    };
  };
};