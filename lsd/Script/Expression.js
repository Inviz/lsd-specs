describe('LSD.Script.Expression', function() {
  describe('when give multiple comma separated expressions', function() {
    it ('should evaluate expressions sequentially', function() {
      var scope = new LSD.Object.Stack;
      var result
      var callback = function(value) {
        result = value;
      }
      var script = LSD.Script('a, b', scope, callback);
      expect(result).toBeNull();
      expect(scope._watched['a']).toBeTruthy()
      expect(scope._watched['b']).toBeFalsy()
      scope.set('a', 1);
      expect(scope._watched['a']).toBeTruthy()
      expect(scope._watched['b']).toBeTruthy()
      expect(result).toBeNull();
      scope.set('b', 2);
      expect(result).toEqual(2);
      scope.set('a', 3);
      expect(result).toEqual(2);
      scope.unset('b', 2);
      expect(result).toBeNull()
      expect(scope._watched['a']).toBeTruthy()
      expect(scope._watched['b']).toBeTruthy()
      script.detach();
      //expect(scope._watched['a']).toEqual([])
      //expect(scope._watched['b']).toEqual([])
    });
    
    it ('should evaluate function calls sequentially', function() {
      var scope = new LSD.Object.Stack;
      var result, state
      var callback = function(value) {
        result = value;
      }
      scope.set('submit', function(value) {
        state = 'submitted'
        return value;
      });
      scope.set('update', function(value) {
        state = 'updated'
        return value;
      });
      var script = LSD.Script('submit(a), update(b), update(c || 1)', scope, callback);
      expect(scope._watched['a']).toBeTruthy()
      expect(scope._watched['b']).toBeFalsy()
      scope.set('a', 1);
      expect(state).toBe('submitted')
      expect(scope._watched['a']).toBeTruthy()
      expect(scope._watched['b']).toBeTruthy()
      scope.set('b', 1);
      expect(state).toBe('updated')
      expect(result).toBe(1)
      scope.set('c', 4);
      expect(result).toBe(4)
      scope.set('a', null);
      expect(scope._watched['a']).toBeTruthy()
      //expect(scope._watched['b']).toBeFalsy()
    });
    
    it ("should lazily evaluate expressions with deep variables", function() {
      var scope = new LSD.Object.Stack;
      
      var script = new LSD.Script('time_range.starts_at && time_range.recurrence_rule.interval || 1', scope)
      expect(script.value).toEqual(1);
      scope.set('time_range.recurrence_rule.interval', 2);
      expect(script.value).toEqual(1);
      scope.set('time_range.starts_at', 3);
      expect(script.value).toEqual(2);
      scope.set('time_range.starts_at', 0);
      expect(script.value).toEqual(1);
    })
    
    it ("should lazily evaluate expression with deep variables and falsy fallbacks", function() {
      var scope = new LSD.Object.Stack;
      var script = new LSD.Script('time_range.starts_at && time_range.recurrence_rule.interval || ""', scope)
      expect(script.value).toEqual("");
      scope.set('time_range.recurrence_rule.interval', 2);
      expect(script.value).toEqual("");
      scope.set('time_range.starts_at', 3);
      expect(script.value).toEqual(2);
      scope.set('time_range.starts_at', 0);
      expect(script.value).toEqual("");
    });
    
    it ("should be able to wait for asynchronous results returned from function calls", function() {
      var scope = new LSD.Object.Stack;
      var read = new Chain;
      var write = new Chain;
      scope.set('read', function() {
        return read;
      });
      scope.set('transform', function(content) {
        return '[' + content + ']';
      });
      scope.set('write', function(content) {
        write.content = content
        return write;
      });
      scope.set('notify', function(content) {
        return 'Superb ' + content;
      });
      var script = new LSD.Script('read(), transform(), write(), notify()', scope);
      expect(script.value).toBeUndefined()
      expect(script.args[0].value).toEqual(read);
      expect(script.args[1].variable).toBeUndefined();
      read.callChain('nurga');
      expect(script.value).toBeUndefined()
      expect(script.args[1].value).toEqual('[nurga]');
      expect(script.args[2].value).toEqual(write);
      write.callChain(write.content);
      expect(script.value).toEqual('Superb [nurga]');
    });
    
    it ("should be able to handle failures and execute alternative actions", function() {
      var scope = new LSD.Object.Stack;
      var invent = Object.append(new Chain, new Events);
      invent.onFailure = function(){ 
        return invent.fireEvent('failure', arguments); 
      };
      invent.onSuccess = function(){ 
        return invent.fireEvent('success', arguments); 
      };
      scope.set('invent', function(content) {
        return invent;
      });
      scope.set('steal', function(reason) {
        return 'Stole invention because ' + reason;
      });
      scope.set('unsteal', function(reason) {
        return '';
      });
      scope.set('profit', function(biz) {
        return '$$$ ' + biz
      });
      var write = new Chain;
      var script = $script = new LSD.Script('invent() || steal(), profit()', scope);
      expect(script.value).toBeNull()
      invent.onFailure('I was drunk')
      expect(script.value).toEqual('$$$ Stole invention because I was drunk');
      script.prepiped = 1;
      script.set(null, true);
      expect(script.value).toBeNull()
      invent.onSuccess('Fair invention')
      expect(script.value).toEqual('$$$ Fair invention');
      script.prepiped = 2;
      script.set(null, true);
      expect(script.value).toBeNull()
      invent.onFailure('Dog ate my homework')
      expect(script.value).toEqual('$$$ Stole invention because Dog ate my homework');
    });
    
    it ("should be able to stack multiple scripts together (kind of coroutines and aspects)", function() {
      var scope = new LSD.Object.Stack;
      var submit = Object.append(new Chain, new Events);
      submit.onFailure = function(){ 
        return submit.fireEvent('failure', arguments); 
      };
      submit.onSuccess = function(){ 
        return submit.fireEvent('success', arguments); 
      };
      scope.merge({
        submit: function(data) {
          submit.data = data;
          return submit;
        },
        before: function() {
          return "Hi"
        },
        after: function(data) {
          return data + "... Boom"
        }
      });
      var script = LSD.Script.compile('submit()', scope);
      var advice = LSD.Script.compile('before(), yield(), after()', scope);
      advice.wrap(script);
      expect(script.value).toBeUndefined()
      expect(script.args[0]).toBeUndefined()
      expect(advice.args[0].script).toBeUndefined()
      advice.attach();
      expect(script.value).toEqual(submit)
      expect(advice.value).toBeUndefined()
      expect(advice.args[0].script).toBeTruthy();
      expect(advice.args[1].script).toBeTruthy();
      expect(advice.args[1].value).toEqual(submit);
      expect(advice.args[2].script).toBeUndefined();
      submit.onSuccess(submit.data + 'Jack');
      expect(advice.value).toEqual('HiJack... Boom')
    })
    
    it ("should be able to stack multiple scripts together and make one handle failures in another", function() {
      var scope = new LSD.Object.Stack;
      var submit = Object.append(new Chain, new Events);
      submit.onFailure = function(){ 
        return submit.fireEvent('failure', arguments); 
      };
      submit.onSuccess = function(){ 
        return submit.fireEvent('success', arguments); 
      };
      var errors = 0;
      scope.merge({
        submit: function(data) {
          submit.data = data;
          return submit;
        },
        error: function(data) {
          errors++;
          return "Error: " + data
        },
        unerror: function() {
          errors--;
        },
        before: function(data) {
          return (data || '') + "Hi"
        },
        after: function(data) {
          return data + "... Boom"
        }
      });
      var script = LSD.Script.compile('submit()', scope);
      var advice = LSD.Script.compile('before(), yield() || error(), after()', scope);
      advice.wrap(script);
      expect(script.value).toBeUndefined()
      expect(script.args[0]).toBeUndefined()
      expect(advice.args[0].script).toBeUndefined()
      advice.attach();
      expect(script.value).toEqual(submit)
      expect(advice.value).toBeNull()
      expect(advice.args[0].script).toBeTruthy();
      expect(advice.args[1].script).toBeTruthy();
      expect(advice.args[1].args[0].value).toEqual(submit);
      expect(advice.args[1].value).toBeUndefined();
      expect(advice.args[2].script).toBeUndefined();
      submit.onFailure(submit.data + 'Jack');
      expect(advice.value).toEqual('Error: HiJack... Boom');
      expect(errors).toEqual(1);
      advice.piped = advice.prepiped = 'Oh! ';
      advice.set(null, true)
      expect(advice.value).toBeNull()
      submit.onSuccess(submit.data + 'Jackie');
      expect(advice.value).toEqual('Oh! HiJackie... Boom');
      expect(errors).toEqual(0);
    })
  })
})