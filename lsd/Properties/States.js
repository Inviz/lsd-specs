describe("LSD.Properties.States", function() {
  describe("when used on an observable object", function() {
    it ("should define methods on the parent objects that are related to that state", function() {
      var widget = new LSD.Element;
      expect(widget.checked).toBeUndefined();
      expect(widget.check).toBeUndefined();
      widget.set('checked', true);
      expect(widget.checked).toEqual(true);
      expect(widget.check).toBeDefined();
      expect(widget.uncheck).toBeDefined();
      widget.set('built', false);
      expect(widget.built).toEqual(false);
      expect(widget.build).toBeDefined();
      expect(widget.destroy).toBeDefined();
      widget.set('selected', false);
      expect(widget.select).toBeDefined();
      expect(widget.unselect).toBeDefined();
    });

    it ("should not undefine prototype methods", function() {
      var widget = new LSD.Element;
      widget.set('built', false);
      expect(widget.built).toEqual(false);
      widget.build();
      expect(widget.built).toEqual(true);
      widget.build();
      expect(widget.built).toEqual(true);
      widget.destroy();
      expect(widget.built).toEqual(false);
      expect(widget.build).toBeDefined();
      widget.unset('built', false)
      expect(widget.build).toBeDefined();
      expect(widget.built).toEqual(false);
      expect(widget.built).toEqual(false);
    });
    
    it ("should undefine methods", function() {
      var widget = new LSD.Element;
      widget.set('empty', false);
      widget.unfill();
      expect(widget.empty).toEqual(true);
      widget.unfill();
      expect(widget.empty).toEqual(true);
      widget.fill();
      expect(widget.empty).toEqual(false);
      expect(widget.fill).toBeDefined();
      widget.unset('empty', false)
      expect(widget.fill).toBeUndefined();
      expect(widget.empty).toBeUndefined();
      expect(widget.empty).toBeUndefined();
    });

    it ("should toggle states by using the defined methods", function() {
      var widget = new LSD.Element;
      widget.set('built', false);
      widget.build();
      expect(widget.built).toEqual(true);
      widget.destroy();
      expect(widget.built).toEqual(false);
    })
  })
  describe("when used on an observable stack based-object", function() {
    it ("should define methods on the parent objects that are related to that state", function() {
      var widget = new LSD.Element;
      expect(widget.checked).toBeUndefined();
      expect(widget.check).toBeUndefined();
      widget.set('checked', true);
      expect(widget.checked).toEqual(true);
      expect(widget.check).toBeDefined();
      expect(widget.uncheck).toBeDefined();
      widget.set('built', false);
      expect(widget.built).toEqual(false);
      expect(widget.build).toBeDefined();
      expect(widget.destroy).toBeDefined();
      widget.set('selected', false);
      expect(widget.selected).toBeFalsy()
      expect(widget.select).toBeDefined();
      expect(widget.unselect).toBeDefined();
    });

    it ("should undefine methods", function() {
      var widget = new LSD.Element;
      widget.set('checked', true);
      expect(widget.check).toBeDefined();
      expect(widget.uncheck).toBeDefined();
      widget.unset('checked', true);
      expect(widget.check).toBeUndefined();
      expect(widget.uncheck).toBeUndefined();
    });

    it ("should toggle states by using the defined methods", function() {
      var widget = new LSD.Element;
      widget.set('empty', false);
      widget.unfill();
      expect(widget.empty).toEqual(true);
      widget.unfill();
      expect(widget.empty).toEqual(true);
      widget.fill();
      expect(widget.empty).toEqual(false);
      expect(widget.fill).toBeDefined();
      widget.unset('empty', false)
      expect(widget.fill).toBeUndefined();
      expect(widget.empty).toBeUndefined();
      expect(widget.empty).toBeUndefined();
    });
  })
})