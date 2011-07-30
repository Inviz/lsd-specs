describe("LSD.Layout", function() {
  describe("#render", function() {
    LSD.Type = new LSD.Type('Test')
    LSD.Test.Form = new Class({
      options: {
        tag: 'form',
        mutations: {
          '> progresz': 'meter',
          'i': true
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
    
    var doc = LSD.document || new LSD.Document
    var parse = function(element, options) {
      if (element.indexOf) element = new Element('div', {html: element});
      return new LSD.Widget(element, Object.append({context: 'test', document: doc}, options));
    }
    
    it('should clone parts of initialized layout', function() {
      var fragment = parse('<form>Test<h2>Test</h2><progresz id="a"></progresz></form>');
      expect(Slick.search(fragment, '*').length).toEqual(2)
      expect(Slick.search(fragment.element, '*').length).toEqual(3)
      var div = new Element('div');
      var widget = new LSD.Widget(div, {document: fragment.document})
      var clone = fragment.getLayout().render(fragment.element, widget, {clone: true})
      expect(Slick.search(clone, '*').length).toEqual(2)
      expect(Slick.search(clone.element, '*').length).toEqual(3)
      expect(fragment.element.getElements('h2').length).toEqual(1);
      expect(fragment.element.getElement('h2')).toNotEqual(clone.element.getElement('h2'));
      expect(clone.element.childNodes[0].childNodes[0].textContent).toEqual('Test')
      expect(clone.element.childNodes[0].childNodes[1].childNodes[0].textContent).toEqual('Test')
    })
    
    it('should convert an element to widget with the same name as element\s tag name', function() {
      var fragment = parse('<meter></meter>');
      expect(Slick.find(fragment, 'meter')).toBeTruthy()
    })
    
    it('should NOT convert an element based on class', function() {
      var fragment = parse('<div class="lsd meter"></div>');
      expect(Slick.find(fragment, 'meter')).toBeFalsy()
    })
    
    it('should mutate elements based on mutations from widget', function() {
      var fragment = parse('<form>\
        <progresz id="a"></progresz>\
        <i>Jesus</i>\
        </form>\
        <progresz id="b"></progresz>\
        <i>Jesus</i>');
      expect(Slick.find(fragment, 'meter#a')).toBeTruthy()
      expect(Slick.find(fragment, 'meter#b')).toBeFalsy()
      expect(Slick.search(fragment, 'i').length).toEqual(1)
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
        <i>Jesus</i>\
      </form>\
      <progresz id="e"></progresz>\
      <i>Jesus</i>\
      <strong></strong>');
      expect(Slick.search(fragment, 'meter').length).toEqual(7)
      expect(Slick.search(fragment, 'button').length).toEqual(3)
      expect(Slick.search(fragment, 'icon').length).toEqual(2)
      expect(Slick.search(fragment, 'i').length).toEqual(1)
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
    
    xit ("should pickup mutations even if layout has started in the middle", function() {
      var element = new Element('div', {html: superform});
      new LSD.Widget(element.getFirst()) //make superform
      var clone = element.cloneNode(true);
      var target = Slick.find(clone, '#bc');
      var widget = new LSD.Widget(target);
      expect(widget.tagName).toEqual('meter');
    })
    
    
    it ("should create layouts from objects", function() {
      var widget = new LSD.Widget({tag: 'body', document: doc, context: 'test'});
      var result = widget.buildLayout({
        'form#c': {
          'label': 'Hello world',
          'fieldset': {
            'label': 'Your name:',
            'input[type=text]': true
          }
        }
      });
      expect(widget.getElements('form#c').length).toEqual(1);
      expect(widget.getElements('fieldset').length).toEqual(0);
      expect(widget.getElements('label').length).toEqual(0);
      expect(widget.getElements('input').length).toEqual(0);
      expect(widget.element.getElements('fieldset').length).toEqual(1);
      expect(widget.element.getElements('label').length).toEqual(2);
      expect(widget.element.getElements('input').length).toEqual(1);
    })
    
    it ("should create layout from objects with branches", function() {
      var widget = new LSD.Widget({tag: 'body', document: doc, context: 'test'});
      var result = widget.buildLayout({
        'form#c': {
          'summary': 'Hello world',
          'fieldset': {
            'if (a > 1)': {
              'label': 'Your name:',
              'input[type=text]': true
            }, 
            'else': {
              'h2': 'Welcome back again!'
            }
          }
        }
      });
      expect(widget.getElements('form#c').length).toEqual(1);
      expect(result['form#c'][1]['summary'][0].tagName.toLowerCase()).toEqual('summary');
      expect(result['form#c'][1]['fieldset'][1]['if (a > 1)'][0].options.keyword).toEqual('if');
      expect(result['form#c'][1]['fieldset'][1]['if (a > 1)'][0].options.expression).toEqual('(a > 1)');
      expect(result['form#c'][1]['fieldset'][1]['if (a > 1)'][0].interpolation.name).toEqual('>');
      expect(result['form#c'][1]['fieldset'][1]['if (a > 1)'][0].checked).toBeFalsy();
      expect(result['form#c'][1]['fieldset'][1]['else'][0].options.keyword).toEqual('else');
      expect(result['form#c'][1]['fieldset'][1]['else'][0].checked).toBeTruthy();
      expect(widget.element.getElement('label')).toBeFalsy();
      expect(widget.element.getElement('input')).toBeFalsy();
      expect(widget.element.getElement('h2')).toBeTruthy();
      widget.interpolations['a'][0](2);
      expect(widget.element.getElement('label')).toBeTruthy();
      expect(widget.element.getElement('input')).toBeTruthy();
      expect(widget.element.getElement('h2')).toBeFalsy();
      widget.interpolations['a'][0](0);
      expect(widget.element.getElement('label')).toBeFalsy();
      expect(widget.element.getElement('input')).toBeFalsy();
      expect(widget.element.getElement('h2')).toBeTruthy();
      widget.interpolations['a'][0](2);
      expect(widget.element.getElement('label')).toBeTruthy();
      expect(widget.element.getElement('input')).toBeTruthy();
      expect(widget.element.getElement('h2')).toBeFalsy();
      widget.interpolations['a'][0](0);
      expect(widget.element.getElement('label')).toBeFalsy();
      expect(widget.element.getElement('input')).toBeFalsy();
      expect(widget.element.getElement('h2')).toBeTruthy();
    });
    
    LSD.Test.Body = new Class({
      options: {
        tag: 'body'
      }
    })
    LSD.Test.Body.Dialog = new Class({
      Implements: LSD.Test.Body
    })
    
    it ("should build widgets off expressions with pseudo-elements allocation queries", function() {
      var widget = new LSD.Widget({tag: 'input', document: doc, context: 'test'});
      var result = widget.buildLayout({
        '::dialog:of-kind(input-date)': {
          'h2': 'Hello world',
          'p': 'Jesus saves!'
        }
      });
      expect(widget.getElements('*').length).toEqual(1);
      expect(widget.getElements('body[type=dialog]').length).toEqual(1);
      //widget.dispose();
      //expect(document.body.getElements('body')).toEqual(0)
    })
    
    it ("should build widgets conditionally", function() {
      var widget = new LSD.Widget({tag: 'input', document: doc, context: 'test'});
      var result = widget.buildLayout({
        'if &:expanded': {
          '::dialog:of-kind(input-time)': {
            'h2': 'Hello world',
            'p': 'Jesus saves!'
          }
        }
      });
      expect(widget.getElements('*').length).toEqual(0)
      expect(widget.getElements('body[type=dialog]').length).toEqual(0);
      widget.addPseudo('expanded');
      expect(widget.getElements('*').length).toEqual(1)
      expect(widget.getElements('body[type=dialog]').length).toEqual(1);
      expect(widget.getElement('body').element.getElement('h2').innerHTML).toEqual('Hello world');
      widget.removePseudo('expanded');
      expect(widget.getElements('*').length).toEqual(0)
      expect(widget.getElements('body[type=dialog]').length).toEqual(0);
      widget.addPseudo('expanded');
      expect(widget.getElements('*').length).toEqual(1)
      expect(widget.getElements('body[type=dialog]').length).toEqual(1);
      expect(widget.getElement('body').element.getElement('h2').innerHTML).toEqual('Hello world');
      widget.removePseudo('expanded');
      expect(widget.getElements('*').length).toEqual(0)
      expect(widget.getElements('body[type=dialog]').length).toEqual(0);
    })
    
    
    it ("should parse comments and interpolate them", function() {
      var element = new Element('div', {html: '\
        <!-- if a > 1 -->\
          <!--\
            <!- if urgency ->\
              <!- <h2>This is so urgent...</h2> ->\
            <!- else ->\
              <h2>This is not urgent, but hell, we need this today</h2>\
            <!- end ->\
          -->\
        <!-- else -->\
          <!-- unless urgency -->\
            <h3>That only takes 5 minutes to do! Come on, copy and paste what we have already</h3>\
          <!-- else -->\
            <!--\
              <h3>I want it right now</h3>\
            -->\
          <!-- end -->\
        <!-- end -->\
      '});
      $e = element
      var widget = $w = new LSD.Widget(element);
      widget.addInterpolator(widget.attributes);
      expect(element.getElement('h2')).toBeFalsy();
      expect(element.getElement('h3').innerHTML).toEqual('That only takes 5 minutes to do! Come on, copy and paste what we have already');
      expect(element.getElements('h3').length).toEqual(1);
      
     widget.attributes.set('urgency', true)
     //console.log([element])
     expect(element.getElement('h2')).toBeFalsy();
     expect(element.getElement('h3').innerHTML).toEqual('I want it right now');
     expect(element.getElements('h3').length).toEqual(1);
     widget.attributes.unset('urgency')
    expect(element.getElement('h2')).toBeFalsy();
    expect(element.getElement('h3').innerHTML).toEqual('That only takes 5 minutes to do! Come on, copy and paste what we have already');
    expect(element.getElements('h3').length).toEqual(1);
    widget.attributes.set('urgency', true)
    expect(element.getElement('h2')).toBeFalsy();
    expect(element.getElement('h3').innerHTML).toEqual('I want it right now');
    expect(element.getElements('h3').length).toEqual(1);
    widget.attributes.unset('urgency')
    expect(element.getElement('h3').innerHTML).toEqual('That only takes 5 minutes to do! Come on, copy and paste what we have already');
   expect(element.getElements('h3').length).toEqual(1);
    widget.interpolations['a'][0](2)
     expect(element.getElements('h2').length).toEqual(1);
    expect(element.getElement('h2').innerHTML).toEqual('This is not urgent, but hell, we need this today');
    expect(element.getElement('h3')).toBeFalsy();
   widget.attributes.set('urgency', true); 
      expect(element.getElements('h2').length).toEqual(1);
    expect(element.getElement('h2').innerHTML).toEqual('This is so urgent...');
    expect(element.getElement('h3')).toBeFalsy();
      widget.interpolations['a'][0](1)
      expect(element.getElement('h2')).toBeFalsy();
     expect(element.getElements('h3').length).toEqual(1);
      expect(element.getElement('h3').innerHTML).toEqual('I want it right now');
      widget.interpolations['a'][0](2)
     expect(element.getElements('h2').length).toEqual(1);
      expect(element.getElement('h2').innerHTML).toEqual('This is so urgent...');
      expect(element.getElement('h3')).toBeFalsy();
     widget.interpolations['urgency'][0](false);
     expect(element.getElement('h2').innerHTML).toEqual('This is not urgent, but hell, we need this today');
     expect(element.getElement('h3')).toBeFalsy();
    expect(element.getElements('h2').length).toEqual(1);
    })
  });

});