var express = require('express');
var router = express.Router();

var config = require('config');
var moment = require('moment');
var _ = require('lodash');
var schema = require('../modules/schema');
var db = require('../modules/database');
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
    report.href = '/reports/registers/' + report.path + report.param;
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

// -- Report list --

router.get('/', function(req, res) {
  // Check rights --
  if (!req.isAuthenticated())
    return res.redirect('/login');

  // Locale --
  req.i18n.changeLanguage(req.user.language);
  var title = req.t('Reports');

  res.render('pages/reports', {
    title: title,
    rights: schema.user.populateRights(req),
    page: {
      header: title
    },
    reports: forEachApply(reports.list, [], function(a, report) {
      a.push({
        href: report.href,
        title: req.t('custom:report.' + report.id),
        type: req.t('Reports_type.' + report.type)
      });
    })
  });
});


// -- "Register" report --

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

  // Locale --
  req.i18n.changeLanguage(req.user.language);
  var localMoment = moment();
  localMoment.locale(req.user.language);

  var date = localMoment.format('LLLL');
  if(req.user.language === 'fr')
    date = _.upperFirst(date);

  // Process the register --
  var id = req.query.report_id || report.id;

  var locals = {
    title: configClass.getLabelPlural(req),
    page: {
      header: req.t('custom:report.' + id),
      logo: report.logo,
      date: date
    },
    data: {
      headers: _.map(report.headers, property => property.getLabel(req)),
      rows: []
    }
  };

  // Query params --
  var options = {
    req: req,
    getCompleteReference: true,
    where: []
  };
  configClass.forEachProperty(function(property) {
    if(req.query.hasOwnProperty(property.name)) {
      var queryValue = req.query[property.name];

      if(property.type === 'reference')
        queryValue = db.helper.unsimplifyAndRecordifyRid(queryValue);

      options.where[property.name] = queryValue;
    }
  });

  configClass.getAllWithReferences(options).each(function(row) {
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