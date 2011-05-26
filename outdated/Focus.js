describe("Mixin.Focus", function() {
  var Focusable = new Class({
    options: {
      tabindex: 0
    },
    Includes: [Widget, Mixin.Focus]
  });
  new LSD.Document;
  var instances = [];
  $w = function(parent) {
    var instance = new Focusable(new Element('div'));
    instances.push(instance)
    instance.inject(parent || document.body);
    return instance;
  }
  
  
  afterEach(function() {
    instances.each(function(item) { return item.destroy() });
    instances = [];
  })
  
  describe("for a single widget", function() {
    it("should have focuser getter", function() {
      var instance = $w();
      expect(Focusable.prototype.focuser).not.toBeDefined();
      expect(instance.focuser).toBeDefined()
      expect(instance.focuser.getFocused).toBeDefined()
    });

    it("should enter focused state only once", function() {
      var instance = $w();
      expect(instance.focused).not.toBeDefined();
      expect(instance.focus()).toBeTruthy();
      expect(instance.focused).toBeTruthy();
      expect(instance.focus()).toBeFalsy();
      expect(instance.focused).toBeTruthy();
      expect(instance.focus()).toBeFalsy();
    });

    xit("should set native focus")
    
    it("should set activeElement for the owner document", function() {
      var instance = $w()
      instance.focus();
      expect($document.activeElement == instance).toBeTruthy()
    });
  });;
  
  describe("for set of flat widgets", function() {
    
    it("should lose focus when something else is focused", function() {
      var instance = $z = $w();
      var another = $y = $w();
      instance.focus();
      waits(100)
      runs(function() {
        another.focus();
        waits(100)
        runs(function() {
          expect(another.focused).toBeTruthy();
          expect(instance.focused).toBeFalsy();
        })
      })
    });
  })
  
  describe("for nested widgets", function() {
    it("should propagate focus state to parents", function() {
      var parent = $w();
      var instance = $w(parent);
      instance.focus();
      expect(parent.focused).toBeTruthy();
    })
    
    it("should propagate blur event to parents", function() {
      var parent = $w();
      var instance = $w(parent);
      var another = $w();
      instance.focus();
      waits(100);
      runs(function() {
        another.focus();
        waits(100);
        runs(function() {
          expect(another.focused).toBeTruthy();
          expect(instance.focused).toBeFalsy();
          expect(parent.focused).toBeFalsy();
        });
      });
    })
  });
  
  describe("for deeply nested widgets", function() {
    it("should propagate blur to parents of previously active widget, but only up to the point of first common ancestor", function() {
      var window = $w();
      var header = $w(window);
      var instance = $w(header);
      var footer = $w(window);
      var another = $w(footer);
      instance.focus();
      waits(100);
      runs(function() {
        expect(header.focused).toBeTruthy();
        expect(window.focused).toBeTruthy();
        another.focus();
        waits(100);
        runs(function() {
          expect(window.focused).toBeTruthy();
          expect(footer.focused).toBeTruthy();
          expect(another.focused).toBeTruthy();
          expect(header.focused).toBeFalsy();
          expect(instance.focused).toBeFalsy();
        });
      });
    });
    
    it("should propagate blur to all parent elements up to the point of new active element", function() {
      var window = $w();
      var header = $w(window);
      var instance = $w(header);
      instance.focus();
      waits(100);
      runs(function() {
        expect(header.focused).toBeTruthy();
        expect(window.focused).toBeTruthy();
        window.focus();
        waits(100);
        runs(function() {
          expect(window.focused).toBeTruthy();
          expect(header.focused).toBeFalsy();
          expect(instance.focused).toBeFalsy();
        });
      });
    })
  });
});