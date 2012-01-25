describe("LSD.Module.Dimensions", function() {
  describe("#size", function() {
    it ("should set size", function() {
      var instance = new LSD.Element;
      instance.setSize({width:400, height:300});
      expect(instance.size.width).toEqual(400);
      expect(instance.size.height).toEqual(300);
    });
  });

  describe("#height", function() {

    it ("should set height", function() {
      var instance = new LSD.Element;
      instance.setSize({height:500});
      expect(instance.size.height).toEqual(500);
    });

    it ("should set height according to minHeight & maxHeight", function() {
      var instance = new LSD.Element;
      instance.setStyle("minHeight", 100);
      instance.setStyle("maxHeight", 200);
      instance.setHeight(250);
      expect(instance.size.height).toEqual(200);
      instance.setHeight(150);
      expect(instance.size.height).toEqual(150);
      instance.setHeight(50);
      expect(instance.size.height).toEqual(100);
    });
  });

  describe("#width", function() {

    it ("should set width", function() {
      var instance = new LSD.Element;
      instance.setSize({width:500});
      expect(instance.size.width).toEqual(500);
    });

    it ("should set width according to minWidth & maxWidth", function() {
      var instance = new LSD.Element;
      instance.setStyle("minWidth", 100);
      instance.setStyle("maxWidth", 200);
      instance.setWidth(250);
      expect(instance.size.width).toEqual(200);
      instance.setWidth(150);
      expect(instance.size.width).toEqual(150);
      instance.setWidth(50);
      expect(instance.size.width).toEqual(100);
    });

  });
});