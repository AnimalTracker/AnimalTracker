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

router.get('/users', function(req, res, next) {
  db.select('first_name', 'last_name', 'username').from('User').where({active: true}).all()
    .then(function (users) {
      res.json({
        users
      });
    });
});

module.exports = router;
