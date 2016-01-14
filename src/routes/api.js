// Api Routes --
// RESTful API cheat sheet : http://ricostacruz.com/cheatsheets/rest-api.html

var express = require('express'),
    router = express.Router(),
    db = require('../modules/database'),
    User = require('../models/user');

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
      res.json({
        users
      });
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

router.post('/users', function(req, res) {

});

module.exports = router;
