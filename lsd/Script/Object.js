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
  
  describe("#set", function() {
    describe("when key references other objects", function() {
      it("should store value for that key and apply to objects", function() {
        var object = new LSD.Object;
        object.set('attributes.hidden', true);
        console.log(object.attributes.hidden, 555)
        var attributes = object.attributes;
        expect(attributes).toBeDefined();
        expect(attributes.hidden).toBeTruthy();
        var other = new LSD.Object;
        object.set('attributes', other);
        expect(attributes.hidden).toBeUndefined();
        expect(other.hidden).toBeTruthy();
        object.unset('attributes.hidden', true);
        expect(other.hidden).toBeUndefined();
      })
    })
  })
  
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
      describe("and the nested object is observable", function() {
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
        });
      });
      describe("and the nested object is NOT observable", function() {
        describe("and there's one more nested object that is observable", function() {
          it ("should execute callback when deeply nested attribute is changed", function() {
            var object = new LSD.Object({
              genre: new LSD.Object({
                band: {
                  artist: new LSD.Object({boy: 'SCHIZO'})
                }
              })
            });
            var stack = []
            object.watch('genre.band.artist.boy', function(value) {
              stack.push(value)
            })
            expect(stack).toEqual(['SCHIZO']);
            object.genre.band.artist.set('boy', 'PSYCHOPATH');
            expect(stack).toEqual(['SCHIZO', 'PSYCHOPATH']);
            object.genre.band.artist.unset('boy');
            expect(stack).toEqual(['SCHIZO', 'PSYCHOPATH', undefined]);
          });
        })
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
  describe('when object sets reference to another object', function() {
    describe('and then mixes value into it', function() {
      it ('should lazily reference object and make a fork of it on the fly', function() {
        var object = new LSD.Object({title: 'object'});
        var referenced = new LSD.Object({title: 'referenced'});
        var other = new LSD.Object({title: 'other'});
        object.set('property', referenced);
        expect(referenced._parent).toEqual(object);
        expect(object.property).toBe(referenced);
        other.set('property', referenced);
        expect(object.property).toEqual(referenced);
        expect(other.property).toEqual(referenced);
        expect(referenced._parent).toBe(object);
        other.property.set('price', 123);
        expect(object.property.price).toEqual(123);
        other.set('property.rating', 666);
        expect(other.property.rating).toEqual(666);
        expect(other.property).toNotBe(object.property)
        expect(object.property.rating).toBeUndefined();
      })
    })
  })
})