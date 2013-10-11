

var byId = function(Collection) {
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

var byFieldCache = function(name) {
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

module.exports = {
    byId: byId,
    byFieldCache: byFieldCache
};