describe("LSD.Module.Styles", function() {
  describe("#attributes", function() {

    it ("should set multiple styles at once", function() {
      var instance = new LSD.Widget;
      instance.setStyles({width:200, height:100});
      expect(instance.style.current.width).toEqual(200);
      expect(instance.style.current.height).toEqual(100);
    });



  });
});