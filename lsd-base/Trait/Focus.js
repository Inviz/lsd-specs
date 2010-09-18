describe("Widget.Trait.Focus", function() {
  var Focusable = new Class({
    Includes: [Widget.Base, Widget.Trait.Focus]
  });
  
  it("should have focuser getter", function() {
    var instance = new Focusable;
    instance.element = new Element('div');
    expect(instance.focuser).not.toBeDefined();
    instance.getFocuser();
    expect(instance.focuser).toBeDefined()
    expect(instance.focuser.getFocused).toBeDefined()
  });
  
})