// Schema initialisation --

var config = require('config');
var crypto = require('crypto');
var i18n = require('i18next');

var schema = config.get('data_schema');

// -- Internal Methods --

var isNotValid = function() {
  if(!schema.has('Animal')) {
    console.error('[schema] Missing "Animal" class list in config.');
    return true;
  }

  return false;
};

var hash = function(value) {
  return crypto.createHash('sha256').update(value).digest('base64');
};

// -- Init Methods --

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

    // Add new members --
    configClass.propertyAlias = {};

    configClass.forEachProperty = function(fn) {
      for(var m of configClass.property)
        fn(m);
    };

    configClass.getLabel = function(req) {
      var ref = req || i18n;
      return ref.t('custom:'+ this.name +'.name');
    };

    configClass.forEachProperty(function(property) {

      // Set the alias --
      configClass.propertyAlias[property.name] = property;

      // Add methods --
      property.getLabel = function(req) {
        var ref = req || i18n;
        return ref.t('custom:' + configClass.name + '.property.' + this.name);
      };

      // Generate hash on property name --
      property.hash = hash(property.name);
    });
  });

  console.log(schema);
};

// -- Access Methods --

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
};

schema.getConfigClassByPath = function(path) {
  for(var item of schema.getConfigClasses())
    if(item.path === path)
      return item;
};

// -- For Each Methods --

schema.forEachConfigClass = function(fn) {
  for(var item of schema.getConfigClasses())
    fn(item);
};

schema.forEachAnimalClass = function(fn) {
  for(var item of schema.Animal)
    fn(item);
};

schema.forEachOtherClass = function(fn) {
  for(var item of schema.Other)
    fn(item);
};

// -- Module exports --

schema.init  = function(app) {
  init();
};

module.exports = schema;
