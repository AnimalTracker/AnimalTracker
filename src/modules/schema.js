// Authentication initialisation --
// Based on Passport : http://passportjs.org/docs
// Based on OrientDB : http://orientdb.com/docs/last/Database-Security.html

var config = require('config');
var crypto = require('crypto');
var i18n = require('i18next');

var db = require('../modules/database.js');
var schema = config.get('data_schema');

var hash = function(value) {
  return crypto.createHash('sha256').update(value).digest('base64');
};

// -- Methods --

var isNotValid = function() {
  if(!schema.has('Animal')) {
    console.error('[schema] Missing "Animal" class list in config.');
    return true;
  }

  return false;
};

schema.getConfigClasses = function() {
  // Join schema.Animal with schema.Other and schema.User
  return schema.Animal.concat(schema.Other).concat([ schema.User ]);
};

schema.getConfigClass = function(name) {
  if(schema.ConfigClassAlias && schema.ConfigClassAlias.hasOwnProperty(name))
    return schema.ConfigClassAlias[name];
  else if(!schema.ConfigClassAlias)
    console.error('[schema] getConfigClass used before initialisation');
  else
    console.error('[schema] There is no '+ name +' config class');
}

schema.forEachConfigClass = function(fn) {
  for(var item of schema.getConfigClasses())
    fn(item);
};

var init = function() {

  // Check for inconsistencies --
  if(isNotValid())
    return;

  // Prepare the schema --
  schema.ConfigClass = [];
  schema.ConfigClassAlias = {};

  schema.forEachConfigClass(function(configClass) {

    // Set the alias --
    console.log(configClass.name);
    schema.ConfigClassAlias[configClass.name] = configClass;
    schema.ConfigClass.push(configClass);

    // Add new methods --
    configClass.forEachProperty = function(fn) {
      for(var m of configClass.property)
        fn(m);
    };
    configClass.propertyAlias = {};

    configClass.forEachProperty(function(property) {

      // Set the alias --
      configClass.propertyAlias[property.name] = property;

      // Generate hash on property name --
      property.hash = hash(property.name);
    });
  });

  console.log(schema);
};


// -- Database creation --

var getPropertyFromType = function(property) {
  switch (property.type) {
    case 'date':
      return 'Date';
    case 'reference':
      return 'Link';
    case 'string':
    case 'password':
    case 'list':
    default:
      return 'String';
  }
};

var createDbClass = function(configClass, name) {
  return db.helper.createClass(name)
    .then(function() {
      var toCreate = [];

      configClass.forEachProperty(function(property) {
        toCreate.push({name: property.name, type: getPropertyFromType(property)});
      });

      return db.helper.createDbProperty(name, toCreate);
    });
};

schema.populateDatabase = function() {
  var promise = db.ready;
  schema.forEachConfigClass(function(configClass) {
    promise = promise.then(function(){
      return createDbClass(configClass, configClass.name);
    });
  });

  return promise;
};

// -- Form Generation --

schema.generateFormInputs = function(configClassName) {
  var inputs = [];

  schema.getConfigClass(configClassName).forEachProperty(function(property) {
    var input = {
      type: 'text',
      label: i18n.t('custom:' + configClassName + '.property.' + property.name)
    };

    switch(property.type)
    {
      case 'list':
        input.type = 'select';
        input.options = [];
        property.list.forEach(function(option) {
          input.options.push({
            text: option.text
          })
        });
        break;
      case 'string':
      default:
        break;
    }

    inputs.push(input);
  });

  return inputs;
};

// -- Module exports --

schema.init  = function(app) {
  init();
};

module.exports = schema;
