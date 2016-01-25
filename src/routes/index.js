var express = require('express');
var router = express.Router();
var db = require('../modules/database');
var passport = require('passport');
var flash = require ('connect-flash');

var schema = require('../modules/schema');
var User = schema.user;

/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }

  // Demo Query --
  return db.ready
    .then(function(){

      //var user = new User.class('test3','test');
      //console.log(user);
      //return user.save();
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

  passport.authenticate('local', function(err, user, info) {

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
