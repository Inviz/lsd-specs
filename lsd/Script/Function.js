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
            var script = new LSD.Script('slicez(object, 1)', scope);
            scope.methods.set('slicez', function(object, index, offset) {
              return object.slice(index, offset)
            })
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
});