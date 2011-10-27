describe('LSD.Array', function() {
  describe('when initialized', function() {
    describe('without arguments', function() {
      it ('should create new observable array', function() {
        var array = new LSD.Array();
        expect(array.length).toEqual(0);
      })
    });
    describe('with a single argument', function() {
      describe('with a primitive', function() {
        [true, false, 0, null, 123, 'lol', {a: 1}, window.Z0NdEf1n3d].each(function(value) {
          it('should create new one-element obserable array', function() {
            var array = new LSD.Array(value);
            expect(array.length).toEqual(1);
            expect(array[0]).toEqual(value);
          })
        })
      })
      describe ('with array', function() {
        it ('should create new observable array with array properties', function() {
          var origin = [1,2];
          var array = new LSD.Array(origin);
          expect(array).toNotEqual(origin);
          expect(array.length).toEqual(origin.length);
          expect(array[0]).toEqual(origin[0]);
          expect(array[1]).toEqual(origin[1]);
          expect(array[2]).toEqual(origin[2]);
        })
      });
      describe('with arguments', function() {
        it ('should create new observable array with each argument as a property', function() {
          !function() {
            var array = new LSD.Array(arguments);
            expect(array).toNotEqual(arguments);
            expect(array.length).toEqual(arguments.length);
            expect(array[0]).toEqual(arguments[0]);
            expect(array[1]).toEqual(arguments[1]);
            expect(array[2]).toEqual(arguments[2]);
          }('lol', {a: 1});
        })
      })
      describe('with node list', function() {
        it ('should create new observable array with each node as a property', function() {
          var element = document.createElement('div');
          element.appendChild(document.createElement('h1'));
          element.appendChild(document.createElement('p'));
          var nodes = element.childNodes;
          var array = new LSD.Array(nodes);
          expect(array).toNotEqual(nodes);
          expect(array.length).toEqual(nodes.length);
          expect(array[0]).toEqual(nodes[0]);
          expect(array[1]).toEqual(nodes[1]);
          expect(array[2]).toEqual(nodes[2]);
        })
      });
    })
    describe('with multiple arguments', function() {
      describe('and none of them are enumerable', function() {
        it ('should create new observable array from arguments', function() {
          var array = new LSD.Array(0, 1);
          expect(array.length).toEqual(2);
          expect(array[0]).toEqual(0);
          expect(array[1]).toEqual(1);
          expect(array[2]).toBeUndefined();
        })
      })
      describe('and some of arguments are enumerables', function() {
        it ('should create new observable array from arguments but enumerables will not be flatten', function() {
          var a = [1,2]
          var array = new LSD.Array(a, 1);
          expect(array.length).toEqual(2);
          expect(array[0]).toEqual([1,2]);
          expect(array[1]).toEqual(1);
          expect(array[2]).toBeUndefined();
        })
      })
    });
  });
  
  describe('#push', function() {
    describe('when given a single argument', function() {
      it ('should notify observers on each push and provide the position of insertion as the second argument', function() {
        var array = new LSD.Array;
        var pushed = [];
        array.addEvent('change', function(value, index, state) {
          expect(index).toEqual(array.length - 1);
          pushed.push([value, index]);
        });
        expect(pushed).toEqual([]);
        array.push(1);
        expect(pushed).toEqual([[1, 0]]);
        array.push(2);
        expect(pushed).toEqual([[1, 0], [2, 1]]);
        expect(array[0]).toEqual(1);
        expect(array[1]).toEqual(2);
      });
    });
    
    describe('when given multiple arguments', function() {
      it ('should notify observers with each argument separately', function() {
        var array = new LSD.Array;
        var pushed = [], count = 0;
        array.addEvent('change', function(value, index, state) {
          expect(index).toEqual(array.length - 1);
          pushed.push([value, index]);
          count++;
        });
        expect(pushed).toEqual([]);
        array.push(1, 2);
        expect(pushed).toEqual([[1, 0], [2, 1]]);
        expect(count).toEqual(2);
        array.push([555], 4);
        expect(pushed).toEqual([[1, 0], [2, 1], [[555], 2], [4, 3]]);
        expect(count).toEqual(4);
        expect(array[0]).toEqual(1);
        expect(array[1]).toEqual(2);
        expect(array[2]).toEqual([555]);
        expect(array[3]).toEqual(4);
      })
    });
  });
  
  describe('#slice', function() {
    describe('when given no arguments', function() {
      it ("should create a copy of array", function() {
        var array = new LSD.Array([1, 2, 3]);
        var copy = array.slice();
        expect(copy).toNotEqual(array);
        expect(copy[0]).toEqual(array[0]);
        expect(copy[1]).toEqual(array[1]);
        expect(copy[2]).toEqual(array[2]);
        expect(copy[3]).toEqual(array[3]);
      });
    });
    describe('when given a single argument - starting index', function() {
      describe('equal to zero', function() {
        it ("should create a copy of array", function() {
          var array = new LSD.Array([1, 2, 3]);
          var copy = array.slice();
          expect(copy).toNotEqual(array);
          expect(copy.length).toEqual(3)
          expect(copy[0]).toEqual(array[0]);
          expect(copy[1]).toEqual(array[1]);
          expect(copy[2]).toEqual(array[2]);
          expect(copy[3]).toEqual(array[3]);
        });
      });
      describe('not equal to zero', function() {
        it ("should create a copy of array starting from the given offset", function() {
          var array = new LSD.Array([1, 2, 3]);
          var copy = array.slice(1);
          expect(copy).toNotEqual(array);
          expect(copy[0]).toEqual(array[1]);
          expect(copy[1]).toEqual(array[2]);
          expect(copy[2]).toEqual(array[3]);
          expect(copy.length).toEqual(2)
        });
      })
    });
    describe('when given two arguments - start index and offset', function() {
      describe('and offset is a small number', function() {
      });
      describe('and offset is a number that is larger than the length of array', function() {
        it ("should copy array from offset ")
      });
    })
    describe('indexOf', function() {
      describe('in array of primitives', function() {
        describe('when given a primitive', function() {
          it('should return value index', function() {
            var array = new LSD.Array(1, 2, 3);
            expect(array.indexOf(1)).toEqual(0);
            expect(array.indexOf('1')).toEqual(-1);
            expect(array.indexOf(3)).toEqual(2);
            expect(array.indexOf(4)).toEqual(-1);
          })
        })
      });
      describe('in array of objects', function() {
        describe('each having id attribute', function() {
          describe('when given a primitive', function() {
            it ("should find object with that as an id", function() {
              var array = new LSD.Array({id: 'George', title: 'Scientist'}, {id: 'Jack', title: 'Singer'}, {id: 0, title: 'Player'}, {title: 'Hustler'});
              expect(array.indexOf(33)).toEqual(-1);
              expect(array.indexOf(0)).toEqual(2);
              expect(array.indexOf('George')).toEqual(0);
              expect(array.indexOf('Jack')).toEqual(1);
              expect(array.indexOf('Hustler')).toEqual(-1);
            })
          })
          describe('when given an object', function() {
            describe('with id attribute', function() {
              it ("should find that object by id or by identicity", function() {
                var george = {id: 'George', title: 'Scientist'}, josh = {id: 'Josh', title: 'Singer'};
                var array = new LSD.Array(george, {id: 'Jack', title: 'Singer'}, {id: 0, title: 'Player'}, {title: 'Hustler'});
                expect(array.indexOf({id: 33})).toEqual(-1);
                expect(array.indexOf({id: 0})).toEqual(2);
              })
            })
            describe('without id attribute', function() {
              it ("should only find object by identicity", function() {
                var george = {name: 'George', title: 'Scientist'}, jack = {name: 'Jack', title: 'Singer'};
                var array = new LSD.Array(george, {name: 'Jack', title: 'Singer'}, {name: 0, title: 'Player'}, {name: 'Hustler'});
                expect(array.indexOf(george)).toEqual(0);
                expect(array.indexOf(jack)).toEqual(-1);
                expect(array.indexOf({id: 'Jack', title: 'Singer'})).toEqual(-1);
              })
            })
          })
        })
        describe('and none of them have id attribute', function() {
          describe('when given a primitive', function() {
            it ("should not find anything", function() {
              var array = new LSD.Array({name: 'George', title: 'Scientist'}, {name: 'Jack', title: 'Singer'});
              expect(array.indexOf(33)).toEqual(-1);
              expect(array.indexOf('George')).toEqual(-1);
            })
          })
          describe('when given an object', function() {
            describe('with id attribute', function() {
              it ("should not find anything", function() {
                var george = {name: 33};
                var array = new LSD.Array(george, {name: 'Jack'});
                expect(array.indexOf({id: 33})).toEqual(-1);
                expect(array.indexOf({id: 'Jack'})).toEqual(-1);
              })
            })
            describe('without id attribute', function() {
              it ("should only find object by identicity", function() {
                var george = {name: 33};
                var array = new LSD.Array(george, {name: 'Jack'});
                expect(array.indexOf({id: 33})).toEqual(-1);
                expect(array.indexOf({id: 'Jack'})).toEqual(-1);
              })
            })
          })
        })
      });
    });
  });
  
  
  
  describe('#filter', function() {
    it ("should create persistent filtered collections", function() {
      var ary = new LSD.Array({name: 'Jack'}, {name: "George"}, {name: 'Josh'});
      var filtered = ary.filter(new LSD.Function('item', 'item.name.charAt(0) == "J"'));
      expect(filtered).toEqual([{name: 'Jack'}, {name: 'Josh'}])
      ary.push({name: 'McCaliger'})
      expect(filtered).toEqual([{name: 'Jack'}, {name: 'Josh'}])
      ary.push({name: 'John'})
      expect(filtered).toEqual([{name: 'Jack'}, {name: 'Josh'}, {name: 'John'}])
      ary.splice(1, 1)
      expect(filtered).toEqual([{name: 'Jack'}, {name: 'Josh'}, {name: 'John'}])
      ary.splice(1, 1)
      expect(filtered).toEqual([{name: 'Jack'}, {name: 'John'}])
      expect(ary.length).toEqual(3);
      ary.push({name: 'Harry'})
      expect(filtered).toEqual([{name: 'Jack'}, {name: 'John'}])
      expect(ary.length).toEqual(4);
      ary.push({name: 'Jesus'})
      expect(ary.length).toEqual(5);
      expect(filtered).toEqual([{name: 'Jack'}, {name: 'John'}, {name: 'Jesus'}])
      ary.push({name: 'Jackie'})
      expect(filtered).toEqual([{name: 'Jack'}, {name: 'John'}, {name: 'Jesus'}, {name: 'Jackie'}]);
      var harry = ary.splice(-3, 1)[0]
      expect(filtered).toEqual([{name: 'Jack'}, {name: 'John'}, {name: 'Jesus'}, {name: 'Jackie'}]);
      ary.splice(0, 1, harry);
      expect(filtered).toEqual([{name: 'John'}, {name: 'Jesus'}, {name: 'Jackie'}]);
      ary.splice(3, 1, {name: 'Johan'});
      expect(filtered).toEqual([{name: 'John'}, {name: 'Johan'}, {name: 'Jackie'}]);
      window.$spliced = true
      ary.splice(3, 1, {name: 'Johan'});
      expect(filtered).toEqual([{name: 'John'}, {name: 'Johan'}, {name: 'Jackie'}]);
      $ary = ary;
      ary.splice(3, 1);
      expect(filtered).toEqual([{name: 'John'}, {name: 'Jackie'}]);
      ary.splice(0, 1);
      expect(filtered).toEqual([{name: 'John'}, {name: 'Jackie'}]);
      debugger
      ary.splice(0, 2, {name: 'Jeff'}, {name: 'Howard'}, {name: 'Jephrey'});
      expect(filtered).toEqual([{name: 'Jeff'}, {name: 'Jephrey'}, {name: 'Jackie'}]);
    })
  });
  
  describe('#map', function() {
    it ("should apply a results of calling callback upon each element of array", function() {
      var array = new LSD.Array({name: 'Jack'}, {name: 'George'}, {id: 'Jack'});
      expect(array.map(function(value) {
        return value.name;
      })).toEqual(['Jack', 'George', window.z0z0z0undefined])
    })
  });
});