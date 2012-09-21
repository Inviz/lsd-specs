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
  
  describe('#set', function() {
    it ('should lazily reference object and make a fork of it on the fly', function() {
      var object = new LSD.Object({title: 'object'});
      var referenced = new LSD.Object({title: 'referenced'});
      var other = new LSD.Object({title: 'other'});
      object.set('property', referenced);
      expect(referenced._owner).toEqual(object);
      expect(object.property).toBe(referenced);
      other.set('property', referenced);
      expect(object.property).toBe(referenced);
      expect(other.property).toBe(referenced);
      expect(referenced._owner).toBe(object);
      other.property.set('price', 123);
      expect(referenced._owner).toBe(object);
      expect(object.property.price).toBe(123);
      other.set('property.rating', 666);
      expect(other.property.rating).toBe(666);
      expect(other.property).toNotBe(object.property)
      expect(object.property.rating).toBeUndefined();
    })
    describe('when given old value', function() {
      describe('and no new value', function() {
        it ('should unset old value', function() {
          var object = new LSD.Object({title: 'object', body: 'text'});
          expect(object.set('title', undefined, undefined, 'object')).toBe(true)
          expect(object.title).toBeUndefined();
          expect(object.set('body', undefined, undefined, 'object', true)).toBe(true)
          expect(object.body).toBeUndefined();
        })
      })
      describe('and a new value', function() {
        it ('should set new value and unset old one', function() {
          var calls = []
          var callback = function(key, value, old, meta) {
            calls.push([key, value, old])
          }
          var object = new LSD.Object
          object.watch(callback)
          object.set('title', 'object')
          expect(calls.pop()).toEqual(['title', 'object', undefined]);
          expect(object.title).toBe('object');
          expect(object.set('title', 'bazooka', 'object'))
          expect(calls.pop()).toEqual(['title', 'bazooka', 'object']);
          expect(object.title).toBe('bazooka');
          expect(object.set('title', 'voodoo', 'object'))
          expect(calls.pop()).toEqual(['title', 'voodoo', 'object']);
          expect(object.title).toBe('voodoo');
          expect(object.set('title')).toBe(true)
          expect(calls.pop()).toEqual(['title', undefined, 'voodoo']);
          expect(object.title).toBeUndefined()
        })
      })
    })
  })

  describe('mix', function() {
    describe('when merging observable objects', function() {
      it('should lazily merge objects by setting reference first and copying the object on change', function() {
        var inside = new LSD.Object({title: 'Pop tarts'});
        var outside = new LSD.Object({title: 'Food', inside: inside});
        var result = new LSD.Object;
        result.merge(outside);
        expect(result).toNotBe(outside);
        expect(result.title).toBe(outside.title);
        expect(result.inside).toBe(outside.inside);
        expect(result.inside._owner).toBe(outside);
        result.set('inside.rating', 5);
        expect(result.inside).toNotBe(outside.inside);
        expect(result.inside._owner).toBe(result);
        expect(result.inside.title).toBe(outside.inside.title);
        expect(result.inside.rating).toBe(5);
        expect(inside.rating).toBeUndefined();
        expect(inside._owner).toBe(outside);
      });
    });
    describe('and key was given', function() {
      it ('should lazily merge the object', function() {
        var inside = new LSD.Object({title: 'Pop tarts'});
        var outside = new LSD.Object({title: 'Food', inside: inside});
        var result = new LSD.Object;
        expect(outside._owner).toBeUndefined();
        result.mix('object', outside, null, true, true);
        expect(outside._owner).toBeUndefined();
        inside.set('outside', outside);
        expect(outside._owner).toEqual(inside);
        expect(result.object).toBe(outside);
        result.set('object.inside.rating', 5);
        expect(result.object).toNotBe(outside);
        expect(result.object.inside).toNotBe(outside.inside);
        expect(result.object.inside.title).toBe(outside.inside.title);
        expect(result.object.inside.rating).toBe(5);
        expect(outside.inside.rating).toBeUndefined();
        expect(outside.inside._owner).toBe(outside);
        expect(outside._owner).toBe(inside);
        inside.unset('outside', outside)
        expect(outside._owner).toBeUndefined()
      })
    })
    describe('when propagating objects recursively', function() {
      describe ('and objects are known to be shared', function() {
        it ('should only copy when it has to', function() {
          var data = LSD.Struct()
          var struct = LSD.Struct({
            Data: data,
            data: function(value, old, memo) {
              this.mix('parent.data', value, old, memo, true);
            }
          })
          data.prototype._ownable = struct.prototype._ownable = false;
          var a  = new struct
          var b  = new struct({parent: a})
          var d  = new struct({parent: b})
          var d1 = new struct({parent: d})
          var d2 = new struct({parent: d})
          var c  = new struct({parent: b})
          var c1 = new struct({parent: c})
          var c2 = new struct({parent: c})
          var o  = new data({title: 'abc'});
          d2.set('data', o);
          expect(d2.parent).toBe(d);
          expect(d.data).toBe(o);
          expect(b.data).toBe(o);
          expect(a.data).toBe(o);
          d.set('data.macaroni', true)
          expect(d.data.macaroni).toBe(true);
          expect(d.data.title).toBe('abc');
          expect(d2.data).toBe(o)
          expect(d2.data.title).toBe('abc');
          expect(d2.data.macaroni).toBeUndefined();
          expect(d.data).toNotBe(o);
          expect(b.data).toBe(d.data);
          expect(a.data).toBe(d.data);
          c1.set('data.lasagna', true)
          expect(d.data.lasagna).toBeUndefined();
          expect(b.data.lasagna).toBe(true);
          expect(c.data.lasagna).toBe(true);
          expect(b.data).toNotBe(d.data);
          expect(b.data).toNotBe(c.data);
          expect(a.data).toBe(b.data);
        })
      });
    })
  })
})