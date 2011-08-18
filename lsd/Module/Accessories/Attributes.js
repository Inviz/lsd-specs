describe("LSD.Module.Attributes", function() {
  describe("#attributes", function() {

    it ("should manage attributes", function() {
      var instance = new LSD.Widget({tag: 'div'});
      instance.build();
      instance.setAttribute("disabled", true);
      expect(instance.element["disabled"]).toBeTruthy();
      expect(instance.attributes["disabled"]).toBeTruthy();
      instance.removeAttribute("disabled");
      expect(instance.element["disabled"]).toBeFalsy();
      expect(instance.attributes["disabled"]).toBeFalsy();
    });

    it ("should manage pseudos via attributes", function() {
      var instance = new LSD.Widget({tag: 'div'});
      instance.setAttribute("disabled", true);
      expect(instance.pseudos["disabled"]).toBeTruthy();
      expect(instance.attributes["disabled"]).toBeTruthy();
      instance.build();
      expect(instance.element["disabled"]).toBeTruthy();
      instance.removeAttribute("disabled");
      expect(instance.pseudos["disabled"]).toBeFalsy();
      expect(instance.attributes["disabled"]).toBeFalsy();
      expect(instance.element["disabled"]).toBeFalsy();
    });

    it ("should manage pseudos", function() {
      var instance = new LSD.Widget;
      instance.addPseudo("disabled");
      expect(instance.pseudos["disabled"]).toBeTruthy();
      instance.removePseudo("disabled");
      expect(instance.pseudos["disabled"]).toBeFalsy();
    });

    it ("should manage attributes & pseudos via states", function() {
      var instance = new LSD.Widget;
      instance.states.add("disabled");
      expect(instance.pseudos["disabled"]).toBeTruthy();
      expect(instance.attributes["disabled"]).toBeTruthy();
      instance.states.remove("disabled");
      expect(instance.pseudos["disabled"]).toBeFalsy();
      expect(instance.attributes["disabled"]).toBeFalsy();
    });

    it ("should manage classes", function() {
      var instance = new LSD.Widget;
      instance.addClass("first");
      instance.addClass("second");
      expect(instance.hasClass("first")).toBeTruthy();
      expect(instance.hasClass("second")).toBeTruthy();
      instance.removeClass("first");
      expect(instance.hasClass("first")).toBeFalsy();
      expect(instance.hasClass("second")).toBeTruthy();
    });

    it ("should manage classes via states", function() {
      var instance = new LSD.Widget({tag: 'div'});
      instance.states.add("custom");
      expect(instance.hasClass("is-custom")).toBeTruthy();
      instance.states.add("empty");
      expect(instance.hasClass('empty')).toBeTruthy();
    });

    it ("should create selector", function() {
      var element = new Element('div');
      var instance = new LSD.Widget(element);
      instance.addClass("first");
      instance.states.add("disabled");
      expect(instance.getSelector()).toEqual("div.first:read-only:disabled[disabled]");
    });

    it ("should set state when state was already defined and class with the name of the state was added", function() {
      var element = new Element('div');
      var instance = new LSD.Widget(element);
      instance.addState('selected');
      instance.addClass('selected');
      expect(instance.selected).toBeTruthy();
    });

    it ("should set state when class with the name of the state was added and state was already defined", function() {
      var element = new Element('div');
      var instance = new LSD.Widget(element);
      instance.addClass('selected');
      instance.addState('selected');
      expect(instance.selected).toBeTruthy();
    });
    
    it ("should be able to set state through a class without state defined", function() {
      var element = new Element('div');
      var instance = new LSD.Widget(element);
      instance.addClass('selected');
      expect(instance.selected).toBeTruthy();
    });
    
    it ("should be able to pick up the state from element", function() {
      var element = new Element('div');
      element.setAttribute('checked', 'checked');
      var instance = new LSD.Widget(element);
      expect(instance.checked).toBeTruthy();
      expect(instance.pseudos.checked).toBeTruthy();
      expect(instance.attributes.checked).toBeTruthy();
      instance.removeAttribute('checked');
      expect(instance.checked).toBeFalsy();
      expect(instance.pseudos.checked).toBeFalsy();
      expect(instance.attributes.checked).toBeFalsy();
    })
    
    it ("should remove the state after the attribute that gave it is removed", function() {
      var element = new Element('div');
      element.setAttribute('checked', 'checked');
      var instance = new LSD.Widget(element);
      expect(instance.checked).toBeTruthy();
      instance.uncheck();
      expect(instance.checked).toBeFalsy();
      expect(instance.pseudos.checked).toBeFalsy();
      expect(instance.attributes.checked).toBeFalsy();
      expect(instance.check).toBeFalsy();
      instance.setAttribute('checked', true);
      expect(instance.checked).toBeTruthy();
      expect(instance.pseudos.checked).toBeTruthy();
      expect(instance.attributes.checked).toBeTruthy();
      instance.uncheck();
      expect(instance.checked).toBeFalsy();
      expect(instance.pseudos.checked).toBeFalsy();
      expect(instance.attributes.checked).toBeFalsy();
      expect(instance.check).toBeFalsy();
    })
    
    it ("should not remove the state from widget, if the state was given by an attribute AND explicitly", function() {
      var element = new Element('div');
      element.setAttribute('checked', 'checked');
      var instance = new LSD.Widget(element, {states: ['checked']});
      expect(instance.checked).toBeTruthy();
      instance.uncheck();
      expect(instance.checked).toBeFalsy();
      expect(instance.pseudos.checked).toBeFalsy();
      expect(instance.attributes.checked).toBeFalsy();
      expect(instance.check).toBeTruthy();
    })
    
    it ("should get the explicit state set to null, acquire methods but not trigger state change", function() {
      var instance = new LSD.Widget;
      expect(instance.checked).toBeFalsy()
      expect(instance.check).toBeFalsy()
      instance.states.set('checked', null);
      expect(instance.check).toBeTruthy()
      expect(instance.checked).toBeFalsy()
      instance.states.unset('checked', null);
      expect(instance.checked).toBeFalsy()
      expect(instance.check).toBeFalsy()
    });
    
    it ("should be able to watch other state", function() {
      var instance = new LSD.Widget;
      instance.states.watch('checked', 'selected');
      expect(instance.checked).toBeFalsy();
      expect(instance.selected).toBeFalsy();
      expect(instance.check).toBeFalsy();
      expect(instance.select).toBeFalsy();
      instance.states.set('checked', true);
      expect(instance.checked).toBeTruthy();
      expect(instance.selected).toBeTruthy();
      expect(instance.check).toBeTruthy();
      expect(instance.select).toBeTruthy();
      instance.states.unset('checked', true);
      expect(instance.checked).toBeFalsy();
      expect(instance.selected).toBeFalsy();
      expect(instance.check).toBeFalsy();
      expect(instance.select).toBeFalsy();
    });
    
    it ("should be able to watch other state and proxy nulls", function() {
      var instance = new LSD.Widget;
      instance.states.watch('checked', 'selected');
      expect(instance.checked).toBeFalsy();
      expect(instance.selected).toBeFalsy();
      expect(instance.check).toBeFalsy();
      expect(instance.select).toBeFalsy();
      instance.states.set('checked', null);
      expect(instance.checked).toBeFalsy();
      expect(instance.selected).toBeFalsy();
      expect(instance.check).toBeTruthy();
      expect(instance.select).toBeTruthy();
      instance.states.unset('checked', null);
      expect(instance.checked).toBeFalsy();
      expect(instance.selected).toBeFalsy();
      expect(instance.check).toBeFalsy();
      expect(instance.select).toBeFalsy();
    })
    
    it ("should allow circular watch", function() {
      
      var instance = new LSD.Widget;
      instance.states.watch('checked', 'selected');
      instance.states.watch('selected', 'checked');
      instance.states.set('checked', null);
      expect(instance.checked).toBeFalsy();
      expect(instance.selected).toBeFalsy();
      expect(instance.check).toBeTruthy();
      expect(instance.select).toBeTruthy();
      expect(instance.states._stack.checked.length).toEqual(1);
      expect(instance.states._stack.selected.length).toEqual(1);
      instance.states.unset('selected', null);
      expect(instance.checked).toBeFalsy();
      expect(instance.selected).toBeFalsy();
      expect(instance.check).toBeFalsy();
      expect(instance.select).toBeFalsy();
      expect(instance.states._stack.checked.length).toEqual(0);
      expect(instance.states._stack.selected.length).toEqual(0);
      instance.states.set('checked', true);
      expect(instance.checked).toBeTruthy();
      expect(instance.selected).toBeTruthy();
      expect(instance.check).toBeTruthy();
      expect(instance.select).toBeTruthy();
      expect(instance.states._stack.checked.length).toEqual(1);
      expect(instance.states._stack.selected.length).toEqual(1);
      instance.states.set('checked', false);
      expect(instance.checked).toBeFalsy();
      expect(instance.selected).toBeFalsy();
      expect(instance.check).toBeTruthy();
      expect(instance.select).toBeTruthy();
      expect(instance.states._stack.checked.length).toEqual(2);
      expect(instance.states._stack.selected.length).toEqual(1);
      instance.states.unset('checked', false);
      expect(instance.checked).toBeTruthy();
      expect(instance.selected).toBeTruthy();
      expect(instance.check).toBeTruthy();
      expect(instance.select).toBeTruthy();
      expect(instance.states._stack.checked.length).toEqual(1);
      expect(instance.states._stack.selected.length).toEqual(1);
      instance.states.unset('checked', true);
      expect(instance.checked).toBeFalsy();
      expect(instance.selected).toBeFalsy();
      expect(instance.check).toBeFalsy();
      expect(instance.select).toBeFalsy();
      expect(instance.states._stack.checked.length).toEqual(0);
      expect(instance.states._stack.selected.length).toEqual(0);
    })
    
    new LSD.Type('Checkboxtest');
    
    it ("should make attributes type='checkbox' and checked='checked'", function() {
      var element = new Element('input', {type: 'checkbox'});
      element.setAttribute('checked', 'checked');
      var instance = new LSD.Widget(element, {
        context: 'checkboxtest',
        element: {tag: 'div'}
      });
      expect(instance.tagName).toEqual('input');
      expect(instance.element.get('tag')).toEqual('div');
      
      expect(instance.attributes.type).toEqual('checkbox');
      expect(instance.getAttribute('type')).toEqual('checkbox');
      expect(instance.element.getAttribute('type')).toEqual('checkbox');
      
      expect(instance.checked).toBeTruthy();
      expect(instance.attributes.checked).toBeTruthy();
      expect(instance.getAttribute('checked')).toBeTruthy();
      expect(instance.element.getAttribute('checked')).toBeTruthy();
    })
  });
});