// Generic view helpers --

var config = require('config');
var i18n = require('i18next');

var schema = require('../modules/schema');
var view = {};

// -- Datatable Generation --

view.generateDatatableLocalsBase = function(path, dataSrc) {
  return {
    cols: [],
    options: {
      responsive: true,
      lengthChange: false,
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.10.10/i18n/French.json'
      },
      ajax: {
        url: '/api/v1/' + path,
        dataSrc: dataSrc
      },
      columnDefs: []
    }
  }
};

view.stringify = function(value) {
  return JSON.stringify(value);
};

view.stringifyOptions = function(locals) {
  locals.options = view.stringify(locals.options);
  return locals;
};

view.populateDatatableLocals = function(locals, configClass, req, route) {
  // Generic columns --
  configClass.forEachProperty(function(property) {
    if(!property.display_datatable)
      return;

    // Add the column --
    locals.cols.push({
      name: property.name,
      label: property.getLabel(req)
    });

    // Add the js def --
    var def = {
      targets: property.name,
      data: property.name
    };

    if(property.type === 'list')
      def.data += '_label';

    locals.options.columnDefs.push(def);
  });

  return locals;
};

// -- Form Generation --

view.generateFormInputLocals = function(configClass, req) {
  var inputs = [];

  configClass.forEachProperty(function(property) {
    var input = {
      type: 'text',
      label: property.getLabel(req),
      name: property.name
    };

    switch(property.type)
    {
      case 'list':
        input.type = 'select';
        input.options = [];
        property.forEachOption(function(option) {
          input.options.push({
            value: option.id,
            text: option.getLabel(req)
          });
        });
        break;
      case 'text':
      default:
        break;
    }

    inputs.push(input);
  });

  return inputs;
};

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
        name: configClass.name,
        path: configClass.path
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

    locals.user = createLocal(schema.User);

    // Add to locals --
    app.locals.schema = locals;

    // For local for resources href --
    app.locals.resPath = '/';
  }
};

// -- Module exports --

module.exports = view;
