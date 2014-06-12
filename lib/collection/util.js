

module.exports.byId = function(Collection) {
    Collection.prototype.byId = function(id) {
        return this._byIdCache[String(id)];
    };

    Collection.prototype.removeById = function(id) {
        var index = this.indexOf(this._byIdCache[String(id)]);
        return this.splice(index, 1)[0];
    };

    Collection.on('initialize', function(collection) {
        Object.defineProperty(collection, '_byIdCache', {
            value: {},
            enumerable: false
        });

        collection.on('add', function(model) {
          //console.log('collection add', model.toJSON());
          collection._byIdCache[model.primary] = model;
        });

        collection.on('remove', function(model) {
          delete collection._byIdCache[model.primary];
        });
    });
};

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

module.exports.byField = function(name) {
    return function(Collection) {
        var cache = '_by_' + name + '_cache';

        Collection.prototype['by' + capitalize(name)] = function(val) {
            return this[cache][val];
        };

        Collection.on('initialize', function(collection) {
            var onFieldChange = function(value, prev) {
                delete collection[cache][prev];

                collection[cache][value] = this;//this there it is a model instance
            };

            Object.defineProperty(collection, cache, {
                value: {},
                enumerable: false
            });

            collection.on('add', function(model) {
                collection[cache][model[name]] = model;

                model.on('change:' + name, onFieldChange);
            });

            collection.on('remove', function(model) {
                model.off('change:' + name, onFieldChange);
                delete collection[cache][model[name]];
            });
        });
    }
};

module.exports.modelsChanges = function(Collection) {
    Collection.on('initialize', function(collection) {

        Object.defineProperties(collection, {
            _onModelChange:{
                value: function(name, value, prev) {
                    // this there is a model instance
                    collection.constructor.emit('change:' + name, collection, this, value, prev);
                    collection.constructor.emit('change', collection, this, name, value, prev);
                    collection.emit('change:' + name, this, value, prev);
                    collection.emit('change', this, name, value, prev);
                },
                enumerable: false
            }
        });

        collection.on('add', function(model) {
            model.on('change', collection._onModelChange);
        });

        collection.on('remove', function(model) {
            model.off('change', collection._onModelChange);
        });
    });
};