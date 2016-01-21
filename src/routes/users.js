var express = require('express');
var router = express.Router();

var schema = require('../modules/schema');
var view = require('../modules/view');

router.get('/', function(req, res, next) {

  var configClass = schema.User;
  var title = configClass.getLabel(req);
  var datatable = view.generateDatatableLocalsBase(configClass.path, configClass.path);

  view.populateDatatableLocals(datatable, configClass, req)
  view.stringifyOptions(datatable);

  res.render('layouts/datatable', {
    title: title,
    page: {
      header: title,
      newHref: '/' + configClass.path +'/new',
      options: view.stringify({
        viewRoute: '/' + configClass.path + '/',
        editLabel: req.t('Edit')
      })
    },
    datatable: datatable
  });
});

router.get('/new', function(req, res, next) {

  var configClass = schema.User;
  var title = req.t('custom:'+ configClass.name +'.name');
  var inputs = view.generateFormInputLocals(configClass, req);

  res.render('layouts/form', {
    title: title,
    page: { header: title },
    form: {
      header: req.t('Creation'),
      inputs: inputs,
      options: view.populateFormOptions(configClass, 'create', null, req)
    }
  });
});

router.get('/:rid', function(req, res, next) {

  var configClass = schema.User;
  var title = req.t('custom:'+ configClass.name +'.name');
  var inputs = view.generateFormInputLocals(configClass, req);

  res.render('layouts/form', {
    title: title,
    page: { header: title },
    form: {
      header: req.t('Edition'),
      inputs: inputs,
      options: view.populateFormOptions(configClass, 'edit', req.params.rid, req)
    }
  });
});

module.exports = router;
