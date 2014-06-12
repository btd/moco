module.exports = function(Collection) {
  Collection.prototype.toJSON = function() {
    var arr = new Array(this.length);
    for(var i = 0, l = this.length; i < l; i++) {
      var el = this[i];
      if(el && el.toJSON) {
        arr[i] = el && el.toJSON();
      } else {
        arr[i] = el;
      }
    }
    return arr;
  }
}