var express = require('express');
var router = express.Router();
var passport = require('passport');

var schema = require('../modules/schema');
var Promise = require('bluebird');

/* GET home page. */
router.get('/', function(req, res) {
  if (!req.isAuthenticated())
    return res.redirect('/login');

  var promises = [];
  var promisesMetadata = [];

  schema.forEachConfigClass((configClass) => {
    promises.push(configClass.countAll());
    promisesMetadata.push({
      label: configClass.getLabelPlural(req),
      type: configClass.type === 'animal' ? 'primary' : configClass.type === 'other' ? 'green' : 'yellow',
      icon: configClass.type === 'animal' ? 'fa-paw' : configClass.type === 'other' ? 'fa-tasks' : 'fa-user',
      configClassType: configClass.type,
      path: '/' + configClass.path
    });
  });

  Promise.all(promises).then((results) => {
    var locals = {
      title: 'Dashboard',
      rights: schema.user.populateRights(req),
      blocks: []
    };

    // Result for animals (global) --
    locals.blocks.push({
      label: req.t('All animals'),
      type: 'primary',
      icon: 'fa-list',
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

router.get('/login', function(req, res) {
  if (req.isAuthenticated())
    return res.redirect('/');

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

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/login');
});

module.exports = router;
