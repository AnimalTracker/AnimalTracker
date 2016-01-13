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

router.get('/users/:username', function (req, res) {
    db.select().from('User').where({active: true, 'username': req.param('username')}).all()
      .then(function (user) {
        res.json({
          user
        });
      });
});

module.exports = router;
