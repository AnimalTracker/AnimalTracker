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
      info.error = 'Unauthorized';
    }
    else if(info instanceof Error) {
      info.error = info.message;
    }

    return res.status(401).json(info);

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
  configClass.createFromReqBody(req.body)
    .then(function (items) {
      var result = {};
      result.message = req.t(configClass.labelPath) + ' created.';
      if (Array.isArray(items)) {
        result.rid = [];
        items.forEach((item) => { result.rid.push(item.rid); });
      } else {
        result.rid = items.rid;
      }
      res.status(201).json(result);
    });
});

// Rid parameter --
router.param('rid', function (req, res, next, rid) {
  req.params.rid = db.helper.unsimplifyRid(rid);
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
  var configClass = req.params.configClass;
  configClass.updateFromReqBody(req.params.rid, req.body)
    .then(function () {
      var result = {};
      result.message = req.t(configClass.labelPath) + ' edited';
      res.status(201).json(result);
    });
});

// Removal --
router.delete('/:configClass/:rid', function(req, res) {
  var configClass = req.params.configClass;
  configClass.deleteByRid(req.params.rid)
    .then(function () {
      res.status(200).json({message: 'Done'});
    });
});

module.exports = router;
