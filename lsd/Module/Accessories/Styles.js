describe("LSD.Module.Styles", function() {
  describe("#attributes", function() {

    it ("should set multiple styles at once", function() {
      var instance = new LSD.Widget;
      instance.setStyles({width:200, height:100});
      expect(instance.size.width).toEqual(200);
      expect(instance.size.height).toEqual(100);
    });



  });
});