try {
  var Emitter = require('emitter');
} catch (e) {
  var Emitter = require('emitter-component');
}

var arrayMethods = require('./collection/array');
var toJSON = require('./collection/to-json');

var aSlice = Array.prototype.slice;

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/prototype#Properties
var createCollection = function (modelType) {

  var Collection = function (models) {
    models = models || [];

    Object.defineProperties(this, {
      _callbacks: { //for event emmitter
        value: {},
        enumerable: false
      },
      length: {
        value: 0,
        writable: true,
        enumerable: false,
        configurable: false
      }
    });

    Collection.emit('initialize', this);

    this.push.apply(this, models);
  };

  Collection.model = modelType || { create: function (o) {
    return o;
  } };

  Collection.prototype = {
    constructor: Collection,
    /**
     * Add a marker for array object consumers to signal that Array methods are supported
     * (see https://github.com/dribnet/ArrayLike.js)
     */
    __ArrayLike: true,

    toArray: function () {
      return aSlice.call(this, 0);
    }
  };

  Emitter(Collection.prototype);
  Emitter(Collection);

  Collection.use = function (fn) {
    fn(this);
    return this;
  };

  Collection.create = function (coll) {
    return coll instanceof this ? coll : new this(coll);
  };

  Collection.use(arrayMethods).use(toJSON);

  return Collection;
};


module.exports = createCollection;