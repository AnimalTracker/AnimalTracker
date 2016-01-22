
var crypto = require('crypto');

// -- Miscellaneous helpers --

exports.hash = function(value) {
  return crypto.createHash('sha256').update(value).digest('base64');
};

exports.arrayifyFunction = function(array, fn) {
  if(Array.isArray(array))
    return array.map(fn);
  else if(array)
    return fn(array);
  else
    return null;
};