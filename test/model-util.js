var should = require('should');

var moco = require('../');
var nestedObjects = require('../lib/model/util').nestedObjects;

var NestedModel1 = moco.model()
  .attr('a');

var NestedModel3 = moco.model()
  .attr('a', { type: NestedModel1})
  .use(nestedObjects);

var NestedCollection = moco.collection(NestedModel1)
  .use(moco.collection.modelsChanges);

var NestedModel2 = moco.model()
  .attr('a', { type: NestedModel1 })
  .attr('b', { type: NestedCollection })
  .use(nestedObjects);

var M = moco.model()
  .attr('a', { type: NestedModel2 });

var C = moco.collection(M)
  .use(moco.collection.modelsChanges);

describe('Model Utils', function () {
  describe('.nestedObjects', function () {
    it('should emit change event when in nested object attribute changed', function () {
      var m1 = new NestedModel1({ a: 'a' });

      var m2 = new NestedModel3({ a: m1 });

      var callbacksCalled = 0;
      m2.on('change:a.a', function (value, prev) {
        callbacksCalled++;

        value.should.be.eql('not a');
        prev.should.be.eql('a');
      });

      m2.on('change:a', function (value, prev) {
        callbacksCalled++;

        value.should.be.equal(prev);
        value.should.be.equal(m2.a);
      });

      m2.on('change', function (name, value, prev) {
        callbacksCalled++;
        switch (name) {
          case 'a':
            value.should.be.equal(prev);
            value.should.be.equal(m2.a);
            break;
          case 'a.a':
            value.should.be.eql('not a');
            prev.should.be.eql('a');
            break;
          default:
            should.fail('There should not be such event');
        }
      });

      m1.a = 'not a';

      callbacksCalled.should.be.eql(4);
    });

    it('should emit change event when in nested array happen add or remove', function () {
      var c = new NestedCollection();

      var m = new NestedModel2({ b: c });

      var callbacksCalled = 0;
      m.on('change:b', function (value, prev) {
        callbacksCalled++;

        value.should.be.eql(prev);
      });

      m.on('change', function (name, value, prev) {
        callbacksCalled++;

        name.should.be.eql('b');
        value.should.be.eql(prev);
      });

      c.push({ a: 'a' });
      c.pop();

      callbacksCalled.should.be.eql(4);
    });

    it('should emit change event when collection emit change event', function () {
      var nm = new NestedModel1({ a: 'a' });

      var c = new NestedCollection([ nm ]);

      var m = new NestedModel2({ b: c });

      var callbacksCalled = 0;
      m.on('change:b.a', function (value, prev) {
        callbacksCalled++;

        value.should.be.eql('b');
        prev.should.be.eql('a');
      });

      m.on('change:b', function (value, prev) {
        callbacksCalled++;

        value.should.be.eql(prev);
      });

      m.on('change', function (name, value, prev) {
        callbacksCalled++;

        switch (name) {
          case 'b':
            value.should.be.eql(prev);
            break;
          case 'b.a':
            value.should.be.eql('b');
            prev.should.be.eql('a');
            break;
          default:
            should.fail('There should not be such event');
        }
      });

      nm.a = 'b';

      callbacksCalled.should.be.eql(4);
    });
  });
});


