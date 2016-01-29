var express = require('express');
var router = express.Router();

var schema = require('../modules/schema');

var populateRights = function(req) {
  var admin = req.user.role === 'admin';
  var project_manager = admin || req.user.role === 'project_manager';
  var viewer = admin || project_manager;

  return {
    admin: admin,
    project_manager: project_manager,
    viewer: viewer,
    rid: req.user.rid,
    username: req.user.username
  };
};

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

  // Check rights --
  if (!req.isAuthenticated())
    return res.redirect('/login');

  if(configClass.type === 'user' && req.user.role != 'admin')
    return res.redirect('/');

  var title = configClass.getLabelPlural(req);
  var locals = {
    cols: [],
    options: {
      responsive: true,
      lengthMenu: [[ 25, 50, 100 , 1000, -1], [25, 50, 100 , 1000, "Tout"] ],
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
    if(property.display_datatable) {
      property.generateDTLocals(locals.cols);
      property.generateDTOptions(locals.options.columnDefs);
    }
  });

  locals.options = JSON.stringify(locals.options);

  res.render('layouts/datatable', {
    title: title,
    rights: populateRights(req),
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

  // Check rights --
  if (!req.isAuthenticated())
    return res.redirect('/login');

  if(configClass.type === 'user' && req.user.role != 'admin')
    return res.redirect('/');

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
    header_alt: req.t('Edit'),
    lang: lang
  };

  configClass.forEachProperty(function(property) {
    property.generateFormInputs(inputs);
    property.generateFormOptions(options);
  });

  var allowMultipleInsert = configClass.type === 'animal';

  // Final rendering --
  res.render('layouts/form', {
    title: title,
    rights: populateRights(req),
    page: {
      header: title,
      lang: lang
    },
    form: {
      header: req.t('Creation'),
      inputs: inputs,
      options: JSON.stringify(options),
      allowMultipleInsert: allowMultipleInsert
    }
  });
});

router.get('/:configClass/:rid', function(req, res, next) {
  var configClass = req.params.configClass;
  if(!configClass) return next();

  // Check rights --
  if (!req.isAuthenticated())
    return res.redirect('/login');

  if(configClass.type === 'user' && !(req.user.role == 'admin' || req.params.rid == req.user.rid))
    return res.redirect('/');

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
    lang: lang
  };

  configClass.forEachProperty(function(property) {
    property.generateFormInputs(inputs);
    property.generateFormOptions(options);
  });

  // Final rendering --
  res.render('layouts/form', {
    title: title,
    rights: populateRights(req),
    page: {
      header: title,
      lang: lang
    },
    form: {
      header: req.t('Edition'),
      inputs: inputs,
      options: JSON.stringify(options),
      allowMultipleInsert: false
    }
  });
});


module.exports = router;
