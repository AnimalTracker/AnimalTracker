var express = require('express');
var router = express.Router();

var schema = require('../modules/schema');

router.get('/', function(req, res, next) {
  var inputs = [];

  schema.getConfigClass('Rat').forEachProperty(function(property) {
    var input = {
      type: 'text',
      label: property.display_name
    };

    switch(property.type)
    {
      case 'list':
        input.type = 'select';
        input.options = [];
        property.list.forEach(function(option) {
          input.options.push({
            text: option.text
          })
        });
      case 'string':
      default:
        break;
    }

    inputs.push(input);
  });

  res.render('layouts/form', {
    title: 'Animals',
    page: { header: 'Animals' },
    form: {
      header: 'Rat',
      inputs: inputs
    }
  });
});

module.exports = router;
