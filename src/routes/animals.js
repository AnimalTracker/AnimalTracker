var express = require('express');
var router = express.Router();

var schema = require('../modules/schema');

router.get('/', function(req, res, next) {

  req.t('custom:Mus.name');
  req.t('custom:Project.name');
  req.t('custom:Rat.name');
  req.t('custom:User.name');

  schema.generateFormInputs('Mus');
  schema.generateFormInputs('Project');
  schema.generateFormInputs('User');
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
