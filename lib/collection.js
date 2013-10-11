try {
    var Emitter = require('emitter');
} catch (e) {
    var Emitter = require('emitter-component');
}


var id = function(o) { return o; };

var arrayMethods = require('./collection/array');

var aSlice = Array.prototype.slice;

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/prototype#Properties
var createCollection = function(modelType) {

    var Collection = function(models) {
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
            }/*,
            _onModelChange:{
                value: function(name, value, prev) {
                    //this there is a model instance, that there it is a collection instance
                    that.constructor.emit('change:' + name, that, this, value, prev);
                    that.constructor.emit('change', that, this, name, value, prev);
                    that.emit('change:' + name, this, value, prev);
                    that.emit('change', this, name, value, prev);
                },
                enumerable: false
            }*/
        });

        for(var i = 0, len = models.length; i < len; i++) {
            this.push(models[i]);
        }

        Collection.emit('initialize', this);
    };

    Collection.model = modelType || { create: id };

    Collection.prototype = {
        constructor: Collection,
        /**
         * Add a marker for array object consumers to signal that Array methods are supported
         * (see https://github.com/dribnet/ArrayLike.js)
         */
        __ArrayLike: true,

        toArray: function() {
            return aSlice.call(this, 0);
        },

        // this method called by JSON.stringify
        toJSON: function() {
            return this.toArray();
        }
    };

    Emitter(Collection.prototype);
    Emitter(Collection);

    Collection.use = function(fn) {
        fn(this);
        return this;
    };

    Collection.create = function(coll) {
        return coll instanceof Collection ? coll : new Collection(coll);
    };

    Collection.use(arrayMethods);

    return Collection;
};


module.exports = createCollection;