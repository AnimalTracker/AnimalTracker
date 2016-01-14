var express = require('express');
var router = express.Router();

var schema = require('../modules/schema');

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
  console.log(req.params.animals);

  var configClass = req.params.animals;
  var title = req.t('custom:'+ configClass.name +'.name');
  var datatable = {
    cols: [],
    options: {
      lengthChange: false,
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.10.10/i18n/French.json'
      },
      ajax: {
        url: '/api/v1/' + configClass.path,
        dataSrc: configClass.path
      },
      columnDefs: []}
  };

  configClass.forEachProperty(function(property) {
    if(!property.display_datatable)
      return;

    // Add the column --
    datatable.cols.push({
      name: property.name,
      label: property.getLabel(req)
    })

    // Add the js def --
    datatable.options.columnDefs.push({
      targets: property.name,
      data: property.name
    });
  });

  datatable.options = JSON.stringify(datatable.options);

  res.render('layouts/datatable', {
    title: title,
    page: { header: title },
    datatable: datatable
  });
});

router.get('/:animals/new', function(req, res, next) {

  var configClass = req.params.animals;
  var title = req.t('custom:'+ configClass.name +'.name');
  res.render('layouts/form', {
    title: title,
    page: { header: title },
    form: {
      header: 'Edition',
      inputs: schema.generateFormInputs(configClass.name)
    }
  });
});

module.exports = router;
