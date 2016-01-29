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

  // -- Data Access Methods --

  // Creation Methods --

  configClass.createRecordsInDb = function(records) {
    return db.helper.createRecords(this.name, records).then(function(results) {
      if(configClass.postCreate) {
        console.log('[orientjs] Trigger ' + configClass.name + '.postUpdate hook');
        return configClass.postCreate(results);
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
    return db.update(this.name).set(record).where({'@rid': rid}).one();
  };

  // Reading Methods --

  configClass.getByRid = function(rid) {
    return db.select().from(this.name).where({'@rid': rid}).one()
      .then((item) => {
        return this.transformRecordsIntoObjects(item);
      });
  };

  configClass.getAll = function() {
    return db.select().from(this.name).where({active: true}).all()
      .then((item) => {
        return this.transformRecordsIntoObjects(item);
      });
  };

  configClass.countAll = function() {
    return db.select('count(*)').from(this.name).where({active: true}).scalar();
  };

  configClass.getAllWithReferences = function() {
    var select = ['*'];

    // If no references, use simple getAll instead --
    if(!this.references)
      return this.getAll();

    this.references.forEach(function(ref) {
      select.push(ref.name + '.*');
    });

    return db.select(select.join(', ')).from(this.name).where({active: true}).all()
      .then((item) => {
        return this.transformRecordsIntoObjects(item);
      });
  };

  // Delete Methods --

  configClass.deleteByRid = function(rid) {
    return db.update(this.name).set({active: false}).where({'@rid': rid}).one();
  };

};