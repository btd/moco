exports.model = require('./lib/model');
exports.collection = require('./lib/collection');

var util = require('./lib/collection/util');
for(var m in util) {
    exports.collection[m] = util[m];
}