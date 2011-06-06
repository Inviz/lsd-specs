describe("LSD.Module.Chain", function() {
  var getAction = function(name, async, failing) {
    var action = LSD.Action[LSD.capitalize(name)] = LSD.Action.build({
      enable: function(target) {
        action.count++;
        action.args = Array.prototype.slice.call(arguments, 1);
        if (async) {
          if (this.retrieve(target)) return;
          var callback = function() {
            this.removeEvents(events);
            self.eliminate(target);
          };
          var self = this, events = {
            complete: callback,
            cancel: callback
          };
          this.store(target, action.xhr)
          action.xhr.addEvents(events);
          action.xhr.fireEvent('start');
          return action.xhr;
        } else this.store(target, true)
      },
      disable: function(target) {
        if (async) action.xhr.fireEvent('cancel');
        this.eliminate(target);
        action.count--;
      },
      getState: function(target) {
        var submission = this.retrieve(target);
        return !submission || !(submission !== true || submission.running);
      }
    });
    if (async) {
      var xhr = new Events;
      xhr.callChain = true;
      xhr.addEvents({
        cancel: function() {
          xhr.running = false;
        },
        complete: function() {
          xhr.running = false;
        },
        start: function() {
          xhr.running = true;
        }
      })
      if (failing) xhr.onFailure = true;
      action.xhr = xhr;
    }
    action.count = 0;
    return action;
  }
  
  it ("should read chain links off options and walk them both ways", function() {
    var kiss = getAction('kiss'), slap = getAction('slap');
    var widget = new LSD.Widget({
      chain: {
        kiss: function() {
          return {action: 'kiss'}
        },
        slap: function() {
          return {action: 'slap'}
        }
      }
    });
    expect(kiss.count).toEqual(0);
    expect(slap.count).toEqual(0);
    expect(widget.chainPhase).toEqual(-1);
    widget.callChain();
    expect(kiss.count).toEqual(1);
    expect(slap.count).toEqual(1);
    expect(widget.chainPhase).toEqual(1);
    widget.uncallChain();
    expect(kiss.count).toEqual(0);
    expect(slap.count).toEqual(0);
    expect(widget.chainPhase).toEqual(-1);
    widget.callChain();
    expect(kiss.count).toEqual(1);
    expect(slap.count).toEqual(1);
    expect(widget.chainPhase).toEqual(1);
    widget.uncallChain();
    expect(kiss.count).toEqual(0);
    expect(slap.count).toEqual(0);
    expect(widget.chainPhase).toEqual(-1);
  });
  
  it ("waits for asynchrponous tasks to finish", function() {
    var kiss = getAction('kiss', true), slap = getAction('slap');
    var widget = new LSD.Widget({
      chain: {
        kiss: function() {
          return {action: 'kiss'}
        },
        slap: function() {
          return {action: 'slap'}
        }
      }
    });
    widget.callChain();
    expect(widget.chainPhase).toEqual(0);
    expect(kiss.count).toEqual(1);
    expect(slap.count).toEqual(0);
    expect(kiss.xhr.fireEvent('complete', [888]));
    expect(widget.chainPhase).toEqual(1);
    expect(kiss.count).toEqual(1);
    expect(slap.args).toEqual([888]);
    expect(slap.count).toEqual(1);
    expect(kiss.xhr.fireEvent('complete', 777));
    expect(widget.chainPhase).toEqual(1);
    expect(kiss.count).toEqual(1);
    expect(slap.count).toEqual(1);
  })
  
  it ("handles asynchronous multiple asynchronous actions and reveses them right", function() {
    var kiss = getAction('kiss'), slap = getAction('slap', true, true);
    var widget = new LSD.Widget({
      chain: {
        ordinarySlap: function() {
          return {action: 'slap', arguments: [3, 4]}
        },
        highPriorityKiss: function() {
          return {action: 'kiss', priority: 10, target: girl}
        },
        doubleKissFirst: function() {
          return {action: 'kiss', arguments: [1, 2], target: mom}
        },
        doubleKissSecond: function() {
          return {action: 'kiss', arguments: [1, 2], target: boy}
        },
        lastSlap: function() {
          return {action: 'slap', arguments: [3, 4], target: mom}
        },
        goodbyeSelfKiss: function() {
          return {action: 'kiss', arguments: [1, 2]}
        }
      }
    });
    var boy = new LSD.Widget, girl = new LSD.Widget, mom = new LSD.Widget;
    widget.callChain();
    var chain = widget.getActionChain().map(function(e) { return e.action});
    expect(chain).toEqual(['kiss', 'slap', 'kiss', 'kiss', 'slap', 'kiss'])
    expect(widget.chainPhase).toEqual(1);
    expect(kiss.count).toEqual(1);
    expect(slap.count).toEqual(1);
    expect(widget.chainPhasing.map(function(e) { return e.action})).toEqual(['kiss', 'slap']);
    slap.xhr.fireEvent('success').fireEvent('complete');
    expect(widget.chainPhase).toEqual(4);
    expect(widget.chainPhasing.map(function(e) { return e.action})).toEqual(['kiss', 'slap', 'kiss', 'kiss', 'slap']);
    expect(kiss.count).toEqual(3);
    expect(slap.count).toEqual(2);
    slap.xhr.fireEvent('success').fireEvent('complete');
    expect(widget.chainPhasing.map(function(e) { return e.action})).toEqual(['kiss', 'slap', 'kiss', 'kiss', 'slap', 'kiss']);
    expect(widget.chainPhase).toEqual(5);
    expect(kiss.count).toEqual(4);
    expect(slap.count).toEqual(2);
    widget.callChain();
    expect(widget.chainPhasing.map(function(e) { return e.action})).toEqual(['kiss', 'slap']);
    expect(widget.chainPhase).toEqual(1);
    expect(kiss.count).toEqual(5);
    expect(slap.count).toEqual(3);
    slap.xhr.fireEvent('success').fireEvent('complete');
    expect(widget.chainPhase).toEqual(4);
    expect(widget.chainPhasing.map(function(e) { return e.action})).toEqual(['kiss', 'slap', 'kiss', 'kiss', 'slap']);
    expect(kiss.count).toEqual(7);
    expect(slap.count).toEqual(4);
    slap.xhr.fireEvent('success').fireEvent('complete');
    expect(widget.chainPhase).toEqual(5);
    expect(widget.chainPhasing.map(function(e) { return e.action})).toEqual(['kiss', 'slap', 'kiss', 'kiss', 'slap', 'kiss']);
    expect(kiss.count).toEqual(8);
    expect(slap.count).toEqual(4);
    widget.uncallChain();
    expect(kiss.count).toEqual(7);
    expect(slap.count).toEqual(4);
    expect(widget.chainPhasing.map(function(e) { return e.action})).toEqual(['kiss', 'slap', 'kiss', 'kiss', 'slap']);
    expect(widget.chainPhase).toEqual(4);
    expect(widget.chainPhasing.getLast().action).toEqual('slap')
    widget.uncallChain();
    expect(widget.chainPhasing.map(function(e) { return e.action})).toEqual(['kiss', 'slap']);
    expect(kiss.count).toEqual(5);
    expect(slap.count).toEqual(3);
    expect(widget.chainPhase).toEqual(1)
    widget.uncallChain();
    expect(widget.chainPhasing.map(function(e) { return e.action})).toEqual([]);
    expect(kiss.count).toEqual(4);
    expect(slap.count).toEqual(2);
    expect(widget.chainPhase).toEqual(-1)
  });
  
  it ("handles asynchronous multiple asynchronous actions and their failures  ", function() {
    var kiss = getAction('kiss'), slap = getAction('slap', true, true);
    var widget = new LSD.Widget({
      chain: {
        goodbyeSelfKiss: function() {
          return {action: 'kiss', arguments: [1, 2], priority: -1}
        },
        ordinarySlap: function() {
          return {action: 'slap', arguments: [3, 4]}
        },
        highPriorityKiss: function() {
          return {action: 'kiss', priority: 10, target: girl}
        },
        doubleKissFirst: function() {
          return {action: 'kiss', arguments: [1, 2], target: mom}
        },
        doubleKissSecond: function() {
          return {action: 'kiss', arguments: [1, 2], target: boy}
        },
        lastSlap: function() {
          return {action: 'slap', arguments: [3, 4], target: mom}
        }
      }
    });
    var boy = new LSD.Widget, girl = new LSD.Widget, mom = new LSD.Widget;
    widget.callChain();
    var chain = widget.getActionChain().map(function(e) { return e.action});
    expect(chain).toEqual(['kiss', 'slap', 'kiss', 'kiss', 'slap', 'kiss']);
    expect(widget.chainPhase).toEqual(1);
    expect(kiss.count).toEqual(1);
    expect(slap.count).toEqual(1);
    slap.xhr.fireEvent('failure');
    slap.xhr.fireEvent('complete');
    expect(widget.chainPhase).toEqual(1);
    expect(kiss.count).toEqual(1);
    expect(slap.count).toEqual(1);
    slap.xhr.fireEvent('failure');
    slap.xhr.fireEvent('complete');
    /*
    expect(widget.chainPhase).toEqual(4);
    expect(kiss.count).toEqual(3);
    expect(slap.count).toEqual(2);
    slap.xhr.fireEvent('success');
    slap.xhr.fireEvent('complete');
    expect(widget.chainPhase).toEqual(5);
    expect(kiss.count).toEqual(4);
    expect(slap.count).toEqual(2);
    widget.callChain();
    expect(widget.chainPhase).toEqual(1);
    expect(kiss.count).toEqual(5);
    expect(slap.count).toEqual(3);
    slap.xhr.fireEvent('success');
    slap.xhr.fireEvent('complete');
    expect(widget.chainPhase).toEqual(4);
    expect(kiss.count).toEqual(7);
    expect(slap.count).toEqual(4);
    slap.xhr.fireEvent('success');
    slap.xhr.fireEvent('complete');
    expect(widget.chainPhase).toEqual(5);
    expect(kiss.count).toEqual(8);
    expect(slap.count).toEqual(4);
    widget.uncallChain();
    expect(kiss.count).toEqual(7);
    expect(slap.count).toEqual(4);
    expect(widget.chainPhase).toEqual(4)
    widget.uncallChain();
    expect(kiss.count).toEqual(5);
    expect(slap.count).toEqual(3);
    expect(widget.chainPhase).toEqual(1)
    widget.uncallChain();
    expect(kiss.count).toEqual(4);
    expect(slap.count).toEqual(2);
    expect(widget.chainPhase).toEqual(-1)
    */
  })
  
  it ("should obey keywords and do walkaheads and alternative branches", function() {
    var kiss = getAction('kiss'), lick = getAction('lick'), slap = getAction('slap', true, true);
    var widget = new LSD.Widget({
      chain: {
        conditionalSlap: function() {
          return {action: 'slap'}
        },
        onSuccessKissInstant: function() {
          return {keyword: 'and', action: 'kiss', arguments: [555]}
        },
        onFailureKiss: function() {
          return {keyword: 'or', action: 'lick', arguments: [666]}
        }
      }
    });
    widget.callChain()
    expect(widget.chainPhase).toEqual(0);
    expect(kiss.args[0]).toEqual(555);
    expect(kiss.count).toEqual(1);
    slap.xhr.fireEvent('failure').fireEvent('complete');
    expect(kiss.count).toEqual(0);
    expect(lick.count).toEqual(1);
  });
  
  it ("should greedely capture and execute actions combined with and", function() {
    var kiss = getAction('kiss'), lick = getAction('lick'), slap = getAction('slap', true, true);
    var widget = new LSD.Widget({
      chain: {
        conditionalSlap: function() {
          return {action: 'slap'}
        },
        onSuccessKissInstant: function() {
          return {keyword: 'and', action: 'kiss', arguments: [555]}
        },
        onSuccessParazyticKissInstant: function() {
          return {keyword: 'and', action: 'kiss', arguments: [333], target: boy}
        },
        onFailureKiss: function() {
          return {keyword: 'or', action: 'lick', arguments: [666]}
        },
        onFailureParazyticKiss: function() {
          return {keyword: 'or', action: 'lick', arguments: [444], target: boy}
        },
        finalStep: function() {
          return {action: 'lick', target: dog}
        }
      }
    });
    var boy = new LSD.Widget, dog = new LSD.Widget
    widget.callChain()
    expect(widget.chainPhase).toEqual(0);
    expect(kiss.args[0]).toEqual(333);
    expect(kiss.count).toEqual(2);
    expect(slap.count).toEqual(1);
    slap.xhr.fireEvent('failure').fireEvent('complete');
    expect(kiss.count).toEqual(0);
    expect(lick.count).toEqual(2);
    expect(widget.chainPhase).toEqual(0);
    widget.callChain();
    expect(widget.chainPhase).toEqual(5);
    expect(kiss.count).toEqual(0);
    expect(lick.count).toEqual(3);
    widget.callChain();
    expect(widget.chainPhase).toEqual(0);
    expect(kiss.count).toEqual(2);
    expect(lick.count).toEqual(3);
    expect(slap.count).toEqual(2);
    slap.xhr.fireEvent('success').fireEvent('complete');
    expect(widget.chainPhase).toEqual(5);
    expect(kiss.count).toEqual(2);
    expect(lick.count).toEqual(4);
    expect(slap.count).toEqual(2);
    widget.uncallChain();
    expect(widget.chainPhase).toEqual(0);
    expect(kiss.count).toEqual(2);
    expect(lick.count).toEqual(3);
    expect(slap.count).toEqual(2);
    widget.uncallChain();
    expect(widget.chainPhase).toEqual(-1);
    expect(kiss.count).toEqual(2);
    expect(lick.count).toEqual(3);
    expect(slap.count).toEqual(1);
    widget.callChain();
    expect(widget.chainPhase).toEqual(0);
    expect(kiss.count).toEqual(4);
    expect(lick.count).toEqual(3);
    expect(slap.count).toEqual(2);
    slap.xhr.fireEvent('failure').fireEvent('complete');
    expect(widget.chainPhase).toEqual(0);
    expect(kiss.count).toEqual(2);
    expect(lick.count).toEqual(5);
    expect(slap.count).toEqual(2);
  });
  
  it ("should wait for multiple asynchronous objects", function() {
    
    var kiss = getAction('kiss'), lick = getAction('lick'), slap = getAction('slap', true, true);
    var cat = new LSD.Widget({
      chain: {
        slap: function() {
          return {action: 'slap', target: dog, fork: true}
        }
      }
    });
    var dog = new LSD.Widget({
      chain: {
        kiss: function() {
          return {action: 'kiss', target: cat}
        }
      }
    });
    cat.callChain();
    expect(cat.chainPhase).toEqual(0);
    expect(kiss.count).toEqual(0);
    slap.xhr.fireEvent('complete').fireEvent('success');
    expect(cat.chainPhase).toEqual(0);
    expect(kiss.count).toEqual(1);
    //slap.xhr.fireEvent('complete').fireEvent('success');
    //expect(kiss.count).toEqual(1);
  });
})