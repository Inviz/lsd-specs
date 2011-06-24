describe("LSD.Layout", function() {
  describe("#render", function() {
    LSD.Type = new LSD.Type('Test')
    LSD.Test.Form = new Class({
      options: {
        tag: 'form',
        mutations: {
          '> progresz': 'meter'
        }
      }
    });
    
    LSD.Test.Meter = new Class({
      options: {
        mutations: {
          '+ strong': 'button',
          '~ strong': 'icon'
        }
      }
    })
    
    var doc = new LSD.Document
    var parse = function(element, options) {
      if (element.indexOf) element = new Element('div', {html: element});
      return new LSD.Widget(element, Object.append({context: 'test', document: doc}, options));
    }
    
    it('should convert an element to widget with the same name as element\s tag name', function() {
      var fragment = parse('<meter></meter>');
      expect(Slick.find(fragment, 'meter')).toBeTruthy()
    })
    
    it('should NOT convert an element based on class', function() {
      var fragment = parse('<div class="lsd meter"></div>');
      expect(Slick.find(fragment, 'meter')).toBeFalsy()
    })
    
    it('should mutate elements based on mutations from widget', function() {
      var fragment = parse('<form><progresz id="a"></progresz></form><progresz id="b"></progresz>');
      expect(Slick.find(fragment, 'meter#a')).toBeTruthy()
      expect(Slick.find(fragment, 'meter#b')).toBeFalsy()
    });
    
    it('should mutate elements to the right of the widget (+ and ~ combinators)', function() {
      var fragment = parse('<form>\
        <strong></strong>\
        <progresz id="a"></progresz>\
        \
        <progresz id="b"></progresz>\
        <strong></strong>\
        \
        <progresz id="c"></progresz>\
        <progresz id="d"></progresz>\
        <strong></strong>\
        <strong></strong>\
        \
        <progresz id="c"></progresz>\
        <progresz id="d"></progresz>\
        <progresz id="d"></progresz>\
        <strong></strong>\
        <strong></strong>\
      </form><progresz id="e"></progresz><strong></strong>');
      expect(Slick.search(fragment, 'meter').length).toEqual(7)
      expect(Slick.search(fragment, 'button').length).toEqual(3)
      expect(Slick.search(fragment, 'icon').length).toEqual(2)
    });
    
    LSD.Test.Superform = new Class({
      options: {
        mutations: {
          'div > section > progresz': 'meter',
          'div ~ progresz + progresz': 'liter'
        }
      }
    });

      var superform = '<superform>\
        <strong></strong>\
        <progresz id="a"></progresz>\
        \
        <progresz id="b"></progresz>\
        <strong></strong>\
        \
        <div>\
          <section>\
            <div>\
              <section>\
                <progresz id="bc"></progresz>\
              </section>\
            </div>\
            <section>\
              <progresz id="c"></progresz>\
              <progresz id="d"></progresz>\
            </section>\
            <progresz id="e"></progresz>\
            <progresz id="f"></progresz>\
          </section>\
          <progresz id="g"></progresz>\
          <progresz id="h"></progresz>\
        </div>\
      </superform>';
    
    it('should mutate elements by complex combinators', function() {
      var fragment = parse(superform);
      
      var html = fragment.element.innerHTML;
      var clone = new LSD.Widget(fragment.element, {clone: true, document: fragment.document});
      expect(html).toEqual(fragment.element.innerHTML)
      expect(clone.element != fragment.element)
      expect(Slick.search(fragment, 'meter').length).toEqual(2);
      expect(Slick.search(fragment, 'meter').map(function(e) { return e.attributes.id})).toEqual(['bc', 'e'])
      expect(Slick.search(fragment, 'liter').length).toEqual(1);
      expect(Slick.search(fragment, 'liter').map(function(e) { return e.attributes.id})).toEqual(['f']);
      expect(Slick.search(fragment.element, '*').length).toEqual(17)
    });
    
    it('should should simply clone complex layout', function() {
      var fragment = parse(superform);
      
      var html = fragment.element.innerHTML;
      var clone = new LSD.Widget(fragment.element, {clone: true, document: fragment.document});
      expect(html).toEqual(fragment.element.innerHTML)
      expect(clone.element != fragment.element)
      expect(Slick.search(fragment, 'meter').length).toEqual(2);
      expect(Slick.search(fragment, 'meter').map(function(e) { return e.attributes.id})).toEqual(['bc', 'e'])
      expect(Slick.search(fragment, 'liter').length).toEqual(1);
      expect(Slick.search(fragment, 'liter').map(function(e) { return e.attributes.id})).toEqual(['f']);
      expect(Slick.search(fragment.element, '*').length).toEqual(17)
      expect(Slick.search(clone, 'meter').length).toEqual(2);
      expect(Slick.search(clone, 'meter').map(function(e) { return e.attributes.id})).toEqual(['bc', 'e'])
      expect(Slick.search(clone, 'liter').length).toEqual(1);
      expect(Slick.search(clone, 'liter').map(function(e) { return e.attributes.id})).toEqual(['f']);
      expect(Slick.search(clone .element, '*').length).toEqual(17)
    });
    
    it ("should pickup mutations even if layout has started in the middle", function() {
      var element = new Element('div', {html: superform});
      new LSD.Widget(element.getFirst()) //make superform
      var clone = element.cloneNode(true);
      var target = Slick.find(clone, '#bc');
      var widget = new LSD.Widget(target);
      expect(widget.tagName).toEqual('meter');
    })
  });

});