var express = require('express');
var router = express.Router();

var schema = require('../modules/schema');

// -- I18n --

var i18n = require('../modules/i18n');
var datatableTranslation = [
];
var formTranslation = [
  'swal.delete.title',
  'swal.delete.text',
  'swal.delete.cancel',
  'swal.delete.confirm'
];

// -- ConfigClass Parameter --

router.param('configClass', function (req, res, next, configClass) {
  configClass = schema.getConfigClassByPath(configClass);
  req.params.configClass = configClass;
  next();
});

// -- Datatable --

router.get('/:configClass', function(req, res, next) {
  var configClass = req.params.configClass;
  if (!configClass) return next();

  // Check rights --
  if (!req.isAuthenticated())
    return res.redirect('/login');

  if (configClass.type === 'user' && req.user.role != 'admin')
    return res.redirect('/');

  req.i18n.changeLanguage(req.user.language);

  var title = configClass.getLabelPlural(req);
  var locals = {
    cols: [],
    options: {
      responsive: true,
      lengthMenu: [[25, 50, 100, 1000, -1], [25, 50, 100, 1000, req.t("All")]],
      language: {
        url: i18n.getDatatableLanguage(req.user.language)
      },
      ajax: {
        url: '/api/v1/' + configClass.path,
        headers: {'Authorization': 'JWT ' + req.user.apitoken},
        dataSrc: configClass.path
      },
      columnDefs: []
    }
  };

  // Generic columns --
  configClass.forEachProperty(function (property) {
    if (property.display_datatable) {
      property.generateDTLocals(locals.cols, req);
      property.generateDTOptions(locals.options.columnDefs);
    }
  });

  locals.options = JSON.stringify(locals.options);

  res.render('layouts/datatable', {
    title: title,
    rights: schema.user.populateRights(req),
    page: {
      header: title,
      newHref: '/' + configClass.path +'/new',
      options: JSON.stringify({
        viewRoute: '/' + configClass.path + '/',
        editLabel: req.t('Edit'),
        t: i18n.generateTranslations(datatableTranslation, req)
      })
    },
    datatable: locals
  });
});

// -- Forms --

var splitColumns = function(inputs) {

  // Split columns for better display --
  if (inputs.length < 2) {
    return [inputs];
  }
  else {
    var splitNb = Math.ceil(inputs.length / 2);
    return [inputs.slice(0, splitNb), inputs.slice(splitNb)];
  }

};

router.get('/:configClass/new', function(req, res, next) {
  var configClass = req.params.configClass;
  if(!configClass) return next();

  // Check rights --
  if (!req.isAuthenticated())
    return res.redirect('/login');

  if(configClass.type === 'user' && req.user.role != 'admin')
    return res.redirect('/');

  req.i18n.changeLanguage(req.user.language);

  // Labels --
  var title = req.t('custom:'+ configClass.name +'.name');
  var lang = 'fr';

  // Generate inputs for Jade --
  var inputs = [];

  // Generate options for client side --
  var options = {
    action: 'create',
    target: '/api/v1/' + configClass.path + '/',
    references: [],
    displayOnly: [],
    applyOperations: [],
    header_alt: req.t('Edit'),
    t: i18n.generateTranslations(formTranslation, req),
    lang: lang
  };

  configClass.forEachProperty(function(property) {
    property.generateFormInputs(inputs, req);
    property.generateFormOptions(options);
  });

  var allowMultipleInsert = configClass.type === 'animal';

  // Final rendering --
  res.render('layouts/form', {
    title: title,
    rights: schema.user.populateRights(req),
    page: {
      header: title,
      lang: lang
    },
    form: {
      header: req.t('Creation'),
      inputs: splitColumns(inputs),
      options: JSON.stringify(options),
      allowMultipleInsert: allowMultipleInsert
    }
  });
});

router.get('/:configClass/:rid', function(req, res, next) {
  var configClass = req.params.configClass;
  if(!configClass) return next();

  // Check rights --
  var rightOptions = {};
  if (!req.isAuthenticated())
    return res.redirect('/login');

  if(configClass.type === 'user' && req.user.role != 'admin' ){
    if(req.params.rid == req.user.rid)
      rightOptions.editBypass = true;
    else
      return res.redirect('/');
  }

  req.i18n.changeLanguage(req.user.language);

  // Label --
  var title = req.t('custom:'+ configClass.name +'.name');
  var lang = 'fr';

  // Generate inputs for Jade --
  var inputs = [];

  // Generate options for client side --
  var options = {
    action: 'edit',
    target: '/api/v1/' + configClass.path + '/' + req.params.rid,
    references: [],
    displayOnly: [],
    applyOperations: [],
    t: i18n.generateTranslations(formTranslation, req),
    lang: lang
  };

  configClass.forEachProperty(function(property) {
    property.generateFormInputs(inputs, req);
    property.generateFormOptions(options);
  });

  // Final rendering --
  res.render('layouts/form', {
    title: title,
    rights: schema.user.populateRights(req, rightOptions),
    page: {
      header: title,
      lang: lang
    },
    form: {
      header: req.t('Edition'),
      inputs: splitColumns(inputs),
      options: JSON.stringify(options),
      allowMultipleInsert: false
    }
  });
});


module.exports = router;
