describe("LSD.Action.Update", function() {
  it("should update target", function() {
    var wrapperElement = new Element('section');
    var wrapperWidget = new LSD.Element(wrapperElement);
    
    var element = new Element('div').inject(wrapperElement);
    var widget = new LSD.Element;
    
    var contentString = '<span></span>';
    
    widget.execute({action: 'update', target: element, arguments: contentString});
    expect(element.get('html')).toEqual(contentString);
    
  });
  
  it ("should update target with element", function() {
    var wrapperElement = new Element('section');
    var wrapperWidget = new LSD.Element(wrapperElement);

    var element = new Element('div').inject(wrapperElement);
    var widget = new LSD.Element;
    var contentElement = new Element('span');
    widget.execute({action: 'update', target: element, arguments: contentElement});
    expect(element.getChildren().splice(0)).toEqual([contentElement]);
  });
  
  it ("should remove old widgets", function() {
    var element = new Element('div', {html:  '123<h1><span>D</span>ings</h1>321'});
    var root = new LSD.Element({pseudos: ['root']});
    var widget = new LSD.Element(element, {mutations: {'h1': true, 'h1 span': true}}).inject(root);
    var header = widget.childNodes[0];
    expect(widget.childNodes[0].element.get('tag')).toEqual('h1');
    expect(element.get('text')).toEqual('123Dings321');
    expect(widget.getElements('span')[0].element.get('text')).toEqual('D')
    expect(widget.execute({action: 'update', target: element, arguments: '321<h1>Dong<span>s</span></h1>123'}))
    expect(widget.childNodes[0]).toNotEqual(header);
    expect(widget.childNodes[0].element.get('tag')).toEqual('h1');
    expect(element.get('text')).toEqual('321Dongs123');
    expect(widget.getElements('span')[0].element.get('text')).toEqual('s')
  });
})