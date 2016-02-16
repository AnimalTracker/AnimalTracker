// Generic view helpers --

var schema = require('../modules/schema');
var config = require('config');
var view = {};

view.init  = function(app) {

  if(app) {
    // Add locals for views --
    var locals = {
      animals: [],
      others: []
    };

    // Methods --
    var createLocal = function (configClass) {
      return {
        name: configClass.labelPath + '_plural',
        path: '/' + configClass.path
      };
    };

    var pushClass = function (array, configClass) {
      var localClass = createLocal(configClass);
      array.push(localClass);
      return localClass;
    };

    // Inserts --
    schema.forEachAnimalClass(function (animal) {
      pushClass(locals.animals, animal);
    });

    schema.forEachOtherClass(function (other) {
      pushClass(locals.others, other);
    });

    locals.user = createLocal(schema.user);

    // Add to locals --
    app.locals.schema = locals;

    // For local for resources href --
    app.locals.resPath = '/';

    // Static reload client side --
    if(config.get('server.live_reload'))
      app.locals.liveReload = true;
  }
};

// -- Module exports --

module.exports = view;
