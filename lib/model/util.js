var wrap = function(model, attr, constructor) {
    model[attr] = constructor.create(model[attr]);

    model[attr].on('change', model._attrChange[attr]);
};

var wrapCollection = function(model, attr, constructor) {
    wrap(model, attr, constructor);

    model[attr].on('add', model._attrChange[attr].coll);
    model[attr].on('remove', model._attrChange[attr].coll);
}

module.exports.nestedObjects = function(Model) {
    Model.on('initialize', function(model) {
        Object.defineProperty(model, '_attrChange', {
            value: {},
            enumerable: false
        });

        Object.keys(Model.attributes).forEach(function(attr) {
            var attributeOptions = Model.attributes[attr];

            //wrap attributes to constructors
            if(attributeOptions.model) {//nested Model
                model._attrChange[attr] = function(name, value, prev) {
                    name = attr + '.' + name;
                    var ownAttrValue = model[attr];

                    model.constructor.emit('change', model, name, value, prev);
                    model.constructor.emit('change:' + name, model, value, prev);

                    model.constructor.emit('change', model, attr, ownAttrValue, ownAttrValue);
                    model.constructor.emit('change:' + name, attr, ownAttrValue, ownAttrValue);

                    model.emit('change', name, value, prev);
                    model.emit('change:' + name, value, prev);

                    model.emit('change', attr, ownAttrValue, ownAttrValue);
                    model.emit('change:' + attr, ownAttrValue, ownAttrValue);
                };

                wrap(model, attr, attributeOptions.model);
            } else if(attributeOptions.collection) { // nested collection
                model._attrChange[attr] = function(nestedModel, name, value, prev) {
                    name = attr + '.' + name;
                    var ownAttrValue = nestedModel;

                    model.constructor.emit('change', model, name, value, prev);
                    model.constructor.emit('change:' + name, model, value, prev);

                    model.constructor.emit('change', model, attr, ownAttrValue, ownAttrValue);
                    model.constructor.emit('change:' + name, attr, ownAttrValue, ownAttrValue);

                    model.emit('change', name, value, prev);
                    model.emit('change:' + name, value, prev);

                    model.emit('change', attr, ownAttrValue, ownAttrValue);
                    model.emit('change:' + attr, ownAttrValue, ownAttrValue);
                };

                model._attrChange[attr].coll = function(value) {
                    model.constructor.emit('change', model, attr, value, value);
                    model.constructor.emit('change:' + attr, model, value, value);
                    model.emit('change', attr, value, value);
                    model.emit('change:' + attr, value, value);
                }

                wrapCollection(model, attr, attributeOptions.collection);
            }
        });

        model.on('change', function(attr, value, prev) {
            if(value !== prev) {
                var attributeOptions = Model.attributes[attr];

                if(attributeOptions) {
                    if(attributeOptions.model) {//nested Model
                        prev.off('change', model._attrChange[attr]);

                        wrap(model, attr, attributeOptions.model);
                    } else if(attributeOptions.collection) { // nested collection
                        prev.off('change', model._attrChange[attr]);
                        prev.off('add', model._attrChange[attr].coll);
                        prev.off('remove', model._attrChange[attr].coll);

                        wrapCollection(model, attr, attributeOptions.collection);
                    }
                }
            }
        });
    });
};
