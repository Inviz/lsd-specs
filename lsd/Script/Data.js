describe("LSD.Data", function() {
  describe('set', function() {
    describe('simple key', function() {
      it ('should set value by key', function() {
        var object = new LSD.Data;
        object.set('a', 'b');
        expect(object.a).toEqual('b')
        object.unset('a', 'b')
        expect(object.a).toBeUndefined();
      })
    })
    describe('nested', function() {
      describe('word key', function() {
        it ('should create a nested object and set value by key', function() {
          var object = new LSD.Data;
          object.set('a[c]', 'b');
          expect(object.a.c).toEqual('b')
          object.unset('a[c]', 'b')
          expect(object.a.c).toBeUndefined();
        })
      })
      describe('empty key', function() {
        it ('should create a nested array and set value by key', function() {
          var object = new LSD.Data;
          object.set('a[]', 'b');
          expect(object.a[0]).toEqual('b')
          expect(object.a.push).toBeDefined();
          object.unset('a[]', 'b')
          expect(object.a[0]).toBeUndefined();
        })
      })
      describe('numerical key', function() {
        it ('should create a nested array and set value by key', function() {
          var object = new LSD.Data;
          object.set('a[0]', 'b');
          expect(object.a[0]).toEqual('b')
          expect(object.a.push).toBeDefined();
          object.unset('a[0]', 'b');
          expect(object.a[0]).toBeUndefined()
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
            object.unset('a[c][d]', 'b');
            expect(object.a.c.d).toBeUndefined()
          })
        })
        describe('inside empty key', function() {
          it ('should create all nested objects and set value by key', function() {
            var object = new LSD.Data;
            object.set('a[][d]', 'b');
            expect(object.a[0].d).toEqual('b')
            object.unset('a[][d]', 'b');
            expect(object.a[0].d).toBeUndefined()
          })
        })
        describe('inside numerical key', function() {
          it ('should create all nested objects and set value by key', function() {
            var object = new LSD.Data;
            object.set('a[1][d]', 'b');
            expect(object.a[1].d).toEqual('b')
            object.unset('a[1][d]', 'b');
            expect(object.a[1].d).toBeUndefined()
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
            object.unset('a[b][]', 'b');
            expect(object.a.b[0]).toBeUndefined()
          })
        })
        describe('inside another empty key key', function() {
          it ('should create a nested array and set value by key', function() {
            var object = new LSD.Data;
            object.set('a[][]', 'b');
            expect(object.a[0][0]).toEqual('b')
            expect(object.a.push).toBeDefined();
            expect(object.a[0].push).toBeDefined();
            object.unset('a[][]', 'b');
            expect(object.a[0][0]).toBeUndefined();
          })
        })
        describe('inside numerical key', function() {
          it ('should create a nested array and set value by key', function() {
            var object = new LSD.Data;
            object.set('a[4][]', 'b');
            expect(object.a[4][0]).toEqual('b')
            expect(object.a.push).toBeDefined();
            expect(object.a[4].push).toBeDefined();
            object.unset('a[4][]', 'b');
            expect(object.a[4][0]).toBeUndefined()
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
            object.unset('a[b][0]', 'b');
            expect(object.a.b[0]).toBeUndefined()
          })
        })
        describe('inside empty key', function() {
          it ('should create a nested array and set value by key', function() {
            var object = new LSD.Data;
            object.set('a[][3]', 'b');
            expect(object.a[0][3]).toEqual('b')
            expect(object.a.push).toBeDefined();
            expect(object.a[0].push).toBeDefined();
            object.unset('a[][3]', 'b');
            expect(object.a[0][3]).toBeUndefined();
          })
        })
        describe('inside numerical key', function() {
          it ('should create a nested array and set value by key', function() {
            var object = new LSD.Data;
            object.set('a[2][3]', 'b');
            expect(object.a[2][3]).toEqual('b')
            expect(object.a.push).toBeDefined();
            expect(object.a[2].push).toBeDefined();
            object.unset('a[2][3]', 'b');
            expect(object.a[2][3]).toBeUndefined()
          })
        })
      })
    })
  })
  describe('toString', function() {
    it ('should recursively serialize simple values', function() {
      expect(LSD.Data.fromString('a=1').toString()).toEqual('a=1')
    });
    it ('should recursively serialize nested values', function() {
      expect(LSD.Data.fromString('a[b]=1').toString()).toEqual('a[b]=1')
    });
    it ('should recursively serialize deeply nested values', function() {
      expect(LSD.Data.fromString('a[b][]=1').toString()).toEqual('a[b][]=1')
    });
    it ('should recursively serialize multiple deeply nested values', function() {
      expect(LSD.Data.fromString('a[b][]=1&a[b][]=2').toString()).toEqual('a[b][]=1&a[b][]=2')
    });
    it ('should recursively serialize and convert values with mixed array access to simple empty index notation', function() {
      expect(LSD.Data.fromString('a[b][]=1&a[b][1]=2').toString()).toEqual('a[b][]=1&a[b][]=2')
    });
  });
  describe('when used in Struct as a second class', function() {
    it ('should be hashing keys', function() {
      var Struct = new LSD.Struct(['Journal', 'Data']);
      var object = new Struct;
      object.set('a[b]', 1);
      expect(object.a.b).toBe(1)
      object.set('a[b]', 2);
      expect(object.a.b).toBe(2)
      expect(object._journal).toBe(undefined)
      expect(object.a._journal.b.slice()).toEqual([1, 2])
    })
  })
})