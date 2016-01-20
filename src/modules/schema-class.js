// Config Class/Property initialisation --

var crypto  = require('crypto');
var i18n    = require('i18next');
var db      = require('../modules/database');

// -- Helper methods --

var hash = function(value) {
  return crypto.createHash('sha256').update(value).digest('base64');
};

var arrayifyFunction = function(array, fn) {
  if(Array.isArray(array))
    return array.map(fn);
  else if(array)
    return fn(array);
  else
    return null;
};

// -- Config Class members --

exports.populateConfigClass = function(configClass) {

  // -- Methods --
  configClass.forEachProperty = function(fn) {
    for(var m of this.property)
      fn(m);
  };

  configClass.apply = arrayifyFunction;

  configClass.getLabel = function(req) {
    var ref = req || i18n;
    return ref.t('custom:'+ this.name +'.name');
  };

  configClass.populateObjectFromRecord = function(obj, record) {
    this.forEachProperty(function(property) {
      switch(property.type)
      {
        case 'reference':
          //obj[property.name] = '';
          break;
        case 'text':
        case 'password':
        case 'date':
        case 'list':
        default:
          obj[property.name] = record[property.name];
          break;
      }
    });

    // Other properties --
    obj.rid = db.helper.simplifyRid(record['@rid']);

    return obj;
  };

  configClass.populateRecordFromObject = function(record, obj) {
    this.forEachProperty(function(property) {
      switch(property.type)
      {
        case 'password':
          record[property.name] = hash(obj[property.name]);
        case 'reference':
          //record[property.name] = '';
          break;
        case 'text':
        case 'date':
        case 'list':
        default:
          var value = obj[property.name];
          record[property.name] = value === '' ? null : value;
          break;
      }
    });

    if(obj.hasOwnProperty('active')) {
      record.active = obj.active;
    } else {
      record.active = true;
    }

    return record;
  };

  configClass.populateRecordFromReq = function(record, body) {
    this.forEachProperty(function(property) {
      switch(property.type)
      {
        case 'password':
          record[property.name] = hash(body[property.name]);
        case 'reference':
          //record[property.name] = '';
          break;
        case 'text':
        case 'date':
        case 'list':
        default:
          var value = body[property.name];
          record[property.name] = value === '' ? null : value;
          break;
      }
    });

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
    return arrayifyFunction(records, (record) => {
      return this.constructObjectFromRecord({}, record);
    });
  };

  configClass.transformObjectsIntoRecords = function(objects) {
    return arrayifyFunction(objects, (object) => {
      return this.populateRecordFromObject({}, object);
    });
  };

  configClass.createRecordsInDb = function(records) {
    return db.helper.createRecords(this.name, records);
  };
};

// -- Property members --

exports.populateProperty = function(property, configClass) {

  // Add methods --
  property.getLabel = function(req) {
    var ref = req || i18n;
    return ref.t('custom:' + configClass.name + '.property.' + this.name);
  };

  // Generate hash on property name --
  property.hash = hash(property.name);
};