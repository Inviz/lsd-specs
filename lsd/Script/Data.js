describe("LSD.Data", function() {
  describe('set', function() {
    describe('simple key', function() {
      it ('should set value by key', function() {
        var object = new LSD.Data;
        object.set('a', 'b');
        expect(object.a).toEqual('b')
      })
    })
    describe('nested', function() {
      describe('word key', function() {
        it ('should create a nested object and set value by key', function() {
          var object = new LSD.Data;
          object.set('a[c]', 'b');
          expect(object.a.c).toEqual('b')
        })
      })
      describe('empty key', function() {
        it ('should create a nested array and set value by key', function() {
          var object = new LSD.Data;
          object.set('a[]', 'b');
          expect(object.a[0]).toEqual('b')
          expect(object.a.push).toBeDefined();
        })
      })
      describe('numerical key', function() {
        it ('should create a nested array and set value by key', function() {
          var object = new LSD.Data;
          object.set('a[0]', 'b');
          expect(object.a[0]).toEqual('b')
          expect(object.a.push).toBeDefined();
        })
      })
    })
    describe('deeply nested', function() {
      describe('word key', function() {
        describe('inside another word key', function() {
          it ('should create all nested objects and set value by key', function() {
            var object = new LSD.Data;
            object.set('a[c][d]', 'b');
            expect(object.a.c.d).toEqual('b')
          })
        })
        describe('inside empty key', function() {
          it ('should create all nested objects and set value by key', function() {
            var object = new LSD.Data;
            object.set('a[][d]', 'b');
            expect(object.a[0].d).toEqual('b')
          })
        })
        describe('inside numerical key', function() {
          it ('should create all nested objects and set value by key', function() {
            var object = new LSD.Data;
            object.set('a[1][d]', 'b');
            expect(object.a[1].d).toEqual('b')
          })
        })
      })
      describe('empty key', function() {
        describe('inside word key', function() {
          it ('should create a nested array and set value by key', function() {
            var object = new LSD.Data;
            object.set('a[b][]', 'b');
            expect(object.a.b[0]).toEqual('b')
            expect(object.a.b.push).toBeDefined();
          })
        })
        describe('inside another empty key key', function() {
          it ('should create a nested array and set value by key', function() {
            var object = new LSD.Data;
            object.set('a[][]', 'b');
            expect(object.a[0][0]).toEqual('b')
            expect(object.a.push).toBeDefined();
            expect(object.a[0].push).toBeDefined();
          })
        })
        describe('inside numerical key', function() {
          it ('should create a nested array and set value by key', function() {
            var object = new LSD.Data;
            object.set('a[4][]', 'b');
            expect(object.a[4][0]).toEqual('b')
            expect(object.a.push).toBeDefined();
            expect(object.a[4].push).toBeDefined();
          })
        })
      })
      describe('numerical key', function() {
        describe('inside word key', function() {
          it ('should create a nested array and set value by key', function() {
            var object = new LSD.Data;
            object.set('a[b][0]', 'b');
            expect(object.a.b[0]).toEqual('b')
            expect(object.a.b.push).toBeDefined();
          })
        })
        describe('inside empty key', function() {
          it ('should create a nested array and set value by key', function() {
            var object = new LSD.Data;
            object.set('a[][3]', 'b');
            expect(object.a[0][3]).toEqual('b')
            expect(object.a.push).toBeDefined();
            expect(object.a[0].push).toBeDefined();
          })
        })
        describe('inside numerical key', function() {
          it ('should create a nested array and set value by key', function() {
            var object = new LSD.Data;
            object.set('a[2][3]', 'b');
            expect(object.a[2][3]).toEqual('b')
            expect(object.a.push).toBeDefined();
            expect(object.a[2].push).toBeDefined();
          })
        })
      })
    })
  })
})