module.exports = function(Model) {
  //Model.primaryKey = false;

  Model.prototype.isNew = function() {
    var key = Model.primaryKey;
    if(!key) throw new Error('Calling isNew on model without primary key');
    return this[key] === undefined;
  }

  Model._properties.primary = {
    get: function() {
      if(Model.primaryKey)
        return this[Model.primaryKey];
      else
        throw new Error('Try to get undefined primary key');
    },
    enumerable: false
  };

  function onAttr(name, attributeOptions) {
    if(attributeOptions.primary) {
      if(Model.primaryKey)
        throw new Error('There are 2 primary attributes: ' + this.primaryKey + ' and ' + name);

      Model.primaryKey = name;
    }
  }

  Model.keys.forEach(function(name) {
    onAttr(name, Model.attributes[name]);
  });

  Model.on('attr', onAttr)
}