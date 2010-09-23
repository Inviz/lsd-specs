//describe("Widget.Base", function() {
//  var instance;
//  beforeEach(function() {
//    instance = new Widget.Base;
//    instance.element = new Element('div');
//  })
//  
//  it("should reflect the state in class name", function() {
//    expect(instance.element.hasClass('is-pressed')).toBeFalsy();
//    instance.setState('pressed');
//    expect(instance.element.hasClass('is-pressed')).toBeTruthy();
//    instance.unsetState('pressed');
//    expect(instance.element.hasClass('is-pressed')).toBeFalsy();
//  });
//  
//})