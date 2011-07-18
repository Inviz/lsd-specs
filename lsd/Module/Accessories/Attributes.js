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
      instance.setState("disabled");
      expect(instance.pseudos["disabled"]).toBeTruthy();
      expect(instance.attributes["disabled"]).toBeTruthy();
      instance.unsetState("disabled");
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
      instance.setState("custom");
      expect(instance.hasClass("is-custom")).toBeTruthy();
      instance.setState("empty");
      expect(instance.hasClass('empty')).toBeTruthy();
    });

    it ("should create selector", function() {
      var element = new Element('div');
      var instance = new LSD.Widget(element);
      instance.addClass("first");
      instance.setState("disabled");
      expect(instance.getSelector()).toEqual("div.first:read-only:disabled[disabled=disabled]");
    });

  });
});