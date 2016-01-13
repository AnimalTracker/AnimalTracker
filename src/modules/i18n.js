// I18n initialisation --
// Based on i18n : https://www.npmjs.com/package/i18n

var path = require('path');
var i18next = require('i18next');
var express = require('express');
var middleware = require('i18next-express-middleware');
var backend = require('i18next-node-fs-backend');

var options = {
  load: 'unspecific',
  lng: 'fr',
  fallbackLng: 'fr',
  ns: ['translation', 'custom'],
  saveMissing: true,
  saveMissingTo: 'current',
  debug: false,
  backend: {
    loadPath: './locales/{{ns}}/{{lng}}.json',
    addPath: './locales/{{ns}}/{{lng}}.json',
    jsonIndent: 2
  }
};

i18next
//.use(middleware.LanguageDetector)
  .use(backend)
  .init(options, (err, t) => {
    // Test i18n --
  });

// -- Module requirements --

exports.init = function(app) {
  app.use(middleware.handle(i18next, {
    ignoreRoutes: ["/foo"]
    // removeLngFromUrl: false
  }));
};