// Server initialisation --
// Based on config : https://github.com/lorenwest/node-config/wiki/Configuration-Files

var config  = require('config');
var express = require('express');
var path = require('path');

var DEFAULT_PORT = 3000;

// Optional parameters --
exports.init = function(app) {

  if(config.has('server')) {
    var server = config.get('server');

    // Static file server --
    if(server.has('static') && server.get('static')) {
      app.use(express.static(path.join(__dirname, 'public')));
    }

    // Live reload --
    if(server.has('liveReload') && server.get('liveReload')) {
      var livereload = require('livereload');
      var serverLr = livereload.createServer();
      serverLr.watch(__dirname + '/public');
    }
  }

  // Start server --
  var server = app.listen(config.getPort(), function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('[app] GeneTracker listening at http://%s:%s', host, port);
  });
};

// Safely get the port number --
exports.getPort = function() {
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
  console.log('[config] no given port, fallback to default port');
  return DEFAULT_PORT;
}
