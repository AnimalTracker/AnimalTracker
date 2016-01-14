// Generic view helpers --

var config = require('config');
var i18n = require('i18next');

var schema = require('../modules/schema');
var view = {};

// -- Datatable Generation --

view.getDatatableLocalsBase = function(path) {
  return {
    cols: [],
    options: {
      lengthChange: false,
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.10.10/i18n/French.json'
      },
      ajax: {
        url: '/api/v1/' + path,
        dataSrc: path
      },
      columnDefs: []}
  }
};

view.stringifyOptions = function(locals) {
  locals.options = JSON.stringify(locals.options);
  return locals;
};

view.generateDatatableLocals = function(configClass, req) {
  var locals = view.getDatatableLocalsBase(configClass.path);

  configClass.forEachProperty(function(property) {
    if(!property.display_datatable)
      return;

    // Add the column --
    locals.cols.push({
      name: property.name,
      label: property.getLabel(req)
    });

    // Add the js def --
    locals.options.columnDefs.push({
      targets: property.name,
      data: property.name
    });
  });

  return locals;
};

view.generateDatatableLocalsJson = function(configClass, req) {
  var locals = view.generateDatatableLocals(configClass, req);
  view.stringifyOptions(locals);
  return locals;
};

// -- Form Generation --

view.generateFormInputs = function(configClass, req) {
  var inputs = [];

  configClass.forEachProperty(function(property) {
    var input = {
      type: 'text',
      label: property.getLabel(req)
    };

    switch(property.type)
    {
      case 'list':
        input.type = 'select';
        input.options = [];
        property.list.forEach(function(option) {
          input.options.push({
            text: i18n.t('custom:' + configClass.name + '.option.' + property.name + '.' + option.id)
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
  }
};

// -- Module exports --

module.exports = view;
