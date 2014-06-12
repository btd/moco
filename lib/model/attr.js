var util = require('../util');


module.exports = function(Model) {

  function setAttribute(model, attribute, value, silent) {
    var prev = model.attributes[attribute];
    var changed = prev !== value;

    if(changed) {
      model.attributes[attribute] = value;

      if(!silent) {
        Model.emit('change', model, attribute, value, prev);
        Model.emit('change:' + attribute, model, value, prev);
        model.emit('change', attribute, value, prev);
        model.emit('change:' + attribute, value, prev);
      }
    }
  }


  Model.attributes = {}; // where we store defined attributes and their properties
  Model.keys = []; //attribute names

  Model.attr = function(name, attributeOptions) {
    if(!this.attributes[name]) { //we do not have this attribute
      attributeOptions = attributeOptions || {};

      util.defaultValue(attributeOptions, 'set', function(value) { return value });

      this.attributes[name] = attributeOptions;

      var defaultValue = attributeOptions.default;
      var defaultValueFunction = typeof defaultValue == 'function';

      if(attributeOptions.get) {
        //it is getter
        this._properties[name] = {
          get: attributeOptions.get,
          enumerable: false
        };
      } else {
        this.keys.push(name);

        if(defaultValue) {
          this._properties[name] = {
            // this.attributes added in constructor
            get: function() {
              return this.attributes[name];
            },
            set: function(value, silent) {
              value = attributeOptions.set.call(this, value);
              if(defaultValue && typeof value == 'undefined') {
                if(defaultValueFunction) {
                  value = defaultValue.call(this);
                } else {
                  value = defaultValue;
                }
              }
              setAttribute(this, name, value, silent);
            },
            enumerable: true
          };
        } else {
          this._properties[name] = {
            // this.attributes added in constructor
            get: function() {
              return this.attributes[name];
            },
            set: function(value, silent) {
              value = attributeOptions.set.call(this, value);
              setAttribute(this, name, value, silent);
            },
            enumerable: true
          };
        }
      }

      Model.emit('attr', name, attributeOptions);
    }
    return this;
  };

  Model.prototype.set = function Model$set(attributes, silent) {
    attributes = attributes || {};

    var _attrs = Model.keys, l = _attrs.length;
    while(l--) {
      var name = _attrs[l];
      Model._properties[name].set.call(this, attributes[name], silent);
    }
  };
}