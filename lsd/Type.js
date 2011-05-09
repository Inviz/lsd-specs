describe("LSD.Type", function() {
  new LSD.Type('Test');
  
  describe("#initialize", function() {

  });
  
  describe("#define", function() { 
    it ("should define the lazy class", function() {
      LSD.Test.define('Input', {});
      expect(LSD.Test.Input).toBeTruthy();
    })
    
    it ("should define deep lazy class", function() {
      LSD.Test.define('Input.File.Dialog', {});
      expect(LSD.Test.Input.File.Dialog).toBeTruthy();
    })
    
    it ("should keep the properties assigned to prototype", function() {
      LSD.Test.define('Button', {});
      LSD.Test.Button.prototype.profanity = true;
      expect(LSD.Test.Button.prototype.profanity).toBeTruthy();
    })
    
    it ("should keep the properties assigned to object", function() {
      var z = {}
      LSD.Test.define('Glutton', z);
      z.profanity = 87;
      expect(LSD.Test.Glutton.prototype.profanity).toEqual(87);
    })
    
  })
  
})
