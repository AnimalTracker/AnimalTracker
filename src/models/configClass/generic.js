// Generic Config Class initialisation --

var Promise = require('bluebird');
var db = require('../../modules/database');

// -- Add members to the configClass --

exports.populate = function(configClass) {

  // -- DB to View --

  configClass.genericRecordToObject = function(record, obj, options) {
    options = options || {};

    // Config driven properties --
    configClass.forEachProperty(function(property) {
      property.recordToObject(record, obj, options);
    });

    // Other properties --
    obj.rid = db.helper.simplifyRid(record['@rid']);

    // Methods --
    obj.save = function() {
      var record = {};
      configClass.specificObjectToRecord(this, record);
      return db.helper.createRecords(this.name, record);
    };

    return obj;
  };

  // -- View to DB --

  configClass.genericObjectToRecord = function(obj, record, options) {
    options = options || {};

    // Config driven properties --
    this.forEachProperty(function(property) {
      var promise = property.objectToRecord(obj, record, options);
      if(promise && options.promises)
        options.promises.push(promise);
    });

    // Other properties --
    record.active = obj.hasOwnProperty('active') ? obj.active : true;

    return record;
  };

  configClass.genericSelectParams = function() {
    var result = {
      select : ['*'],
      variables: []
    };

    var i = 1;

    this.forEachProperty(function(property) {
      if(property.type !== 'computed')
        return;

      if(property.subtype === 'reverse-reference') {
        result.select.push('$' + i + '[0].count as ' + property.name);
        result.variables.push({
          id: '$' + i,
          value: '(select count(*) from ' + property.reference_from + ' where '
            + property.property + ' = $parent.$current)'});
        i++;
      }
    });

    if(result.select.length > 0)
      result.select = result.select.join(', ');
    else
      result.select = undefined;

    return result;
  };

  // -- Data Access Methods --

  // Creation Methods --

  configClass.createRecordsInDb = function(records) {
    return db.helper.createRecords(this.name, records).then(function(results) {
      if(configClass.postCreate) {
        console.log('[orientjs] Trigger ' + configClass.name + '.postUpdate hook');
        return configClass.postCreate(results);
      } else {
        return results;
      }
    });
  };

  configClass.createFromObject = function(objects) {
    var records = this.transformObjectsIntoRecords(objects);
    return this.createRecordsInDb(records);
  };

  configClass.createFromReq = function(req) {
    var records = [];
    var nbToAdd = req.body.nb_to_add || 1;
    var options = {req: req, promises: []};

    for (var i = 0; i < nbToAdd; i++) {
      records.push(this.specificObjectToRecord(req.body, { active: true }, options));
    }

    return Promise.all(options.promises).then(() => {
      return this.createRecordsInDb(records);
    });
  };

  configClass.updateFromReq = function(rid, req) {
    var options = {req: req, promises: []};
    var record = this.specificObjectToRecord(req.body, {}, options);
    return Promise.all(options.promises).then(() => {
      return db.update(this.name).set(record).where({'@rid': rid, active: true}).one();
    });
  };

  // Reading Methods --

  configClass.getByRid = function(rid, options) {
    var params = this.specificSelectParams();
    var where = options && options.where ? options.where : {};

    where['@rid'] = rid;
    where.active = true;

    var request = db.select(params.select).from(this.name).where(where);

    // Add a let entry for each variable --
    for(var variable of params.variables) {
      request.let(variable.id, variable.value);
    }

    return request.one()
      .then((item) => {
        return this.transformRecordsIntoObjects(item, options);
      });
  };

  configClass.getAll = function(options) {
    var params = this.specificSelectParams();
    var request = db.select(params.select).from(this.name).where({active: true});

    // Add a let entry for each variable --
    for(var variable of params.variables) {
      request.let(variable.id, variable.value);
    }

    return request.all()
      .then((item) => {
        return this.transformRecordsIntoObjects(item, options);
      });
  };

  configClass.countAll = function() {
    return db.select('count(*)').from(this.name).where({active: true}).scalar();
  };

  configClass.getAllWithReferences = function(options) {
    var params = this.specificSelectParams();
    var where = options && options.where ? options.where : {};

    where.active = true;

    // If no references, use simple getAll instead --
    if(!this.references)
      return this.getAll(options);

    params.select = [params.select];
    this.references.forEach(function(ref) {
      params.select.push(ref.name + '.*');
    });

    var request = db.select(params.select.join(', ')).from(this.name).where(where);

    // Add a let entry for each variable --
    for(var variable of params.variables) {
      request.let(variable.id, variable.value);
    }

    return request.all()
      .then((item) => {
        return this.transformRecordsIntoObjects(item, options);
      });
  };

  // Delete Methods --

  configClass.deleteByRid = function(rid) {
    return db.update(this.name).set({active: false}).where({'@rid': rid}).one();
  };


  // Toggle processing --
  if(!configClass.datatable)
    configClass.datatable = {};

  if(!configClass.datatable.toggle)
    configClass.datatable.toggle = [];

  configClass.datatable.toggle_labels = [];
  var labels = configClass.datatable.toggle_labels;

  configClass.datatable.toggle.forEach(function(toggle) {

    if(!toggle.on)
      toggle.on = '';
    if(!toggle.off)
      toggle.off = '';

    // Label --
    var labelPath = 'custom:'+ configClass.name + '.toggle.' + toggle.name;
    labels.push(labelPath + '_on');
    labels.push(labelPath + '_off');

    toggle.labelPath = labelPath;
    toggle.checked = toggle.default === 'on';
    delete toggle.default;
  });
};