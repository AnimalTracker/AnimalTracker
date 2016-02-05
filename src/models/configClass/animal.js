// Animal Config Class initialisation --

// -- Add members to the animal configClass --

exports.populate = function(Animal) {

  // -- DB to View --

  Animal.specificRecordToObject = function(record, obj, options) {

    // Generic properties/methods --
    Animal.genericRecordToObject(record, obj, options);

    return obj;
  };

  // -- View to DB --

  Animal.specificObjectToRecord = function(obj, record, options) {

    // Generic properties/methods --
    Animal.genericObjectToRecord(obj, record, options);

    return record;
  };

  Animal.specificSelectParams = function() {
    return Animal.genericSelectParams();
  };
};