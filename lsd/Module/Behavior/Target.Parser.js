describe("LSD.Mixin.Target.Parser", function() {
  it("should parse the selector into single object", function() {
    var parsed = LSD.Mixin.Target.Parser.exec("div");
    expect(parsed.length).toEqual(1)
  })
  
  it ("should set selector for the parsed object", function() {
    var parsed = LSD.Mixin.Target.Parser.exec("div")
    expect(parsed[0].selector.expressions[0][0].tag).toEqual("div")
  })
  
  it ("should parse comma separated selectors into two separate selectors", function() {
    var parsed = LSD.Mixin.Target.Parser.exec("div, div span")
    expect(parsed.length).toEqual(2)
    expect(parsed[0].selector.expressions[0].length).toEqual(1);
    expect(parsed[1].selector.expressions[0].length).toEqual(2);
  });
  
  it ("should not parse out the action on simple selectors", function() {
    var parsed = LSD.Mixin.Target.Parser.exec("div:kill()");
    expect(parsed.length).toEqual(1);
    expect(parsed[0].selector.expressions[0].length).toEqual(1);
    expect(parsed[0].action).toBeFalsy()    
  })
  
  it ("should parse out the action on simple selectors with only the pseudos", function() {
    var parsed = LSD.Mixin.Target.Parser.exec(":kill():live()");
    expect(parsed.length).toEqual(2);
    expect(parsed[0].selector).toBeFalsy();
    expect(parsed[0].action).toEqual('kill');
    expect(parsed[1].selector).toBeFalsy();
    expect(parsed[1].action).toEqual('live');  
  })
  
  it ("should parse out the action even if the rest of the selector is combinator", function() {
    var parsed = LSD.Mixin.Target.Parser.exec("$ :kill()");
    expect(parsed.length).toEqual(1);
    expect(parsed[0].selector).toBeFalsy();
    expect(parsed[0].action).toEqual('kill');
  })
  
  it ("should store argument for further use", function() {
    var parsed = LSD.Mixin.Target.Parser.exec("div :flip(flop)");
    expect(parsed.length).toEqual(1);
    expect(parsed[0].selector.expressions[0].length).toEqual(1);
    expect(parsed[0].action).toEqual('flip');
    expect(parsed[0].arguments).toEqual('flop');
  })
  
  it ("should create two separate parsed actions when multiple actions are given as pseudos", function() {
    var parsed = LSD.Mixin.Target.Parser.exec("div :kill():resurrect()");
    expect(parsed.length).toEqual(2);
    expect(parsed[0].selector.expressions[0].length).toEqual(1);
    expect(parsed[0].action).toEqual('kill');
    expect(parsed[1].action).toEqual('resurrect');
    expect(parsed[0].selector.expressions[0][0].tag).toEqual(parsed[1].selector.expressions[0][0].tag)
  })
  
  it ("should inline multiple actions shortcut not affecting signling selectors", function() {
    var parsed = LSD.Mixin.Target.Parser.exec("h1, h2 :hey(you):bro():sup(), :roflcopters, :doc(), a :roflcopters():crap, a")
    expect(parsed.length).toEqual(9)
    expect(parsed[0].action).toBeFalsy();
    expect(parsed[1].action).toEqual('hey');
    expect(parsed[2].action).toEqual('bro');
    expect(parsed[5].selector).toBeFalsy();
    expect(parsed[7].action).toEqual('crap');
  })
  
  describe("scenarios", function() {
    it ("State instantly applied, a branch handles possible errors", function() {
      var parsed = LSD.Mixin.Target.Parser.exec("and $$ #document :state(followed), else :error('Fail')");
      expect(parsed.length).toEqual(2)
      expect(parsed[0].action).toEqual('state');
      expect(parsed[0].arguments).toEqual('followed');
      expect(parsed[0].keyword).toEqual('and');
      expect(parsed[1].action).toEqual('error');
      expect(parsed[1].keyword).toEqual('else');
      expect(parsed[1].arguments).toEqual('Fail');
    });
    
    it ("Dialog is called before everything else, state is applied on submission, otherwise element is deleted", function() {
      var parsed = LSD.Mixin.Target.Parser.exec("before $$ #follow_dialog :dialog(), then $$ :state(followed), else ::invoker :delete()")
      expect(parsed.length).toEqual(3)
      expect(parsed[0].action).toEqual('dialog');;
      expect(parsed[0].keyword).toEqual('before');
      expect(parsed[1].action).toEqual('state');
      expect(parsed[1].keyword).toEqual('then');
      expect(parsed[1].arguments).toEqual('followed');
    });
    
    it ("Should try to delete selected items one by one and their state instantly set as deleted, but if deletion fails it reverts the state and shows error message", function() { 
      var parsed = LSD.Mixin.Target.Parser.exec("grid::selected-items :delete(), and :state(deleted), or :error('fail')")
    });
    
    it ("Should try to Delete selected items one by one and apply 'deleted' state, show error flash message summary on failures", function() {
      var parsed = LSD.Mixin.Target.Parser.exec("grid::selected-items :delete():state(deleted), else :failure(#{pluralize(count(::target), 'publication')} were not deleted)")
    })
    
    it ("Should try to Delete items and update grid, set cleaning state while requests are made, set clean state afterwards, errorify the button if there are any failures", function() {
      var parsed = "grid::selected-items :delete(), and grid :state(cleaning), grid :state(clean):state(cleaning), else ::invoker :error('fail')"
    });
    
    it ("Should try to Delete items one by one, and set clean state on grid when all are done. Show validation error on button if atleast one request is failed.", function() {
      var parsed = "grid::selected-items :delete(), grid :state(clean), else ::invoker :error('fail')"
    });
    
    it ("Should try to delete items and update grid, request failures trigger errors on related elements", function() {
      var parsed = "grid::selected-items :delete(), or :error('Failed to delete'), grid :submit(), or :error('Failed to update')"
    });
    
    it ("Should try to delete items and update grid", function() {
      var parsed = "grid::selected-items :delete(), else grid :error('Failed to delete'), grid :submit(), else grid :error('Failed to update')"
    });
  
    it ("Should try to delete items and update grid", function() {
      var parsed = "grid::selected-items :delete(), or :error('Boo!'), else :error('Failed to delete'), grid :submit(), or :error('Failed to update')"
    });
    
    it ("Should try to delete items and update grid", function() {
      var parsed = "grid::selected-items :delete(), grid :submit(), or :error('Failed to update'), else :error('Failed to delete') "
    });
  });
})