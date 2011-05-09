describe("LSD.Layout", function() {
  
  describe("#initialize", function() {

  });

  describe("#render", function() {
    LSD.Type = new LSD.Type('Test')

    LSD.Test.Button = new Class({
      Extends: LSD.Widget,
      options: {
        tag: 'button'
      }
    });

    LSD.Test.Form = new Class({
      Extends: LSD.Widget,
      options: {
        tag: 'form',
        mutations: {
          '> meter': 'button'
        }
      }
    });

    LSD.Test.Input = new Class({
      Extends: LSD.Widget,
      options: {
        tag: 'input'
      }
    });

    LSD.Test.Input = new Class({
      Extends: LSD.Widget,
      options: {
        tag: 'input',
        element: {
          tag: 'input'
        }
      }
    });
    
    var layout = function(a, options) {
      return new LSD.Layout(null, null, Object.extend({context: 'test'}, options)).render(a, Body)
    }

    var parse = function(element, options) {
      if (element.indexOf) element = new Element('div', {html: element});
      return new LSD.Widget.Body(element, {layout: {options: Object.extend({context: 'test'}, options)}});
    }
    
    it('should convert an element to widget with the same name as element\s tag name', function() {
      var doc = parse('<button></button>');
      expect(Slick.find(doc, 'button')).toBeTruthy()
    })
    
    it('should NOT convert an element based on tag- class', function() {
      var doc = parse('<div class="tag-button"></div>');
      expect(Slick.find(doc, 'button')).toBeFalsy()
    })
    
    it('should NOT convert an element based on tag- class', function() {
      var doc = parse('<form><meter id="a"></meter></form><meter id="b"></meter>');
      expect(Slick.find(doc, 'button#a')).toBeTruthy()
      expect(Slick.find(doc, 'button#b')).toBeFalsy()
    })
  });

});