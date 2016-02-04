// Api Routes --
// RESTful API cheat sheet : http://ricostacruz.com/cheatsheets/rest-api.html

var express   = require('express'),
    router    = express.Router(),
    db        = require('../modules/database'),
    schema    = require('../modules/schema'),
    passport  = require('passport');

/* Check if API is up */
router.get('/', function(req, res) {
  res.json({
    message: 'Server is running'
  });
});

var responseInsufficientRights = function(req, res) {
  return res.status(401).json({
    title: req.t('Error'),
    message: req.t('Insufficient rights'),
    status: 'error'
  });
};

// -- Auth system (API methods below are protected) --

router.use(function (req, res, next) {
  passport.authenticate('jwt', function(err, user, info) {
    if (!info) {
      req.user = user;
      req.i18n.changeLanguage(req.user.language);
      return next();
    }

    // If an message (error) occurs --
    if (info === {}) {
      info.error = req.t('Unauthorized');
      info.title = req.t('Error');
    }
    else if(info instanceof Error) {
      info.error = info.message;
    }

    res.status(401).json({
      title: info.title || req.t('Error', {lng: 'en'}),
      message: info.error,
      status: 'error'
    });

    // If not, continue --
  })(req, res, next);
});

// -- ConfigClass Parameter --

router.param('configClass', function (req, res, next, configClass) {
  configClass = schema.getConfigClassByPath(configClass);

  if(!configClass)
    return res.status(404).send('This config class does\'n exists.');
  else {
    req.params.configClass = configClass;
    next();
  }
});

// Listing --
router.get('/:configClass', function(req, res) {
  var configClass = req.params.configClass;

  if(configClass.type === 'user' && req.user.role != 'admin')
    return responseInsufficientRights(req, res);

  configClass.getAllWithReferences({req: req})
    .then(function (items) {
      var result = {};
      result[configClass.path] = items ? items : [];
      res.status(200).json(result);
    });
});

// Creation --
router.post('/:configClass', function(req, res) {
  var configClass = req.params.configClass;

  if(req.user.role === 'viewer')
    return responseInsufficientRights(req, res);

  if(configClass.type === 'user' && req.user.role != 'admin')
    return responseInsufficientRights(req, res);

  configClass.createFromReqBody(req.body)
    .then(function (items) {
      var result = {
        title: req.t('Created'),
        status: 'success'
      };

      if (Array.isArray(items)) {
        result.rid = [];
        items.forEach((item) => { result.rid.push(item.rid); });
        result.message= req.t('Created_description', {type: configClass.getLabel(req), count: items.length});
      } else {
        result.rid = items.rid;
        result.message= req.t('Created_description', {type: configClass.getLabel(req)});
      }
      res.status(201).json(result);
    });
});

// Rid parameter --
router.param('rid', function (req, res, next, rid) {
  req.params.rid = db.helper.unsimplifyRid(rid);
  var configClass = req.params.configClass;

  if(configClass.type === 'user' && !(req.user.role == 'admin' || req.params.rid == req.user.rid))
    return responseInsufficientRights(req, res);

  next();
});

// Reading --
router.get('/:configClass/:rid', function(req, res) {
  var configClass = req.params.configClass;
  configClass.getByRid(req.params.rid, {req: req})
    .then(function (item) {
      res.status(200).json(item);
    });
});

// Edition --
router.put('/:configClass/:rid', function(req, res) {
  if(req.user.role === 'viewer')
    return responseInsufficientRights(req, res);

  var configClass = req.params.configClass;
  configClass.updateFromReqBody(req.params.rid, req.body)
    .then(function () {
      res.status(201).json({
        title: req.t('Edited'),
        message: req.t('Edited_description', {type: configClass.getLabel(req)}),
        status: 'success'
      });
    });
});

// Removal --
router.delete('/:configClass/:rid', function(req, res) {
  if(req.user.role === 'viewer')
    return responseInsufficientRights(req, res);

  var configClass = req.params.configClass;
  configClass.deleteByRid(req.params.rid)
    .then(function () {
      res.status(200).json({
        title: req.t('Deleted'),
        message: req.t('Deleted_description', {type: configClass.getLabel(req)}),
        status: 'success'
      });
    });
});

router.use(function(req, res) {
  return res.status(404).json({
    title: req.t('Error'),
    message: req.t('Route not found'),
    status: 'error'
  });
});

module.exports = router;
