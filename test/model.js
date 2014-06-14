var should = require('should');

var createModel = require('../').model;

var M = createModel()
  .attr('a')
  .attr('b')
  .attr('c');

describe('Model', function() {
  it('should be able to define simple attributes and be able to use them via constructor', function() {
    var a = { a: 1, b: 'b', c: 'c' };
    var m = new M(a);

    m.should.containEql(a);
  });

  it('should be able to assign attributes by =', function() {
    var m = new M();
    m.a = 'a';

    m.a.should.containEql('a');
  });

  it('should not be able to save values that we do not define', function() {
    var m = new M();
    m.v = 'a';

    should(m.v).not.ok;
  });

  it('should set default values while creation of attribute undefined', function() {
    var M1 = createModel().attr('a').attr('b', { default: 'b' });

    var m = new M1({ a: 'a' });

    m.should.have.properties({ a: 'a', b: 'b' });
  });

  it('should set default values while creation of attribute undefined if default value is function call it', function() {
    var M1 = createModel().attr('a').attr('b', { default: function() {
      return 'b';
    } });

    var m = new M1({ a: 'a' });

    m.should.containEql({ a: 'a', b: 'b' });
  });

  it('should attributes should save references', function() {
    var M1 = createModel().attr('a');

    var a = { b: 'b' };

    var m = new M1({ a: a });

    m.a.should.be.exactly(a);
  });

  it('should save primary attribute in .primaryKey', function() {
    var P = createModel().attr('pk', { primary: true });

    P.primaryKey.should.be.exactly('pk');
  });

  it('should not allow to set 2 primary attributes', function() {
    (function() {
      createModel().attr('pk1', { primary: true }).attr('pk2', { primary: true });
    }).should.throw();
  });

  it('should ignore redefinition of attributes', function() {
    var M1 = createModel().attr('a', { prop: 1 }).attr('a', { prop: 2 });

    M1.attributes.a.prop.should.be.exactly(1);
  });

  it('should return primary attribute by #primary', function() {
    var M1 = createModel().attr('a', { primary: true });

    var m = new M1({ a: 1 });
    m.primary.should.be.exactly(1);
  });

  it('should throw error if we are trying to get primary when it is not defined', function() {
    var M1 = createModel().attr('a');

    var m = new M1({ a: 1 });
    (function() {
      m.primary;
    }).should.throw();
  });

  it('should return only enumerated attributes, that is defined', function() {
    var M1 = createModel().attr('a').attr('b').attr('c');

    Object.keys(new M1()).should.be.eql(['a', 'b', 'c']);
  });

  it('should allow to define virtual attribute', function() {
    var M1 = createModel().attr('a', { get: function() {
      return 'a' + this.b;
    } }).attr('b');

    var m = new M1({ a: 1, b: 2 });

    m.a.should.be.exactly('a2');
  });

  it('#isNew should say if model new (do not have primary property filled)', function() {
    var M1 = createModel().attr('a', { primary: true }).attr('b');

    var m1 = new M1({ a: 1, b: 2 });

    m1.isNew().should.be.false;

    var m2 = new M1({ b: 2 });

    m2.isNew().should.be.true;
  });

  it('should complain if model.isNew called on model without primary key', function() {
    var M1 = createModel().attr('b');

    (new M1()).isNew.should.throw();
  });

  it('.create should wrap object to model if it is not a model', function() {
    M.create({}).should.be.instanceof(M);

    var m = new M();
    M.create(m).should.be.exactly(m);
  });

  it('should emit "change" event when model attribute changed', function() {
    var m = new M({ a: 1, b: 2, c: 3});

    var numOfchanges = 0;

    m.on('change', function(name, value, prev) {
      numOfchanges++;
    });

    m.on('change:a', function(value, prev) {
      value.should.be.equal(2);
      prev.should.be.equal(1);
    });

    m.on('change:b', function(value, prev) {
      value.should.be.equal(3);
      prev.should.be.equal(2);
    });

    m.on('change:c', function(value, prev) {
      value.should.be.equal(4);
      prev.should.be.equal(3);
    });

    m.a = 2;
    m.b = 3;
    m.c = 4;

    numOfchanges.should.be.exactly(3);
  });

  it('should be able to preprocess value before assign', function() {
    var M1 = createModel().attr('a', { set: function(value) {
      return value && value.toLowerCase().trim();
    } });

    var m = new M1({ a: ' ABC ' });
    m.a.should.be.equal('abc');

    m.a = ' CDE ';
    m.a.should.be.equal('cde');
  })
});