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
  
  it ("should use pseudo element in the beginning of the selector and assign anchor", function() {
    var parsed = LSD.Module.Target.Parser.exec("::element div");
    expect(parsed.length).toEqual(1)
    expect(parsed[0].selector.expressions[0].length).toEqual(1);
    expect(parsed[0].anchor).toBeTruthy()
  })
  
  it ("should only set anchor from pseudo element to a single selector, not affecting others", function() {
    var parsed = LSD.Module.Target.Parser.exec("::element div, :element div");
    expect(parsed.length).toEqual(2)
    expect(parsed[0].selector.expressions[0].length).toEqual(1);
    expect(parsed[0].anchor).toBeTruthy()
    expect(parsed[1].selector.expressions[0].length).toEqual(2);
    expect(parsed[1].anchor).toBeFalsy()
  })
  
  it ("should let two comma separated selectors have different anchors", function() {
    var parsed = LSD.Module.Target.Parser.exec("::element div, ::document div");
    expect(parsed.length).toEqual(2)
    expect(parsed[0].selector.expressions[0].length).toEqual(1);
    expect(parsed[0].anchor).toBeTruthy()
    expect(parsed[1].selector.expressions[0].length).toEqual(1);
    expect(parsed[1].anchor).toBeTruthy()
    expect(parsed[0].anchor).toNotEqual(parsed[1].anchor)
  })
  
  it ("should parse out the action call given as the last bit of selector", function() {
    var parsed = LSD.Module.Target.Parser.exec("div :kill()");
    expect(parsed.length).toEqual(1);
    expect(parsed[0].selector.expressions[0].length).toEqual(1);
    expect(parsed[0].action).toEqual('kill');
  })
  
  it ("should not parse out the actionc all on simple selectors", function() {
    var parsed = LSD.Module.Target.Parser.exec(":kill()");
    expect(parsed.length).toEqual(1);
    expect(parsed[0].selector.expressions[0].length).toEqual(1);
    expect(parsed[0].action).toBeFalsy()    
  })
  
  it ("should parse out the action even if the rest of the selector is pseudo-element", function() {
    var parsed = LSD.Module.Target.Parser.exec("::element :kill()");
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
    var parsed = LSD.Module.Target.Parser.exec("h1, h2 :hey(you):bro():sup(), :roflcopters, ::doc :doc(), a :roflcopters():crap, a")
    expect(parsed.length).toEqual(9)
    expect(parsed[0].action).toBeFalsy();
    expect(parsed[1].action).toEqual('hey');
    expect(parsed[2].action).toEqual('bro');
    expect(parsed[5].selector).toBeFalsy();
    expect(parsed[7].action).toEqual('crap');
  })
})