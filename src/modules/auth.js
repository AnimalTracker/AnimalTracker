// Authentication initialisation --
// Based on Passport : http://passportjs.org/docs
// Based on OrientDB : http://orientdb.com/docs/last/Database-Security.html

var config = require('config');
var crypto = require('crypto');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');

var db = require('../modules/database.js');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// -- Strategy --

passport.use(new LocalStrategy(
  function(username, password, done) {

    // Find OUser in OrientDB --
    db.query('select from User where name=:name', {
      params: {
        name: username
      },
      limit: 1
    }).then(function (results){

      // User found --
      if(results.length == 1) {
        var user = results[0];

        var hash = '{SHA-256}' + crypto
            .createHash('sha256')
            .update(password)
            .digest('base64');

        console.log('Password: ' + password);
        console.log(user);

        // Check password --
        if(password == user.password_alt) {
          // Success --
          return done(null, user);
        }
        else {
          // Not matching --
          return done(null, false, { message: 'Incorrect password.' });
        }
      }
      else {
        // No user found --
        return done(null, false, { message: 'Incorrect username.' });
      }
    });
  }
));


passport.use(new LocalStrategy(
  function(username, password, done) {

    // Find OUser in OrientDB --
    db.query('select from User where name=:name', {
      params: {
        name: username
      },
      limit: 1
    }).then(function (results){

      // User found --
      if(results.length == 1) {
        var user = results[0];

        var hash = '{SHA-256}' + crypto
            .createHash('sha256')
            .update(password)
            .digest('base64');

        console.log('Password: ' + password);
        console.log(user);

        // Check password --
        if(password == user.password_alt) {
          // Success --
          return done(null, user);
        }
        else {
          // Not matching --
          return done(null, false, { message: 'Incorrect password.' });
        }
      }
      else {
        // No user found --
        return done(null, false, { message: 'Incorrect username.' });
      }
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, '' + user['@rid']);
});

passport.deserializeUser(function(id, done) {
  db.query('select from User where @rid=:id', {
    params: {
      id: id
    },
    limit: 1
  }).then(function (results){
    done(results.length == 0, results[0]);
  });
});

// -- Module requirements --

exports.init = function(app) {

  app.use(cookieParser());

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use(session({
    secret: config.get('secret_token'),
    resave: true,
    saveUninitialized: true
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(flash());
};