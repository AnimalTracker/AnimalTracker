var express = require('express');
var router = express.Router();

var schema = require('../modules/schema');

// -- ConfigClass Parameter --

router.param('configClass', function (req, res, next, configClass) {
  configClass = schema.getConfigClassByPath(configClass);
  req.params.configClass = configClass;
  next();
});

// -- Datatable --

router.get('/:configClass', function(req, res, next) {

  var configClass = req.params.configClass;
  if(!configClass) return next();

  var title = configClass.getLabel(req);
  var locals = {
    cols: [],
    options: {
      responsive: true,
      lengthChange: false,
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.10.10/i18n/French.json'
      },
      ajax: {
        url: '/api/v1/' + configClass.path,
        dataSrc: configClass.path
      },
      columnDefs: []
    }
  };

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

  locals.options = JSON.stringify(locals.options);

  res.render('layouts/datatable', {
    title: title,
    page: {
      header: title,
      newHref: '/' + configClass.path +'/new',
      options: JSON.stringify({
        viewRoute: '/' + configClass.path + '/',
        editLabel: req.t('Edit')
      })
    },
    datatable: locals
  });
});

// -- Forms --

router.get('/:configClass/new', function(req, res, next) {

  var configClass = req.params.configClass;
  if(!configClass) return next();

  var title = req.t('custom:'+ configClass.name +'.name');

  // Generate inputs for Jade --
  var inputs = [];
  configClass.forEachProperty(function(property) {
    property.generateFormInputs(inputs);
  });

  // Generate options for client side --
  var options = {
    action: 'create',
    target: '/api/v1/' + configClass.path + '/',
    references: [],
    header_alt: req.t('Edit')
  };

  configClass.forEachProperty(function(property) {
    property.generateFormOptions(options);
  });

  // Final rendering --
  res.render('layouts/form', {
    title: title,
    page: { header: title },
    form: {
      header: req.t('Creation'),
      inputs: inputs,
      options: JSON.stringify(options)
    }
  });
});

router.get('/:configClass/:rid', function(req, res, next) {

  var configClass = req.params.configClass;
  if(!configClass) return next();

  var title = req.t('custom:'+ configClass.name +'.name');

  // Generate inputs for Jade --
  var inputs = [];
  configClass.forEachProperty(function(property) {
    property.generateFormInputs(inputs);
  });

  // Generate options for client side --
  var options = {
    action: 'edit',
    target: '/api/v1/' + configClass.path + '/' + req.params.rid,
    references: []
  };

  configClass.forEachProperty(function(property) {
    property.generateFormOptions(options);
  });

  // Final rendering --
  res.render('layouts/form', {
    title: title,
    page: { header: title },
    form: {
      header: req.t('Edition'),
      inputs: inputs,
      options: JSON.stringify(options)
    }
  });
});


module.exports = router;
