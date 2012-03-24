describe("LSD.Script", function() {
  describe('constructor', function() {
    describe('when given string', function() {
      describe('and string is simple', function() {
        it ('should create simple observable variables', function() {
          var scope = new LSD.Object;
          var script = LSD.Script('jeez', scope);
          expect(script.value).toBeUndefined();
          scope.set('jeez', 'joosh')
          expect(script.value).toEqual('joosh')
          scope.set('jeez', 'jack')
          expect(script.value).toEqual('jack')
          scope.unset('jeez', 'jack')
          expect(script.value).toBeUndefined();
          scope.set('jeez', 'jim')
          expect(script.value).toEqual('jim')
          script.unset('attached', true)
          expect(script.value).toBeUndefined();
          scope.set('jeez', 'jehrar')
          expect(script.value).toBeUndefined();
          script.set('attached', true)
          expect(script.value).toEqual('jehrar')
        })
        
        describe('when there is a method with that name defined', function() {
          it ('should create simple observable variables', function() {
            var scope = new LSD.Object;
            var count = 0;
            scope.variables = new LSD.Object;
            scope.methods = new LSD.Object({
              jeez: function() {
                count++;
                return 'oink'
              }
            })
            var script = LSD.Script('jeez', scope);
            expect(count).toEqual(1);
            expect(script.value).toEqual('oink');
            scope.variables.set('jeez', 'joosh')
            expect(script.value).toEqual('joosh')
            scope.variables.set('jeez', 'jack')
            expect(script.value).toEqual('jack')
            scope.variables.unset('jeez', 'jack')
            expect(count).toEqual(2);
            expect(script.value).toEqual('oink');
            scope.variables.set('jeez', 'jim')
            expect(script.value).toEqual('jim')
            script.unset('attached', true)
            expect(script.value).toBeUndefined();
            scope.variables.unset('jeez', 'jim')
            expect(script.value).toBeUndefined();
            expect(count).toEqual(2);
            script.set('attached', true)
            expect(count).toEqual(3);
            expect(script.value).toEqual('oink');
          })
        })
      });
      describe('and string contains dot separators', function() {
        it ('should create simple observable variables', function() {
          var root = new LSD.Object;
          var scope = (new LSD.Object).mix('root', root);
          var script = LSD.Script('root.jeez', scope);
          expect(script.value).toBeUndefined();
          root.set('jeez', 'joosh')
          expect(script.value).toEqual('joosh')
          root.set('jeez', 'jack')
          expect(script.value).toEqual('jack')
          root.unset('jeez', 'jack')
          expect(script.value).toBeUndefined();
          root.set('jeez', 'jim')
          expect(script.value).toEqual('jim')
          script.unset('attached', true)
          expect(script.value).toBeUndefined();
          root.set('jeez', 'jehrar')
          expect(script.value).toBeUndefined();
          script.set('attached', true)
          expect(script.value).toEqual('jehrar')
          scope.unset('root', root)
          expect(script.value).toBeUndefined();
          scope.set('root', root)
          expect(script.value).toEqual('jehrar')
          scope.root.change('jeez', 'juan')
          expect(script.value).toEqual('juan');
          scope.set('root', {jeez: 'john'})
          expect(script.value).toEqual('john')
        })
      })
      describe('and string contains function calls', function() {
        it ('should parse input and create a function script', function() {
          var scope = new LSD.Object;
          var script = LSD.Script('concat(a, b)', scope);
          expect(script.input[0].name).toEqual('a');
          expect(script.args[0].value).toBeUndefined();
          expect(script.args[0].attached).toBeTruthy();
          expect(script.input[1].name).toEqual('b');
          expect(script.args[1].value).toBeUndefined();
          expect(script.args[1].attached).toBeFalsy();
          expect(script.type).toEqual('function');
          expect(script.value).toBeUndefined();
          scope.set('a', 'lol');
          expect(script.args[0].value).toBe('lol');
          expect(script.args[0].parents).toEqual([script])
          expect(script.args[1].attached).toBeTruthy();
          expect(script.args[1].value).toBeUndefined();
          expect(script.value).toBeUndefined();
          scope.unset('a', 'lol');
          expect(script.args[0].value).toBeUndefined()
          scope.set('a', 'lol');
          expect(script.args[0].value).toBe('lol');
          expect(script.args[1].value).toBeUndefined();
          expect(script.value).toBeUndefined();
          scope.set('b', 'rofl');
          expect(script.args[0].value).toBe('lol');
          expect(script.args[1].value).toBe('rofl');
          expect(script.value).toBe('lolrofl');
          scope.set('a', 'lolleo');
          expect(script.value).toBe('lolleorofl');
          scope.set('b', 'rofel');
          expect(script.value).toBe('lolleorofel');
          scope.unset('b', 'rofel');
          expect(script.args[1].value).toBeUndefined();
          scope.set('b', 'bacon');
          expect(script.value).toBe('lolleobacon');
          scope.unset('a', 'lolleo');
          expect(script.args[0].value).toBeUndefined();
          expect(script.args[1].value).toBe('bacon');
          expect(script.value).toBeUndefined();
          script.unset('attached', script.attached)
          expect(script.args[1].value).toBeUndefined();
        })
      })
    })
    describe('when given array', function() {
      it ("should make a comma-separate expression out of tokens in array", function() {
        var scope = new LSD.Object;
        var script = LSD.Script([{type: 'variable', name: 'a'}, {type: 'variable', name: 'b'}], scope);
        expect(script.args[0].name).toEqual('a');
        expect(script.args[0].value).toBeUndefined();
        expect(script.args[0].attached).toBeTruthy();
        expect(script.args[1].name).toEqual('b');
        expect(script.args[1].value).toBeUndefined();
        expect(script.args[1].attached).toBeFalsy();
        expect(script.type).toEqual('function');
        expect(script.value).toBeNull();
        scope.set('a', 123);
        expect(script.args[0].value).toBe(123);
        expect(script.args[0].parents).toEqual([script])
        expect(script.args[1].attached).toBeTruthy();
        expect(script.args[1].value).toBeUndefined();
        expect(script.value).toBeNull();
        scope.unset('a', 123);
        expect(script.args[0].value).toBeUndefined()
        //expect(script.args[1].attached).toBeFalsy();
      })
    })
  })
})