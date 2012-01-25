describe("LSD.Module.Ambient.Expectations", function() {
  describe("#expect", function() {
    it ("single pseudo", function() {
      var instance = new LSD.Widget;
      var bool = false;
      instance.expect({tag: '*', pseudos: [{key: 'disabled'}]}, function() { bool=true });
      instance.addPseudo('disabled');
      expect(bool).toBeTruthy();
    });

    it ("single attribute", function() {
      var instance = new LSD.Widget;
      var bool = false;
      instance.expect({tag: '*', attributes: [{key: 'disabled'}]}, function() { bool=true });
      instance.setAttribute("disabled", true);
      expect(bool).toBeTruthy();
    });

    it ("single class", function() {
      var instance = new LSD.Widget;
      var bool = false;
      instance.expect({tag: '*', classes: [{value: 'first'}]}, function() { bool=true });
      instance.addClass("first");
      expect(bool).toBeTruthy();
    });



    it ("multyple pseudos", function() {
      var instance = new LSD.Widget;
      var bool = false;
      instance.expect({tag: '*', pseudos: [{key: 'disabled'},{key: 'read-write'}]}, function() { bool=true });
      instance.addPseudo('disabled');
      instance.addPseudo('read-write');
      expect(bool).toBeTruthy();
    });

    it ("multyple attributes", function() {
      var instance = new LSD.Widget;
      var bool = false;
      instance.expect({tag: '*', attributes: [{key: 'disabled'}, {key: 'title'}]}, function() { bool=true });
      instance.setAttribute("disabled", true);
      instance.setAttribute("title", "this is spartaaaa!!!!");
      expect(bool).toBeTruthy();
    });

    it ("multiple classes", function() {
      var instance = new LSD.Widget;
      var bool = false;
      instance.expect({tag: '*', classes: [{value: 'first'},{value: 'second'}]}, function() { bool=true });
      instance.addClass("first");
      instance.addClass("second");
      expect(bool).toBeTruthy();
    });

    it ("pseudo & attributes", function() {
      var instance = new LSD.Widget;
      var bool = false;
      instance.expect({tag: '*', pseudos: [{key: 'disabled'}], attributes: [{key: 'title'}]}, function() { bool=true });
      instance.addPseudo('disabled');
      instance.setAttribute("title", "this is spartaaaa!!!!");
      expect(bool).toBeTruthy();
    });

    it ("class & pseudo", function() {
      var instance = new LSD.Widget;
      var bool = false;
      instance.expect({tag: '*', classes: [{value: 'first'}], pseudos: [{key: 'disabled'}]}, function() { bool=true });
      instance.addClass("first");
      instance.addPseudo('disabled');
      expect(bool).toBeTruthy();
    });

    it ("class & attribute", function() {
      var instance = new LSD.Widget;
      var bool = false;
      instance.expect({tag: '*', classes: [{value: 'first'}], attributes: [{key: 'title'}]}, function() { bool=true });
      instance.addClass("first");
      instance.setAttribute("title", "this is spartaaaa!!!!");
      expect(bool).toBeTruthy();
    });

    it ("class & attribute & pseudo", function() {
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

    it ("anonymous", function() {
      var instance = new LSD.Widget;
      var iterator = 0;
      instance.expect({tag: '*', classes: [{value: 'custom'}]}, function() { iterator++ });
      instance.expect({tag: '*', classes: [{value: 'custom'}]}, function() { iterator++ });
      instance.addClass("custom");
      expect(iterator).toEqual(2);
      instance.addClass("custom");
      expect(iterator).toEqual(2);
    });

    it ("should not fire callbacks on excessive setting of class", function() {
      var instance = new LSD.Widget;
      var iterator = 0;
      var callback = function() { iterator++ };
      instance.expect({tag: '*', classes: [{value: 'custom'}]}, callback);
      instance.expect({tag: '*', classes: [{value: 'custom'}]}, callback);
      instance.expect({tag: '*', classes: [{value: 'custom'}]}, callback);
      instance.addClass("custom");
      expect(iterator).toEqual(3);
      instance.addClass("custom");
      expect(iterator).toEqual(3);
    });
  });

  describe("#unexpect", function() {

    it ("all", function() {
      var instance = new LSD.Widget;
      var bool = false;
      instance.expect({tag: '*', pseudos: [{key: 'disabled'}]}, function() { bool=true });
      instance.unexpect({tag: '*', pseudos: [{key: 'disabled'}]});
      instance.addPseudo('disabled');
      expect(bool).toBeFalsy();
    });

    it ("single", function() {
      var instance = new LSD.Widget;
      var string = "";
      var callback = function() { string = "callback"; };
      instance.expect({tag: '*', pseudos: [{key: 'disabled'}]}, function(){ string = "anonymous"; });
      instance.expect({tag: '*', pseudos: [{key: 'disabled'}]}, callback);
      instance.unexpect({tag: '*', pseudos: [{key: 'disabled'}]}, callback);
      instance.addPseudo('disabled');
      expect(string).toEqual("anonymous")
    });

    it ("multiple", function() {
      var instance = new LSD.Widget;
      var bool = false;
      var callback = function(widget, state) { bool=state };
      instance.expect({tag: '*', pseudos: [{key: 'disabled'}]}, callback);
      instance.expect({tag: '*', pseudos: [{key: 'disabled'}]}, callback);
      instance.addPseudo('disabled');
      expect(bool).toBeTruthy();
      instance.removePseudo('disabled');
      expect(bool).toBeFalsy();
      instance.unexpect({tag: '*', pseudos: [{key: 'disabled'}]}, callback);
      instance.addPseudo('disabled');
      expect(bool).toBeTruthy();
      instance.removePseudo('disabled');
      expect(bool).toBeFalsy();
      instance.unexpect({tag: '*', pseudos: [{key: 'disabled'}]}, callback);
      instance.addPseudo('disabled');
      expect(bool).toBeFalsy();
    });
  });

  describe("#match", function() {
    it ("should match a complex combinator", function() {
      var bool = false;
      var root = new LSD.Widget({
        tag: 'root',
        pseudos: ['root'],
        document: Factory('document')
      });

      var form = new LSD.Widget({tag: 'form'});
      root.appendChild(form);

      var button1 = new LSD.Widget({tag: 'button'});
      form.appendChild(button1);
      var button2 = new LSD.Widget({tag: 'button'});
      form.appendChild(button2);

      root.match("form button + button", function(){
        bool = true;
      });

      expect(bool).toBeTruthy();
    });
  });

  describe("when custom referential combinators are used", function() {
    describe ("and & combinator is given", function() {
      it ("should relate to the widget itself", function() {
        var form = new LSD.Widget({tag: 'form'});
        var button = new LSD.Widget({tag: 'button'});
        button.inject(form);
        var favoured, found;
        var callback = function(widget, state) {
          favoured = state;
          found = widget;
        };
        form.match('&:favoured', callback);
        expect(favoured).toBeFalsy();
        expect(found).toBeFalsy();
        form.addPseudo('favoured');
        button.addPseudo('favoured');
        expect(favoured).toBeTruthy();
        expect(found).toEqual(form);
        form.removePseudo('favoured');
        button.removePseudo('favoured');
        expect(favoured).toBeFalsy();
        expect(found).toEqual(form);
        form.unmatch('&:favoured', callback);
        form.addPseudo('favoured');
        button.addPseudo('favoured');
        expect(favoured).toBeFalsy();
      });
    })
    
    describe("and && combinator is given", function() {
      it ("should relate to the root widget", function() {
        var form = new LSD.Widget({
          tag: 'form',
          pseudos: ['root'],
          document: Factory('document')
        });
        var button = new LSD.Widget({tag: 'button'});
        var callback = function(widget, state) {
          working = state;
          found = widget;
        };
        var working, found;
        button.match('&&:working', callback);
        expect(working).toBeFalsy();
        button.inject(form);
        expect(working).toBeFalsy();
        expect(found).toBeFalsy();
        form.addPseudo('working')
        expect(working).toBeTruthy();
        expect(found).toEqual(form);
        form.removePseudo('working')
        expect(working).toBeFalsy();
        form.addPseudo('working');
        expect(working).toBeTruthy();
        button.dispose();
        expect(working).toBeFalsy();
        //button.inject(form);
        //expect(working).toBeTruthy();
        //form.removePseudo('working')
        //expect(working).toBeFalsy();
      })
    })
  })

});