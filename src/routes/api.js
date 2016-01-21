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
      result[schema.User.path] = users ? users : [];
      res.json(result);
    });
});

// Users creation --
router.post('/users', function(req, res) {
  User.createFromReqBody(req.body, schema.User)
    .then(function (record) {
      var result = {};
      result.message = 'User created';
      result.rid = record.rid;
      res.status(201).json(result);
    });
});

// Users rid parameter --
router.param('rid', function (req, res, next, rid) {
  req.params.rid = db.helper.unsimplifyRid(rid);
  next();
});

// Users reading --
router.get('/users/:rid', function(req, res) {
  User.getByRid(req.params.rid, schema.User)
    .then(function (user) {
      res.status(200).json(user);
    });
});

// Users edition --
router.put('/users/:rid', function(req, res) {
  User.updateFromReqBody(req.params.rid, req.body, schema.User)
    .then(function () {
      var result = {};
      result.message = 'User edited';
      res.status(201).json(result);
    });
});

// Users removal --
router.delete('/users/:rid', function(req, res) {
  User.deleteByRid(req.params.rid, schema.User)
    .then(function () {
      res.status(200).json({message: 'Done'});
    });
});

/* GET animals listing. */

// Animals parameter --
router.param('animals', function (req, res, next, animals) {
  var configClass = schema.getAnimalClassByPath(animals);

  if(!configClass)
    return res.status(404).send('This animal class does\'n exists.');
  else {
    req.params.animals = configClass;
    next();
  }
});

// Animals listing --
router.get('/animals/:animals', function(req, res) {
  Animal.getAnimals(req.params.animals)
    .then(function (animals) {
      var result = {};
      result[req.params.animals.path] = animals ? animals : []
      res.status(200).json(result);
    });
});

// Animals creation --
router.post('/animals/:animals', function(req, res) {
  Animal.createFromReqBody(req.body, req.params.animals)
    .then(function (record) {
      var result = {};
      result.message = 'Animal created';
      result.rid = record.rid;
      res.status(201).json(result);
    });
});

// Animals rid parameter --
router.param('rid', function (req, res, next, rid) {
  req.params.rid = db.helper.unsimplifyRid(rid);
  next();
});

// Animals reading --
router.get('/animals/:animals/:rid', function(req, res) {
  Animal.getByRid(req.params.rid, req.params.animals)
    .then(function (animal) {
      res.status(200).json(animal);
    });
});

// Animals edition --
router.put('/animals/:animals/:rid', function(req, res) {
  Animal.updateFromReqBody(req.params.rid, req.body, req.params.animals)
    .then(function () {
      var result = {};
      result.message = 'Animal edited';
      res.status(201).json(result);
    });
});

// Animals removal --
router.delete('/animals/:animals/:rid', function(req, res) {
  Animal.deleteByRid(req.params.rid, req.params.animals)
    .then(function () {
      res.status(200).json({message: 'Done'});
    });
});

/* GET others listing. */

// Others parameter --
router.param('others', function (req, res, next, others) {
  var configClass = schema.getOtherClassByPath(others);

  if(!configClass)
    return res.status(404).send('This other class does\'n exists.');
  else {
    req.params.others = configClass;
    next();
  }
});

// Others listing --
router.get('/others/:others', function(req, res) {
  Other.getOthers(req.params.others)
    .then(function (others) {
      var result = {};
      result[req.params.others.path] = others ? others : []
      res.status(200).json(result);
    });
});

// Others creation --
router.post('/others/:others', function(req, res) {
  Other.createFromReqBody(req.body, req.params.others)
    .then(function (record) {
      var result = {};
      result.message = 'Other created';
      result.rid = record.rid;
      res.status(201).json(result);
    });
});

// Others rid parameter --
router.param('rid', function (req, res, next, rid) {
  req.params.rid = db.helper.unsimplifyRid(rid);
  next();
});

// Others reading --
router.get('/others/:others/:rid', function(req, res) {
  Other.getByRid(req.params.rid, req.params.others)
    .then(function (other) {
      res.status(200).json(other);
    });
});

// Others edition --
router.put('/others/:others/:rid', function(req, res) {
  Other.updateFromReqBody(req.params.rid, req.body, req.params.others)
    .then(function () {
      var result = {};
      result.message = 'Other edited';
      res.status(201).json(result);
    });
});

// Others removal --
router.delete('/others/:others/:rid', function(req, res) {
  Other.deleteByRid(req.params.rid, req.params.others)
    .then(function () {
      res.status(200).json({message: 'Done'});
    });
});


module.exports = router;
