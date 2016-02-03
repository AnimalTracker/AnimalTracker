// I18n initialisation --
// Based on i18n : https://www.npmjs.com/package/i18n

var config      = require('config'),
    i18next     = require('i18next'),
    middleware  = require('i18next-express-middleware'),
    backend     = require('i18next-node-fs-backend');

var options = {
  load: 'unspecific',
  preload: ['fr', 'en'],
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
  },
  detection: {
    // order and from where user language should be detected
    order: [/*'path', 'session', 'cookie', 'header' */ 'querystring'],

    // keys or params to lookup language from
    lookupQuerystring: 'lng'
    // lookupCookie: 'i18next',
    // lookupSession: 'lng',
    // lookupFromPathIndex: 0,

    // cache user language
    // caches: false, // ['cookie']

    // optional expire and domain for set cookie
    // cookieExpirationDate: new Date(),
    // cookieDomain: 'myDomain'
  }
};

i18next
  .use(middleware.LanguageDetector)
  .use(backend)
  .init(options, () => {
    // Test i18n --
  });

// -- Config --

var datatableLanguages = {},
    datatableDefaultLanguage,
    datatableFolder = 'i18n/datatables/';

if(config.has('i18n')) {
  for(var lang of config.get('i18n')) {
    if(!lang.id)
      continue;

    if(lang.datatable) {
      datatableLanguages[lang.id] = datatableFolder + lang.datatable + '.lang';

      if(lang.default)
        datatableDefaultLanguage = datatableFolder + lang.datatable + '.lang';
    }
  }
}

// -- Module requirements --

exports.init = function(app) {

  app.use(middleware.handle(i18next, {
    ignoreRoutes: ["/foo"]
    // removeLngFromUrl: false
  }));
};

// Datatable language --

exports.getDatatableLanguage = function(lang) {
  console.log(lang, datatableLanguages, datatableDefaultLanguage);
  if(datatableLanguages.hasOwnProperty(lang))
    return datatableLanguages[lang];

  else
    return datatableDefaultLanguage;

  //'https://cdn.datatables.net/plug-ins/1.10.10/i18n/French.json'


};