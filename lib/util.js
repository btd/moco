var defaultValue = function(obj, attr, value) {
    if(obj[attr] === undefined)
        obj[attr] = value;
};

module.exports.defaultValue = defaultValue;

var forOwn = function(obj, callback, context) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            callback.call(context, obj[prop], prop);
    }
}

module.exports.forOwn = forOwn;