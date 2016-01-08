var express = require('express');
var router = express.Router();
var db = require('../modules/database');
var passport = require('passport');
var flash = require ('connect-flash');

/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }

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

// Login form receiver --

router.get('/login', function(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  return res.render("pages/login", {
    errors: req.flash('error'),
    user: req.user
  });
});

router.post('/login', function(req, res, next) {
  // Authenticate the user --
  console.log('user');

  passport.authenticate('local', function(err, user, info) {
    console.log(err,user, info);
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('error', info.message);
      return res.redirect('/login');
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect("/");
    });
  })(req, res, next);
});

router.post('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
