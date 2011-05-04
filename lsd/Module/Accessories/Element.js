describe("LSD.Module.Element", function() {
  describe("#attach", function() {
    it ("should attach element from constructor", function() {
      var element = new Element('div');
      var instance = new LSD.Widget(element);
      expect(instance.attached).toBeTruthy();
      expect(instance.element).toBeTruthy();
      expect(element.retrieve('widget') == instance).toBeTruthy();
    });
    
    it ("should not attach if no element is given to constructor", function() {
      var instance = new LSD.Widget();
      expect(instance.attached).toBeFalsy();
      expect(instance.element).toBeFalsy();
    });
    
    it ("should let attach element after construction", function() {
      var element = new Element('div');
      var instance = new LSD.Widget();
      instance.attach(element);
      expect(instance.attached).toBeTruthy();
      expect(instance.element).toBeTruthy();
    });
    
    it ("should let change element storage key through options", function() {
      var element = new Element('div');
      var instance = new LSD.Widget(element, {key: 'jesus'});
      expect(element.retrieve('jesus')).toEqual(instance)
    });
  });
  
  describe("#detach", function() {
    it ("should clean element on detach", function() {
      var element = new Element('div');
      var instance = new LSD.Widget(element);
      instance.detach();
      expect(instance.element).toBeFalsy();
      expect(element.retrieve('widget')).toBeFalsy();
    });
    
    it ("should let attach another element after", function() {
      var element = new Element('div'), another = new Element('a');
      var instance = new LSD.Widget(element);
      expect(instance.element == element).toEqual(true);
      instance.detach();
      expect(instance.element).toEqual(null);
      instance.attach(another);
      expect(instance.element).toEqual(another);
      expect(another.retrieve('widget')).toEqual(instance);
      expect(element.retrieve('widget')).toBeFalsy();
      instance.detach();
      instance.attach(element);
      expect(instance.element).toNotEqual(another);
      expect(instance.element).toEqual(element);
      expect(element.retrieve('widget')).toEqual(instance);
      expect(another.retrieve('widget')).toBeFalsy();
    });
  });
  
  describe("#build", function() {
    it ('should build the attached element', function() {
      var element = new Element('div');
      var instance = new LSD.Widget(element);
      expect(instance.built).toBeTruthy();
    });
    
    it ("should attach the built element", function() {
      var instance = new LSD.Widget;
      instance.build();
      expect(instance.element).toBeTruthy();
      expect(instance.attached).toBeTruthy();    
    });
  });
  
  describe("#destroy", function() {
    it ('should detach the destroyed element', function() {
      var element = new Element('div');
      var instance = new LSD.Widget(element);
      expect(element.retrieve('widget') == instance).toBeTruthy();
      instance.destroy();
      expect(instance.attached).toBeFalsy();
    });
    
    it ('should destroy element', function() {
      var element = new Element('div');
      var child = new Element('a').inject(element);
      var instance = new LSD.Widget(child);
      instance.destroy();
      expect(element.getChildren().length).toEqual(0)
    });
  });
  
  describe("#toElement", function() {
    it ('should pick up attached element', function() {
      var element = new Element('div');
      var instance = new LSD.Widget(element);
      expect(instance.toElement()).toEqual(element);
    });
    
    it ('should build element when no there\'s no attached element', function() {
      var instance = new LSD.Widget();
      expect(instance.toElement().nodeName).toEqual('DIV');
    });
    
    it ('should be used in document.id (aka $ function)', function() {
      var instance = new LSD.Widget();
      expect($(instance).nodeName).toEqual('DIV');
    });
  });

});