

module.exports.byId = function(Collection) {
    Collection.prototype.byId = function(id) {
        return this._byIdCache[id];
    };

    Collection.prototype.removeById = function(id) {
        var index = this.indexOf(this._byIdCache[id]);
        return this.splice(index, 1)[0];
    }

    Collection.on('initialize', function(collection) {
        Object.defineProperty(collection, '_byIdCache', {
            value: {},
            enumerable: false
        });

        collection.on('add', function(model) {
            collection._byIdCache[model.primary] = model;
        });

        collection.on('remove', function(model) {
            delete collection._byIdCache[model.primary];
        });
    });
};

var capitalize = function(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

module.exports.byField = function(name) {
    return function(Collection) {
        var cache = '_by_' + name + '_cache';

        Collection.prototype['by' + capitalize(name)] = function(val) {
            return this[cache][val];
        };

        Collection.on('initialize', function(collection) {
            Object.defineProperty(collection, cache, {
                value: {},
                enumerable: false
            });

            collection.on('add', function(model) {
                collection[cache][model[name]] = model;
            });

            collection.on('remove', function(model) {
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
                    console.log('on change');
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