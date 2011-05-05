describe("LSD.Module.Target.Parser", function() {
  it("should parse the selector into single object", function() {
    var parsed = LSD.Module.Target.Parser.exec("div");
    expect(parsed.length).toEqual(1)
  })
  
  it ("should set selector for the parsed object", function() {
    var parsed = LSD.Module.Target.Parser.exec("div")
    expect(parsed[0].selector.expressions[0][0].tag).toEqual("div")
  })
  
  it ("should parse comma separated selectors into two separate selectors", function() {
    var parsed = LSD.Module.Target.Parser.exec("div, div span")
    expect(parsed.length).toEqual(2)
    expect(parsed[0].selector.expressions[0].length).toEqual(1);
    expect(parsed[1].selector.expressions[0].length).toEqual(2);
  });
  
  it ("should not parse out the action on simple selectors", function() {
    var parsed = LSD.Module.Target.Parser.exec("div:kill()");
    expect(parsed.length).toEqual(1);
    expect(parsed[0].selector.expressions[0].length).toEqual(1);
    expect(parsed[0].action).toBeFalsy()    
  })
  
  it ("should parse out the action on simple selectors with only the pseudos", function() {
    var parsed = LSD.Module.Target.Parser.exec(":kill():live()");
    expect(parsed.length).toEqual(2);
    expect(parsed[0].selector).toBeFalsy();
    expect(parsed[0].action).toEqual('kill');
    expect(parsed[1].selector).toBeFalsy();
    expect(parsed[1].action).toEqual('live');  
  })
  
  it ("should parse out the action even if the rest of the selector is combinator", function() {
    var parsed = LSD.Module.Target.Parser.exec("$ :kill()");
    expect(parsed.length).toEqual(1);
    expect(parsed[0].selector).toBeFalsy();
    expect(parsed[0].action).toEqual('kill');
  })
  
  it ("should store argument for further use", function() {
    var parsed = LSD.Module.Target.Parser.exec("div :flip(flop)");
    expect(parsed.length).toEqual(1);
    expect(parsed[0].selector.expressions[0].length).toEqual(1);
    expect(parsed[0].action).toEqual('flip');
    expect(parsed[0].arguments).toEqual('flop');
  })
  
  it ("should create two separate parsed actions when multiple actions are given as pseudos", function() {
    var parsed = LSD.Module.Target.Parser.exec("div :kill():resurrect()");
    expect(parsed.length).toEqual(2);
    expect(parsed[0].selector.expressions[0].length).toEqual(1);
    expect(parsed[0].action).toEqual('kill');
    expect(parsed[1].action).toEqual('resurrect');
    expect(parsed[0].selector.expressions[0][0].tag).toEqual(parsed[1].selector.expressions[0][0].tag)
  })
  
  it ("should inline multiple actions shortcut not affecting signling selectors", function() {
    var parsed = LSD.Module.Target.Parser.exec("h1, h2 :hey(you):bro():sup(), :roflcopters, :doc(), a :roflcopters():crap, a")
    expect(parsed.length).toEqual(9)
    expect(parsed[0].action).toBeFalsy();
    expect(parsed[1].action).toEqual('hey');
    expect(parsed[2].action).toEqual('bro');
    expect(parsed[5].selector).toBeFalsy();
    expect(parsed[7].action).toEqual('crap');
  })
})