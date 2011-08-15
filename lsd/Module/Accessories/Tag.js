describe("LSD.Module.Tag", function() {
  
  describe("#setSource", function() {
    LSD.Applet = new LSD.Type;
    LSD.Applet.Body = new Class({

      getBody: function() {
        return true;
      }
    });
    LSD.Applet.Button = new Class({

      clickaz: function() {
        return true;
      }
    });
    
    it ("should set the widget class and implement its methods", function() {
      var widget = new LSD.Widget({
        context: 'applet'
      });
      expect(widget.getBody).toBeFalsy();
      widget.setTag('body');
      expect(widget.getBody).toBeTruthy();
    });
    
    it ("should change the class after it once were set", function() {
      var widget = new LSD.Widget({
        context: 'applet'
      });
      widget.property = 1;
      widget.setTag('body');
      expect(widget.clickaz).toBeFalsy();
      expect(widget.getBody).toBeTruthy();
      expect(widget.property).toEqual(1);
      widget.setTag('button');
      expect(widget.clickaz).toBeTruthy();
      expect(widget.getBody).toBeFalsy();
      expect(widget.property).toEqual(1);
    });
    
    it ("should create a functioning widget", function() {
      
      var widget = new LSD.Widget({
        context: 'applet',
        inline: null
      });
      widget.setTag('button');
      widget.build()
      expect(widget.element.tagName.toLowerCase()).toEqual('button');
    })
    
    it ("should create a widget off an element and replace it when tag is changed", function() {
      var element = document.createElement('body');
      var widget = new LSD.Widget(element, {context: 'applet'});
      expect(widget.tagName).toEqual('body');
      expect(widget.getBody).toBeTruthy()
    })
    
    it("should not fail", function() {
      var clicked = false;

      LSD.Widget.Buttonesque = new Class({
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
      var element = new Element('div');
      var instance = new LSD.Widget(element, {tag:'buttonesque', context: 'widget'});
      element.fireEvent("click");
      expect(clicked).toBeTruthy();
    })
    
  });
  
  describe("mixin", function() {
    it ("should respect multiple mixin requests", function() {
      LSD.Mixin.Zizzoro = new Class({
        bang: function() {}
      })
      var instance = new LSD.Widget;
      expect(instance.bang).toBeFalsy()
      instance.mixins.add('zizzoro');
      expect(instance.bang).toBeTruthy()
      instance.mixins.remove('zizzoro');
      expect(instance.bang).toBeFalsy()
      instance.mixins.add('zizzoro');
      expect(instance.bang).toBeTruthy()
      instance.mixins.add('zizzoro');
      expect(instance.bang).toBeTruthy()
      instance.mixins.remove('zizzoro');
      expect(instance.bang).toBeTruthy()
      instance.mixins.remove('zizzoro');
      expect(instance.bang).toBeFalsy()
    })
  })
  
});