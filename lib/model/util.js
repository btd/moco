var util = require('../util');

module.exports.nestedObjects = function(Model) {
  function wrap(model, attr, constructor) {
    model.set(attr, constructor.create(model[attr]), true);

    model[attr].on('change', model._attrChange[attr]);
  }

  function wrapCollection(model, attr, constructor) {
    wrap(model, attr, constructor);

    model[attr].on('add', model._attrChange[attr].coll);
    model[attr].on('remove', model._attrChange[attr].coll);
  }


  var modelAttributes = [];
  var collectionAttributes = [];

  function onAttr(name, attributeOptions) {
    if(util.isModelAttribute(attributeOptions)) {//nested Model
      modelAttributes.push(name);
    } else if(util.isCollectionAttribute(attributeOptions)) { // nested collection
      collectionAttributes.push(name);
    }
  }

  Model.keys.forEach(function(name) {
    onAttr(name, Model.attributes[name]);
  });

  Model.on('attr', onAttr);

  Model.on('initialize', function(model) {
    Object.defineProperty(model, '_attrChange', {
      value: {},
      enumerable: false
    });

    modelAttributes.forEach(function(attr) {
      var attributeOptions = Model.attributes[attr];

      model._attrChange[attr] = function(name, value, prev) {
        name = attr + '.' + name;
        var ownAttrValue = model[attr];

        Model.emit('change', model, name, value, prev);
        Model.emit('change:' + name, model, value, prev);

        Model.emit('change', model, attr, ownAttrValue, ownAttrValue);
        Model.emit('change:' + name, model, ownAttrValue, ownAttrValue);

        model.emit('change', name, value, prev);
        model.emit('change:' + name, value, prev);

        model.emit('change', attr, ownAttrValue, ownAttrValue);
        model.emit('change:' + attr, ownAttrValue, ownAttrValue);
      };

      if(typeof model[attr] != 'undefined') {
        wrap(model, attr, attributeOptions.type);
      }
    });

    collectionAttributes.forEach(function(attr) {
      var attributeOptions = Model.attributes[attr];

      model._attrChange[attr] = function(nestedModel, name, value, prev) {
        name = attr + '.' + name;
        var ownAttrValue = nestedModel;

        Model.emit('change', model, name, value, prev);
        Model.emit('change:' + name, model, value, prev);

        Model.emit('change', model, attr, ownAttrValue, ownAttrValue);
        Model.emit('change:' + name, model, ownAttrValue, ownAttrValue);

        model.emit('change', name, value, prev);
        model.emit('change:' + name, value, prev);

        model.emit('change', attr, ownAttrValue, ownAttrValue);
        model.emit('change:' + attr, ownAttrValue, ownAttrValue);
      };

      model._attrChange[attr].coll = function(value) {
        Model.emit('change', model, attr, value, value);
        Model.emit('change:' + attr, model, value, value);
        model.emit('change', attr, value, value);
        model.emit('change:' + attr, value, value);
      };

      if(typeof model[attr] != 'undefined') {
        wrapCollection(model, attr, attributeOptions.type);
      }
    });

    model.on('change', function(attr, value, prev) {
      if(value !== prev) {
        var attributeOptions = Model.attributes[attr];

        if(attributeOptions) {
          if(util.isModelAttribute(attributeOptions)) {//nested Model
            if(prev instanceof attributeOptions.type) {
              prev.off('change', model._attrChange[attr]);
            }

            wrap(model, attr, attributeOptions.type);
          } else if(util.isCollectionAttribute(attributeOptions)) { // nested collection
            if(prev instanceof attributeOptions.type) {
              prev.off('change', model._attrChange[attr]);
              prev.off('add', model._attrChange[attr].coll);
              prev.off('remove', model._attrChange[attr].coll);
            }

            wrapCollection(model, attr, attributeOptions.type);
          }
        }
      }
    });


  });
};
