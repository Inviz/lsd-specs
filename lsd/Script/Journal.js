describe('LSD.Journal', function() {
  describe('set', function() {
    describe('when given new value', function() {
      it ('should journalize values if there are more than one given by the same key', function() {
        var object = new LSD.Journal;
        expect(object._journal).toBeUndefined();
        object.set('a', 1);
        expect(object._journal).toBeUndefined();
        expect(object.a).toBe(1);
        object.unset('a', 1);
        expect(object._journal).toBeUndefined();
        expect(object.a).toBeUndefined();
        object.set('a', 1);
        expect(object._journal).toBeUndefined();
        expect(object.a).toBe(1);
        object.set('a', 2);
        expect(object.a).toBe(2);
        expect(object._journal).toBeDefined();
        expect(object._journal.a).toEqual([1, 2]);
        object.unset('a', 1);
        expect(object.a).toBe(2);
        expect(object._journal.a).toEqual([2]);
        object.unset('a', 1);
        expect(object.a).toBe(2);
        expect(object._journal.a).toEqual([2]);
        object.unset('a', 2);
        expect(object.a).toBeUndefined()
        expect(object._journal.a).toEqual([]);
      })
      describe('and object already has that key via prototype', function() {
        it ('should be able to change that value without creating a journal', function() {
          var klass = function() {};
          klass.prototype = new LSD.Journal;
          klass.prototype.a = 1;
          var object = new klass;
          object.set('a', 10);
          expect(object._journal).toBeUndefined();
          object.set('a', 100);
          expect(object._journal.a).toEqual([10, 100]);
          object.unset('a', 100);
          expect(object._journal.a).toEqual([10]);
          expect(object.a).toBe(10)
          object.unset('a', 10);
          expect(object.a).toBe(1)
          expect(object._journal.a).toEqual([]);
          object.set('a', 10);
          expect(object._journal.a).toEqual([10]);
          expect(object.a).toBe(10)
          object.unset('a', 10);
          expect(object.a).toBe(1)
          expect(object._journal.a).toEqual([]);
        })
      })
      
      describe('when prepending value', function() {
        describe('and there is that property defined in prototype', function() {
          it ('should NOT create journal right away', function() {
            var klass = function() {};
            klass.prototype = new LSD.Journal;
            klass.prototype.a = 1;
            var object = new klass;
            object.set('a', 10, undefined, undefined, true);
            expect(object._journal).toBeUndefined();
            expect(object.a).toBe(10);
            object.set('a', undefined, 10, undefined, true);
            expect(object.a).toBe(1);
            expect(object._journal).toBeUndefined();
            object.set('a', 10, undefined, undefined, true);
            expect(object.a).toBe(10);
            expect(object._journal).toBeUndefined();
            object.set('a', 20, undefined, undefined, true);
            expect(object._journal.a).toEqual([20, 10]);
            expect(object.a).toBe(10);
            object.unset('a', 10, undefined, undefined, true);
            expect(object._journal.a).toEqual([20]);
            expect(object.a).toBe(20);
            object.set('a', undefined, 20, undefined, true);
            expect(object.a).toBe(1);
            expect(object._journal.a).toEqual([])
            object.set('a', 10, undefined, undefined, true);
            expect(object._journal.a).toEqual([10])
            expect(object.a).toBe(10);
          })
        })
        it ('should not create journal right away', function() {
          var klass = function() {};
          klass.prototype = new LSD.Journal;
          var object = new klass;
          object.set('a', 10, undefined, undefined, true);
          expect(object._journal).toBeUndefined();
          expect(object.a).toBe(10);
          object.set('a', undefined, 10, undefined, true);
          expect(object.a).toBeUndefined()
          expect(object._journal).toBeUndefined();
          object.set('a', 10, undefined, undefined, true);
          expect(object._journal).toBeUndefined();
          expect(object.a).toBe(10);
          object.set('a', 20, undefined, undefined, true);
          expect(object._journal.a).toEqual([20, 10])
          expect(object.a).toBe(10);
          object.set('a', undefined, 10, undefined, true);
          expect(object._journal.a).toEqual([20])
          expect(object.a).toBe(20);
          object.set('a', undefined, 20, undefined, true);
          expect(object.a).toBeUndefined()
          expect(object._journal.a).toEqual([])
          object.set('a', 10, undefined, undefined, true);
          expect(object._journal.a).toEqual([10])
          expect(object.a).toBe(10);
        })
      })
    })
    describe('when given old value', function() {
      describe('and no new value', function() {
        it ('should unset old value', function() {
          var object = new LSD.Journal({title: 'object', body: 'text'});
          expect(object.set('title', undefined, 'object', undefined)).toBe(true)
          expect(object.title).toBeUndefined();
          expect(object.set('body', undefined, 'object', undefined, true)).toBe(false)
          expect(object.body).toBe('text');
          expect(object.set('body', undefined, 'text', undefined, true)).toBe(true)
          expect(object.body).toBeUndefined()
        })
      })
      describe('and a new value', function() {
        it ('should set new value and unset old one', function() {
          var calls = []
          var callback = function(key, value, old, meta) {
            calls.push([key, value, old])
          }
          var object = new LSD.Journal
          object.watch(callback)
          
          object.set('title', 'object')
          expect(calls.pop()).toEqual(['title', 'object', undefined]);
          expect(object._journal).toBeUndefined();
          expect(object.title).toBe('object');
          
          expect(object.set('title', 'bazooka', 'object')).toBe(true);
          expect(calls.pop()).toEqual(['title', 'bazooka', 'object']);
          expect(object._journal).toBeUndefined();
          expect(object.title).toBe('bazooka');
          
          expect(object.set('title', 'voodoo', 'object')).toBe(true)
          expect(object._journal.title).toEqual(['bazooka', 'voodoo']);
          expect(object.title).toBe('voodoo');
          
          expect(object.set('title', 'kazoop')).toBe(true)
          expect(object._journal.title).toEqual(['bazooka', 'voodoo', 'kazoop']);
          expect(calls.pop()).toEqual(['title', 'kazoop', 'voodoo']);
          expect(object.title).toBe('kazoop');
          
          expect(object.set('title')).toBe(true);
          expect(calls.pop()).toEqual(['title', 'voodoo', 'kazoop']);
          expect(object.title).toBe('voodoo');
          
          expect(object.set('title')).toBe(true);
          expect(calls.pop()).toEqual(['title', 'bazooka', 'voodoo']);
          expect(object.title).toBe('bazooka');
          
          expect(object.set('title')).toBe(true);
          expect(calls.pop()).toEqual(['title', undefined, 'bazooka']);
          expect(object.title).toBeUndefined();
        })
      })
    })
  })
  describe('when given a numerical prepend argument', function() {
    it ('should pad the group and insert value at the given position', function() {
      var object = new LSD.Journal;
      object.set('a', 1, undefined, undefined, 0);
      expect(object.a).toBe(1)
      expect(object._journal.a.slice()).toEqual([1]);
      object.set('a', 2, undefined, undefined, 0);
      expect(object.a).toBe(2)
      expect(object._journal.a.slice()).toEqual([2]);
      object.set('a', 3, undefined, undefined, 3);
      expect(object._journal.a.slice()).toEqual([2, undefined, undefined, 3]);
      expect(object.a).toBe(3)
      object.set('a', 4);
      expect(object._journal.a.slice()).toEqual([2, undefined, undefined, 3, 4]);
      expect(object.a).toBe(4)
      object.set('a', undefined, 4);
      expect(object._journal.a.slice()).toEqual([2, undefined, undefined, 3]);
      expect(object.a).toBe(3)
      object.set('a', undefined, 3); //nothing happens! value on the stack is guarded
      expect(object._journal.a.slice()).toEqual([2, undefined, undefined, 3]);
      expect(object.a).toBe(3)
      object.set('a', undefined, 3, undefined, 3); //value is removed by index
      expect(object._journal.a.slice()).toEqual([2, undefined, undefined, undefined]);
      expect(object.a).toBe(2)
      object.set('a', undefined, 3, undefined, 0); //value is removed by index even if it doesnt match
      object.set('a', 4, undefined, undefined, 1);
      expect(object._journal.a.slice()).toEqual([undefined, 4, undefined, undefined]);
      expect(object.a).toBe(4)
      object.set('a', 4, undefined, undefined, true); //prepended values are inserted after indexed values
      expect(object._journal.a.slice()).toEqual([undefined, 4, undefined, undefined, 4]);
      object.set('a', 5, undefined, undefined, true);
      expect(object._journal.a.slice()).toEqual([undefined, 4, undefined, undefined, 5, 4]);
      object.set('a', 4, undefined, undefined, true);
      expect(object._journal.a.slice()).toEqual([undefined, 4, undefined, undefined, 4, 5, 4]);
      object.unset('a', 4, undefined, undefined, true);
      expect(object._journal.a.slice()).toEqual([undefined, 4, undefined, undefined, 5, 4]);
      object.set('a', 6, undefined, undefined, 4);
      expect(object._journal.a.slice()).toEqual([undefined, 4, undefined, undefined, 6, 5, 4]);
      expect(object.a).toBe(4)
      object.unset('a', 4, undefined, undefined, true);
      expect(object._journal.a.slice()).toEqual([undefined, 4, undefined, undefined, 6, 5]);
      expect(object.a).toBe(5)
      object.unset('a', 4, undefined, undefined, true); //nothing happens when removing prepended values if stack doesnt have em
      expect(object._journal.a.slice()).toEqual([undefined, 4, undefined, undefined, 6, 5]);
      object.unset('a', 5, undefined, undefined, true);
      expect(object._journal.a.slice()).toEqual([undefined, 4, undefined, undefined, 6]);
      expect(object.a).toBe(6)
      object.unset('a', 6, undefined, undefined, 4);
      expect(object._journal.a.slice()).toEqual([undefined, 4, undefined, undefined, undefined]);
      expect(object.a).toBe(4)
      object.unset('a', 4, undefined, undefined, 1);
      expect(object._journal.a.slice()).toEqual([undefined, undefined, undefined, undefined, undefined]);
      expect(object.a).toBe(undefined)
    })
    describe('and the argument is infinite', function() {
      it ('should add the value before/after every indexed value', function() {
        var object = new LSD.Journal;
        object.set('a', -Infinity, undefined, undefined, -Infinity);
        expect(object._journal.a.slice()).toEqual([-Infinity])
        expect(object.a).toBe(-Infinity)
        object.set('a', Infinity, undefined, undefined, Infinity);
        expect(object._journal.a.slice()).toEqual([-Infinity, Infinity])
        expect(object.a).toBe(Infinity)
        object.set('a', 0, undefined, undefined, 0);
        expect(object._journal.a.slice()).toEqual([-Infinity, 0, Infinity])
        expect(object.a).toBe(Infinity)
        object.set('a', 'zero', undefined, undefined, 0);
        expect(object._journal.a.slice()).toEqual([-Infinity, 'zero', Infinity])
        expect(object.a).toBe(Infinity)
        object.set('a', 1, undefined, undefined, 1);
        expect(object._journal.a.slice()).toEqual([-Infinity, 'zero', 1, Infinity])
        expect(object.a).toBe(Infinity)
        object.set('a', 'a');
        expect(object._journal.a.slice()).toEqual([-Infinity, 'zero', 1, Infinity, 'a'])
        expect(object.a).toBe('a')
        object.unset('a', Infinity); // does nothing
        expect(object._journal.a.slice()).toEqual([-Infinity, 'zero', 1, Infinity, 'a'])
        expect(object.a).toBe('a')
        object.set('a', 'b', undefined, undefined, true);
        expect(object._journal.a.slice()).toEqual([-Infinity, 'zero', 1, Infinity, 'b', 'a'])
        expect(object.a).toBe('a')
        object.unset('a', 'a'); 
        expect(object._journal.a.slice()).toEqual([-Infinity, 'zero', 1, Infinity, 'b'])
        expect(object.a).toBe('b')
        object.unset('a', 'b');
        expect(object.a).toBe(Infinity)
        expect(object._journal.a.slice()).toEqual([-Infinity, 'zero', 1, Infinity])
        object.unset('a', Infinity, undefined, undefined, Infinity);
        expect(object.a).toBe(1)
        expect(object._journal.a.slice()).toEqual([-Infinity, 'zero', 1, undefined])
        object.unset('a', 1, undefined, undefined, 1);
        expect(object.a).toBe('zero')
        expect(object._journal.a.slice()).toEqual([-Infinity, 'zero', undefined, undefined])
        object.unset('a', 'zero', undefined, undefined, 0);
        expect(object.a).toBe(-Infinity)
        expect(object._journal.a.slice()).toEqual([-Infinity, undefined, undefined, undefined])
        object.unset('a', -Infinity, undefined, undefined, -Infinity);
        expect(object._journal.a.slice()).toEqual([undefined, undefined, undefined, undefined])
        expect(object.a).toBe(undefined)
        object.set('a', 'a');
        expect(object._journal.a.slice()).toEqual([undefined, undefined, undefined, undefined, 'a'])
        expect(object.a).toBe('a')
        object.set('a', Infinity, undefined, undefined, Infinity)
        expect(object.a).toBe('a')
        expect(object._journal.a.slice()).toEqual([undefined, undefined, undefined, Infinity, 'a'])
        object.set('a', -Infinity, undefined, undefined, -Infinity)
        expect(object._journal.a.slice()).toEqual([-Infinity, undefined, undefined, Infinity, 'a'])
        expect(object.a).toBe('a')
        object.set('a', 0, undefined, undefined, 0)
        expect(object._journal.a.slice()).toEqual([-Infinity, 0, undefined, Infinity, 'a'])
        expect(object.a).toBe('a')
        object.set('a', 1, undefined, undefined, 1)
        expect(object._journal.a.slice()).toEqual([-Infinity, 0, 1, Infinity, 'a'])
        expect(object.a).toBe('a')
        object.set('a', 2, undefined, undefined, 2)
        expect(object._journal.a.slice()).toEqual([-Infinity, 0, 1, 2, Infinity, 'a'])
        expect(object.a).toBe('a')
      });
    })
    describe('and property is marked as chunked', function() {
      it ('should fire up callback each time', function() {
        var a = [], b = [], c = [], d = [];
        var Struct = new LSD.Struct({
          a: function(value, old, meta, prepend) { //regular stream
            a.push([value, prepend]);
          },
          b: function(value, old, meta, prepend) { //transforming stream
            if (value === undefined)
              return;
            b.push([value, prepend]);
            return value + '!';
          },
          c: function(value, old, meta, prepend) { //reducing stream
            if (typeof prepend != 'number') return;
            c.push([value, prepend]);
            var group = this._journal.c, str;
            for (var i = 0, j = group.position + 1; i < j; i++)
              if (group[i] && (i !== prepend || value !== undefined))
                (str) = (str || '') + (str && str.length ? '+' : '') + group[i];
            this.change('c', str);
          },
          d: function(value) { //simple property that observes result of reduce
            d.push(value)
            return '~' + value;
          }
        }, 'Journal');
        Struct.prototype._chunked = {
          a: true,
          b: true,
          c: true
        }
        var object = new Struct;
        object.watch('a', 'b');
        object.watch('b', 'c');
        object.watch('c', 'd');
        object.set('a', 1, undefined, undefined, 1); //set 2nd chunk
        expect(object.c).toBe('1!');
        expect(object._journal.a.slice()).toEqual([undefined, 1])
        expect(a).toEqual([[1, 1]])
        expect(b).toEqual([[1, 1]])
        expect(c).toEqual([['1!', 1]])
        expect(d).toEqual(['1!'])
        object.set('a', 2, undefined, undefined, 0); //set 1st chunk
        expect(object.c).toBe('2!+1!');
        expect(object.d).toBe('~2!+1!');
        expect(object._journal.a.slice()).toEqual([2, 1])
        expect(a).toEqual([[1, 1], [2, 0]])
        expect(b).toEqual([[1, 1], [2, 0]])
        expect(c).toEqual([['1!', 1], ['2!', 0]])
        object.set('a', 3, undefined, undefined, 2); //set 3rd chunk
        expect(object.c).toBe('2!+1!+3!');
        expect(object.d).toBe('~2!+1!+3!');
        expect(object._journal.a.slice()).toEqual([2, 1, 3])
        expect(a).toEqual([[1, 1], [2, 0], [3, 2]])
        expect(b).toEqual([[1, 1], [2, 0], [3, 2]])
        expect(c).toEqual([['1!', 1], ['2!', 0], ['3!', 2]])
        expect(d).toEqual(['1!', '2!+1!', '2!+1!+3!'])
        window.zzz = true;
        object.unset('a', 1, undefined, undefined, 1); //unset 2nd chunk
        expect(object.c).toBe('2!+3!');
        expect(object.d).toBe('~2!+3!');
        object.unset('a', 3, undefined, undefined, 2); //unset 3rd chunk
        expect(object.c).toBe('2!');
        expect(object.d).toBe('~2!');
        object.unset('a', 2, undefined, undefined, 0); //unset 1rd chunk
        expect(object.c).toBe(undefined);
        expect(object.d).toBe(undefined);
      })
    })
  })
})