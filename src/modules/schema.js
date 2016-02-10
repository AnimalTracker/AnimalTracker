// Schema initialisation --

var Promise = require('bluebird');
var ready = Promise.defer();

var config = require('config');

var schema = config.get('data_schema');
var configClassModel = require('../models/configClass');

var configClassType = {
  generic:  require('./../models/configClass/generic'),
  animal:   require('./../models/configClass/animal'),
  other:    require('./../models/configClass/other'),
  user:     require('./../models/configClass/user')
};

schema.ready = ready.promise;
module.exports = schema;

var nbClass = schema.models.length;

// -- Internal Methods --

var isNotValid = function() {
  if(!schema.has('models')) {
    console.error('[schema] Missing "models" class list in config.');
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
  schema.modelsAlias = {};
  schema.animals = [];
  schema.others = [];
  schema.user = false;

  // Set aliases --
  schema.forEachConfigClass(function(configClass) {

    // Set the alias --
    schema.modelsAlias[configClass.name] = configClass;

    // -- Specific Methods --
    if(configClass.type === 'animal') {
      schema.animals.push(configClass);
    }
    else if(configClass.type === 'user') {

      if(schema.user != false) {
        console.error('[schema] Only one user model allowed. Ignoring duplicates')
      }
      else {
        schema.user = configClass;
      }
    }
    else {
      schema.others.push(configClass);
    }
  });

  // Populate classes --
  schema.forEachConfigClass(function(configClass, i) {

    if(!schema.user) {
      console.error('[schema] Missing a "user" model in data_schema');
      process.exit(1);
    }

    // Add ConfigClass root methods --
    configClassModel.populate(configClass, schema);

    // -- Specific/generic Methods --
    configClassType.generic.populate(configClass);
    configClassType[configClass.type].populate(configClass);

    // Counter --
    console.log('[schema] ConfigClass ' + configClass.name + ' ('+ i + '/' + nbClass + ') processed');
    if(i >= nbClass) {
      console.log('[schema] Schema ready');

      ready.resolve();
      i++;
    }
  });
};

// -- Access Methods --

schema.getAnimalClasses = function() {
  return schema.animals;
};

schema.getOtherClasses = function() {
  return schema.others;
};

schema.getConfigClasses = function() {
  return schema.models;
};

schema.getConfigClass = function(name) {
  if(!schema.modelsAlias)
    console.error('[schema] getConfigClass used before initialisation');
  else if(schema.modelsAlias.hasOwnProperty(name))
    return schema.modelsAlias[name];
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
  var i = 0;
  for(var item of schema.getConfigClasses()) {
    i++;
    fn(item, i);
  }

};

schema.forEachAnimalClass = function(fn) {
  for(var item of schema.animals)
    fn(item);
};

schema.forEachOtherClass = function(fn) {
  for(var item of schema.others)
    fn(item);
};

// -- Module exports --

schema.init  = function() {
  init();
};
