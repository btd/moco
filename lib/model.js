try {
  var Emitter = require('emitter');
} catch(e) {
  var Emitter = require('emitter-component');
}

var util = require('./util');

var attr = require('./model/attr');
var toJSON = require('./model/to-json');
var primary = require('./model/primary');

var createModel = function(modelOptions) {
  function Model(attributes) {
    if(!(this instanceof Model)) return new Model(attributes);

    Object.defineProperties(this, {
      attributes: {
        value: {},
        enumerable: false
      },
      _callbacks: { //for event emitter
        value: {},
        enumerable: false
      }
    });

    Object.defineProperties(this, Model._properties);

    this.reset(true);
    this.set(attributes, true);

    Model.emit('initialize', this);

    Object.seal(this);
  }

  Model.prototype = {
    constructor: Model
  };

  Emitter(Model.prototype); // each instance will can emit events
  Emitter(Model); // but also constructor can emit events for all models

  // static properties
  Model.options = modelOptions || {};

  Model._properties = {
  };

  Model.use = function(fn) {
    fn(this);
    return this;
  };

  Model.create = function(obj) {
    return obj instanceof Model ? obj : new Model(obj);
  };

  Model.use(attr).use(toJSON).use(primary);

  return Model;
};

module.exports = createModel;
