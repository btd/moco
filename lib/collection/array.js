var aProto = Array.prototype;

var aPush = aProto.push;
var aPop = aProto.pop;
var aShift = aProto.shift;
var aUnshift = aProto.unshift;
var aSplice = aProto.splice;

var onChange = function(event, collection, model) {
  collection.constructor.emit(event, collection, model);
  collection.emit(event, model);
};

var ArrayProto = {

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push
  push: function() {
    var len = arguments.length;
    var Model = this.constructor.model;

    //console.log('PUSH ARG',arguments);

    for(var i = 0; i < len; i++) {
      //console.log('GETTING MODEL IN PUSH', JSON.stringify(arguments[i]));
      var model = Model.create(arguments[i]);
      // console.log('PUSH', JSON.stringify(arguments[i]), model.toJSON());
      aPush.call(this, model);

      onChange('add', this, model);
    }
    return this.length;
  },

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift
  unshift: function() {
    var len = arguments.length;
    var Model = this.constructor.model;

    for(var i = 0; i < len; i++) {
      var model = Model.create(arguments[i]);
      aUnshift.call(this, model);

      onChange('add', this, model);
    }
    return this.length;
  },

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/pop
  pop: function() {
    var model = aPop.call(this);

    onChange('remove', this, model);
    return model;
  },

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/shift
  shift: function() {
    var model = aShift.call(this);

    onChange('remove', this, model);
    return model;
  },

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
  splice: function(index, howMany /* [, element1[, ...[, elementN]]]*/) {
    var i, len;
    if(arguments.length > 2) {
      var Model = this.constructor.model;
      for(i = 2, len = arguments.length; i < len; i++) {
        arguments[i] = Model.create(arguments[i]);
      }
    }
    var removedModels = aSplice.apply(this, arguments);

    for(i = 0, len = removedModels.length; i < len; i++) onChange('remove', this, removedModels[i]);
    for(i = 2, len = arguments.length; i < len; i++) onChange('add', this, arguments[i]);

    return removedModels;
  }
};

var copy = function(name) {
  ArrayProto[name] = aProto[name];
};

var copyThis = function(name) {
  ArrayProto[name] = function() {
    return new (this.constructor)(aProto[name].apply(this, arguments));
  }
};

['indexOf', 'lastIndexOf', 'sort', 'reverse', 'join', 'toString', 'forEach', 'every', 'some', 'map', 'reduce', 'reduceRight'].forEach(copy);
['concat', 'slice', 'filter'].forEach(copyThis);

module.exports = function(Collection) {
  for(var method in ArrayProto) {
    Collection.prototype[method] = ArrayProto[method];
  }
}
