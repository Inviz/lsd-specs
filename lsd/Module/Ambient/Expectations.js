describe("LSD.Module.Expectations", function() {
  describe("#expect", function() {

    it ("#single pseudo", function() {
      var instance = new LSD.Widget;
      var bool = false;
      instance.expect({tag: '*', pseudos: [{key: 'disabled'}]}, function() { bool=true });
      instance.addPseudo('disabled');
      expect(bool).toBeTruthy();
    });

    it ("#single attribute", function() {
      var instance = new LSD.Widget;
      var bool = false;
      instance.expect({tag: '*', attributes: [{key: 'disabled'}]}, function() { bool=true });
      instance.setAttribute("disabled", true);
      expect(bool).toBeTruthy();
    });

    it ("#single class", function() {
      var instance = new LSD.Widget;
      var bool = false;
      instance.expect({tag: '*', classes: [{value: 'first'}]}, function() { bool=true });
      instance.addClass("first");
      expect(bool).toBeTruthy();
    });



    it ("#multyple pseudos", function() {
      var instance = new LSD.Widget;
      var bool = false;
      instance.expect({tag: '*', pseudos: [{key: 'disabled'},{key: 'read-write'}]}, function() { bool=true });
      instance.addPseudo('disabled');
      instance.addPseudo('read-write');
      expect(bool).toBeTruthy();
    });

    it ("#multyple attributes", function() {
      var instance = new LSD.Widget;
      var bool = false;
      instance.expect({tag: '*', attributes: [{key: 'disabled'}, {key: 'title'}]}, function() { bool=true });
      instance.setAttribute("disabled", true);
      instance.setAttribute("title", "this is spartaaaa!!!!");
      expect(bool).toBeTruthy();
    });

    it ("#multiple classes", function() {
      var instance = new LSD.Widget;
      var bool = false;
      instance.expect({tag: '*', classes: [{value: 'first'},{value: 'second'}]}, function() { bool=true });
      instance.addClass("first");
      instance.addClass("second");
      expect(bool).toBeTruthy();
    });

    it ("#pseudo & attributes", function() {
      var instance = new LSD.Widget;
      var bool = false;
      instance.expect({tag: '*', pseudos: [{key: 'disabled'}], attributes: [{key: 'title'}]}, function() { bool=true });
      instance.addPseudo('disabled');
      instance.setAttribute("title", "this is spartaaaa!!!!");
      expect(bool).toBeTruthy();
    });

    it ("#class & pseudo", function() {
      var instance = new LSD.Widget;
      var bool = false;
      instance.expect({tag: '*', classes: [{value: 'first'}], pseudos: [{key: 'disabled'}]}, function() { bool=true });
      instance.addClass("first");
      instance.addPseudo('disabled');
      expect(bool).toBeTruthy();
    });

    it ("#class & attribute", function() {
      var instance = new LSD.Widget;
      var bool = false;
      instance.expect({tag: '*', classes: [{value: 'first'}], attributes: [{key: 'title'}]}, function() { bool=true });
      instance.addClass("first");
      instance.setAttribute("title", "this is spartaaaa!!!!");
      expect(bool).toBeTruthy();
    });

    it ("#class & attribute & pseudo", function() {
      var instance = new LSD.Widget;
      var bool = false;
      instance.expect({tag: '*', classes: [{value: 'first'}], pseudos: [{key: 'disabled'}], attributes: [{key: 'title'}]}, function() { bool=true });
      instance.addClass("first");
      instance.addPseudo('disabled');
      instance.setAttribute("title", "this is spartaaaa!!!!");
      expect(bool).toBeTruthy();
    });

  });

  describe("#multiple", function() {

    it ("#anonymous", function() {
      var instance = new LSD.Widget;
      var iterator = 0;
      instance.expect({tag: '*', classes: [{value: 'custom'}]}, function() { iterator++ });
      instance.expect({tag: '*', classes: [{value: 'custom'}]}, function() { iterator++ });
      instance.addClass("custom");
      expect(iterator).toEqual(2);
    });

    it ("#callback", function() {
      var instance = new LSD.Widget;
      var iterator = 0;
      var callback = function() { iterator++ };
      instance.expect({tag: '*', classes: [{value: 'custom'}]}, callback);
      instance.expect({tag: '*', classes: [{value: 'custom'}]}, callback);
      instance.expect({tag: '*', classes: [{value: 'custom'}]}, callback);
      instance.addClass("custom");
      expect(iterator).toEqual(3);
    });
  });

  describe("#unexpect", function() {

    it ("#all", function() {
      var instance = new LSD.Widget;
      var bool = false;
      instance.expect({tag: '*', pseudos: [{key: 'disabled'}]}, function() { bool=true });
      instance.unexpect({tag: '*', pseudos: [{key: 'disabled'}]});
      instance.addPseudo('disabled');
      expect(bool).toBeFalsy();
    });

    it ("#single", function() {
      var instance = new LSD.Widget;
      var string = "";
      var callback = function() { string = "callback"; };
      instance.expect({tag: '*', pseudos: [{key: 'disabled'}]}, function(){ string = "anonymous"; });
      instance.expect({tag: '*', pseudos: [{key: 'disabled'}]}, callback);
      instance.unexpect({tag: '*', pseudos: [{key: 'disabled'}]}, callback);
      instance.addPseudo('disabled');
      expect(string).toEqual("anonymous")
    });

    it ("#multiple", function() {
      var instance = new LSD.Widget;
      var bool = false;
      var callback = function() { bool=true };
      instance.expect({tag: '*', pseudos: [{key: 'disabled'}]}, callback);
      instance.expect({tag: '*', pseudos: [{key: 'disabled'}]}, callback);
      instance.unexpect({tag: '*', pseudos: [{key: 'disabled'}]}, callback);
      instance.addPseudo('disabled');
      expect(bool).toBeFalsy();
    });
  });


});