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

    // Replace property items by the property in the model --
    report.property = forEachApply(report.property, [], function(a, item) {
      if(configClass.propertyAlias.hasOwnProperty(item))
        a.push(configClass.propertyAlias[item]);
    });
  }
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
      headers: forEachApply(report.property, [], function(a, property) {
        a.push(property.getLabel(req));
      }),
      rows: []
    }
  };

  configClass.getAllWithReferences({req: req}).each(function(row) {
    locals.data.rows.push(forEachApply(report.property, [], function(a, property) {
      var label = property.name;

      if(property.type === 'list')
        label += '_label';

      a.push(row[label]);
    }));
  })
  .then(function() {
    res.render('pages/register', locals);
  });
});

module.exports = router;