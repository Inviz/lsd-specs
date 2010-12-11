describe("Widget.Trait.Dimensions", function() {
  
  var Dimensioned = new Class({
    Extends: LSD.Widget.Paint,
    
    options: {
      layers: {
        shadow:  ['shadow'],
        stroke: ['stroke'],
        background:  [LSD.Layer.Fill.Background.Offset],
        reflection:  [LSD.Layer.Fill.Reflection.Offset]
      }
    }
  });
  var color = hsb(10, 10, 10);
  var instance;
  beforeEach(function() {
    if (instance) instance.destroy();
    instance = new Dimensioned;
  });
  
  
  var empty = {top: 0, left: 0, bottom: 0, right: 0}
  var examples = {
    'fixed width widget with padding': {
      styles: {
        'width': 50,
        'height': 35,
        'paddingLeft': 3,
        'paddingBottom': 7
      },
      expect: {
        offset: {
          inside: empty,
          outside: empty,
          padding: $merge(empty, {left: 3, bottom: 7}),
          margin: empty
        },
        methods: {
          getClientWidth: 50 + 3,
          getOffsetWidth: 50 + 3,
          getLayoutWidth: 50 + 3,
          getClientHeight: 35 + 7,
          getOffsetHeight: 35 + 7,
          getLayoutHeight: 35 + 7
        }
      }
    },
   'fixed size widget with padding and borders': {
     styles: {
       'width': 30,
       'height': 20,
       'paddingRight': 4,
       'paddingTop': 9,
       'borderTopWidth': 3,
       'borderRightWidth': 8,
       'borderStyle': 'solid',
       'borderColor': '#333'
     },
     expect: {
       offset: {
         inside: empty,
         outside: empty,
         padding: $merge(empty, {right: 4, top: 9}),
         margin: empty
       },
       methods: {
         getClientWidth:  30 + 4,
         getOffsetWidth:  30 + 4 + 8,
         getLayoutWidth:  30 + 4 + 8,
         getClientHeight: 20 + 9,
         getOffsetHeight: 20 + 9 + 3,
         getLayoutHeight: 20 + 9 + 3
       }
     }
   },
   'padding, stroke and margin (negative too)': {
     styles: {
       width: 20,
       height: 100,
       paddingBottom: 8,
       paddingLeft: 1,
       strokeWidth: 3,
       strokeColor: color,
       marginTop: 19,
       marginLeft: -5
     },
     expect: {
       offset: {
         inside: {left: 3, bottom: 3, right: 3, top: 3},
         outside: empty,
         padding: {bottom: 8, left: 1},
         margin: {top: 19, left: -5}
       },
       methods: {
         getClientWidth: 20 + 1,
         getOffsetWidth: 20 + 3 * 2 + 1,
         getLayoutWidth: 20 + 3 * 2 + 1 - 5,
         getClientHeight: 100 + 8,
         getOffsetHeight: 100 + 3 * 2 + 8,
         getLayoutHeight: 100 + 3 * 2 + 8 + 19,
       }
     }
   },
   'arrow widget with stroke, paddings, border and margin ;-)': {
     styles: {
       arrowWidth: 16,
       arrowHeight: 4,
       arrowSide: 'bottom',
       height: 43,
       width: 71,
       marginBottom: 12,
       paddingBottom: 19,
       borderBottomWidth: 5,
       borderStyle: 'solid',
       borderColor: '#ddd',
       strokeWidth: 1,
       strokeColor: color
     },
     options: {
       shape: 'arrow'
     },
     expect: {
       offset: {
         inside: {left: 1, bottom: 1, right: 1, top: 1},
         outside: empty,
         padding: {bottom: 19},
         margin: {bottom: 12}
       },
       methods: {
         getClientWidth: 71,                         // 71
         getOffsetWidth: 71 + 16 + 1 * 2,            // 89
         getLayoutWidth: 71 + 16 + 1 * 2,            // 89
         getClientHeight: 43 + 19,                   // 62
         getOffsetHeight: 43 + 19 + 4 + 1 * 2,       // 68
         getOffsetHeight: 43 + 19 + 4 + 12 + 1 * 2,  // 80
       }
     }
   }
   
    
  };
  
  Hash.each(examples, function(example, description) {
    describe(description, function() {
      it ("should match specs", function() {
        if (example.styles) instance.setStyles(example.styles)
        if (example.options) instance.setOptions(example.options)
        instance.inject(document.body);
        var offset = example.expect.offset;
        if (offset) {
          for (var type in offset) {
            var kind = offset[type];
            for (var side in kind) expect(instance.offset[type][side]).toEqual(kind[side]);
          }
        }
        var methods = example.expect.methods;
          if (methods) for (var method in methods) {
          expect(instance[method]()).toEqual(methods[method]);
        }
      })
    })
  }); 
  
  
  ['height', 'width'].each(function(property) {
    var cc = property.capitalize();
    var directions = property == 'height' ? ['top', 'bottom'] : ['left', 'right'];
    describe("without " + property + " set", function() {
      beforeEach(function() {
        $(instance).setStyle(property, 50);
      });
      afterEach(function() {
        expect(instance['getClient' + cc]()).toEqual(50);
      })
      it("should pick it up from offset" + cc, function() {
        instance.inject(document.body);
      });
    });
    describe("with " + property + " set", function() {
      it ("should return exactly that " + property, function() {
        instance.setStyle(property, 75);
        instance.inject(document.body);
        expect(instance['getClient' + cc]()).toEqual(75);
      })
    })
  });
  
  
  describe("nested widget with undefined width", function() {
    var other;
    beforeEach(function() {
      instance.setStyle('width', 123);
      if (other) other.destroy();
      other = new Dimensioned;
      other.inject(instance);
    })
    it("should get width from parent", function() {
      instance.inject(document.body);
      expect(instance.getClientWidth()).toEqual(123);
      expect(other.getClientWidth()).toEqual(123);
    })
    
    describe("and paddings", function() {
      it("should not go beyound parent's width bounds", function() {
        other.setStyles({paddingLeft: 13, paddingRight: 10});
        instance.inject(document.body);
        expect(instance.getClientWidth()).toEqual(123);
        expect(other.getClientWidth()).toEqual(123);
        expect(other.getOffsetWidth()).toEqual(123);
        //expect(other.offset.padding.left).toEqual(13);
        //expect(other.offset.padding.right).toEqual(10);
      })
    })
  })
});