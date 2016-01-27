var express = require('express');
var router = express.Router();
var db = require('../modules/database');
var passport = require('passport');
var flash = require ('connect-flash');

var schema = require('../modules/schema');
var User = schema.user;
var Promise = require('bluebird');

/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }

  var promises = [];
  var promisesMetadata = [];

  schema.forEachConfigClass((configClass) => {
    promises.push(configClass.countAll());
    promisesMetadata.push({
      label: configClass.getLabel(req),
      type: configClass.type === 'animal' ? 'primary' : configClass.type === 'other' ? 'green' : 'yellow',
      configClassType: configClass.type,
      path: '/' + configClass.path
    });
  });

  Promise.all(promises).then((results) => {
    var locals = {
      title: 'Dashboard',
      blocks: []
    };

    // Result for animals (global) --
    locals.blocks.push({
      label: req.t('All animals'),
      type: 'primary',
      count: 0
    });

    // For each configClass --
    for(var i = 0; i < promisesMetadata.length; i++) {
      var block = promisesMetadata[i];
      block.count = results[i];

      if(block.configClassType === 'animal')
        locals.blocks[0].count += block.count;

      locals.blocks.push(block);
    }

    res.render('pages/index', locals);
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
