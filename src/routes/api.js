// Api Routes --
// RESTful API cheat sheet : http://ricostacruz.com/cheatsheets/rest-api.html

var express = require('express'),
    router  = express.Router(),
    db      = require('../modules/database'),
    schema  = require('../modules/schema'),
    User    = require('../models/user'),
    Animal  = require('../models/animal'),
    Other   = require('../models/other');

/* Check if API is up */
router.get('/', function(req, res) {
  res.json({
    message: 'Server is running'
  });
});

/* GET users listing. */
router.get('/users', function(req, res) {
  User.getUsers()
    .then(function (users) {
      var result = {};
      result[req.params.users.path] = users ? users : []
      res.json(result);
    });
});

router.get('/users/:username', function (req, res) {
  User.getByUsername(req.param('username'))
    .then(function (user) {
      res.json({
        user
      });
    });
});

/* GET animals listing. */

router.param('animals', function (req, res, next, animals) {
  var configClass = schema.getAnimalClassByPath(animals);

  if(!configClass)
    return res.status(404).send('This animal class does\'n exists.');
  else {
    req.params.animals = configClass;
    next();
  }
});

router.get('/animals/:animals', function(req, res) {
  Animal.getAnimals(req.params.animals.name)
    .then(function (animals) {
      var result = {};
      result[req.params.animals.path] = animals ? animals : []
      res.json(result);
    });
});


/* GET others listing. */

router.param('others', function (req, res, next, others) {
  var configClass = schema.getOtherClassByPath(others);

  if(!configClass)
    return res.status(404).send('This other class does\'n exists.');
  else {
    req.params.others = configClass;
    next();
  }
});

router.get('/others/:others', function(req, res) {
  Other.getOthers(req.params.others.name)
    .then(function (others) {
      var result = {};
      result[req.params.others.path] = others ? others : []
      res.json(result);
    });
});


module.exports = router;
