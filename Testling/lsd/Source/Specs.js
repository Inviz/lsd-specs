/*
---
name: Specs
description: LSD Specs
provides: Specs
requires:
  - Jasmine
  - LSD/LSD.Document
...
*/

describe("1 to equal 1", function() {
  it ("should use equal assert on testling", function() {
    expect(1).toEqual(1)
  })
  it ("should use equal assertz on testling", function() {
    expect(1).toNotEqual(0)
  })
})


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
  
  describe('splice', function() {
    describe('when given no arguments', function() {
      it ("should remove all elements from array and return them in a new array", function() {
        var array = new LSD.Array('A', 'B', 'C', 'D', 'E');
        expect(array.splice()).toEqual(['A', 'B', 'C', 'D', 'E'])
        expect(array.slice()).toEqual([])
      })
    })
    describe('when given zero index', function() {
      describe('and offset is not given', function() {
        it ('should remove all elements from array and return them in a new array', function() {
          var array = new LSD.Array('A', 'B', 'C', 'D', 'E');
          expect(array.splice(0)).toEqual(['A', 'B', 'C', 'D', 'E'])
          expect(array.slice()).toEqual([])
        })
      })
      describe('and offset is zero', function() {
        it ('should do nothing to array and return empty array', function() {
          var array = new LSD.Array('A', 'B', 'C', 'D', 'E');
          expect(array.splice(0, 0)).toEqual([])
          expect(array.slice()).toEqual(['A', 'B', 'C', 'D', 'E'])
        })
      });
      describe('and offset is non zero', function() {
        it ('should remove `offset` number of elements from original array and return them', function() {
          var array = new LSD.Array('A', 'B', 'C', 'D', 'E');
          expect(array.splice(0, 2)).toEqual(['A', 'B'])
          expect(array.slice()).toEqual(['C', 'D', 'E'])
        })
      });
      describe('and offset is negative', function() {
        it ('should do nothing to array and return empty array', function() {
          var array = new LSD.Array('A', 'B', 'C', 'D', 'E');
          expect(array.splice(0, -1)).toEqual([])
          expect(array.slice()).toEqual(['A', 'B', 'C', 'D', 'E'])
        })
      });
      describe('and offset is too large', function() {
        it ('should ignore the large offset and just return removed elements', function() {
          var array = new LSD.Array('A', 'B', 'C', 'D', 'E');
          expect(array.splice(0, 10)).toEqual(['A', 'B', 'C', 'D', 'E'])
          expect(array.slice()).toEqual([])
        })
      })
    });
    describe('when given non zero index', function() {
      describe('and offset is not given', function() {
        it ('should remove all elements starting from index and return them', function() {
          var array = new LSD.Array('A', 'B', 'C', 'D', 'E');
          expect(array.splice(1)).toEqual(['B', 'C', 'D', 'E'])
          expect(array.slice()).toEqual(['A'])
        })
      })
      describe('and offset is zero', function() {
        it ('should do nothing to array and return empty array', function() {
          var array = new LSD.Array('A', 'B', 'C', 'D', 'E');
          expect(array.splice(1, 0)).toEqual([])
          expect(array.slice()).toEqual(['A', 'B', 'C', 'D', 'E'])
        })
      });
      describe('and offset is non zero', function() {
        it ('should return `offset` number of elements from array starting from `index` and return them', function() {
          var array = new LSD.Array('A', 'B', 'C', 'D', 'E');
          expect(array.splice(1, 2)).toEqual(['B', 'C'])
          expect(array.slice()).toEqual(['A', 'D', 'E'])
        })
      });
      describe('and offset is negative', function() {
        it ('should do nothing to array and return empty array', function() {
          var array = new LSD.Array('A', 'B', 'C', 'D', 'E');
          expect(array.splice(1, -1)).toEqual([])
          expect(array.slice()).toEqual(['A', 'B', 'C', 'D', 'E'])
        })
      });
      describe('and offset is too large', function() {
        it ('should ignore the large offset and just return removed elements', function() {
          var array = new LSD.Array('A', 'B', 'C', 'D', 'E');
          expect(array.splice(1, 10)).toEqual(['B', 'C', 'D', 'E'])
          expect(array.slice()).toEqual(['A'])
        })
      });
    })
    describe('when given negative index', function() {
      describe('and offset is not given', function() {
        it ('should remove all elements starting from `index`th element from the end and return them', function() {
          var array = new LSD.Array('A', 'B', 'C', 'D', 'E');
          expect(array.splice(-2)).toEqual(['D', 'E'])
          expect(array.slice()).toEqual(['A', 'B', 'C'])
        })
      })
      describe('and offset is zero', function() {
        it ('should do nothing to array and return empty array', function() {
          var array = new LSD.Array('A', 'B', 'C', 'D', 'E');
          expect(array.splice(-2, 0)).toEqual([])
          expect(array.slice()).toEqual(['A', 'B', 'C', 'D', 'E'])
        })
      });
      describe('and offset is non zero', function() {
        it ('should return `offset` number of elements from array starting from `index` and return them', function() {
          var array = new LSD.Array('A', 'B', 'C', 'D', 'E');
          expect(array.splice(-2, 1)).toEqual(['D'])
          expect(array.slice()).toEqual(['A', 'B', 'C', 'E'])
        })
      });
      describe('and offset is negative', function() {
        it ('should do nothing to array and return empty array', function() {
          var array = new LSD.Array('A', 'B', 'C', 'D', 'E');
          expect(array.splice(-1, -1)).toEqual([])
          expect(array.slice()).toEqual(['A', 'B', 'C', 'D', 'E'])
        })
      });
      describe('and offset is too large', function() {
        it ('should ignore the large offset and just return removed elements', function() {
          var array = new LSD.Array('A', 'B', 'C', 'D', 'E');
          expect(array.splice(-2, 5)).toEqual(['D', 'E'])
          expect(array.slice()).toEqual(['A', 'B', 'C'])
        })
      });
    });
    describe('when given index larger than length of array', function() {
      
    })
  })
  
  describe('#filter', function() {
    it ("should create persistent filtered javascript array", function() {
      var ary = new LSD.Array({name: 'Jack'}, {name: "George"}, {name: 'Josh'});
      var filtered = ary.filter(new LSD.Function('item', 'item.name.charAt(0) == "J"'), true);
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
      ary.splice(3, 1);
      expect(filtered).toEqual([{name: 'John'}, {name: 'Jackie'}]);
      ary.splice(0, 1);
      expect(filtered).toEqual([{name: 'John'}, {name: 'Jackie'}]);
      ary.splice(0, 2, {name: 'Jeff'}, {name: 'Howard'}, {name: 'Jephrey'});
      expect(filtered).toEqual([{name: 'Jeff'}, {name: 'Jephrey'}, {name: 'Jackie'}]);
      ary.splice(0, 0, {name: 'Griffin'});
      expect(filtered).toEqual([{name: 'Jeff'}, {name: 'Jephrey'}, {name: 'Jackie'}]);
      ary.splice(0, 0, {name: 'Gordon'}, {name: 'Greg'});
      expect(filtered).toEqual([{name: 'Jeff'}, {name: 'Jephrey'}, {name: 'Jackie'}]);
      ary.splice(0, 4, {name: 'George'});
      expect(filtered).toEqual([{name: 'Jephrey'}, {name: 'Jackie'}]);
      ary.splice(3, 0, {name: 'Jennifer'}, {name: 'Gonzales'}, {name: 'Jannet'});
      expect(filtered).toEqual([{name: 'Jephrey'}, {name: 'Jennifer'}, {name: 'Jannet'}, {name: 'Jackie'}]);
      ary.splice(1, 2, {name: 'Julia'});
      expect(filtered).toEqual([{name: 'Julia'}, {name: 'Jennifer'}, {name: 'Jannet'}, {name: 'Jackie'}]);
      ary.splice(1, 1);
      expect(filtered).toEqual([{name: 'Jennifer'}, {name: 'Jannet'}, {name: 'Jackie'}]);
      ary.splice(-1, 1);
      expect(filtered).toEqual([{name: 'Jennifer'}, {name: 'Jannet'}]);
      ary.splice(-1, 1, {name: 'Christian'}, {name: 'Jagger'});
      expect(filtered).toEqual([{name: 'Jennifer'}, {name: 'Jagger'}]);
      ary.splice(-1, 2, {name: 'Justin'});
      expect(filtered).toEqual([{name: 'Jennifer'}, {name: 'Justin'}]);
      ary.splice(0, 2, {name: 'Hoffman'});
      expect(filtered).toEqual([{name: 'Justin'}]);
      ary.splice(1, 2, {name: 'Jenkins'});
      expect(filtered).toEqual([{name: 'Jenkins'}, {name: 'Justin'}]);
      var justin = ary.pop();
      expect(filtered).toEqual([{name: 'Jenkins'}]);
      ary.pop();
      expect(filtered).toEqual([]);
      ary.pop();
      expect(filtered).toEqual([]);
      expect(ary.length).toEqual(0);
      expect(filtered.length).toEqual(0);
      expect(ary[1]).toBeUndefined();
      ary.push({name: 'Jeeves'})
      expect(filtered).toEqual([{name: 'Jeeves'}]);
    })
    
    it ("should create persistent filtered LSD arrays", function() {
      var ary = new LSD.Array({name: 'Jack'}, {name: "George"}, {name: 'Josh'});
      var filtered = ary.filter(new Function('item', 'return item.name.charAt(0) == "J"'));
      expect(filtered.slice()).toEqual([{name: 'Jack'}, {name: 'Josh'}])
      ary.push({name: 'McCaliger'})
      expect(filtered.slice()).toEqual([{name: 'Jack'}, {name: 'Josh'}])
      ary.push({name: 'John'})
      expect(filtered.slice()).toEqual([{name: 'Jack'}, {name: 'Josh'}, {name: 'John'}])
      ary.splice(1, 1)
      expect(filtered.slice()).toEqual([{name: 'Jack'}, {name: 'Josh'}, {name: 'John'}])
      ary.splice(1, 1)
      expect(filtered.slice()).toEqual([{name: 'Jack'}, {name: 'John'}])
      expect(ary.length).toEqual(3);
      ary.push({name: 'Harry'})
      expect(filtered.slice()).toEqual([{name: 'Jack'}, {name: 'John'}])
      expect(ary.length).toEqual(4);
      ary.push({name: 'Jesus'})
      expect(ary.length).toEqual(5);
      expect(filtered.slice()).toEqual([{name: 'Jack'}, {name: 'John'}, {name: 'Jesus'}])
      ary.push({name: 'Jackie'})
      expect(filtered.slice()).toEqual([{name: 'Jack'}, {name: 'John'}, {name: 'Jesus'}, {name: 'Jackie'}]);
      var harry = ary.splice(-3, 1)[0]
      expect(filtered.slice()).toEqual([{name: 'Jack'}, {name: 'John'}, {name: 'Jesus'}, {name: 'Jackie'}]);
      ary.splice(0, 1, harry);
      expect(filtered.slice()).toEqual([{name: 'John'}, {name: 'Jesus'}, {name: 'Jackie'}]);
      ary.splice(3, 1, {name: 'Johan'});
      expect(filtered.slice()).toEqual([{name: 'John'}, {name: 'Johan'}, {name: 'Jackie'}]);
      window.$spliced = true
      ary.splice(3, 1, {name: 'Johan'});
      expect(filtered.slice()).toEqual([{name: 'John'}, {name: 'Johan'}, {name: 'Jackie'}]);
      ary.splice(3, 1);
      expect(filtered.slice()).toEqual([{name: 'John'}, {name: 'Jackie'}]);
      ary.splice(0, 1);
      expect(filtered.slice()).toEqual([{name: 'John'}, {name: 'Jackie'}]);
      ary.splice(0, 2, {name: 'Jeff'}, {name: 'Howard'}, {name: 'Jephrey'});
      expect(filtered.slice()).toEqual([{name: 'Jeff'}, {name: 'Jephrey'}, {name: 'Jackie'}]);
      ary.splice(0, 0, {name: 'Griffin'});
      expect(filtered.slice()).toEqual([{name: 'Jeff'}, {name: 'Jephrey'}, {name: 'Jackie'}]);
      ary.splice(0, 0, {name: 'Gordon'}, {name: 'Greg'});
      expect(filtered.slice()).toEqual([{name: 'Jeff'}, {name: 'Jephrey'}, {name: 'Jackie'}]);
      ary.splice(0, 4, {name: 'George'});
      expect(filtered.slice()).toEqual([{name: 'Jephrey'}, {name: 'Jackie'}]);
      ary.splice(3, 0, {name: 'Jennifer'}, {name: 'Gonzales'}, {name: 'Jannet'});
      expect(filtered.slice()).toEqual([{name: 'Jephrey'}, {name: 'Jennifer'}, {name: 'Jannet'}, {name: 'Jackie'}]);
      ary.splice(1, 2, {name: 'Julia'});
      expect(filtered.slice()).toEqual([{name: 'Julia'}, {name: 'Jennifer'}, {name: 'Jannet'}, {name: 'Jackie'}]);
      ary.splice(1, 1);
      expect(filtered.slice()).toEqual([{name: 'Jennifer'}, {name: 'Jannet'}, {name: 'Jackie'}]);
      ary.splice(-1, 1);
      expect(filtered.slice()).toEqual([{name: 'Jennifer'}, {name: 'Jannet'}]);
      ary.splice(-1, 1, {name: 'Christian'}, {name: 'Jagger'});
      expect(filtered.slice()).toEqual([{name: 'Jennifer'}, {name: 'Jagger'}]);
      ary.splice(-1, 2, {name: 'Justin'});
      expect(filtered.slice()).toEqual([{name: 'Jennifer'}, {name: 'Justin'}]);
      ary.splice(0, 2, {name: 'Hoffman'});
      expect(filtered.slice()).toEqual([{name: 'Justin'}]);
      ary.splice(1, 2, {name: 'Jenkins'});
      expect(filtered.slice()).toEqual([{name: 'Jenkins'}, {name: 'Justin'}]);
      var justin = ary.pop();
      expect(filtered.slice()).toEqual([{name: 'Jenkins'}]);
      ary.pop();
      expect(filtered.slice()).toEqual([]);
      ary.pop();
      expect(filtered.slice()).toEqual([]);
      expect(ary.length).toEqual(0);
      expect(filtered.length).toEqual(0);
      expect(ary[1]).toBeUndefined();
      ary.push({name: 'Jeeves'})
      expect(filtered.slice()).toEqual([{name: 'Jeeves'}]);
    })
    
    describe('paired with sort', function() {
      it ("should sort filtered results", function() {
        var array = new LSD.Array(4, 2, 8, 5, 1, 7, 6, 3, 10, 9);
        var filtered = array.filter(new LSD.Function('number', 'number % 2 == 0'));
        var sorted = filtered.sort()
        expect(filtered.slice()).toEqual([4, 2, 8, 6, 10])
        expect(sorted.slice()).toEqual([2, 4, 6, 8, 10])
        array.splice(2, 5, 11, 18, 16, 3, 6)
        expect(filtered.slice()).toEqual([4, 2, 18, 16, 6, 10])
        expect(sorted.slice()).toEqual([2, 4, 6, 10, 16, 18])
        array.push(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
        expect(sorted.slice()).toEqual([2, 2, 4, 4, 6, 6, 8, 10, 10, 16, 18])
      })
    });
    
    describe('when non-local variables are used in the block', function() {
      it ("should re-filter values as filter criteria change", function() {
        var scope = new LSD.Script.Scope;
        scope.variables.set('divisor', 2);
        scope.variables.set('result', 0);
        var array = new LSD.Array(4, 2, 8, 5, 1, 7, 6, 3, 10, 9);
        var filtered = array.filter(new LSD.Function('number', 'number % divisor == result', scope));
        expect(filtered.slice()).toEqual([4, 2, 8, 6, 10])
        scope.variables.set('result', 1);
        expect(filtered.slice()).toEqual([5, 1, 7, 3, 9])
        scope.variables.set('divisor', 3);
        expect(filtered.slice()).toEqual([4, 1, 7, 10])
        scope.variables.set('divisor', 2);
        expect(filtered.slice()).toEqual([5, 1, 7, 3, 9])
        scope.variables.set('result', 0);
        expect(filtered.slice()).toEqual([4, 2, 8, 6, 10])
        scope.variables.set('divisor', 3);
        expect(filtered.slice()).toEqual([6, 3, 9])
        scope.variables.set('result', 2);
        expect(filtered.slice()).toEqual([2, 8, 5])
        scope.variables.set('result', 1);
        expect(filtered.slice()).toEqual([4, 1, 7, 10])
        scope.variables.set('divisor', 4);
        expect(filtered.slice()).toEqual([5, 1, 9])
        scope.variables.set('divisor', 5);
        expect(filtered.slice()).toEqual([1, 6])
        scope.variables.set('result', 2);
        expect(filtered.slice()).toEqual([2, 7])
        scope.variables.set('result', 3);
        expect(filtered.slice()).toEqual([8, 3])
        scope.variables.set('result', 4);
        expect(filtered.slice()).toEqual([4, 9])
        scope.variables.set('result', 5);
        expect(filtered.slice()).toEqual([])
        scope.variables.set('result', 0);
        expect(filtered.slice()).toEqual([5, 10])
        scope.variables.set('divisor', 3);
        expect(filtered.slice()).toEqual([6, 3, 9])
        array.unshift(4);
        expect(filtered.slice()).toEqual([6, 3, 9]);
        array.push(9);
        expect(filtered.slice()).toEqual([6, 3, 9, 9]);
        array.splice(1, 1, 12, 15, 11)
        expect(filtered.slice()).toEqual([12, 15, 6, 3, 9, 9]);
        array.unshift(3);
        expect(filtered.slice()).toEqual([3, 12, 15, 6, 3, 9, 9])
        array.unshift(3);
        expect(filtered.slice()).toEqual([3, 3, 12, 15, 6, 3, 9, 9])
        array.splice(-1, 1, 99);
        expect(filtered.slice()).toEqual([3, 3, 12, 15, 6, 3, 9, 99])
        array.unshift(1, 2, -3);
        expect(filtered.slice()).toEqual([-3, 3, 3, 12, 15, 6, 3, 9, 99])
      });
    });

    describe('when given a block using index', function() {
      it ("should filter array based on index of the values", function() {
        var scope = new LSD.Script.Scope;
        scope.variables.set('divisor', 2)
        scope.variables.set('result', 0)
        var array = new LSD.Array('George', 'Harry', 'Bill', 'Jeff', 'Claus');
        var filtered = array.filter(new LSD.Function('name', 'index', 'index % divisor == result', scope))
        expect(filtered.slice()).toEqual(['George', 'Bill', 'Claus']);
        scope.variables.set('result', 1)
        expect(filtered.slice()).toEqual(['Harry', 'Jeff']);
        array.push('Michael')
        expect(filtered.slice()).toEqual(['Harry', 'Jeff', 'Michael']);
        array.push('Jesus')
        expect(filtered.slice()).toEqual(['Harry', 'Jeff', 'Michael']);
        array.shift();
        expect(filtered.slice()).toEqual(['Bill', 'Claus', 'Jesus']);
        array.splice(1, 1, 'Gomes')
        expect(filtered.slice()).toEqual(['Gomes', 'Claus', 'Jesus']);
        array.splice(2, 1)
        expect(filtered.slice()).toEqual(['Gomes', 'Michael']);
        array.push('Jahmal')
        expect(filtered.slice()).toEqual(['Gomes', 'Michael', 'Jahmal']);
        array.push('Jehrar')
        expect(filtered.slice()).toEqual(['Gomes', 'Michael', 'Jahmal']);
        scope.variables.set('result', 0)
        expect(filtered.slice()).toEqual(['Harry', 'Claus', 'Jesus', 'Jehrar']);
        scope.variables.set('divisor', 3)
        expect(filtered.slice()).toEqual(['Harry', 'Michael', 'Jehrar']);
      });
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
  
  describe ('#sort', function() {
    it ("should create persistent sorted collection", function() {
      var array = new LSD.Array();
      var sorted = array.sort();
      array.push('Howard');
      expect(sorted.slice(0)).toEqual(['Howard']) 
      array.push('Adolf');
      expect(sorted.slice(0)).toEqual(['Adolf', 'Howard'])
      array.push('Herfer');
      expect(sorted.slice(0)).toEqual(['Adolf', 'Herfer', 'Howard']);
      array.shift();
      expect(sorted.slice(0)).toEqual(['Adolf', 'Herfer']);
      array.splice(1, 0, 'Zack')
      expect(sorted.slice(0)).toEqual(['Adolf', 'Herfer', 'Zack']);
      array.splice(1, 0, 'Zoey', 'Xena')
      expect(sorted.slice(0)).toEqual(['Adolf', 'Herfer', 'Xena', 'Zack', 'Zoey']);
      array.splice(0, 1)
      expect(sorted.slice(0)).toEqual(['Herfer', 'Xena', 'Zack', 'Zoey']);
      array.splice(1, 2)
      expect(sorted.slice(0)).toEqual(['Herfer', 'Zoey']);
      array.unshift('Hanz', 'Andy', 'Wiggley', 'Zuzan');
      expect(sorted.slice(0)).toEqual(['Andy', 'Hanz', 'Herfer', 'Wiggley', 'Zoey', 'Zuzan']);
      array.splice(2, 3, 'Xoop', 'Yu')
      expect(sorted.slice(0)).toEqual(['Andy', 'Hanz', 'Herfer', 'Xoop', 'Yu']);
    });
  });
  
  describe('#every', function() {
    it ('should update value asynchronously', function() {
      var array = new LSD.Array;
      var scope = new LSD.Script.Scope;
      scope.variables.set('array', array);
      var script = new LSD.Script('every (array) { |item| item.selected }', scope);
      expect(script.value).toEqual(true);
      var first = new LSD.Object({selected: true})
      array.push(first);
      expect(script.value).toEqual(true);
      first.set('selected', false);
      expect(script.value).toEqual(false);
      var second = new LSD.Object({selected: true});
      array.push(second);
      expect(script.value).toEqual(false);
      first.set('selected', true);
      expect(script.value).toEqual(true);
      second.set('selected', false);
      expect(script.value).toEqual(false);
      var third = new LSD.Object({selected: false});
      array.push(third);
      expect(script.value).toEqual(false);
      second.set('selected', true);
      expect(script.value).toEqual(false);
      third.set('selected', true);
      expect(script.value).toEqual(true);
      array.splice(0, 1, {selected: false})
      expect(script.value).toEqual(false);
      array.shift()
      expect(script.value).toEqual(true);
      array.shift()
      expect(script.value).toEqual(true);
      array[0].set('selected', false)
      expect(script.value).toEqual(false);
    })
  });
  
  describe('#some', function() {
    it ("should calculate value asynchronously", function() {
      var array = new LSD.Array;
      var scope = new LSD.Script.Scope;
      scope.variables.set('array', array);
      var script = new LSD.Script('array.some() { |item| item.shquared }', scope);
      expect(script.value).toEqual(false);
      var first = new LSD.Object({shquared: false});
      array.push(first);
      expect(script.value).toEqual(false);
      first.set('shquared', true);
      expect(script.value).toEqual(true);
      var second = new LSD.Object({shquared: true});
      array.push(second);
      expect(script.value).toEqual(true);
      first.set('shquared', false);
      expect(script.value).toEqual(true);
      second.set('shquared', false);
      expect(script.value).toEqual(false);
      var third = new LSD.Object({shquared: true});
      array.push(third);
      expect(script.value).toEqual(true);
      array.pop();
      expect(script.value).toEqual(false);
      second.set('shquared', true);
      expect(script.value).toEqual(true);
      array.shift();
      expect(script.value).toEqual(true);
      array.shift()
      expect(script.value).toEqual(false);
    })
  });
  
  describe('#map', function() {
    it ("should invoke an iterator on each value and return an array with results", function() {
      var array = new LSD.Array;
      var scope = new LSD.Script.Scope;
      scope.variables.set('array', array);
      var script = new LSD.Script('array.map() { |item| organization || item.organization || fallback }', scope);
      var first = new LSD.Object({organization: 'ICP'});
      var second = new LSD.Object;
      array.push(first, second);
      scope.variables.set('fallback', 'BurgerKing')
      expect(script.value).toEqual(['ICP', 'BurgerKing'])
      second.set('organization', 'ICPP')
      expect(script.value).toEqual(['ICP', 'ICPP'])
      array.splice(1, 0, new LSD.Object({organization: 'Jungo'}), {}, new LSD.Object({organization: 'Chimp'}))
      expect(script.value).toEqual(['ICP', 'Jungo', 'BurgerKing', 'Chimp', 'ICPP'])
      array.shift()
      expect(script.value).toEqual(['Jungo', 'BurgerKing', 'Chimp', 'ICPP'])
      scope.variables.set('fallback', 'McDonalds')
      expect(script.value).toEqual(['Jungo', 'McDonalds', 'Chimp', 'ICPP'])
      scope.variables.set('organization', 'KGB')
      expect(script.value).toEqual(['KGB', 'KGB', 'KGB', 'KGB'])
      array.splice(2, 1);
      expect(script.value).toEqual(['KGB', 'KGB', 'KGB']);
      array.unshift({})
      expect(script.value).toEqual(['KGB', 'KGB', 'KGB', 'KGB']);
      scope.variables.unset('organization', 'KGB')
      expect(script.value).toEqual(['McDonalds', 'Jungo', 'McDonalds', 'ICPP'])
      array.splice(2, 1, {organization: 'Ding'}, {organization: 'Dong'})
      expect(script.value).toEqual(['McDonalds', 'Jungo', 'Ding', 'Dong', 'ICPP'])
      array.splice(1, 1)
      expect(script.value).toEqual(['McDonalds', 'Ding', 'Dong', 'ICPP'])
      array.splice(0, 2)
      expect(script.value).toEqual(['Dong', 'ICPP'])
    })
  })
});


describe("LSD.Script.Block", function() {
  
  var global = new LSD.Script.Scope;
  it ('should evaluate blocks', function() {
    var scope = new LSD.Script.Scope(global);
    scope.methods.set('filter', function(array, fn, bind) {
      var results = [];
      count++;
  		for (var i = 0, l = array.length >>> 0; i < l; i++){
  			if ((i in array) && fn.call(bind, array[i], i, array)) results.push(array[i]);
  		}
  		return results;
    });
    var script = $script =new LSD.Script('filter (items) { |item| item.active == active }', scope);
    var count = 0;
    scope.variables.set('active', true);
    expect(count).toEqual(0)
    scope.variables.set('items', [{title: 'Bogus', active: false}, {title: 'Sacred', active: true}]);
    expect(count).toEqual(1)
    expect(script.value).toEqual([{title: 'Sacred', active: true}])
    scope.variables.set('active', false);
    expect(count).toEqual(2)
    expect(script.value).toEqual([{title: 'Bogus', active: false}])
    scope.variables.set('active', true);
    expect(count).toEqual(3)
    expect(script.value).toEqual([{title: 'Sacred', active: true}])
  })
  
  it ('should run a block against an observable array', function() {
    var scope = new LSD.Script.Scope(global);
    scope.methods.set('map', function(array, fn, bind) {
      if (fn.results == null) {
        var results = fn.results = [];
        array.iterate(fn, function(result, value, index, state) {
          count++;
          if (state) results[index] = result;
          else results.splice(index, 1);
        })
      }
  		return fn.results;
    });
    var script = new LSD.Script('map (users) { |user| toUpperCase(user.name) + " " + (user.organization || organization) }', scope);
    var count = 0;
    var ary = new LSD.Array(new LSD.Object({name: 'Michael'}), new LSD.Object({name: 'Alex'}));
    expect(count).toEqual(0);
    scope.variables.set('users', ary);
    expect(count).toEqual(0);
    scope.variables.set('organization', 'ICP');
    expect(count).toEqual(2);
    expect(script.value).toEqual(['MICHAEL ICP', 'ALEX ICP'])
    ary[1].set('name', 'Oleksandr');
    expect(count).toEqual(3);
    expect(script.value).toEqual(['MICHAEL ICP', 'OLEKSANDR ICP'])
    ary.push(new LSD.Object({name: 'Yarik'}))
    expect(count).toEqual(4);
    expect(script.value).toEqual(['MICHAEL ICP', 'OLEKSANDR ICP', 'YARIK ICP'])
    scope.variables.set('organization', 'Orceo');
    expect(count).toEqual(7);
    expect(script.value).toEqual(['MICHAEL Orceo', 'OLEKSANDR Orceo', 'YARIK Orceo'])
    ary[2].set('name', 'Yaroslaff');
    expect(count).toEqual(8);
    expect(script.value).toEqual(['MICHAEL Orceo', 'OLEKSANDR Orceo', 'YAROSLAFF Orceo'])
    ary[2].set('organization', 'OrceoUI')
    expect(count).toEqual(9);
    expect(script.value).toEqual(['MICHAEL Orceo', 'OLEKSANDR Orceo', 'YAROSLAFF OrceoUI']);
    var spliced = ary.splice(1, 1);
    expect(count).toEqual(12);
    expect(ary.length).toEqual(2)
    expect(script.value).toEqual(['MICHAEL Orceo', 'YAROSLAFF OrceoUI'])
    scope.variables.set('organization', 'Overmind');
    expect(count).toEqual(13);
    expect(script.value).toEqual(['MICHAEL Overmind', 'YAROSLAFF OrceoUI'])
    window.$spliced = true;
    ary.splice(0, 0, spliced[0]);
    expect(count).toEqual(16);
    expect(ary.length).toEqual(3)
    expect(script.value).toEqual(['OLEKSANDR Overmind', 'MICHAEL Overmind', 'YAROSLAFF OrceoUI'])
    ary[2].unset('organization');
    expect(count).toEqual(17);
    expect(script.value).toEqual(['OLEKSANDR Overmind', 'MICHAEL Overmind', 'YAROSLAFF Overmind'])
  });
  
  it ("should reuse global variables in block across iterations", function() {
    var scope = new LSD.Script.Scope(global);
    scope.methods.set('map', function(array, fn, bind) {
      if (fn.results == null) {
        var results = fn.results = [];
        array.iterate(fn, function(result, value, index, state) {
          count++;
          if (state) results[index] = result;
          else results.splice(index, 1);
        })
      }
  		return fn.results;
    });
    var count = 0;
    var a = 0;
    var b = 0;
    scope.methods.set('transform', function(salt) {
      a++;
      return String(salt).split('').reverse().join('')
    })
    scope.methods.set('prettify', function(name) {
      b++;
      return '~' + name + '~'
    })
    var ary = new LSD.Array(['George', 'Jeff', 'Josh']);
    scope.variables.set('names', ary)
    scope.variables.set('salt', '123')
    var script = new LSD.Script('map (names) { |name| prettify(name) + " " + transform(salt) }', scope);
    expect(script.value).toEqual(['~George~ 321', '~Jeff~ 321', '~Josh~ 321']);
    expect(count).toEqual(3)
    expect(a).toEqual(1)
    expect(b).toEqual(3)
    scope.variables.set('salt', 321)
    expect(script.value).toEqual(['~George~ 123', '~Jeff~ 123', '~Josh~ 123']);
    expect(count).toEqual(6)
    expect(a).toEqual(2)
    expect(b).toEqual(3)
  });
  
  
  it ("should execute and unroll conditional blocks", function() {
    var scope = new LSD.Script.Scope;
    var script = new LSD.Script('if (a > 1) { zig = 1 }', scope);
    expect(scope.variables.zig).toBeFalsy()
    scope.variables.set('a', 2)
    expect(scope.variables.zig).toEqual(1)
    scope.variables.set('a', 1);
    expect(scope.variables.zig).toBeFalsy()
    scope.variables.set('a', 5)
    expect(scope.variables.zig).toEqual(1)
  })
  
  it ("should execute scenarios", function() {
    var scope = new LSD.Script.Scope;
    var script = new LSD.Script('                  \n\
      each (masters) |input|                       \n\
        if (input.checked)                         \n\
          each(slaves) |checkbox|                  \n\
            checkbox.check()                       \n\
        if (every(slaves) {|c| c.checked})         \n\
          input.check()                            \n\
      ', scope)
    $script = script
    var checks = 0, unchecks = 0;
    scope.methods.set('check', function(object) { 
      checks++;
      return object.set('checked', true)
    });
    scope.methods.set('uncheck', function(object, force) {
      unchecks++;
      return object.set('checked', false)
    });
    var masters = new LSD.Array(new LSD.Object.Stack({title: 'A'}), new LSD.Object.Stack({title: 'B'}))
    var slaves = new LSD.Array(new LSD.Object.Stack({title: 'a'}), new LSD.Object.Stack({title: 'b'}), new LSD.Object.Stack({title: 'c'}), new LSD.Object.Stack({title: 'd'}));
    scope.variables.merge({'masters': masters, slaves: slaves});
    expect(checks).toEqual(0);
    expect(unchecks).toEqual(0);
    scope.methods.check(masters[0]);
    expect(checks).toEqual(7);
    expect(unchecks).toEqual(0);
    expect(masters[0].checked).toBeTruthy();
    expect(masters[1].checked).toBeTruthy();
    expect(slaves[0].checked).toBeTruthy();
    expect(slaves[1].checked).toBeTruthy();
    expect(slaves[2].checked).toBeTruthy();
    expect(slaves[3].checked).toBeTruthy();
    
    scope.methods.uncheck(masters[0], true);
    expect(masters[0].checked).toBeFalsy();
    expect(masters[1].checked).toBeFalsy();
    expect(slaves[0].checked).toBeFalsy();
    expect(slaves[1].checked).toBeFalsy();
    expect(slaves[2].checked).toBeFalsy();
    expect(slaves[3].checked).toBeFalsy();
    expect(unchecks).toEqual(7);
    expect(checks).toEqual(7);
    
    scope.methods.check(masters[1]);
    expect(masters[0].checked).toBeTruthy();
    expect(masters[1].checked).toBeTruthy();
    expect(slaves[0].checked).toBeTruthy();
    expect(slaves[1].checked).toBeTruthy();
    expect(slaves[2].checked).toBeTruthy();
    expect(slaves[3].checked).toBeTruthy();
    expect(checks).toEqual(14);
    expect(unchecks).toEqual(7);
    
    
    scope.methods.uncheck(slaves[0], true);
    expect(masters[0].checked).toBeFalsy();
    expect(masters[1].checked).toBeFalsy();
    expect(slaves[0].checked).toBeFalsy();
    expect(slaves[1].checked).toBeFalsy();
    expect(slaves[2].checked).toBeFalsy();
    expect(slaves[3].checked).toBeFalsy();
    expect(checks).toEqual(14);
    expect(unchecks).toEqual(14);
    
    scope.methods.check(slaves[0]);
    expect(checks).toEqual(15);
    expect(unchecks).toEqual(14);
    scope.methods.check(slaves[1]);
    expect(checks).toEqual(16);
    expect(unchecks).toEqual(14);
    scope.methods.check(slaves[2]);
    expect(checks).toEqual(17);
    expect(unchecks).toEqual(14);
    expect(masters[0].checked).toBeFalsy();
    expect(masters[1].checked).toBeFalsy();
    scope.methods.check(slaves[3]);
    expect(checks).toEqual(24);
    expect(unchecks).toEqual(14);
    expect(masters[0].checked).toBeTruthy();
    expect(masters[1].checked).toBeTruthy();
    expect(slaves[0].checked).toBeTruthy();
    expect(slaves[1].checked).toBeTruthy();
    expect(slaves[2].checked).toBeTruthy();
    expect(slaves[3].checked).toBeTruthy();
    
    scope.methods.uncheck(slaves[3], true);
    expect(masters[0].checked).toBeFalsy();
    expect(masters[1].checked).toBeFalsy();
    expect(slaves[0].checked).toBeFalsy();
    expect(slaves[1].checked).toBeFalsy();
    expect(slaves[2].checked).toBeFalsy();
    expect(slaves[3].checked).toBeFalsy();
    expect(checks).toEqual(24);
    expect(unchecks).toEqual(21);
  });
})

describe('LSD.Script.Expression', function() {
  describe('when give multiple comma separated expressions', function() {
    it ('should evaluate expressions sequentially', function() {
      var scope = new LSD.Script.Scope;
      var result
      var callback = function(value) {
        result = value;
      }
      var script = LSD.Script('a, b', scope, callback);
      expect(result).toBeNull();
      expect(scope.variables._watched['a']).toBeTruthy()
      expect(scope.variables._watched['b']).toBeFalsy()
      scope.variables.set('a', 1);
      expect(scope.variables._watched['a']).toBeTruthy()
      expect(scope.variables._watched['b']).toBeTruthy()
      expect(result).toBeNull();
      scope.variables.set('b', 2);
      expect(result).toEqual(2);
      scope.variables.set('a', 3);
      expect(result).toEqual(2);
      scope.variables.unset('b', 2);
      expect(result).toBeNull()
      expect(scope.variables._watched['a']).toBeTruthy()
      expect(scope.variables._watched['b']).toBeTruthy()
      script.detach();
      //expect(scope.variables._watched['a']).toEqual([])
      //expect(scope.variables._watched['b']).toEqual([])
    });
    
    it ('should evaluate function calls sequentially', function() {
      var scope = new LSD.Script.Scope;
      var result, state
      var callback = function(value) {
        result = value;
      }
      scope.methods.set('submit', function(value) {
        state = 'submitted'
        return value;
      });
      scope.methods.set('update', function(value) {
        state = 'updated'
        return value;
      });
      var script = LSD.Script('submit(a), update(b), update(c || 1)', scope, callback);
      expect(scope.variables._watched['a']).toBeTruthy()
      expect(scope.variables._watched['b']).toBeFalsy()
      scope.variables.set('a', 1);
      expect(state).toBe('submitted')
      expect(scope.variables._watched['a']).toBeTruthy()
      expect(scope.variables._watched['b']).toBeTruthy()
      scope.variables.set('b', 1);
      expect(state).toBe('updated')
      expect(result).toBe(1)
      scope.variables.set('c', 4);
      expect(result).toBe(4)
      scope.variables.set('a', null);
      expect(scope.variables._watched['a']).toBeTruthy()
      //expect(scope.variables._watched['b']).toBeFalsy()
    });
    
    it ("should lazily evaluate expressions with deep variables", function() {
      var scope = new LSD.Script.Scope;
      
      var script = new LSD.Script('time_range.starts_at && time_range.recurrence_rule.interval || 1', scope)
      expect(script.value).toEqual(1);
      scope.variables.set('time_range.recurrence_rule.interval', 2);
      expect(script.value).toEqual(1);
      scope.variables.set('time_range.starts_at', 3);
      expect(script.value).toEqual(2);
      scope.variables.set('time_range.starts_at', 0);
      expect(script.value).toEqual(1);
    })
    
    it ("should lazily evaluate expression with deep variables and falsy fallbacks", function() {
      var scope = new LSD.Script.Scope;
      var script = new LSD.Script('time_range.starts_at && time_range.recurrence_rule.interval || ""', scope)
      expect(script.value).toEqual("");
      scope.variables.set('time_range.recurrence_rule.interval', 2);
      expect(script.value).toEqual("");
      scope.variables.set('time_range.starts_at', 3);
      expect(script.value).toEqual(2);
      scope.variables.set('time_range.starts_at', 0);
      expect(script.value).toEqual("");
    })
  })
})

describe("LSD.Script.Function", function() {
  describe("when a function is called", function() {
    
    describe("and the first given argument is array", function() {
      describe("and the method is set in array prototype", function() {
        it("should execute that array method", function() {
          var scope = new LSD.Script.Scope;
          var script = new LSD.Script('slice(object, 1)', scope);
          scope.variables.set('object', [1, 2, 3]);
          expect(script.value).toEqual([2, 3]);
        });
      });
      describe("and method is not set in array prototype", function() {
        describe("and there is a fallback method defined", function() {
          it("should use fallback method", function() {
            var scope = new LSD.Script.Scope;
            scope.methods.set('slicez', function(object, index, offset) {
              return object.slice(index, offset)
            })
            var script = new LSD.Script('slicez(object, 1, 3)', scope);
            scope.variables.set('object', [1, 2, 3]);
            expect(script.value).toEqual([2, 3]);
          });
        });
        describe("and the method is not defined as fallback", function() {
          it ("should not execute any method", function() {
            var scope = new LSD.Script.Scope;
            var script = new LSD.Script('void(object)', scope);
            scope.variables.set('object', [1, 2, 3]);
            expect(script.value).toEqual(null);
          })
        })
      });
    });
    
    describe("and the first given argument is number", function() {
      describe("and the method is set in number prototype", function() {
        it("should execute that number method", function() {
          var scope = new LSD.Script.Scope;
          var script = new LSD.Script('round(object)', scope);
          scope.variables.set('object', 2.51);
          expect(script.value).toEqual(3);
        });
      });
      describe("and method is not set in number prototype", function() {
        describe("and there is a fallback method defined", function() {
          it("should use fallback method", function() {
            var scope = new LSD.Script.Scope;
            var script = new LSD.Script('count(object)', scope);
            scope.methods.set('count', function(object) {
              return object.length != null ? object.length : object;
            })
            scope.variables.set('object', 2);
            expect(script.value).toEqual(2);
          });
        });
        describe("and the method is not defined as fallback", function() {
          it ("should not execute any method", function() {
            var scope = new LSD.Script.Scope;
            var script = new LSD.Script('void(object)', scope);
            scope.variables.set('object', 2);
            expect(script.value).toEqual(null);
          })
        })
      });
    });
    
    
    describe("and the first given argument is object", function() {
      describe("and the method is set in object base class", function() {
        it("should execute that object method", function() {
          var scope = new LSD.Script.Scope;
          var script = new LSD.Script('keys(object)', scope);
          scope.variables.set('object', {a: 1, b: 2, y: 3});
          expect(script.value).toEqual(['a', 'b', 'y']);
        });
      });
      describe("and method is not set in object prototype", function() {
        describe("and there is a fallback method defined", function() {
          it("should use fallback method", function() {
            var scope = new LSD.Script.Scope;
            var script = new LSD.Script('keyz(object)', scope);
            scope.methods.set('keyz', function(object) {
          		var keys = [];
          		for (var key in object){
          			if (hasOwnProperty.call(object, key)) keys.push(key);
          		}
          		return keys;
            })
            scope.variables.set('object', {a: 1, b: 2, y: 3});
            expect(script.value).toEqual(['a', 'b', 'y']);
          });
        });
        describe("and the method is not defined as fallback", function() {
          it ("should not execute any method", function() {
            var scope = new LSD.Script.Scope;
            var script = new LSD.Script('void(object)', scope);
            scope.variables.set('object', {a: 1});
            expect(script.value).toEqual(null);
          })
        })
      });
    });
    
    describe("and the first given argument is element", function() {
      describe("and the method is set in element prototype", function() {
        it("should execute that element method", function() {
          var scope = new LSD.Script.Scope;
          var script = new LSD.Script('getAttribute(object, "title")', scope);
          scope.variables.set('object', new Element('div', {title: 'Loleo'}));
          expect(script.value).toEqual('Loleo');
        });
      });
      describe("and method is not set in element prototype", function() {
        describe("and there is a fallback method defined", function() {
          it("should use fallback method", function() {
            var scope = new LSD.Script.Scope;
            var script = new LSD.Script('getSomething(object, "title")', scope);
            scope.methods.set('getSomething', function(object, name) {
              return object.getAttribute(name)
            })
            scope.variables.set('object', new Element('div', {title: 'Loleo'}));
            expect(script.value).toEqual('Loleo');
          });
        });
        describe("and the method is not defined as fallback", function() {
          it ("should not execute any method", function() {
            var scope = new LSD.Script.Scope;
            var script = new LSD.Script('void(object)', scope);
            scope.variables.set('object', new Element('div', {title: 'Loleo'}));
            expect(script.value).toEqual(null);
          })
        })
      });
    });
    
    
    describe("and the first given argument is widget", function() {
      describe("and the method is set in widget prototype", function() {
        it("should execute that widget method", function() {
          var scope = new LSD.Script.Scope;
          var script = new LSD.Script('getAttribute(object, "title")', scope);
          scope.variables.set('object', new LSD.Widget({attributes: {title: 'Loleo'}}));
          expect(script.value).toEqual('Loleo');
        });
      });
      describe("and method is not set in widget prototype", function() {
        describe("and there is a fallback method defined", function() {
          it("should use fallback method", function() {
            var scope = new LSD.Script.Scope;
            var script = new LSD.Script('getSomething(object, "title")', scope);
            scope.methods.set('getSomething', function(object, name) {
              return object.getAttribute(name)
            })
            scope.variables.set('object', new LSD.Widget({attributes: {title: 'Loleo'}}));
            expect(script.value).toEqual('Loleo');
          });
        });
        describe("and the method is not defined as fallback", function() {
          it ("should not execute any method", function() {
            
          })
        })
      });
    });
  });
  
  describe("when operator is used on two values", function() {
    describe("and that operator is =", function() {
      it ("should not evaluate first argument and use it as name to define the variable with the second value", function() {
        var scope = new LSD.Script.Scope;
        var script = new LSD.Script('incremented = number + 1', scope);
        scope.variables.set('number', 1);
        expect(script.value).toEqual(2)
        expect(scope.variables.incremented).toEqual(2);
      })
    })
  });
  
  describe("when expression consists of multiple function calls", function() {
    var scope = new LSD.Script.Scope;
    scope.methods.set('submit', function() {
      return 1337
    });
    scope.methods.set('make', function(value) {
      return new LSD.Widget({attributes: {title: value}})
    });
    scope.methods.set('return', function(value) {
      return Array.from(arguments)
    });
    describe("when the pipee function doesnt have any arguments", function() {
      it("should pipe arguments from one function call to another", function() {
        var script = new LSD.Script('submit(), return()', scope);
        expect(script.value).toEqual([1337])
      });
      describe("and value changes", function() {
        it ("should reevaluate the expression and re-pipe value again", function() {
          var local = new LSD.Script.Scope(scope);
          local.variables.set('n', 1336)
          var script = new LSD.Script('return(n), return()', local);
          expect(script.value).toEqual([[1336]])
          local.variables.set('n', 1338)
          expect(script.value).toEqual([[1338]])
        })
      })
    })
    describe("when a pipee function has arguments by itself", function() {
      describe("and that argument is a simple value", function() {
        it ("should push piped argument at the end", function() {
          var script = new LSD.Script('submit(), return("fire")', scope);
          expect(script.value).toEqual(["fire", 1337])
        });
        describe("and pipe consists of more than two function calls", function() {
          it ("should push piped argument at the end", function() {
            var script = new LSD.Script('submit(), return("fire"), return("ice")', scope);
            expect(script.value).toEqual(["ice", ["fire", 1337]])
          });
        })
        describe("and piped argument is a widget", function() {
          describe("and a pipee function can be resolved on the argument", function() {
            it ("should use the widget as argument and execute function on argument", function() {
              var script = new LSD.Script('make(), return("fire")', scope);
              expect(script.value[0]).toEqual('fire');
              expect(script.value[1].nodeType).toEqual(1);
            });
          })
          describe("and a pipee function only resolves on widget", function() {
            it ("should use the widget as argument and execute function on argument", function() {
              var script = new LSD.Script('make(), setAttribute("tabindex", -1)', scope);
              expect(script.value.attributes.tabindex).toEqual(-1)
            });
            describe("and there are more expressions", function() {
              it ("should pipe it through", function() {
                var script = new LSD.Script('make(), setAttribute("tabindex", -1), return()', scope);
                expect(script.value[0].nodeType).toEqual(1)
              })            
            })
          })
        })
      })
    });
    describe("and functions dont have explicit arguments", function() {
      it ("should be able to pipe both arguments and context", function() {
        var scope = new LSD.Widget({tag: 'container'});
        scope.methods.set('request', function() {
          return true
        });
        scope.methods.set('create', function(success) {
          if (success === true) return new LSD.Widget({tag: 'response'}) 
        });
        var script = new LSD.Script('request(), create(), grab()', scope)
        expect(scope.childNodes[0].tagName).toEqual('response')
      })
    })
    describe("when function is executed in context `dot.notation()`", function() {
      describe("and context for that function call is a result of execution of other function", function() {
        it("should use returned values", function() {
          var script = new LSD.Script('make(123).return()', scope);
          expect(script.value[0].attributes.title).toEqual(123)
        })
      })
      describe("and context for that function call is a variable pointing to widget", function() {
        it("should use returned values", function() {
          var local = new LSD.Script.Scope(scope);
          local.variables.set('widget', new LSD.Widget)
          var script = new LSD.Script('widget.return()', local);
          expect(script.value[0].nodeType).toEqual(1)
        })
      })
      describe("and context for that function call is a variable pointing to simple value", function() {
        it("should use returned values", function() {
          var local = new LSD.Script.Scope(scope);
          local.variables.set('dog', 'hot')
          var script = new LSD.Script('dog.return()', local);
          expect(script.value).toEqual(['hot'])
        })
      })
    })
    describe("when functions are nested", function() {
      it("should use returned values", function() {
        var script = new LSD.Script('return(make(123))', scope);
        expect(script.value[0].attributes.title).toEqual(123)
      })
    });
    describe("and function is called in context of", function() {
      describe("a block", function() {
        describe("that iterates over widget collection", function() {
          it ("should use widget as a context", function() {
            var local = new LSD.Script.Scope(scope);
            local.variables.set('items', [
              new LSD.Widget({attributes: {title: 'L'}}),
              new LSD.Widget({attributes: {title: 'S'}}),
              new LSD.Widget({attributes: {title: 'D'}})
            ])
            var script = new LSD.Script('items.map { getAttribute("title") }', local)
            expect(script.value).toEqual(['L', 'S', 'D'])
          })
        });
        describe("that iterates over element collection", function() {
          it ("should use element as a context", function() {
            var local = new LSD.Script.Scope(scope);
            local.variables.set('items', [
              new Element('div[title=L]'),
              new Element('div[title=S]'),
              new Element('div[title=D]'),
            ])
            var script = new LSD.Script('items.map { getAttribute("title") }', local)
            expect(script.value).toEqual(['L', 'S', 'D'])
          })
        });
        describe("that iterates over element collection", function() {
          it ("should not change context", function() {
            var local = new LSD.Widget({attributes: {title: 'LSD'}});
            local.variables.set('items', ['L', 'S', 'D'])
            var script = new LSD.Script('items.map { getAttribute("title") }', local)
          })
        });
      })
    });
    describe("when function uses .dot() notation", function() {
      describe("through a widget property", function() {
        it ("should be able to access value and call a function upon it", function() {
          var local = new LSD.Script.Scope(scope);
          var items = [
            new LSD.Widget({attributes: {title: 'L'}}),
            new LSD.Widget({attributes: {title: 'S'}}),
            new LSD.Widget({attributes: {title: 'D'}})
          ];
          local.variables.set('items', items)
          var script = new LSD.Script('items.each { |item| item.attributes.set("food", "borscht")}', local)
          expect(items.every(function(item) { 
            return item.attributes.food == 'borscht'
          })).toBeTruthy()
        })
      })
    })
  });
  
});


describe('LSD.Script.Parser', function() {
  var Examples = { 
    'a': {type: 'variable', name: 'a'},
    '1': 1,
    '0': 0,
    '-1': -1,
    '"a"': 'a',
    '""': '',
    "'a'": 'a',
    "''": '',
    '1 + 1': {type: 'function', name: '+', value: [1, 1]},
    'a = 1': {type: 'function', name: '=', value: [{type: 'variable', name: 'a'}, 1]},
    'a = ($$ buttons)': {type: 'function', name: '=', value: [{type: 'variable', name: 'a'}, {type: 'selector', value: '$$ buttons'}]},
    'a ||= 1': {type: 'function', name: '||=', value: [{type: 'variable', name: 'a'}, 1]},
    'ding("a", 2)': {type: 'function', name: 'ding', value: ["a", 2]},
    'item.ding': {type: 'variable', name: 'item.ding'},
    'item.ding()': {type: 'function', name: 'ding', value: [{type: 'variable', name: 'item'}]},
    'item.ding().ding()': {type: 'function', name: 'ding', value: [{type: 'function', name: 'ding', value: [{type: 'variable', name: 'item'}]}]},
    'item.delete(2)': {type: 'function', name: 'delete', value: [{type: 'variable', name: 'item'}, 2]},
    'a[b]': {type: 'function', name: '[]', value: [{type: 'variable', name: 'a'}, {type: 'variable', name: 'b'}]},
    'a["b"]': {type: 'function', name: '[]', value: [{type: 'variable', name: 'a'}, 'b']},
    'a[\'b\']': {type: 'function', name: '[]', value: [{type: 'variable', name: 'a'}, 'b']},
    'a[\'b\' + \'c\']': {type: 'function', name: '[]', value: [{type: 'variable', name: 'a'}, 'b']},
    'a[\'b\' + \'c\']': 
      {type: 'function', name: '[]', value: [
        {type: 'variable', name: 'a'}, 
        {type: 'function', name: '+', value: [
          'b',
          'c'
        ]}
      ]},
    'a[b + \'c\']': 
      {type: 'function', name: '[]', value: [
        {type: 'variable', name: 'a'}, 
        {type: 'function', name: '+', value: [
          {type: 'variable', name: 'b'},
          'c'
        ]}
      ]},
    'a()[b + \'c\']': 
      {type: 'function', name: '[]', value: [
        {type: 'function', name: 'a', value: []}, 
        {type: 'function', name: '+', value: [
          {type: 'variable', name: 'b'},
          'c'
        ]}
      ]},
    'a[b[c[d()]]][e[f]]': 
      {type: 'function', name: '[]', value: [
        {type: 'function', name: '[]', value: [
          {type: 'variable', name: 'a'},
          {type: 'function', name: '[]', value: [
            {type: 'variable', name: 'b'},
            {type: 'function', name: '[]', value: [
              {type: 'variable', name: 'c'},
              {type: 'function', name: 'd', value: []}
            ]},
          ]}
        ]},
        {type: 'function', name: '[]', value: [
          {type: 'variable', name: 'e'},
          {type: 'variable', name: 'f'}
        ]}
      ]},
    '$ buttons': {type: 'selector', value: '$ buttons'},
    'count(#zipper)': {type: 'function', name: 'count', value: [{type: 'selector', value: '#zipper'}]},
    '($ .buttons).dispose()': {type: 'function', name: 'dispose', value: [{type: 'selector', value: '$ .buttons'}]},
    "time_range.starts_at && time_range.recurrence_rule.type || 'a'":
      {type: 'function', name: '||', value: [
        {type: 'function', name: '&&', value: [
          {type: 'variable', name: 'time_range.starts_at'},
          {type: 'variable', name: 'time_range.recurrence_rule.type'}
        ]},
        'a'
      ]},
    'filter (& button) {|button| button.match(".gross")}': 
      {type: 'function', name: 'filter', value: [
        {type: 'selector', value: '& button'}, 
        {type: 'block', value: [
          {type: 'function', name: 'match', value: [
            {type: 'variable', name: 'button'},
            ".gross"
          ]}
        ], locals: [{type: 'variable', name: 'button'}]}
      ]},
    'filtered = filter (& button) {|button| button.match(".gross")}': 
      {type: 'function', name: '=', value: [
        {type: 'variable', name: 'filtered'}, 
        {type: 'function', name: 'filter', value: [
          {type: 'selector', value: '& button'}, 
          {type: 'block', value: [
            {type: 'function', name: 'match', value: [
              {type: 'variable', name: 'button'},
              ".gross"
            ]}
          ], locals: [{type: 'variable', name: 'button'}]}
        ]}
      ]},
    'if (a > 1) { 2 } else { 0 }': [
      {type: 'function', name: 'if', value: [
        {type: 'function', name: '>', value: [
          {type: 'variable', name: 'a'},
          1
        ]},
        {type: 'block', value: [
          2
        ]}
      ]},
      {type: 'function', name: 'else', value: [
        {type: 'block', value: [
          0
        ]}
      ]}
    ],
    '($ button).filter {|b| b.publish {|r| r.body} }': 
      {type: 'function', name: 'filter', value: [
        {type: 'selector', value: '$ button'},
        {type: 'block', value: [
          {type: 'function', name: 'publish', value: [
            {type: 'variable', name: 'b'},
            {type: 'block', value: [
              {type: 'variable', name: 'r.body'}
            ], locals: [{type: 'variable', name: 'r'}]}
          ]}
        ], locals: [{type: 'variable', name: 'b'}]}
      ]},
    '($ button).filter() {|b| b.publish() {|r| r.body} }': 
      {type: 'function', name: 'filter', value: [
        {type: 'selector', value: '$ button'},
        {type: 'block', value: [
          {type: 'function', name: 'publish', value: [
            {type: 'variable', name: 'b'},
            {type: 'block', value: [
              {type: 'variable', name: 'r.body'}
            ], locals: [{type: 'variable', name: 'r'}]}
          ]}
        ], locals: [{type: 'variable', name: 'b'}]}
      ]},
    '     post()': {type: 'function', name: 'post', value: []},
    '             \n\
    post()        \n\
    destroy()':   [{type: 'function', name: 'post', value: []}, {type: 'function', name: 'destroy', value: []}],
    '             \n\
    post()        \n\
      destroy()'  : [{type: 'function', name: 'post', value: [{type: 'block', value: [{type: 'function', name: 'destroy', value: []}]}]}],
    '             \n\
    post()        \n\
      destroy()   \n\
        build()': [ {type: 'function', name: 'post', value: [
                    {type: 'block', value: [
                      {type: 'function', name: 'destroy', value: [
                        {type: 'block', value: [
                          {type: 'function', name: 'build', value: []}
                        ]}
                      ]}
                    ]}
                  ]}],
    '             \n\
    post()        \n\
      destroy()   \n\
        build()   \n\
      repair()':  [ {type: 'function', name: 'post', value: [
                    {type: 'block', value: [
                      {type: 'function', name: 'destroy', value: [
                        {type: 'block', value: [
                          {type: 'function', name: 'build', value: []}
                        ]}
                      ]},
                      {type: 'function', name: 'repair', value: []}
                    ]}
                  ]}],
    '             \n\
    post()        \n\
      destroy()   \n\
        build()   \n\
      repair()    \n\
        milk()':  [ {type: 'function', name: 'post', value: [
                    {type: 'block', value: [
                      {type: 'function', name: 'destroy', value: [
                        {type: 'block', value: [
                          {type: 'function', name: 'build', value: []}
                        ]}
                      ]},
                      {type: 'function', name: 'repair', value: [
                        {type: 'block', value: [
                          {type: 'function', name: 'milk', value: []}
                        ]}
                      ]}
                    ]}
                  ]}],
    '             \n\
    post()        \n\
      destroy()   \n\
                  \n\
        build()   \n\
                  \n\
                  \n\
        1         \n\
      2           \n\
      repair()    \n\
        3         \n\
        milk()':  [ {type: 'function', name: 'post', value: [
                    {type: 'block', value: [
                      {type: 'function', name: 'destroy', value: [
                        {type: 'block', value: [
                          {type: 'function', name: 'build', value: []},
                          1
                        ]}
                      ]},
                      2,
                      {type: 'function', name: 'repair', value: [
                        {type: 'block', value: [
                          3,
                          {type: 'function', name: 'milk', value: []}
                        ]}
                      ]}
                    ]}
                  ]}],
                  
    '                                              \n\
    (& input.parent[type=checkbox]).each() |input|     \n\
      checkboxes = (& input.child[type=checkbox])    \n\
      checkboxes.each() |checkbox|                \n\
        if (input.checked)                         \n\
          checkbox.check()                         \n\
      if (checkboxes.every() {|c| c.checked})        \n\
        input.check()                              \n\
    ': [{type: 'function', name: 'each', value: [
      {type: 'selector', value: '& input.parent[type=checkbox]'},
      {type: 'block', value: [
        {type: 'function', name: '=', value: [
          {type: 'variable', name: 'checkboxes'},
          {type: 'selector', value: '& input.child[type=checkbox]'}
        ]},
        {type: 'function', name: 'each', value: [
          {type: 'variable', name: 'checkboxes'},
          {type: 'block', value: [
            {type: 'function', name: 'if', value: [
              {type: 'variable', name: 'input.checked'},
              {type: 'block', value: [
                {type: 'function', name: 'check', value: [
                  {type: 'variable', name: 'checkbox'}
                ]}
              ]}
            ]}
          ], locals: [{type: 'variable', name: 'checkbox'}]}
        ]},
        {type: 'function', name: 'if', value: [
          {type: 'function', name: 'every', value: [
            {type: 'variable', name: 'checkboxes'},
            {type: 'block', value: [
              {type: 'variable', name: 'c.checked'}
            ], locals: [{type: 'variable', name: 'c'}]}
          ]},
          {type: 'block', value: [
            {type: 'function', name: 'check', value: [
              {type: 'variable', name: 'input'}
            ]}
          ]}
        ]}
      ], locals: [{type: 'variable', name: 'input'}]}
    ]}],
    '             \n\
    post()        \n\
     destroy()    \n\
     	destroy()' :{exception: "Inconsistent indentation: `\\s\\s\\s\\s\\s\\t` but `\\s\\s\\s\\s` is a baseline, and `\\s` is chosen indent level"},
    '             \n\
    post()        \n\
     destroy()    \n\
	   destroy()'   :{exception: "Inconsistent indentation: `\\t\\s\\s\\s` but `\\s\\s\\s\\s` is a baseline"},
    '             \n\
    post()        \n\
     destroy()    \n\
       destroy()':{exception: "Incorrect indentation: A line is 2 levels deeper then previous line"},
    '             \n\
    post()        \n\
     destroy()    \n\
        destroy()': {exception: "Incorrect indentation: A line is 3 levels deeper then previous line"}
                                                            
    //'($ > button).length': [{type: 'selector', value: '$ > button'}, {type: 'variable', name: 'length'}],
    //'delete item': [{type: 'function', value: [{type: 'variable', value: 'item'}]}]
    
  };
  var clean = function(object) {
    if (object.push) return Array.each(object, clean);
    if (object.scope) delete object.scope;
    if (object.precedence) delete object.precedence;
    if (object.index) delete object.index;
    if (object.value && object.value.length) Array.each(object.value, clean);
    return object;
  }
  Object.each(Examples, function(value, example) {
    describe("when given expression is " + example, function() {
      it ("should parse it correctly", function() {
        if (value === false || value.exception) {
          expect(function() {
            LSD.Script.parse(example)
          }).toThrow(value.exception)
        } else {
          var val = clean(LSD.Script.parse(example));
          expect(val).toEqual(value);
        }
      })
    })
  });
})

describe("LSD.Object", function() {
  describe("initialized", function() {
    describe("with object", function() {
      it("should set the values from the object", function() {
        var object = new LSD.Object({stories: true, vodka: false});
        expect(object.stories).toEqual(true);
        expect(object.vodka).toEqual(false);
      })
    })
    describe("without arguments", function() {
      it ("should simply create a new object", function() {
        var object = new LSD.Object;
        expect(object.set).toEqual(LSD.Object.prototype.set)
      })
    })
  });
  
  describe("#watch", function() {
    describe("when given a simple property to watch", function() {
      describe("before the property was set", function() {
        it ("should execute callback", function() {
          var object = new LSD.Object;
          var counter = 0;
          var callback = function(value) {
            expect(value).toEqual('honks')
            counter++;
          };
          object.watch('dongs', callback);
          object.set('dongs', 'honks');
          expect(counter).toEqual(1)
        });
        describe("and then unset", function() {
          it ("should execute callback each time value is changed", function() {
            var object = new LSD.Object;
            var counter = 0;
            var callback = function(value) {
              counter++;
            };
            object.watch('dongs', callback);
            object.set('dongs', 'honks');
            object.unset('dongs', 'honks');
            expect(counter).toEqual(2)
          })
        })
      });
      describe("after the property was set", function() {
        it ("should execute callback", function() {
          var object = new LSD.Object;
          var counter = 0;
          var callback = function(value) {
            expect(value).toEqual('Boston, MA')
            counter++;
          };
          object.set('location', 'Boston, MA');
          object.watch('location', callback);
          expect(counter).toEqual(1)
        });
        describe("and then unset", function() {
          it ("should execute callback each time value is changed", function() {
            var object = new LSD.Object;
            var counter = 0;
            var callback = function(value) {
              counter++;
            };
            object.set('dongs', 'honks');
            object.watch('dongs', callback);
            object.unset('dongs', 'honks');
            expect(counter).toEqual(2)
          });
          describe("and then set again", function() {
            it ("should execute callback each time value is changed", function() {
              var object = new LSD.Object;
              var counter = 0;
              var callback = function(value) {
                counter++;
              };
              object.set('dongs', 'honks');
              object.watch('dongs', callback);
              object.unset('dongs', 'honks');
              object.set('dongs', 'honks');
              expect(counter).toEqual(3)
            })
          })
        });
        describe("and unset before the watch call", function() {
          it ("should execute callback", function() {
            var object = new LSD.Object;
            var counter = 0;
            var callback = function(value) {
              counter++;
            };
            object.set('dongs', 'honks');
            object.unset('dongs', 'honks');
            object.watch('dongs', callback);
            expect(counter).toEqual(0)
          })  
          describe("but set again", function() {
            it ("should execute callback", function() {
              var object = new LSD.Object;
              var counter = 0;
              var callback = function(value) {
                counter++;
              };
              object.set('dongs', 'honks');
              object.unset('dongs', 'honks');
              object.set('dongs', 'honks');
              object.watch('dongs', callback);
              expect(counter).toEqual(1)
            })
          })
        })
      });
    })
    describe("when given a nested attribute to watch", function() {
      it ("should execute callback when nested attribute is changed", function() {
        var object = new LSD.Object;
        var artist = new LSD.Object({boy: 'george'});
        object.set('artist', artist);
        var stack = []
        object.watch('artist.boy', function(value) {
          stack.push(value)
        })
        expect(stack).toEqual(['george']);
        object.artist.set('boy', 'clooney');
        expect(stack).toEqual(['george', 'clooney']);
        object.artist.unset('boy');
        expect(stack).toEqual(['george', 'clooney', undefined]);
      })
    });
    
    describe("when given an unusual callback in form of", function() {
      describe("a string", function() {
        it ("should set its own property", function() {
          var object = new LSD.Object;
          object.watch('cash', 'money');
          expect(object.cash).toBeFalsy();
          expect(object.money).toBeFalsy();
          object.set('cash', 200);
          expect(object.cash).toEqual(200);
          expect(object.money).toEqual(200);
          object.unset('cash');
          expect(object.cash).toBeFalsy();
          expect(object.money).toBeFalsy();
        });
      })
      describe("an object", function() {
        it ("should set the watched property in that object", function() {
          var object = new LSD.Object;
          var other = new LSD.Object;
          object.watch('cash', other);
          expect(object.cash).toBeFalsy();
          expect(other.cash).toBeFalsy();
          object.set('cash', 200);
          expect(object.cash).toEqual(200);
          expect(other.cash).toEqual(200);
          object.unset('cash');
          expect(object.cash).toBeFalsy();
          expect(other.cash).toBeFalsy();
        })
      })
      describe("an array of object and a string", function() {
        it ("should set the property from array on an object from array when the watched property is changed", function() {
          var object = new LSD.Object;
          var other = new LSD.Object;
          object.watch('cash', [other, 'money']);
          expect(object.cash).toBeFalsy();
          expect(other.money).toBeFalsy();
          object.set('cash', 200);
          expect(object.cash).toEqual(200);
          expect(other.money).toEqual(200);
          object.unset('cash');
          expect(object.cash).toBeFalsy();
          expect(other.money).toBeFalsy();
        })
      })
    })
  });
  
  describe("unwatch", function() {
    describe("called with a property or callback that was not watched", function() {
      it ("should do nothing", function() {
        var counter = 0;
        var callback = function() {
          counter++;
        };
        var object = new LSD.Object;
        object.set('a', 1)
        object.unwatch('b', callback);
        expect(counter).toEqual(0);
        object.unwatch('a', callback);
        expect(counter).toEqual(0);
      })
    });
    describe("following a watch call", function() {
      describe("over a simple property", function() {
        describe("when property was set before", function() {
          it ("should execute callback with a null and not execute callback on subsequent changes of the property", function() {
            var stack = [];
            var callback = function(value) {
              stack.push(value);
            };
            var object = new LSD.Object;
            object.set('cash', 50);
            object.watch('cash', callback);
            expect(stack).toEqual([50])
            object.unwatch('cash', callback);
            expect(stack).toEqual([50, undefined]);
            object.set('cash', 60);
            expect(stack).toEqual([50, undefined]);
            object.unset('cash')
            expect(stack).toEqual([50, undefined]);
          });
        })
        describe("when a property was not set before", function() {
          it ("should not execute callback", function() {
            var stack = [];
            var callback = function(value) {
              stack.push(value);
            };
            var object = new LSD.Object;
            object.watch('cash', callback);
            object.unwatch('cash', callback);
            expect(stack).toEqual([])
          })
        })
        describe("when a property was set and unset before", function() {
          it ("should execute callback on changes", function() {
            var stack = [];
            var callback = function(value) {
              stack.push(value);
            };
            var object = new LSD.Object;
            object.watch('cash', callback);
            object.set('cash', 666);
            expect(stack).toEqual([666]);
            object.unset('cash', 666);
            expect(stack).toEqual([666, undefined]);
            object.unwatch('cash', callback);
            expect(stack).toEqual([666, undefined]);
          })
        })
      })
      describe("over a complex property", function() {
        describe("when a left part was not set before", function() {
          it ("should remove watch function and not execute callbacks", function() {
            var object = new LSD.Object;
            var artist = new LSD.Object({boy: 'george'});
            var stack = []
            var callback = function(value) {
              stack.push(value);
            };
            expect(object._watched).toBeFalsy();
            object.watch('artist.boy', callback)
            expect(object._watched.artist.length).toEqual(1);
            object.unwatch('artist.boy', callback)
            expect(object._watched.artist.length).toEqual(0);
            expect(stack).toEqual([]);
          });
        })
        describe("when the left part was set and the right part was not", function() {
          it ("should remove watches functions and not execute callback", function() {
            var object = new LSD.Object;
            var artist = new LSD.Object({});
            var stack = []
            var callback = function(value) {
              stack.push(value);
            };
            object.set('artist', artist);
            expect(object._watched).toBeFalsy();
            object.watch('artist.boy', callback)
            expect(object._watched.artist.length).toEqual(1);
            expect(artist._watched.boy.length).toEqual(1);
            object.unwatch('artist.boy', callback)
            expect(object._watched.artist.length).toEqual(0);
            //expect(artist._watched.boy.length).toEqual(0);
            //expect(stack).toEqual([]);
          })
        })
        describe("when both left and right sides are set", function() {
          it("should remove watch finders and execute callback setting value to null", function() {
            var object = new LSD.Object;
            var artist = new LSD.Object({boy: 'george'});
            var stack = []
            var callback = function(value) {
              stack.push(value);
            };
            object.set('artist', artist);
            expect(object._watched).toBeFalsy();
            object.watch('artist.boy', callback)
            expect(object._watched.artist.length).toEqual(1);
            expect(artist._watched.boy.length).toEqual(1);
            expect(stack).toEqual(['george']);
            object.unwatch('artist.boy', callback)
            expect(object._watched.artist.length).toEqual(0);
            expect(artist._watched.boy.length).toEqual(0);
            expect(stack).toEqual(['george', undefined]);
          })
        })
      })

      describe("when given an unusual callback in form of", function() {
        describe("a string", function() {
          it ("should unset that property from a string", function() {
            var object = new LSD.Object;
            object.watch('cash', 'money');
            object.set('cash', 200);
            expect(object.money).toEqual(200);
            object.unwatch('cash', 'money');
            expect(object.cash).toEqual(200);
            expect(object.money).toBeFalsy();
          });
        })
        describe("an object", function() {
          it ("should set the watched property in that object", function() {
            var object = new LSD.Object;
            var other = new LSD.Object;
            object.watch('cash', other);
            object.set('cash', 200);
            expect(object.cash).toEqual(200);
            expect(other.cash).toEqual(200);
            object.unwatch('cash', other);
            expect(object.cash).toEqual(200);
            expect(other.cash).toBeFalsy();
          })
        })
        describe("an array of object and a string", function() {
          it ("should set the property from array on an object from array when the watched property is changed", function() {
            var object = new LSD.Object;
            var other = new LSD.Object;
            object.watch('cash', [other, 'money']);
            object.set('cash', 200);
            expect(object.cash).toEqual(200);
            expect(other.money).toEqual(200);
            object.unwatch('cash', [other, 'money']);
            expect(object.cash).toEqual(200);
            expect(other.money).toBeFalsy();
          })
        })
      })
    })
  })
})

LSD.document = LSD.getCleanDocument()