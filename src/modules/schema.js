// Schema initialisation --

var config = require('config');

var schema = config.get('data_schema');
var schemaConstructors = require('./schema-class');

// -- Internal Methods --

var isNotValid = function() {
  if(!schema.has('Animal')) {
    console.error('[schema] Missing "Animal" class list in config.');
    return true;
  }

  return false;
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
    schema.ConfigClassAlias[configClass.name] = configClass;
    schema.ConfigClass.push(configClass);

    // Add new members --
    configClass.propertyAlias = {};

    // Add ConfigClass members/methods --
    schemaConstructors.populateConfigClass(configClass);

    // Add Property members/methods --
    configClass.forEachProperty(function(property) {

      // Set the alias --
      configClass.propertyAlias[property.name] = property;

      schemaConstructors.populateProperty(property, configClass);
    });
  });

  console.log(schema);
};

// -- Access Methods --

schema.getAnimalClasses = function() {
  return schema.Animal;
};

schema.getOtherClasses = function() {
  return schema.Other;
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
};

// -- Access Methods : Path --

schema.getAnimalClassByPath = function(path) {
  for(var item of schema.getAnimalClasses())
    if(item.path === path)
      return item;
};


schema.getOtherClassByPath = function(path) {
  for(var item of schema.getOtherClasses())
    if(item.path === path)
      return item;
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
