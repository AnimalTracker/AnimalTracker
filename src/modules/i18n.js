// I18n initialisation --
// Based on i18n : https://www.npmjs.com/package/i18n

var i18n = require('i18n');
var path = require('path');
var express = require('express');

i18n.configure({
  locales:['en', 'fr'],
  cookie: 'locale',
  directory: path.resolve('./locales')
});


console.log(path.resolve('./locales'));
// -- Module requirements --

exports.init = function(app) {

  app.use('/locales', express.static(path.resolve('./locales')));
  app.use(i18n.init);
};