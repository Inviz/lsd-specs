
describe("LSD.Widget.Layer.InnerShadow", function() {

  var Innershadowed = new Class({
    Extends: LSD.Widget.Paint,
  
    options: {
      layers: {
        innerShadow:  ['inner-shadow'],
        fill: [LSD.Layer.Fill.Background]
      }
    }
  });
  var instances = [];
  $w = function(parent) {
    var instance = new Innershadowed;
    instances.push(instance)
    instance.inject(parent);
    instance.setStyles({
      height: 50,
      width: 50
    })
    return instance;
  }
  
  
  var domready = function(fn) {
    waitsFor(function() {
      return document.body;
    });
    runs(fn)
  }

  var setups = [
    {
      styles: {
        'innerShadowBlur': 3,
        'innerShadowOffsetX': 3
      },
      assert: {
        'layers': 6
      },
      layers: [

      ]
    },
    {
      styles: {
        'innerShadowBlur': 3,
        'innerShadowOffsetX': -3
      },
      assert: {
        'layers': 6
      }
    }
  ];
  
  afterEach(function() {
    instances.each(function(item) { return item.destroy() });
    instances = [];
  });
  
  describe("without blur specified", function() {
    it("should not draw shadow", function() {
      domready(function() {        
        var instance = $w(new LSD.Document);
        expect(instance.layers.innerShadow.layers.length == 0).toBeTruthy()
        expect($(instance).offsetWidth == 50).toBeTruthy()
        expect($(instance).offsetHeight == 50).toBeTruthy()
      })
    });
  });
  
  setups.each(function(setup) {
    describe("with styles " + JSON.encode(setup.style), function() {
      it("should render the stuff right", function() {
        domready(function() {
          var instance = $w(new LSD.Document);
          instance.setStyles(setup.styles);
          instance.refresh();
          if (setup.assert.layers) expect(instance.layers.innerShadow.layers.length).toBe(setup.assert.layers)
        })
      })
    })
  })
  
  describe("with blur specified as 5", function() {
    var instance;
    beforeEach(function() {
      instance = $w(new LSD.Document);
      instance.setStyles({
        'innerShadowColor': hsb(0, 0, 100),
        'innerShadowBlur': 5
      })
    })
    it ("should draw exactly 5 layers", function() {
      domready(function() {  
        instance.refresh();
        expect(instance.layers.innerShadow.layers.length == 5).toBeTruthy()
      })
    })
    
    it("should not change offset width or height", function() {
      domready(function() {         
        instance.refresh();
        expect($(instance).offsetWidth == 50).toBeTruthy()
        expect($(instance).offsetHeight == 50).toBeTruthy()
      })
    });
    
    describe("and x-offset as 3", function() {
      it ("should draw 8 layers", function() {
        domready(function() {  
          instance.setStyle('innerShadowOffsetX', 3);
          instance.refresh();
          expect(instance.layers.innerShadow.layers.length).toBe(8)
        })
      })
    })
    
    describe("and x-offset as -3", function() {
      it ("should draw 2 layers", function() {
        domready(function() {  
          instance.setStyle('innerShadowOffsetX', -3);
          instance.refresh();
          expect(instance.layers.innerShadow.layers.length).toBe(2)
        })
      })
    })
  
    describe("and then updated", function() {
      describe("to higher number", function() {
        xit("should add more layers and redraw the ones it had", function() {
          domready(function() {    
            instance.refresh();
            var old = [].concat(instance.layers.innerShadow.layers);
            instance.setStyle('innerShadowBlur', 7);
            instance.refresh();
            expect(instance.layers.innerShadow.layers.length).toBe(7)
            for (var layers = instance.layers.innerShadow.layers, i = 0, j = old.length; i < j; i++) expect(layers[i] == old[i]).toBeTruthy()
            for (var layers = instance.layers.innerShadow.layers, i = old.length, j = layers.length; i < j; i++) expect(layers[i] == old[i]).toBeFalsy()
          })
        })
      })
    
      describe("to a lower number", function() {
        xit("should remove extra layers", function() {
          domready(function() {    
            instance.refresh();
            var old = [].concat(instance.layers.innerShadow.layers);
            instance.setStyle('innerShadowBlur', 3);
            instance.refresh();
            var layers = instance.layers.innerShadow.layers;
            for (i = 0, j = layers.length; i < j; i++) expect(layers[i] == old[i]).toBeTruthy();
            expect($defined(layers[old.length - 1])).toBeFalsy();
          });
        });
      });
    });
  });
});