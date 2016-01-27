// Config Class initialisation --

var i18n          = require('i18next');
var db            = require('../modules/database');
var helper        = require('../helpers/misc');
var propertyModel = require('./property');

// -- Add members to the configClass --

exports.populate = function(configClass, schema) {

  // -- Attributes --
  configClass.propertyAlias = {};
  configClass.labelPath = 'custom:'+ configClass.name +'.name';

  // -- Primary Methods --
  configClass.forEachProperty = function(fn) {
    for(var m of this.property)
      fn(m);
  };

  // Add Property members/methods --
  configClass.forEachProperty(function(property) {

    // Set the alias --
    configClass.propertyAlias[property.name] = property;

    propertyModel.populate(property, configClass, schema);
  });

  // -- Secondary Methods --

  configClass.getLabel = function(req) {
    var ref = req || i18n;
    return ref.t(this.labelPath);
  };

  // -- Transformation Methods --

  configClass.populateObjectFromRecord = function(obj, record, req) {
    this.forEachProperty(function(property) {
      property.recordToObject(record, obj, req);
    });

    // Other properties --
    obj.rid = db.helper.simplifyRid(record['@rid']);

    return obj;
  };

  configClass.populateRecordFromObject = function(record, obj) {
    this.forEachProperty(function(property) {
      property.objectToRecord(obj, record);
    });

    record.active = obj.hasOwnProperty('active') ? obj.active : true;

    return record;
  };

  configClass.populateRecordFromReq = function(record, body) {
    this.forEachProperty(function(property) {
      property.reqToRecord(body, record);
    });

    console.log(record);
    record.active = true;
    return record;
  };

  configClass.addMethodsToObject = function(obj) {

    obj.save = function() {
      var record = {};
      this.populateRecordFromObject(record, this);
      return db.helper.createRecords(this.name, this);
    };

  };

  configClass.constructObjectFromRecord = function(obj, record) {
    this.populateObjectFromRecord(obj, record);
    this.addMethodsToObject(obj);
    return obj;
  };

  configClass.transformRecordsIntoObjects = function(records) {
    return helper.arrayifyFunction(records, (record) => {
      return this.constructObjectFromRecord({}, record);
    });
  };

  configClass.transformObjectsIntoRecords = function(objects) {
    return helper.arrayifyFunction(objects, (object) => {
      return this.populateRecordFromObject({}, object);
    });
  };

  // -- Database Creation Methods --

  configClass.createRecordsInDb = function(records) {
    return db.helper.createRecords(this.name, records);
  };

  configClass.createRecords = function(objects) {
    var records = this.transformObjectsIntoRecords(objects);
    return this.createRecordsInDb(records);
  };

  configClass.createFromReqBody = function(body) {
    var records = this.populateRecordFromReq({}, body);
    return this.createRecordsInDb(records);
  };

  configClass.updateFromReqBody = function(rid, body) {
    var record = this.populateRecordFromReq({}, body);
    return db.update(this.name).set(record).where({'@rid': rid}).one();
  };

  // -- Database Reading Methods --

  configClass.getByRid = function(rid) {
    return db.select().from(this.name).where({'@rid': rid}).one()
      .then((item) => {
        return this.transform(item);
      });
  };

  configClass.getAll = function() {
    return db.select().from(this.name).where({active: true}).all()
      .then((item) => {
        return this.transform(item);
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
        return this.transform(item);
      });
  };

  // -- Database Other Methods --

  configClass.deleteByRid = function(rid) {
    return db.update(this.name).set({active: false}).where({'@rid': rid}).one();
  };
};