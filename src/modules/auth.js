// Authentication initialisation --
// Based on Passport : http://passportjs.org/docs
// Based on OrientDB : http://orientdb.com/docs/last/Database-Security.html

var config = require('config');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');

var db = require('../modules/database');
var schema = require('./schema');
var User = schema.user;

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var secret = require('config').get('secret_token');

// -- Strategy --

passport.use(new LocalStrategy(
  function(username, password, done) {

    User.getByUsername(username)
      .then(function (user){
        // Check password --
        if(user && user.test(password)) {
          // Success --
          return done(null, user);
        }
        else {
          // Not matching --
          return done(null, false, { error: 'Incorrect credentials' });
        }
      }, function() {
        done(null, false, { error: 'The database does not respond' });
      });
  }
));

var opts = {
  secretOrKey: secret
};

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
  User.getByRid(db.helper.unsimplifyRid(jwt_payload.rid))
    .then(function (user){

    // Check if user exists --
    if(!user) {
      return done(null, false, { message: 'Incorrect credentials' });
    }
    else {
      // Success --
      return done(null, user);
    }
    }, function() {
      done(null, false, { error: 'The database does not respond' });
    });
}));


passport.serializeUser(function(user, done) {
  done(null, user.rid);
});

passport.deserializeUser(function(id, done) {
  return User.getByRid(db.helper.unsimplifyRid(id)).then(function (user){
    done(user ? null : 'User not found', user);
  }, function() {
    done('Database error', null);
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