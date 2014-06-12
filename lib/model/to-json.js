module.exports = function(Model) {
  function generateToJSON() {
    var func = Model.keys.map(function(attr) {
      var attributeOptions = Model.attributes[attr];
      var attrName = '"' + attr.replace('"', '\\"') + '"';
      var a = '_temp = this[' + attrName + '];\nif(_temp !== undefined) { obj[' + attrName + '] = ';
      if(attributeOptions.type && !attributeOptions.type.wrapper) {
        return a + '_temp != null ? _temp.toJSON() : _temp }';
      } else {
        return a + '_temp }';
      }
    }).join('\n');

    Model.prototype.toJSON = new Function('var _temp, obj = {}; ' + func + '; return obj; ');
  }

  Model.on('attr', generateToJSON);
}
