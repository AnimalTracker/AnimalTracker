
var schema = require('../modules/schema');
var db = require('../modules/database');
var helper = {};
module.exports = helper;

// -- Database creation methods --

helper.notifyClassCreation = function (Class) {
  console.log('[orientjs] Class "' + Class.name + '" created.');
  return Class;
};

helper.notifyPropertiesCreation = function() {
  console.log('[orientjs] Properties created.');
};

helper.getPropertyFromType = function(property) {
  switch (property.type) {
    case 'date':
      return 'Date';
    case 'reference':
      return 'Link';
    case 'text':
    case 'password':
    case 'list':
    default:
      return 'String';
  }
};

helper.createDbClass = function() {
  return db.class.create.apply(this, arguments).then(helper.notifyClassCreation);
};

helper.createDbClassAndProperties = function(configClass, name) {
  return helper.createDbClass(name)
    .then(function() {
      var toCreate = [];

      configClass.forEachProperty(function(property) {
        toCreate.push({name: property.name, type: helper.getPropertyFromType(property)});
      });

      toCreate.push({name: 'active', type: 'Boolean'});

      return helper.createDbProperty(name, toCreate);
    });
};

helper.createDbProperty = function(className, arg) {
  return db.class.get(className).then(function(Class) {
    return Class.property.create(arg).then(helper.notifyPropertiesCreation);
  });
};

helper.populateDatabase = function() {
  var promise = db.ready;
  schema.forEachConfigClass(function(configClass) {
    promise = promise.then(function(){
      return helper.createDbClassAndProperties(configClass, configClass.name);
    });
  });

  return promise;
};