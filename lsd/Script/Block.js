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
        array.seek(fn, function(result, value, index, state) {
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
        array.seek(fn, function(result, value, index, state) {
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