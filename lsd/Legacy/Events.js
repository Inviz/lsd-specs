describe("LSD.Module.Accessories.Events", function() {
  var Context = Factory('type')
  describe("#simple", function() {
    it ("self", function() {
      var clicked = false;
      Context.Selftest = new Class({
        options: {
          events: {
            self: {
              'touch': 'onTouch'
            }
          }
        },

        onTouch: function(event) {
          clicked = true;
        }
      });

      var element = new Element('selftest');
      var widget = new LSD.Element(element, {context: Context});
      widget.fireEvent('touch');
      expect(clicked).toBeTruthy();
    });

    it ("element", function() {
      var clicked = false;
      Context.Elementtest = new Class({
        options: {
          events: {
            element: {
              'click': 'onClick'
            }
          }
        },

        onClick: function(event) {
          clicked = true;
        }
      });

      var element = new Element('elementtest');
      new LSD.Element(element, {context: Context});
      element.fireEvent("click");
      expect(clicked).toBeTruthy();
    });

    it ("parent", function() {
      var clicked = false;
      Context.Parenttest = new Class({
        options: {
          events: {
            parent: {
              'click': 'onClick'
            }
          }
        },

        onClick: function(event) {
          clicked = true;
        }
      });

      var parent = new LSD.Element
      var widget = new LSD.Element(new Element('parenttest'), {context: Context});

      parent.appendChild(widget);
      parent.fireEvent('click');

      expect(clicked).toBeTruthy();
    });

    it ("document", function() {
      var clicked = false;

      Context.Documenttest = new Class({
        options: {
          events: {
            document: {
              'click': 'onClick'
            }
          }
        },

        onClick: function(event) {
          clicked = true;
        }
      });
      var doc = Factory('document');
      var widget = new LSD.Element(new Element('documenttest'), {context: Context, document: doc});
      doc.fireEvent("click");
      expect(clicked).toBeTruthy();
    });

    it ("window", function() {
      var resized = false;

      Context.Windowtest = new Class({
        options: {
          events: {
            window: {
              resize: 'onWindowResize'
            }
          }
        },

        onWindowResize: function(event) {
          resized = true;
        }
      });

      new LSD.Element(new Element('windowtest'), {context: Context});

      window.fireEvent("resize");
      expect(resized).toBeTruthy();
    });

  });

  describe("#complex", function() {

    it ("click:relay", function() {
      var clicked = false;
      Context.Relaytest = new Class({
        options: {
          events: {
            element: {
              'click:relay(span)': 'onClick'
            }
          }
        },

        onClick: function(event) {
          clicked = true;
        }
      });


      var widget = new LSD.Element(new Element('relaytest'), {context: Context});
      var button = new LSD.Element({tag: 'span', inline: null});
      button.inject(widget);
      widget.element.fireEvent('click', {target: button.element});

      expect(clicked).toBeTruthy();
    });

  });


});