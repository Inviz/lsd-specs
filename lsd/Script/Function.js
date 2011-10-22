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