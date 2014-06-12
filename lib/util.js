exports.defaultValue = function defaultValue(obj, attr, value) {
  if(obj[attr] === undefined)
    obj[attr] = value;
};

exports.forOwn = function forOwn(obj, callback, context) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop))
      callback.call(context, obj[prop], prop);
  }
};


function isWrapperAttribute(options) {
  return options.type && !options.type.model && options.type.wrapper;
}

exports.isWrapperAttribute = isWrapperAttribute;

function isModelAttribute(options) {
  return options.type && !options.type.model && !options.type.wrapper;
}

exports.isModelAttribute = isModelAttribute;

function isCollectionAttribute(options) {
  return options.type && options.type.model;
}

exports.isCollectionAttribute = isCollectionAttribute;
