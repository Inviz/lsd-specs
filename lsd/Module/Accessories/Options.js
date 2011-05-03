describe("LSD.Module.Options", function() {
  describe("#initialize", function() {
    it ("should instantiate without arguments", function() {
      var instance = new LSD.Widget;
      expect(instance instanceof LSD.Widget).toBeTruthy()
    });

    it ('should instantiate with element as argument', function() {
      var element = new Element('div');
      var instance = new LSD.Widget(element)
      expect(instance.element == element).toBeTruthy();
    })

    it ('should instantiate with options as argument', function() {
      var options = {magic: 784};
      var instance = new LSD.Widget(options);
      expect(instance.options.magic == 784).toBeTruthy();
    })
    
    it ('should instantiate with options and element as arguments', function() {
      var options = {'honk': 'kong'};
      var element = new Element('div');
      var instance = new LSD.Widget(options, element);
      expect(instance.options.honk == 'kong').toBeTruthy();
      expect(instance.element == element).toBeTruthy();
    })
    
    it ('should instantiate with element and options as arguments', function() {
      var options = {'honk': 'kong'};
      var element = new Element('div');
      var instance = new LSD.Widget(element, options);
      expect(instance.options.honk == 'kong').toBeTruthy();
      expect(instance.element == element).toBeTruthy();
    })
  });
})