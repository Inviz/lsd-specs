describe("LSD.Module.Accessories.Events", function() {
  describe("#simple", function() {

    it ("self", function() {
      var clicked = false;
      LSD.Widget.Test = new Class({
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

      var element = new Element('test');
      var widget = new LSD.Widget(element, {context:'widget'});
      widget.fireEvent('touch');
      expect(clicked).toBeTruthy();
    });

    it ("element", function() {
      var clicked = false;
      LSD.Widget.Test = new Class({
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

      var element = new Element('test');
      new LSD.Widget(element, {context:'widget'});
      element.fireEvent("click");
      expect(clicked).toBeTruthy();
    });

    it ("parent", function() {
      var clicked = false;
      LSD.Widget.Test = new Class({
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

      var parent = new LSD.Widget(new Element('button'), {context:'widget'});
      var widget = new LSD.Widget(new Element('test'), {context:'widget'});

      parent.appendChild(widget);
      parent.fireEvent('click');

      expect(clicked).toBeTruthy();
    });

    it ("document", function() {
      var clicked = false;

      LSD.Widget.Test = new Class({
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

      var doc = LSD.document || new LSD.Document;
      var widget = new LSD.Widget(new Element('test'), {context:'widget', document: doc});
      doc.fireEvent("click");
      expect(clicked).toBeTruthy();
    });

    it ("window", function() {
      var resized = false;

      LSD.Widget.Test = new Class({
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

      new LSD.Widget(new Element('test'), {context:'widget'});

      window.fireEvent("resize");
      expect(resized).toBeTruthy();
    });

  });

  describe("#complex", function() {

    it ("click:relay", function() {
      var clicked = false;
      LSD.Widget.Test = new Class({
        options: {
          events: {
            element: {
              'click:relay(buttog)': 'onClick'
            }
          }
        },

        onClick: function(event) {
          clicked = true;
        }
      });


      var widget = new LSD.Widget(new Element('test'), {context:'widget'});
      var button = new LSD.Widget({tag: 'buttog', inline: null});
      button.inject(widget);
      widget.element.fireEvent('click', {target: button.element});

      expect(clicked).toBeTruthy();
    });

  });


});