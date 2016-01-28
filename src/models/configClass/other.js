// Other Config Class initialisation --

// -- Add members to the other configClass --

exports.populate = function(Other) {

  // -- DB to View --

  Other.specificRecordToObject = function(record, obj, options) {

    // Generic properties/methods --
    Other.genericRecordToObject(record, obj, options);

    return obj;
  };

  // -- View to DB --

  Other.specificObjectToRecord = function(obj, record, options) {

    // Generic properties/methods --
    Other.genericObjectToRecord(obj, record, options);

    return record;
  };
};