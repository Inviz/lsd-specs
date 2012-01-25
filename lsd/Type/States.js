describe("LSD.Type.States", function() {
  describe("when used on an observable object", function() {
    it ("should define methods on the parent objects that are related to that state", function() {
      var widget = new LSD.Object({
        states: new LSD.Type.States
      });
      expect(widget.checked).toBeUndefined();
      expect(widget.check).toBeUndefined();
      widget.states.set('checked', true);
      expect(widget.checked).toEqual(true);
      expect(widget.check).toBeDefined();
      expect(widget.uncheck).toBeDefined();
      widget.states.set('built', false);
      expect(widget.built).toEqual(false);
      expect(widget.build).toBeDefined();
      expect(widget.destroy).toBeDefined();
      widget.states.set('selected', false);
      expect(widget.select).toBeDefined();
      expect(widget.unselect).toBeDefined();
    });

    it ("should undefine methods", function() {
      var widget = new LSD.Object({
        states: new LSD.Type.States,
        pseudos: new LSD.Object
      });
      widget.states.set('built', false);
      widget.build();
      expect(widget.built).toEqual(true);
      expect(widget.pseudos.built).toEqual(true)
      widget.build();
      expect(widget.pseudos.built).toEqual(true)
      expect(widget.built).toEqual(true);
      widget.destroy();
      expect(widget.pseudos.built).toBeUndefined()
      expect(widget.built).toEqual(false);
      expect(widget.build).toBeDefined();
      widget.states.unset('built', false)
      expect(widget.pseudos.built).toBeUndefined()
      expect(widget.build).toBeUndefined();
      expect(widget.built).toBeUndefined();
      expect(widget.states.built).toBeUndefined();
    });

    it ("should toggle states by using the defined methods", function() {
      var widget = new LSD.Object({
        states: new LSD.Type.States
      });
      widget.states.set('built', false);
      widget.build();
      expect(widget.built).toEqual(true);
      widget.destroy();
      expect(widget.built).toEqual(false);
    })
  })
  describe("when used on an observable stack based-object", function() {
    it ("should define methods on the parent objects that are related to that state", function() {
      var widget = new LSD.Object.Stack({
        states: new LSD.Type.States
      });
      expect(widget.checked).toBeUndefined();
      expect(widget.check).toBeUndefined();
      widget.states.set('checked', true);
      expect(widget.checked).toEqual(true);
      expect(widget.check).toBeDefined();
      expect(widget.uncheck).toBeDefined();
      widget.states.set('built', false);
      expect(widget.built).toEqual(false);
      expect(widget.build).toBeDefined();
      expect(widget.destroy).toBeDefined();
      widget.states.set('selected', false);
      expect(widget.selected).toBeFalsy()
      expect(widget.select).toBeDefined();
      expect(widget.unselect).toBeDefined();
    });

    it ("should undefine methods", function() {
      var widget = new LSD.Object.Stack({
        states: new LSD.Type.States
      });
      widget.states.set('checked', true);
      expect(widget.check).toBeDefined();
      expect(widget.uncheck).toBeDefined();
      widget.states.unset('checked', true);
      expect(widget.check).toBeUndefined();
      expect(widget.uncheck).toBeUndefined();
    });

    it ("should toggle states by using the defined methods", function() {
      var widget = new LSD.Object.Stack({
        states: new LSD.Type.States,
        pseudos: new LSD.Object
      });
      widget.states.set('built', false);
      widget.build();
      expect(widget.built).toEqual(true);
      expect(widget.pseudos.built).toEqual(true)
      widget.build();
      expect(widget.pseudos.built).toEqual(true)
      expect(widget.built).toEqual(true);
      widget.destroy();
      expect(widget.pseudos.built).toBeUndefined()
      expect(widget.built).toEqual(false);
      expect(widget.build).toBeDefined();
      widget.states.unset('built', false)
      expect(widget.pseudos.built).toBeUndefined()
      expect(widget.build).toBeUndefined();
      expect(widget.built).toBeUndefined();
      expect(widget.states.built).toBeUndefined();
    });
  })
})