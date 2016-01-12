// Api Routes --
// RESTful API cheat sheet : http://ricostacruz.com/cheatsheets/rest-api.html

var express = require('express'),
    router = express.Router(),
    db = require('../modules/database');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json({
    message: 'Hello world!'
  });
});

module.exports = router;
