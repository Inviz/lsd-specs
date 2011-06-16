describe("LSD.Module.Ambient.DOM", function() {
  if (!LSD.document) new LSD.Document;
  LSD.Widget.Root = new Class({
    options: {
      tag: 'root',
      pseudos: ['root'],
      document: LSD.document
    }
  });
  describe("#dom manipulations", function() {
    
    it ("contains", function() {
      var root = new LSD.Widget({tag: 'root'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'pane'});

      root.appendChild(pane1);
      expect(root.contains(pane1)).toBeTruthy();
      expect(pane1.sourceIndex).toEqual(2)

      root.removeChild(pane1);
      root.appendChild(pane2);
      expect(root.sourceIndex).toEqual(1);
      expect(pane2.sourceIndex).toEqual(2);
      expect(root.contains(pane1)).toBeFalsy();

      pane2.appendChild(pane1);
      expect(root.contains(pane1)).toBeTruthy();
      expect(pane2.sourceIndex).toEqual(2);
      expect(pane1.sourceIndex).toEqual(3);
    });

    it ("getChildren", function() {
      var root = new LSD.Widget({tag: 'root'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      pane1.addClass("first");

      var pane2 = new LSD.Widget({tag: 'pane'});
      pane2.addClass("second");

      var pane3 = new LSD.Widget({tag: 'pane'});
      pane3.addClass("second");


      root.appendChild(pane1);
      root.appendChild(pane2);
      expect(root.getChildren()).toEqual([pane1,pane2]);

      root.appendChild(pane3);
      expect(root.getChildren()).toEqual([pane1,pane2, pane3]);

      root.removeChild(pane1);
      expect(root.getChildren()).toEqual([pane2, pane3]);

      pane3.appendChild(pane1);
      expect(root.getChildren()).toEqual([pane2, pane3]);
    });

    it ("getRoot", function() {
      var root = new LSD.Widget({tag: 'root'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'pane'});
      var pane3 = new LSD.Widget({tag: 'pane'});

      root.appendChild(pane1);
      pane1.appendChild(pane2);
      pane2.appendChild(pane3);  // d > 1 > 2 > 3
      expect(pane1.getRoot()).toEqual(root);
      expect(pane2.getRoot()).toEqual(root);
      expect(pane3.getRoot()).toEqual(root);

      root.removeChild(pane1); // d & 1 > 2 > 3
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


    describe ("setParent", function() {
      it ("should set properties right", function() {
        var root = new LSD.Widget({tag: 'root'});

        var pane1 = new LSD.Widget({tag: 'pane'});
        var pane2 = new LSD.Widget({tag: 'pane'});
        var pane3 = new LSD.Widget({tag: 'pane'});

        root.appendChild(pane1);
        expect(root.firstChild).toEqual(pane1); 
        expect(root.lastChild).toEqual(pane1);
        expect(pane1.previousSibling).toBeUndefined();
        expect(pane1.nextSibling).toBeUndefined();

        root.appendChild(pane2);
        expect(root.firstChild).toEqual(pane1);  
        expect(root.lastChild).toEqual(pane2);
        expect(pane1.previousSibling).toBeUndefined();
        expect(pane1.nextSibling).toEqual(pane2);  
        expect(pane2.previousSibling).toEqual(pane1);  
        expect(pane2.nextSibling).toBeUndefined();

        root.appendChild(pane3);
        expect(root.firstChild).toEqual(pane1);  
        expect(root.lastChild).toEqual(pane3);
        expect(pane1.previousSibling).toBeUndefined();
        expect(pane1.nextSibling).toEqual(pane2);   
        expect(pane2.previousSibling).toEqual(pane1);  
        expect(pane2.nextSibling).toEqual(pane3);  
        expect(pane3.previousSibling).toEqual(pane2);  
        expect(pane3.nextSibling).toBeUndefined();
      })
      
      xit ("should keep sourceIndex", function() {
        
        var root = new LSD.Widget({tag: 'root'});

        var pane1 = new LSD.Widget({tag: 'pane'});
        var pane2 = new LSD.Widget({tag: 'pane'});
        var pane3 = new LSD.Widget({tag: 'pane'});
        
        pane2.appendChild(pane3);
        expect(pane2.sourceIndex).toEqual(1);
        expect(pane3.sourceIndex).toEqual(2);
        expect(pane2.sourceLastIndex).toEqual(2);
        expect(pane3.sourceLastIndex).toBeFalsy();
        
        root.appendChild(pane2)
        expect(root.sourceLastIndex).toEqual(3);
        expect(root.sourceIndex).toEqual(1);
        expect(pane2.sourceIndex).toEqual(2);
        expect(pane2.sourceLastIndex).toEqual(3);
        expect(pane3.sourceIndex).toEqual(3);
        expect(pane3.sourceLastIndex).toBeFalsy();
        
        expect(pane2.sourceLastIndex).toEqual(3);
        root.appendChild(pane1);
        expect(root.sourceLastIndex).toEqual(4);
        expect(pane1.sourceIndex).toEqual(4);
        
        var rooty = new LSD.Widget({tag: 'root'});
        rooty.appendChild(root);
        expect(rooty.sourceLastIndex).toEqual(5);
        expect(rooty.sourceIndex).toEqual(1);
        expect(root.sourceLastIndex).toEqual(5);
        expect(root.sourceIndex).toEqual(2);
        expect(pane2.sourceIndex).toEqual(3);
        expect(pane2.sourceLastIndex).toEqual(4);
        expect(pane3.sourceIndex).toEqual(4);
        expect(pane3.sourceLastIndex).toBeFalsy();
        
        var pane4 = new LSD.Widget({tag: 'kane'});
        pane2.appendChild(pane4);
        expect(rooty.sourceLastIndex).toEqual(6);
        expect(rooty.sourceIndex).toEqual(1);
        expect(root.sourceLastIndex).toEqual(6);
        expect(root.sourceIndex).toEqual(2);
        expect(pane1.sourceIndex).toEqual(5);
        expect(pane2.sourceIndex).toEqual(3);
        expect(pane2.sourceLastIndex).toEqual(5);
        expect(pane3.sourceLastIndex).toBeFalsy();
        expect(pane3.sourceIndex).toEqual(6);
        expect(pane4.sourceIndex).toEqual(4);
        
        expect(rooty.expectations.tag.pane.map(function(e) { return e.sourceIndex})).toEqual([])
      })
    });
    

    it ("unsetParent", function() {
      var root = new LSD.Widget({tag: 'root'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'pane'});
      var pane3 = new LSD.Widget({tag: 'pane'});

      root.appendChild(pane1);
      root.appendChild(pane2);
      root.appendChild(pane3);

      root.removeChild(pane3);
      expect(root.firstChild).toEqual(pane1);
      expect(root.lastChild).toEqual(pane2);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toEqual(pane2);
      expect(pane2.previousSibling).toEqual(pane1);
      expect(pane2.nextSibling).toBeUndefined();

      root.removeChild(pane2);
      expect(root.firstChild).toEqual(pane1);
      expect(root.lastChild).toEqual(pane1);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toBeUndefined();

      root.removeChild(pane1);
      expect(root.firstChild).toBeUndefined();
      expect(root.lastChild).toBeUndefined();

      expect(pane1.getRoot()).toEqual(pane1);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toBeUndefined();

    });


    it ("appendChild", function() {
      var root = new LSD.Widget({tag: 'root'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'pane'});
      var pane3 = new LSD.Widget({tag: 'pane'});

      root.appendChild(pane1);
      expect(root.firstChild).toEqual(pane1);
      expect(root.lastChild).toEqual(pane1);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toBeUndefined();

      root.appendChild(pane2);
      expect(root.firstChild).toEqual(pane1);
      expect(root.lastChild).toEqual(pane2);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toEqual(pane2);
      expect(pane2.previousSibling).toEqual(pane1);
      expect(pane2.nextSibling).toBeUndefined();

      root.appendChild(pane3);
      expect(root.firstChild).toEqual(pane1);
      expect(root.lastChild).toEqual(pane3);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toEqual(pane2);
      expect(pane2.previousSibling).toEqual(pane1);
      expect(pane2.nextSibling).toEqual(pane3);
      expect(pane3.previousSibling).toEqual(pane2);
      expect(pane3.nextSibling).toBeUndefined();

    });

    it ("removeChild", function() {
      var root = new LSD.Widget({tag: 'root'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'pane'});
      var pane3 = new LSD.Widget({tag: 'pane'});

      root.appendChild(pane1);
      root.appendChild(pane2);
      root.appendChild(pane3);

      root.removeChild(pane3);
      expect(root.firstChild).toEqual(pane1);
      expect(root.lastChild).toEqual(pane2);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toEqual(pane2);
      expect(pane2.previousSibling).toEqual(pane1);
      expect(pane2.nextSibling).toBeUndefined();

      root.removeChild(pane2);
      expect(root.firstChild).toEqual(pane1);
      expect(root.lastChild).toEqual(pane1);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toBeUndefined();

      root.removeChild(pane1);
      expect(root.firstChild).toBeUndefined();
      expect(root.lastChild).toBeUndefined();

      expect(pane1.getRoot()).toEqual(pane1);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toBeUndefined();

    });

    it ("insertBefore", function() {
      var root = new LSD.Widget({tag: 'root'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'label'});
      var pane3 = new LSD.Widget({tag: 'textbox'});

      root.appendChild(pane3);
      root.insertBefore(pane1, pane3);
      expect(root.firstChild).toEqual(pane1);
      expect(root.lastChild).toEqual(pane3);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toEqual(pane3);
      expect(pane3.previousSibling).toEqual(pane1);
      expect(pane3.nextSibling).toBeUndefined();
      root.insertBefore(pane2, pane3);
      expect(root.firstChild).toEqual(pane1);
      expect(root.lastChild).toEqual(pane3);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toEqual(pane2);
      expect(pane2.previousSibling).toEqual(pane1);
      expect(pane2.nextSibling).toEqual(pane3);
      expect(pane3.previousSibling).toEqual(pane2);
      expect(pane3.nextSibling).toBeUndefined();

    });

    it ("replaceChild", function() {
      var root = new LSD.Widget({tag: 'root'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'pane'});

      root.appendChild(pane1);
      root.replaceChild(pane2, pane1);
      expect(root.firstChild).toEqual(pane2);
      expect(root.lastChild).toEqual(pane2);
      expect(pane2.previousSibling).toBeUndefined();
      expect(pane2.nextSibling).toBeUndefined();

    });

    it ("replaceChild", function() {
      var root = new LSD.Widget({tag: 'root'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'pane'});
      var pane3 = new LSD.Widget({tag: 'pane'});
      var pane4 = new LSD.Widget({tag: 'pane'});

      root.appendChild(pane1);
      root.appendChild(pane4);
      root.appendChild(pane3);

      root.replaceChild(pane2, pane4);
      
      expect(root.firstChild).toEqual(pane1);
      expect(root.lastChild).toEqual(pane3);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toEqual(pane2);
      expect(pane2.previousSibling).toEqual(pane1);
      expect(pane2.nextSibling).toEqual(pane3);
      expect(pane3.previousSibling).toEqual(pane2);
      expect(pane3.nextSibling).toBeUndefined();

    });

    it ("inject horizontal", function() {
      var root = new LSD.Widget({tag: 'root'});

      var pane1 = new LSD.Widget({tag: 'pane1'});
      var pane2 = new LSD.Widget({tag: 'pane2'});
      var pane3 = new LSD.Widget({tag: 'pane3'});

      root.appendChild(pane2);
      pane1.inject(pane2, "before");
      pane3.inject(pane2, "after");
      expect(root.firstChild).toEqual(pane1);
      expect(root.lastChild).toEqual(pane3);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toEqual(pane2);
      expect(pane2.previousSibling).toEqual(pane1);
      expect(pane2.nextSibling).toEqual(pane3);
      expect(pane3.previousSibling).toEqual(pane2);
      expect(pane3.nextSibling).toBeUndefined();

    });

    it ("inject vertical", function() {
      var root = new LSD.Widget({tag: 'root'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'pane'});
      var pane3 = new LSD.Widget({tag: 'pane'});

      root.appendChild(pane1);
      pane2.inject(pane1, "top");
      pane3.inject(pane2, "bottom");

      expect(root.firstChild).toEqual(pane1);
      expect(pane1.firstChild).toEqual(pane2);
      expect(pane2.firstChild).toEqual(pane3);
    });


  });


});