var express = require('express');
var router = express.Router();
var db = require('../modules/database');

/* GET home page. */
router.get('/', function(req, res, next) {
  return db.query('select from OUser', {
      limit: 10
    })
    .then(function (results){
      console.log(results);
    })
    .then(function() {
      res.render('pages/index', { title: 'Express' });
    });
});

module.exports = router;
