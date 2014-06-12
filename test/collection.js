var should = require('should');

var createCollection = require('../').collection;

describe('Collection', function() {
  it('should be created without model', function() {
    var C = createCollection();

    var models = [1, 2, 3, { a: 10 }];
    var c = new C(models);

    c.should.be.eql(models);
  });

  it('should be able to use array-like objects', function() {
    var C = createCollection();

    var models = { '0': 1, '1': 2, '2': 3, length: 3 };
    var c = new C(models);

    c.should.have.properties(models);
  });

  it('should have not enumerable, writable length and keys the same', function() {
    var C = createCollection();

    var models = [1, 2, 3];
    var c = new C(models);

    c.should.have.length(models.length);
    Object.keys(c).should.have.keys(Object.keys(models));
  });

  describe('Array methods', function() {
    it('#push', function() {
      var C = createCollection();

      var c = new C();

      c.should.be.empty;

      c.push(1, 2, 3).should.be.equal(3);
      c.should.have.length(3);
    });

    it('#pop', function() {
      var C = createCollection();

      var c = new C([1, 2]);

      c.pop().should.be.equal(2);
      c.should.have.length(1);
      c.pop().should.be.equal(1);
      c.should.have.length(0);

      should(c.pop()).not.be.ok;
    });

    it('#shift', function() {
      var C = createCollection();

      var c = new C([1, 2]);

      c.shift().should.be.equal(1);
      c.should.have.length(1);
      c.shift().should.be.equal(2);
      c.should.have.length(0);

      should(c.shift()).not.be.ok;
    });

    it('#unshift', function() {
      var C = createCollection();

      var c = new C();

      c.should.be.empty;

      c.unshift(1, 2, 3).should.be.equal(3);
      c.should.have.length(3);
    });

    it('#splice', function() {
      var C = createCollection();

      var c = new C([ 1, 2, 3, 4 ]);

      var res = c.splice(1, 2, 5, 6);

      res.should.be.eql([2, 3]);
      c.should.have.length(4);
      c[1].should.be.eql(5);
      c[2].should.be.eql(6);

      res.splice(0, 0).should.be.empty;
    });
  })
});
