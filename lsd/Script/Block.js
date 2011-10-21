describe("LSD.Script.Block", function() {
  it ('should evaluate blocks', function() {
    var scope = new LSD.Script.Scope;
    var script = new LSD.Script('filter (items) { |item| item.active == active }', scope);
    var count = 0;
    scope.methods.set('filter', function(array, fn, bind) {
      var results = [];
      count++;
  		for (var i = 0, l = array.length >>> 0; i < l; i++){
  			if ((i in array) && fn.call(bind, array[i], i, array)) results.push(array[i]);
  		}
  		return results;
    });
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
    var scope = new LSD.Script.Scope;
    var script = new LSD.Script('map (users) { |user| toUpperCase(user.name) + " " + (user.organization || organization) }', scope);
    var count = 0;
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
    var ary = new LSD.Array(new LSD.Object({name: 'Michael'}), new LSD.Object({name: 'Alex'}));
    expect(count).toEqual(0);
    scope.variables.set('users', ary);
    expect(count).toEqual(2);
    scope.variables.set('organization', 'ICP');
    expect(count).toEqual(4);
    expect(script.value).toEqual(['MICHAEL ICP', 'ALEX ICP'])
    ary[1].set('name', 'Oleksandr');
    expect(count).toEqual(5);
    expect(script.value).toEqual(['MICHAEL ICP', 'OLEKSANDR ICP'])
    ary.push(new LSD.Object({name: 'Yarik'}))
    expect(count).toEqual(6);
    expect(script.value).toEqual(['MICHAEL ICP', 'OLEKSANDR ICP', 'YARIK ICP'])
    scope.variables.set('organization', 'Orceo');
    expect(count).toEqual(9);
    expect(script.value).toEqual(['MICHAEL Orceo', 'OLEKSANDR Orceo', 'YARIK Orceo'])
    ary[2].set('name', 'Yaroslaff');
    expect(count).toEqual(10);
    expect(script.value).toEqual(['MICHAEL Orceo', 'OLEKSANDR Orceo', 'YAROSLAFF Orceo'])
    ary[2].set('organization', 'OrceoUI')
    expect(count).toEqual(11);
    expect(script.value).toEqual(['MICHAEL Orceo', 'OLEKSANDR Orceo', 'YAROSLAFF OrceoUI']);
    var spliced = ary.splice(1, 1);
    expect(count).toEqual(13);
    expect(ary.length).toEqual(2)
    expect(script.value).toEqual(['MICHAEL Orceo', 'YAROSLAFF OrceoUI'])
    scope.variables.set('organization', 'Overmind');
    expect(count).toEqual(14);
    expect(script.value).toEqual(['MICHAEL Overmind', 'YAROSLAFF OrceoUI'])
    ary.splice(0, 0, spliced[0]);
    expect(count).toEqual(17);
    expect(ary.length).toEqual(3)
    expect(script.value).toEqual(['OLEKSANDR Overmind', 'MICHAEL Overmind', 'YAROSLAFF OrceoUI'])
    ary[2].unset('organization');
    expect(count).toEqual(18);
    expect(script.value).toEqual(['OLEKSANDR Overmind', 'MICHAEL Overmind', 'YAROSLAFF Overmind'])
  })
})