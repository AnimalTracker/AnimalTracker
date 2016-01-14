var express = require('express');
var router = express.Router();

var schema = require('../modules/schema');

router.get('/:animals', function(req, res, next) {
  var configClass = schema.getConfigClassByPath(req.params.animals);

  if(!configClass)
    return res.status(404).send('This animal class does\'n exists.');

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
