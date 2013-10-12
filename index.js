exports.model = require('./lib/model');
exports.collection = require('./lib/collection');

var collectionUtil = require('./lib/collection/util');
for(var m in collectionUtil) {
    exports.collection[m] = collectionUtil[m];
}

var modelUtil = require('./lib/model/util');
for(var m in modelUtil) {
    exports.model[m] = modelUtil[m];
}