describe("LSD.Type", function() {
  describe("#initialize", function() {

  });
  
  describe("#find", function() {
    var Widget = new LSD.Type('Applet');
    Widget.Button = new Number(1);
    Widget.Button.Submit = new Number(2);
    it ("should find widget by simple query", function() {
      expect(Widget.find('button')).toEqual(1);
    })
    it ("should find widget by a nested query", function() {
      expect(Widget.find('button-submit')).toEqual(2);
    })
    it ("should find widget by a raw array query", function() {
      expect(Widget.find(['button'])).toEqual(1);
      expect(Widget.find(['button', 'submit'])).toEqual(2);
    })
    it ("should find widget by excessive raw array query", function() {
      expect(Widget.find(['button', 'submit', 'ding', 'dong'])).toEqual(2);    
    })
  });
  
});