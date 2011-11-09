describe("LSD.Module.Accessories.Events", function() {
  new LSD.Type('EventTest');
  describe("#simple", function() {

    it ("self", function() {
      var clicked = false;
      LSD.EventTest.Selftest = new Class({
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
      var widget = new LSD.Widget(element, {context:'event_test'});
      widget.fireEvent('touch');
      expect(clicked).toBeTruthy();
    });

    it ("element", function() {
      var clicked = false;
      LSD.EventTest.Elementtest = new Class({
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
      new LSD.Widget(element, {context:'event_test'});
      element.fireEvent("click");
      expect(clicked).toBeTruthy();
    });

    it ("parent", function() {
      var clicked = false;
      LSD.EventTest.Parenttest = new Class({
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

      var parent = new LSD.Widget
      var widget = new LSD.Widget(new Element('parenttest'), {context:'event_test'});

      parent.appendChild(widget);
      parent.fireEvent('click');

      expect(clicked).toBeTruthy();
    });

    it ("document", function() {
      var clicked = false;

      LSD.EventTest.Documenttest = new Class({
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
      var doc = LSD.getCleanDocument();
      var widget = new LSD.Widget(new Element('documenttest'), {context:'event_test', document: doc});
      doc.fireEvent("click");
      expect(clicked).toBeTruthy();
    });

    it ("window", function() {
      var resized = false;

      LSD.EventTest.Windowtest = new Class({
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

      new LSD.Widget(new Element('windowtest'), {context:'event_test'});

      window.fireEvent("resize");
      expect(resized).toBeTruthy();
    });

  });

  describe("#complex", function() {

    it ("click:relay", function() {
      var clicked = false;
      LSD.EventTest.Relaytest = new Class({
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


      var widget = new LSD.Widget(new Element('relaytest'), {context:'event_test'});
      var button = new LSD.Widget({tag: 'span', inline: null});
      button.inject(widget);
      widget.element.fireEvent('click', {target: button.element});

      expect(clicked).toBeTruthy();
    });

  });


});