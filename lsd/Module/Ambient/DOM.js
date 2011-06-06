describe("LSD.Module.Ambient.DOM", function() {
  LSD.Widget.Doc = LSD.Document;
  describe("#dom manipulations", function() {

    it ("contains", function() {
      var doc = new LSD.Widget({tag: 'doc'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'pane'});

      doc.appendChild(pane1);
      expect(doc.contains(pane1)).toBeTruthy();

      doc.removeChild(pane1);
      doc.appendChild(pane2);
      expect(doc.contains(pane1)).toBeFalsy();

      pane2.appendChild(pane1);
      expect(doc.contains(pane1)).toBeTruthy();

    });

    it ("getChildren", function() {
      var doc = new LSD.Widget({tag: 'doc'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      pane1.addClass("first");

      var pane2 = new LSD.Widget({tag: 'pane'});
      pane2.addClass("second");

      var pane3 = new LSD.Widget({tag: 'pane'});
      pane3.addClass("second");


      doc.appendChild(pane1);
      doc.appendChild(pane2);
      expect(doc.getChildren()).toEqual([pane1,pane2]);

      doc.appendChild(pane3);
      expect(doc.getChildren()).toEqual([pane1,pane2, pane3]);

      doc.removeChild(pane1);
      expect(doc.getChildren()).toEqual([pane2, pane3]);

      pane3.appendChild(pane1);
      expect(doc.getChildren()).toEqual([pane2, pane3]);
    });

    it ("getRoot", function() {
      var doc = new LSD.Widget({tag: 'doc'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'pane'});
      var pane3 = new LSD.Widget({tag: 'pane'});

      doc.appendChild(pane1);
      pane1.appendChild(pane2);
      pane2.appendChild(pane3);  // d > 1 > 2 > 3
      expect(pane1.getRoot()).toEqual(doc);
      expect(pane2.getRoot()).toEqual(doc);
      expect(pane3.getRoot()).toEqual(doc);

      doc.removeChild(pane1); // d & 1 > 2 > 3
      expect(pane1.getRoot()).toEqual(pane1);
      expect(pane2.getRoot()).toEqual(pane1);
      expect(pane3.getRoot()).toEqual(pane1);

      pane2.removeChild(pane3); // 1 > 2 & 3
      expect(pane1.contains(pane3)).toBeFalsy();

      pane3.appendChild(pane1); // 3 > 1 > 2
      expect(pane1.getRoot()).toEqual(pane3);
      expect(pane2.getRoot()).toEqual(pane3);
      expect(pane3.getRoot()).toEqual(pane3);

      // test with setParent unsetParent

    });


    it ("setParent", function() {
      var doc = new LSD.Widget({tag: 'doc'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'pane'});
      var pane3 = new LSD.Widget({tag: 'pane'});

      doc.appendChild(pane1);
      expect(doc.firstChild).toEqual(pane1); // error
      expect(doc.lastChild).toEqual(pane1);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toBeUndefined();

      doc.appendChild(pane2);
      expect(doc.firstChild).toEqual(pane1);  // error
      expect(doc.lastChild).toEqual(pane2);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toEqual(pane2);  // error
      expect(pane2.previousSibling).toEqual(pane1);  // error
      expect(pane2.nextSibling).toBeUndefined();
      
      doc.appendChild(pane3);
      expect(doc.firstChild).toEqual(pane1);  // error
      expect(doc.lastChild).toEqual(pane3);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toEqual(pane2);   // error
      expect(pane2.previousSibling).toEqual(pane1);  // error
      expect(pane2.nextSibling).toEqual(pane3);  // error
      expect(pane3.previousSibling).toEqual(pane2);  // error
      expect(pane3.nextSibling).toBeUndefined();

    });

    it ("unsetParent", function() {
      var doc = new LSD.Widget({tag: 'doc'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'pane'});
      var pane3 = new LSD.Widget({tag: 'pane'});

      doc.appendChild(pane1);
      doc.appendChild(pane2);
      doc.appendChild(pane3);

      doc.removeChild(pane3);
      expect(doc.firstChild).toEqual(pane1);
      expect(doc.lastChild).toEqual(pane2);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toEqual(pane2);
      expect(pane2.previousSibling).toEqual(pane1);
      expect(pane2.nextSibling).toBeUndefined();

      doc.removeChild(pane2);
      expect(doc.firstChild).toEqual(pane1);
      expect(doc.lastChild).toEqual(pane1);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toBeUndefined();

      doc.removeChild(pane1);
      expect(doc.firstChild).toBeUndefined();
      expect(doc.lastChild).toBeUndefined();

      expect(pane1.getRoot()).toEqual(pane1);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toBeUndefined();

    });


    it ("appendChild", function() {
      var doc = new LSD.Widget({tag: 'doc'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'pane'});
      var pane3 = new LSD.Widget({tag: 'pane'});

      doc.appendChild(pane1);
      expect(doc.firstChild).toEqual(pane1);
      expect(doc.lastChild).toEqual(pane1);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toBeUndefined();

      doc.appendChild(pane2);
      expect(doc.firstChild).toEqual(pane1);
      expect(doc.lastChild).toEqual(pane2);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toEqual(pane2);
      expect(pane2.previousSibling).toEqual(pane1);
      expect(pane2.nextSibling).toBeUndefined();

      doc.appendChild(pane3);
      expect(doc.firstChild).toEqual(pane1);
      expect(doc.lastChild).toEqual(pane3);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toEqual(pane2);
      expect(pane2.previousSibling).toEqual(pane1);
      expect(pane2.nextSibling).toEqual(pane3);
      expect(pane3.previousSibling).toEqual(pane2);
      expect(pane3.nextSibling).toBeUndefined();

    });

    it ("removeChild", function() {
      var doc = new LSD.Widget({tag: 'doc'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'pane'});
      var pane3 = new LSD.Widget({tag: 'pane'});

      doc.appendChild(pane1);
      doc.appendChild(pane2);
      doc.appendChild(pane3);

      doc.removeChild(pane3);
      expect(doc.firstChild).toEqual(pane1);
      expect(doc.lastChild).toEqual(pane2);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toEqual(pane2);
      expect(pane2.previousSibling).toEqual(pane1);
      expect(pane2.nextSibling).toBeUndefined();

      doc.removeChild(pane2);
      expect(doc.firstChild).toEqual(pane1);
      expect(doc.lastChild).toEqual(pane1);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toBeUndefined();

      doc.removeChild(pane1);
      expect(doc.firstChild).toBeUndefined();
      expect(doc.lastChild).toBeUndefined();

      expect(pane1.getRoot()).toEqual(pane1);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toBeUndefined();

    });

    it ("insertBefore", function() {
      var doc = new LSD.Widget({tag: 'doc'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'label'});
      var pane3 = new LSD.Widget({tag: 'textbox'});

      doc.appendChild(pane3);
      doc.insertBefore(pane1, pane3);
      expect(doc.firstChild).toEqual(pane1);
      expect(doc.lastChild).toEqual(pane3);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toEqual(pane3);
      expect(pane3.previousSibling).toEqual(pane1);
      expect(pane3.nextSibling).toBeUndefined();
      doc.insertBefore(pane2, pane3);
      expect(doc.firstChild).toEqual(pane1);
      expect(doc.lastChild).toEqual(pane3);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toEqual(pane2);
      expect(pane2.previousSibling).toEqual(pane1);
      expect(pane2.nextSibling).toEqual(pane3);
      expect(pane3.previousSibling).toEqual(pane2);
      expect(pane3.nextSibling).toBeUndefined();

    });

    it ("replaceChild", function() {
      var doc = new LSD.Widget({tag: 'doc'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'pane'});

      doc.appendChild(pane1);
      doc.replaceChild(pane2, pane1);
      expect(doc.firstChild).toEqual(pane2);
      expect(doc.lastChild).toEqual(pane2);
      expect(pane2.previousSibling).toBeUndefined();
      expect(pane2.nextSibling).toBeUndefined();

    });

    it ("replaceChild", function() {
      var doc = new LSD.Widget({tag: 'doc'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'pane'});
      var pane3 = new LSD.Widget({tag: 'pane'});
      var pane4 = new LSD.Widget({tag: 'pane'});

      doc.appendChild(pane1);
      doc.appendChild(pane4);
      doc.appendChild(pane3);

      doc.replaceChild(pane2, pane4);
      
      expect(doc.firstChild).toEqual(pane1);
      expect(doc.lastChild).toEqual(pane3);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toEqual(pane2);
      expect(pane2.previousSibling).toEqual(pane1);
      expect(pane2.nextSibling).toEqual(pane3);
      expect(pane3.previousSibling).toEqual(pane2);
      expect(pane3.nextSibling).toBeUndefined();

    });

    it ("inject horizontal", function() {
      var doc = new LSD.Widget({tag: 'doc'});

      var pane1 = new LSD.Widget({tag: 'pane1'});
      var pane2 = new LSD.Widget({tag: 'pane2'});
      var pane3 = new LSD.Widget({tag: 'pane3'});

      doc.appendChild(pane2);
      pane1.inject(pane2, "before");
      pane3.inject(pane2, "after");
      expect(doc.firstChild).toEqual(pane1);
      expect(doc.lastChild).toEqual(pane3);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toEqual(pane2);
      expect(pane2.previousSibling).toEqual(pane1);
      expect(pane2.nextSibling).toEqual(pane3);
      expect(pane3.previousSibling).toEqual(pane2);
      expect(pane3.nextSibling).toBeUndefined();

    });

    it ("inject vertical", function() {
      var doc = new LSD.Widget({tag: 'doc'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'pane'});
      var pane3 = new LSD.Widget({tag: 'pane'});

      doc.appendChild(pane1);
      pane2.inject(pane1, "top");
      pane3.inject(pane2, "bottom");

      expect(doc.firstChild).toEqual(pane1);
      expect(pane1.firstChild).toEqual(pane2);
      expect(pane2.firstChild).toEqual(pane3);
    });


  });


});