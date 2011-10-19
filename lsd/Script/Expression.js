describe('LSD.Script.Expression', function() {
  describe('when give multiple comma separated expressions', function() {
    it ('should evaluate expressions sequentially', function() {
      var scope = new LSD.Script.Scope;
      var result
      var callback = function(value) {
        result = value;
      }
      var script = LSD.Script('a, b', scope, callback);
      expect(result).toBeUndefined();
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
  })
  
  it ('should evaluate blocks', function() {
    var scope = new LSD.Script.Scope;
    var script = new LSD.Script('filter (items) { |item| item.active == active }', scope);
    scope.methods.set('filter', function(array, fn, bind) {
      var results = [];
  		for (var i = 0, l = array.length >>> 0; i < l; i++){
  			if ((i in array) && fn.call(bind, array[i], i, array)) results.push(array[i]);
  		}
  		return results;
    });
    scope.variables.set('active', true);
    scope.variables.set('items', [{title: 'Bogus', active: false}, {title: 'Sacred', active: true}]);
    expect(script.value).toEqual([{title: 'Sacred', active: true}])
    scope.variables.set('active', false);
    expect(script.value).toEqual([{title: 'Bogus', active: false}])
    scope.variables.set('active', true);
    expect(script.value).toEqual([{title: 'Sacred', active: true}])
  })
  
  xit ('should run a block against an observable array', function() {
    var scope = new LSD.Script.Scope;
    var script = new LSD.Script('map (users) { |user| toUpperCase(user.name) + " " + organization }', scope);
    scope.methods.set('map', function(array, fn, bind) {
      var results = [];
  		for (var i = 0, l = array.length >>> 0; i < l; i++){
  			if ((i in array)) results.push(fn.call(bind, array[i], i, array));
  		}
  		return results;
    });
    var ary = new LSD.Array(new LSD.Object({name: 'Michael', active: false}), new LSD.Object({name: 'Alex', active: true}));
    scope.variables.set('users', ary);
    scope.variables.set('organization', 'ICP');
    expect(script.value).toEqual(['MICHAEL ICP', 'ALEX ICP'])
    ary[1].set('name', 'Oleksandr');
    expect(script.value).toEqual(['MICHAEL ICP', 'OLEKSANDR ICP'])
    ary.push({name: 'Yarik', active: true})
    expect(script.value).toEqual(['MICHAEL ICP', 'OLEKSANDR ICP', 'YARIK ICP'])
  })
})