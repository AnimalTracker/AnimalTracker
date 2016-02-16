// Server initialisation --
// Based on config : https://github.com/lorenwest/node-config/wiki/Configuration-Files

var config  = require('config');
var express = require('express');
var path = require('path');

// -- Constants --

var DEFAULT_PORT = 3000;

// -- Methods --

var getPort = function() {
  if(config.has('server')) {
    var server = config.get('server');

    if(server.has('port')) {
      var port = server.get('port');

      if(port > 0 && port < 65536) {
        return port;
      }
      else {
        console.error('[config] given port is invalid');
        return DEFAULT_PORT;
      }
    }
  }

  // Fallback --
  console.log('[config] no server.port field, fallback to default port');
  return DEFAULT_PORT;
};

var startStaticServer = function(app) {
  app.use(express.static('public'));

  console.log('[app] Static server ready');
};

var startLiveReloadServer = function() {
  var livereload = require('livereload');
  var serverLr = livereload.createServer();
  serverLr.watch(path.resolve(__dirname, '../..', 'public'));

  console.log('[app] LiveReload server ready');
};

var startExpressServer = function(app) {
  app.use(function(err, req, res, next) {
    // Do logging and user-friendly error message display
    if(err.stack) {
      console.error('[app] ' + err.stack);
      res.status(500).render('pages/error', {
        code:500,
        message: req.t('Internal error'),
        description: req.t('Internal error_description')
      });
    }
    else {
      next();
    }
  });

  // 404 Error --
  app.use(function(req, res) {
    console.error('[server] 404: ' + req.url);
    res.status(404).render('pages/error', {
      code:404,
      message: req.t('Not found'),
      description: req.t('Not found_description')
    });
  });

  // Start the app --
  var server = app.listen(getPort(), function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('[app] AnimalTracker listening at http://%s:%s', host, port);
    console.log('[app] Mode: %s', process.env.NODE_ENV);
  });
};

// -- Module requirements --

exports.init = function(app) {

  if(config.has('server')) {
    var server = config.get('server');

    // Static file server --
    if(server.has('static') && server.get('static'))
      startStaticServer(app);

    // Live reload --
    if(server.has('live_reload') && server.get('live_reload'))
      startLiveReloadServer();
  }

  // Express server --
  startExpressServer(app);
};