describe("LSD.Action.Update", function() {
  it("should update target", function() {
    var wrapperElement = new Element('section');
    var wrapperWidget = new LSD.Widget(wrapperElement);
    
    var element = new Element('div').inject(wrapperElement);
    var widget = new LSD.Widget;
    
    var contentString = '<span></span>';
    
    widget.execute({action: 'update', target: element, arguments: contentString});
    expect(element.get('html')).toEqual(contentString);
    
  });
  
  it ("should update target with element", function() {
    var wrapperElement = new Element('section');
    var wrapperWidget = new LSD.Widget(wrapperElement);

    var element = new Element('div').inject(wrapperElement);
    var widget = new LSD.Widget;
    var contentElement = new Element('span');
    widget.execute({action: 'update', target: element, arguments: contentElement});
    expect(element.getChildren().splice(0)).toEqual([contentElement]);
  })
})