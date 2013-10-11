var should = require('should');

var moco = require('../');
var util = require('../lib/collection/util');

var M = moco.model()
    .attr('a', { primary: true });

var C = moco.collection(M)
    .use(util.byId);

var C1 = moco.collection(M)
    .use(util.byField('a'));

var C2 = moco.collection(M)
    .use(util.modelsChanges);

describe('Collection Utils', function () {
    describe('.byId', function () {
        it('should be possible to retrieve model by its primary', function () {
            var m = new M({ a: 1 });
            var c = new C([
                { a: 2 },
                m,
                { a: 4 }
            ]);

            c.byId(m.primary).should.be.exactly(m);

            c.splice(1, 1);

            should(c.byId(m.primary)).not.ok;
        });

        it('should allow to remove model by its primary', function() {
            var m = new M({ a: 1 });
            var c = new C([
                { a: 2 },
                m,
                { a: 4 }
            ]);

            c.removeById(m.primary).should.be.exactly(m);

            c.should.have.length(2);
        });
    });

    describe('.byField', function() {
        it('should allow to retrieve by field value', function() {
            var m = new M({ a: 1 });
            var c = new C1([
                { a: 2 },
                m,
                { a: 4 }
            ]);

            c.byA(m.a).should.be.exactly(m);

            c.splice(1, 1);

            should(c.byA(m.a)).not.ok;
        })
    });

    describe('.modelsChanges', function() {
        it('should emit change event when nested model changed', function() {
            var m = new M({ a: 1 });
            var c = new C2([
                { a: 3 },
                m,
                { a: 4 }
            ]);

            c.on('change', function(model, name, value, prev) {
                name.should.be.eql('a');
                model.should.be.exactly(m);

                value.should.be.eql(2);
                prev.should.be.eql(1);
            });

            c.on('change:a', function(model, value, prev) {
                model.should.be.exactly(m);

                value.should.be.eql(2);
                prev.should.be.eql(1);
            });

            m.a = 2;
        })
    });
});