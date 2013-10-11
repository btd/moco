var should = require('should');

var createCollection = require('../').collection;

describe('Collection', function() {
    it('should be created without model', function() {
        var C = createCollection();

        var models = [1, 2, 3];
        var c = new C(models);

        for(var i = 0, len = models.length; i < len; i++)
            c[i].should.be.exactly(models[i]);

        c.should.have.length(models.length);
    });

    it('should be able to use array-like objects', function() {
        var C = createCollection();

        var models = { '0': 1, '1': 2, '2': 3, length: 3 };
        var c = new C(models);

        for(var i = 0, len = models.length; i < len; i++)
            c[i].should.be.exactly(models[i]);

        c.should.have.length(models.length);
    });

    it('should have not enumerable, writable length', function() {
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

            c.should.have.empty;

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
    })
});
