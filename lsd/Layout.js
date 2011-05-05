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
        tag: 'form'
      }
    });

    LSD.Test.Input = new Class({
      Extends: LSD.Widget,
      options: {
        tag: 'input'
      }
    });
    
    var layout = function(a, options) {
      return new LSD.Layout(null, null, Object.extend({context: 'test'}, options)).render(a, Body)
    }

    var parse = function(html, options) {
      var element = new Element('div', {html: html});
      new LSD.Native.Body(element, {layout: {options: Object.extend({context: 'test'}, options)}});
      return element.childNodes;
    }
    
    var match = function(element, selector, result) {
      if (element && element.retrieve) {
        var widget = element.retrieve('widget');
        if (widget) var result = Slick.match(widget, selector)
      }
      expect(result).toEqual(result)
    }
    
    it('should convert an element to widget with the same name as element\s tag name', function() {
      var nodes = parse('<button></button>');
      match(nodes[0], 'button', true);
    })
    
    it('should NOT convert an element based on tag- class', function() {
      var nodes = parse('<div class="tag-button"></div>');
      match(nodes[0], 'button', false);
    })
  });

});