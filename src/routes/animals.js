var express = require('express');
var router = express.Router();

var schema = require('../modules/schema');
var view = require('../modules/view');

// -- Methods --

router.param('animals', function (req, res, next, animals) {
  var configClass = schema.getConfigClassByPath(animals);

  if(!configClass)
    return res.status(404).send('This animal class does\'n exists.');
  else {
    req.params.animals = configClass;
    next();
  }
});

router.get('/:animals', function(req, res, next) {

  var configClass = req.params.animals;
  var title = configClass.getLabel(req);
  var datatable = view.generateDatatableLocalsJson(configClass, req);
  
  res.render('layouts/datatable', {
    title: title,
    page: { header: title },
    datatable: datatable
  });
});

router.get('/:animals/new', function(req, res, next) {

  var configClass = req.params.animals;
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
