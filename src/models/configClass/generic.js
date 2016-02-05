// Generic Config Class initialisation --

var db = require('../../modules/database');

// -- Add members to the configClass --

exports.populate = function(configClass) {

  // -- DB to View --

  configClass.genericRecordToObject = function(record, obj, options) {
    options = options || {};

    // Config driven properties --
    configClass.forEachProperty(function(property) {
      property.recordToObject(record, obj, options.req);
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
      property.objectToRecord(obj, record);
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

    if(result.select.length > 1)
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

  configClass.createFromReqBody = function(body) {
    var records = [],
      nbToAdd = body.nb_to_add || 1;

    for (var i = 0; i < nbToAdd; i++) {
      records.push(this.specificObjectToRecord(body, { active: true }));
    }

    return this.createRecordsInDb(records);
  };

  configClass.updateFromReqBody = function(rid, body) {
    var record = this.specificObjectToRecord(body, {});
    return db.update(this.name).set(record).where({'@rid': rid, active: true}).one();
  };

  // Reading Methods --

  configClass.getByRid = function(rid, options) {
    var params = this.specificSelectParams();

    var request = db.select(params.select).from(this.name).where({'@rid': rid, active: true});

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

    // If no references, use simple getAll instead --
    if(!this.references)
      return this.getAll(options);

    params.select = [params.select];
    this.references.forEach(function(ref) {
      params.select.push(ref.name + '.*');
    });

    var request = db.select(params.select.join(', ')).from(this.name).where({active: true});

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

};