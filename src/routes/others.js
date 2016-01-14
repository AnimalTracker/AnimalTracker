var express = require('express');
var router = express.Router();

var schema = require('../modules/schema');
var view = require('../modules/view');

// -- Methods --

router.param('others', function (req, res, next, others) {
  var configClass = schema.getOtherClassByPath(others);

  if(!configClass)
    return res.status(404).send('This other class does\'n exists.');
  else {
    req.params.others = configClass;
    next();
  }
});

router.get('/:others', function(req, res, next) {

  var configClass = req.params.others;
  var title = configClass.getLabel(req);
  var datatable = view.generateDatatableLocalsBase('others/'+configClass.path, configClass.path);

  view.populateDatatableLocals(datatable, configClass, req)
  view.stringifyOptions(datatable);

  res.render('layouts/datatable', {
    title: title,
    page: {
      header: title,
      newHref: '/others/' + configClass.path +'/new'
    },
    datatable: datatable
  });
});

router.get('/:others/new', function(req, res, next) {

  var configClass = req.params.others;
  var title = req.t('custom:'+ configClass.name +'.name');
  var inputs = view.generateFormInputLocals(configClass, req);

  res.render('layouts/form', {
    title: title,
    page: { header: title },
    form: {
      header: 'Edition',
      inputs: inputs
    }
  });
});

module.exports = router;
