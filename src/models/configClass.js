// Config Class initialisation --

var i18n          = require('i18next');
var OrientDB      = require('orientjs');
var db            = require('../modules/database');
var helper        = require('../helpers/misc');
var propertyModel = require('./property');

// -- Add members to the configClass --

exports.populate = function(configClass) {

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

    propertyModel.populate(property, configClass);
  });

  // -- Secondary Methods --

  configClass.getLabel = function(req) {
    var ref = req || i18n;
    return ref.t(this.labelPath);
  };

  configClass.populateObjectFromRecord = function(obj, record, req) {
    this.forEachProperty(function(property) {
      switch(property.type)
      {
        case 'reference':
          obj[property.name] = db.helper.simplifyRid(record[property.name]);
          break;
        case 'password':
          obj[property.name + '_hidden'] = record[property.name];
          break;
        case 'list':
          obj[property.name + '_label'] = property.getOptionLabel(record[property.name], req);
        case 'text':
        case 'date':
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
          record[property.name] = helper.hash(obj[property.name]);
        case 'reference':
          record[property.name] = db.helper.unsimplifyAndRecordifyRid(obj[property.name]);
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
          if(body[property.name] && body[property.name] != '')
            record[property.name] = helper.hash(body[property.name]);
          break;
        case 'reference':
          record[property.name] = OrientDB.RID(db.helper.unsimplifyRid(body[property.name]));
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

  configClass.createRecordsInDb = function(records) {
    return db.helper.createRecords(this.name, records);
  };
};