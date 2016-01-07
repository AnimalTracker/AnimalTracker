var express = require('express');
var router = express.Router();
var db = require('../modules/database');

/* GET home page. */
router.get('/', function(req, res, next) {
  return db.list()
    .then(function (dbs) {
      console.log('[orientdb] There are ' + dbs.length + ' databases on the server.');
    })
    .then(function() {
      res.render('pages/index', { title: 'Express' });
    });
});

module.exports = router;
