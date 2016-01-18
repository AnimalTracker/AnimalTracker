// Config Class/Property initialisation --

var crypto  = require('crypto');
var i18n    = require('i18next');
var db      = require('../modules/database');

// -- Helper methods --

var hash = function(value) {
  return crypto.createHash('sha256').update(value).digest('base64');
};

var apply = function(objects, fn) {
  if(Array.isArray(objects)) {
    objects.forEach(function(object) {
      fn(object);
    });

    return objects;
  }
  else if(objects) {
    return fn(objects);
  }
  else {
    return null;
  }
};

// -- Config Class members --

exports.populateConfigClass = function(configClass) {

  // -- Methods --
  configClass.forEachProperty = function(fn) {
    for(var m of this.property)
      fn(m);
  };

  configClass.apply = apply;

  configClass.getLabel = function(req) {
    var ref = req || i18n;
    return ref.t('custom:'+ this.name +'.name');
  };

  configClass.populateObjectFromRecord = function(obj, record) {
    this.forEachProperty(function(property) {
      switch(property.type)
      {
        case 'text':
          obj[property.name] = record[property.name];
          break;
        case 'password':
          obj[property.name] = record[property.name];
          break;
        case 'date':
          obj[property.name] = record[property.name];
          break;
        case 'list':
          obj[property.name] = '';
          break;
        case 'reference':
          obj[property.name] = '';
          break;
        default:
          obj[property.name] = record[property.name];
          break;
      }
    });

    // Other properties --
    obj.rid = record['@rid'];

    return obj;
  };

  configClass.populateRecordFromObject = function(record, obj) {
    this.forEachProperty(function(property) {
      switch(property.type)
      {
        case 'text':
          record[property.name] = obj[property.name];
          break;
        case 'password':
          record[property.name] = hash(obj[property.name]);
          break;
        case 'date':
          record[property.name] = obj[property.name];
          break;
        case 'list':
          record[property.name] = '';
          break;
        case 'reference':
          record[property.name] = '';
          break;
        default:
          record[property.name] = obj[property.name];
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
        case 'text':
          record[property.name] = body[property.name];
          break;
        case 'password':
          record[property.name] = hash(body[property.name]);
          break;
        case 'date':
          record[property.name] = body[property.name];
          break;
        case 'list':
          record[property.name] = '';
          break;
        case 'reference':
          record[property.name] = '';
          break;
        default:
          record[property.name] = body[property.name];
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

    if(Array.isArray(records)) {
      var list = [];
      records.forEach((record) => { list.push(this.constructObjectFromRecord({}, record)); });
      return list;
    }
    else if(records) {
      return this.constructObjectFromRecord({}, records);
    }
    else {
      return null;
    }
  };

  configClass.transformObjectsIntoRecords = function(objects) {

    if(Array.isArray(objects)) {
      var list = [];
      objects.forEach((object) => { list.push(this.populateRecordFromObject({}, object)); });
      return list;
    }
    else if(objects) {
      return this.populateRecordFromObject({}, objects);
    }
    else {
      return null;
    }
  };

  configClass.createRecordsInDb = function(records) {

    // Circular dependency fix --
    if(!db.helper) {
      delete require.cache[require.resolve('../modules/database')];
      db = require('../modules/database');
    }

    console.log(db);
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