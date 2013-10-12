
try {
    var Emitter = require('emitter');
} catch (e) {
    var Emitter = require('emitter-component');
}

var isGetter = function(attributeOptions) {
    return typeof attributeOptions.get === 'function';
};

var defaultValue = function(obj, attr, value) {
    if(obj[attr] === undefined)
        obj[attr] = value;
};

var createModel = function(modelOptions) {
    var Model = function(attributes) {
        attributes = attributes || {};

        Object.defineProperties(this, {
            attributes: { //where we store attribute values
                value: {},
                enumerable: false
            },
            _callbacks: { //for event emmitter
                value: {},
                enumerable: false
            },
            primary: {
                get: function() {
                    if(this.constructor.primaryKey)
                        return this[this.constructor.primaryKey];
                    else
                        throw new Error('Try to get undefined primary key');
                },
                enumerable: false
            }
        });

        // set default values and assign
        // we take from attributes only defined keys
        Object.keys(this.constructor.attributes).forEach(function(name) {
            var attributeOptions = this.constructor.attributes[name];
            var value = attributes[name];

            // define getter/setter
            if(isGetter(attributeOptions)) {
                //it is getter
                Object.defineProperty(this, name, {
                    get: attributeOptions.get,
                    enumerable: false
                });
            } else {

                // let define for our model getter and setter that it mimic real plain object
                Object.defineProperty(this, name, {
                    // this.attributes added in constructor
                    get: function() {
                        return this.attributes[name];
                    },
                    set: function(value) {
                        /*
                         For primitive types it will compare by value, but for reference types by reference
                         as a TODO:
                         1. add support of standard types: Date, RegExp
                         2. add support of collections and models (with eventing)
                         */

                        var changed = this.attributes[name] !== value;

                        if(changed) {
                            var prev = this.attributes[name];
                            this.attributes[name] = value;

                            this.constructor.emit('change', this, name, value, prev);
                            this.constructor.emit('change:' + name, this, value, prev);
                            this.emit('change', name, value, prev);
                            this.emit('change:' + name, value, prev);
                        }
                    },
                    enumerable: true
                });

                var defaultValue = attributeOptions.default;
                // only if attribute undefined we set default value
                this.attributes[name] = value === undefined ?
                    typeof defaultValue === 'function' ?
                        defaultValue.call(this) :
                        defaultValue :
                    value;
            }
        }, this);

        Model.emit('initialize', this);

        Object.seal(this);
    };

    Model.prototype = {
        constructor: Model,
        /**
         * check if model has primary attribute filled
         * @returns {boolean}
         */
        isNew: function() {
            var key = this.constructor.primaryKey;
            if(!key) throw new Error('Calling isNew on model without primary key');
            return this[key] === undefined;
        },
        /**
         * Check if model have this attribute defined (not filled)
         * @param {String} attr
         */
        has: function(attr) {
            return this.constructor.attributes.hasOwnProperty(attr);
        }
    };



    Emitter(Model.prototype); // each instance will can emit events
    Emitter(Model); // but also constructor can emit events for all models

    // static properties
    Model.options = modelOptions || {};
    Model.attributes = {}; // where we store defined attributes and their properties
    Model.primaryKey = false; //by default it is a name of attribute that

    /*
        Possible attribute options:
        primary {Boolean} by default is false, - fill primaryKey, make working isNew
        get {Function} by default is false - make this attribute getter
        default {Function|value} by default is undefined - default value for this attribute, assigned with default value while creation
     */
    Model.attr = function(name, attributeOptions) {
        if(!this.attributes[name]) { //we do not have this attribute
            attributeOptions = attributeOptions || {};

            defaultValue(attributeOptions, 'get', false);
            defaultValue(attributeOptions, 'default', undefined);
            defaultValue(attributeOptions, 'primary', false);

            // there we can add validators
            // TODO validate by types, values (numbers, strings etc)

            this.attributes[name] = attributeOptions;

            if(attributeOptions.primary) {
                if(this.primaryKey)
                    throw new Error('There are 2 primary attributes: ' + this.primaryKey + ' and ' + name);

                this.primaryKey = name;
            }

        }
        return this;
    };

    Model.use = function(fn){
        fn(this);
        return this;
    };

    Model.create = function(obj) {
        return obj instanceof this ? obj : new (this)(obj);
    };

    return Model;
};

module.exports = createModel;
