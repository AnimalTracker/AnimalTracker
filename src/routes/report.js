var express = require('express');
var router = express.Router();

var config = require('config');
var moment = require('moment');
var _ = require('lodash');
var schema = require('../modules/schema');
var forEachApply = require('../helpers/misc').forEachApply;

// -- Config preparation --

var reports = {
  registers: {},
  list: config.get('reports')
};
if(!reports.list)
  reports.list = [];

reports.list.forEach(function(report){
  // Error checks --
  if(!report.path)
    return console.error('[report] No path defined on the report');

  var configClass = schema.getConfigClass(report.model);
  report.model = configClass;
  if(!report.model)
    return console.error('[report] Invalid model ' + report.model + ': the config class does not exists');

  // Register reports
  if(report.type === 'register') {
    reports.registers[report.path] = report;
  }

  // Headers --
  report.headers = forEachApply(report.property, [], function(a, propertyPath) {
    var propLevel = propertyPath.split(':')[0].split('.');
    var property = configClass.propertyAlias[_.head(propLevel)];

    _.tail(propLevel).forEach((level) => {
      if(!property || property.type !== 'reference') {
        property = null;
        return console.error('[report] Invalid property ' + propertyPath + ' in ' + report.path);
      }

      property = property.reference.propertyAlias[level];
    });

    if(property)
      a.push(property);
  });

  // Transform for later usability --
  report.property = _.map(report.property, value => value.replace(':', '_'));
});

// -- Register report --

router.get('/registers/:report', function(req, res) {
  if(!reports.registers.hasOwnProperty(req.params.report))
    return res.status(401).json({error: { message: 'Report not found' }});

  var report = reports.registers[req.params.report];
  var configClass = report.model;

  // Check rights --
  if (!req.isAuthenticated())
    return res.redirect('/login');

  if (configClass.type === 'user' && req.user.role != 'admin')
    return res.redirect('/');

  req.i18n.changeLanguage(req.user.language);
  var localMoment = moment();
  localMoment.locale(req.user.language);

  var date = localMoment.format('LLLL');
  if(req.user.language === 'fr')
    date = _.upperFirst(date);

  // Process the register --

  var locals = {
    title: configClass.getLabelPlural(req),
    page: {
      header: req.t('custom:report.register.' + report.path),
      logo: report.logo,
      date: date
    },
    data: {
      headers: _.map(report.headers, property => property.getLabel(req)),
      rows: []
    }
  };

  configClass.getAllWithReferences({req: req, getCompleteReference: true}).each(function(row) {
    locals.data.rows.push(forEachApply(report.property, [], function(a, property) {
      console.log(property);
      a.push(row[property]);
    }));
  })
  .then(function() {
    res.render('pages/register', locals);
  });
});

module.exports = router;