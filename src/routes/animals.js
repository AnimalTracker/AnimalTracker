var express = require('express');
var router = express.Router();

var schema = require('../modules/schema');

router.get('/', function(req, res, next) {

  res.render('layouts/form', {
    title: 'Animals',
    page: { header: 'Animals' },
    form: {
      header: 'Rat',
      inputs: schema.generateFormInputs('Rat')
    }
  });
});

module.exports = router;
