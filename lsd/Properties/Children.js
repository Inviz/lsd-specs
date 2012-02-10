describe("LSD.Properties.ChildNodes", function() {
  describe("when given objects", function() {
    it ("should update length", function() {
      var children = new LSD.Properties.ChildNodes;
      var a = new LSD.Object;
      var b = new LSD.Object;
      expect(children.length).toEqual(0);
      children.push(a);
      expect(children[0]).toEqual(a);
      expect(children.length).toEqual(1);
      children.push(b);
      expect(children[1]).toEqual(b);
      expect(children.length).toEqual(2);
    });
    describe("when objects are observable objects", function() {
      it ("should make the inserted objects link to previous and next object", function() {
        var children = new LSD.Properties.ChildNodes;
        var a = new LSD.Object;
        var b = new LSD.Object;
        var c = new LSD.Object;
        var d = new LSD.Object;
        expect(children.length).toEqual(0);
        expect(a.nextSibling).toBeUndefined();
        expect(a.previousSibling).toBeUndefined();
        children.push(a); //a
        expect(a.nextSibling).toBeNull();
        expect(a.previousSibling).toBeNull();
        children.push(b); //ab
        expect(a.nextSibling).toEqual(b);
        expect(a.previousSibling).toBeNull();
        expect(b.nextSibling).toBeNull();
        expect(b.previousSibling).toEqual(a);
        children.push(c); //abc
        expect(a.nextSibling).toEqual(b);
        expect(a.previousSibling).toBeNull();
        expect(b.nextSibling).toEqual(c);
        expect(b.previousSibling).toEqual(a);
        expect(c.nextSibling).toBeNull();
        expect(c.previousSibling).toEqual(b);
        children.unshift(d); //dabc
        expect(a.nextSibling).toEqual(b);
        expect(a.previousSibling).toEqual(d);
        expect(b.nextSibling).toEqual(c);
        expect(b.previousSibling).toEqual(a);
        expect(c.nextSibling).toBeNull();
        expect(c.previousSibling).toEqual(b);
        expect(d.nextSibling).toEqual(a);
        expect(d.previousSibling).toBeNull();
        children.erase(b); //dac
        expect(a.nextSibling).toEqual(c);
        expect(a.previousSibling).toEqual(d);
        expect(b.nextSibling).toBeUndefined();
        expect(b.previousSibling).toBeUndefined();
        expect(c.nextSibling).toBeNull();
        expect(c.previousSibling).toEqual(a);
        expect(d.nextSibling).toEqual(a);
        expect(d.previousSibling).toBeNull();
        children.pop(); //da
        expect(a.nextSibling).toBeNull()
        expect(a.previousSibling).toEqual(d);
        expect(c.nextSibling).toBeUndefined();
        expect(c.previousSibling).toBeUndefined();
        expect(d.nextSibling).toEqual(a);
        expect(d.previousSibling).toBeNull();
        children.shift(); //a
        expect(a.nextSibling).toBeNull()
        expect(a.previousSibling).toBeNull();
        expect(d.nextSibling).toBeUndefined();
        expect(d.previousSibling).toBeUndefined();
        children.shift(); //<empty>
        expect(a.nextSibling).toBeUndefined()
        expect(a.previousSibling).toBeUndefined();
      });
      it ("should maintain first/last links", function() {
        var children = new LSD.Properties.ChildNodes;
        var a = new LSD.Object({id: 'a'});
        var b = new LSD.Object({id: 'b'});;
        var c = new LSD.Object({id: 'c'});;
        var d = new LSD.Object({id: 'd'});;
        expect(children.first).toBeNull();
        expect(children.last).toBeNull();
        children.push(a); //a
        expect(children.first).toEqual(a);
        expect(children.last).toEqual(a);
        children.unshift(b); //ba
        expect(children.first).toEqual(b);
        expect(children.last).toEqual(a);
        children.splice(1, 0, c); //bac
        expect(children.first).toEqual(b);
        expect(children.last).toEqual(a);
        children.push(d); //bacd
        expect(children.first).toEqual(b);
        expect(children.last).toEqual(d);
        children.shift(); //cad
        expect(children.first).toEqual(c);
        expect(children.last).toEqual(d);
        children.shift(); //ad
        expect(children.first).toEqual(a);
        expect(children.last).toEqual(d);
        children.pop(); //a
        expect(children.first).toEqual(a);
        expect(children.last).toEqual(a);
        children.pop(); //
        expect(children.first).toBeNull();
        expect(children.last).toBeNull();
      });
      it ("should maintain parentNode link on each item of the array", function() {
        var children = new LSD.Properties.ChildNodes;
        var widget = new LSD.Object({
          childNodes: children
        });
        var a = new LSD.Object({id: 'a'});
        var b = new LSD.Object({id: 'b'});
        var c = new LSD.Object({id: 'c'});
        expect(a.parentNode).toBeUndefined()
        children.push(a);
        expect(a.parentNode).toEqual(widget)
        children.push(b);
        expect(b.parentNode).toEqual(widget)
        children.unshift(c);
        expect(c.parentNode).toEqual(widget)
        children.pop();
        expect(b.parentNode).toBeUndefined();
        children.pop();
        expect(a.parentNode).toBeUndefined();
        children.pop();
        expect(c.parentNode).toBeUndefined();
        children.push(c);
        expect(c.parentNode).toEqual(widget)
        children.shift();
        expect(c.parentNode).toBeUndefined();
      })
    })
    describe("when objects are stack based observable objects", function() {
      it ("should make the inserted objects link to previous and next object", function() {
        var children = new LSD.Properties.ChildNodes;
        var a = new LSD.Object.Stack;
        var b = new LSD.Object.Stack;
        var c = new LSD.Object.Stack;
        var d = new LSD.Object.Stack;
        expect(children.length).toEqual(0);
        expect(a.nextSibling).toBeUndefined();
        expect(a.previousSibling).toBeUndefined();
        children.push(a); //a
        expect(a.nextSibling).toBeNull();
        expect(a.previousSibling).toBeNull();
        children.push(b); //ab
        expect(a.nextSibling).toEqual(b);
        expect(a.previousSibling).toBeNull();
        expect(b.nextSibling).toBeNull();
        expect(b.previousSibling).toEqual(a);
        children.push(c); //abc
        expect(a.nextSibling).toEqual(b);
        expect(a.previousSibling).toBeNull();
        expect(b.nextSibling).toEqual(c);
        expect(b.previousSibling).toEqual(a);
        expect(c.nextSibling).toBeNull();
        expect(c.previousSibling).toEqual(b);
        children.unshift(d); //dabc
        expect(a.nextSibling).toEqual(b);
        expect(a.previousSibling).toEqual(d);
        expect(b.nextSibling).toEqual(c);
        expect(b.previousSibling).toEqual(a);
        expect(c.nextSibling).toBeNull();
        expect(c.previousSibling).toEqual(b);
        expect(d.nextSibling).toEqual(a);
        expect(d.previousSibling).toBeNull();
        children.erase(b); //dac
        expect(a.nextSibling).toEqual(c);
        expect(a.previousSibling).toEqual(d);
        expect(b.nextSibling).toBeUndefined();
        expect(b.previousSibling).toBeUndefined();
        expect(c.nextSibling).toBeNull();
        expect(c.previousSibling).toEqual(a);
        expect(d.nextSibling).toEqual(a);
        expect(d.previousSibling).toBeNull();
        children.pop(); //da
        expect(a.nextSibling).toBeNull()
        expect(a.previousSibling).toEqual(d);
        expect(c.nextSibling).toBeUndefined();
        expect(c.previousSibling).toBeUndefined();
        expect(d.nextSibling).toEqual(a);
        expect(d.previousSibling).toBeNull();
        children.shift(); //a
        expect(a.nextSibling).toBeNull()
        expect(a.previousSibling).toBeNull();
        expect(d.nextSibling).toBeUndefined();
        expect(d.previousSibling).toBeUndefined();
        children.shift(); //<empty>
        expect(a.nextSibling).toBeUndefined()
        expect(a.previousSibling).toBeUndefined();
      });
      
      it ("should maintain first/last links", function() {
        var children = new LSD.Properties.ChildNodes;
        var a = new LSD.Object.Stack({id: 'a'});
        var b = new LSD.Object.Stack({id: 'b'});;
        var c = new LSD.Object.Stack({id: 'c'});;
        var d = new LSD.Object.Stack({id: 'd'});;
        expect(children.first).toBeNull();
        expect(children.last).toBeNull();
        children.push(a); //a
        expect(children.first).toEqual(a);
        expect(children.last).toEqual(a);
        children.unshift(b); //ba
        expect(children.first).toEqual(b);
        expect(children.last).toEqual(a);
        children.splice(1, 0, c); //bac
        expect(children.first).toEqual(b);
        expect(children.last).toEqual(a);
        children.push(d); //bacd
        expect(children.first).toEqual(b);
        expect(children.last).toEqual(d);
        children.shift(); //cad
        expect(children.first).toEqual(c);
        expect(children.last).toEqual(d);
        children.shift(); //ad
        expect(children.first).toEqual(a);
        expect(children.last).toEqual(d);
        children.pop(); //a
        expect(children.first).toEqual(a);
        expect(children.last).toEqual(a);
        children.pop(); //
        expect(children.first).toBeNull();
        expect(children.last).toBeNull();
      });
      
      it ("should maintain parentNode link on each item of the array", function() {
        var children = new LSD.Properties.ChildNodes;
        var widget = new LSD.Object({
          childNodes: children
        });
        var a = new LSD.Object.Stack({id: 'a'});
        var b = new LSD.Object.Stack({id: 'b'});
        var c = new LSD.Object.Stack({id: 'c'});
        expect(a.parentNode).toBeUndefined()
        children.push(a);
        expect(a.parentNode).toEqual(widget)
        children.push(b);
        expect(b.parentNode).toEqual(widget)
        children.unshift(c);
        expect(c.parentNode).toEqual(widget)
        children.pop();
        expect(b.parentNode).toBeUndefined();
        children.pop();
        expect(a.parentNode).toBeUndefined();
        children.pop();
        expect(c.parentNode).toBeUndefined();
        children.push(c);
        expect(c.parentNode).toEqual(widget)
        children.shift();
        expect(c.parentNode).toBeUndefined();
      })
    })
  });
  describe("when attached to an object", function() {
    it ("should export firstChild/lastChild properties", function() {
      var children = new LSD.Properties.ChildNodes;
      var widget = new LSD.Object.Stack({
        childNodes: children
      });
      var a = new LSD.Object.Stack({id: 'a'});
      var b = new LSD.Object.Stack({id: 'b'});;
      var c = new LSD.Object.Stack({id: 'c'});;
      var d = new LSD.Object.Stack({id: 'd'});;
      expect(widget.firstChild).toBeNull();
      expect(widget.lastChild).toBeNull();
      children.push(a); //a
      expect(widget.firstChild).toEqual(a);
      expect(widget.lastChild).toEqual(a);
      children.unshift(b); //ba
      expect(widget.firstChild).toEqual(b);
      expect(widget.lastChild).toEqual(a);
      children.splice(1, 0, c); //bac
      expect(widget.firstChild).toEqual(b);
      expect(widget.lastChild).toEqual(a);
      children.push(d); //bacd
      expect(widget.firstChild).toEqual(b);
      expect(widget.lastChild).toEqual(d);
      children.shift(); //cad
      expect(widget.firstChild).toEqual(c);
      expect(widget.lastChild).toEqual(d);
      children.shift(); //ad
      expect(widget.firstChild).toEqual(a);
      expect(widget.lastChild).toEqual(d);
      children.pop(); //a
      expect(widget.firstChild).toEqual(a);
      expect(widget.lastChild).toEqual(a);
      children.pop(); //
      expect(widget.firstChild).toBeNull();
      expect(widget.lastChild).toBeNull();
      widget.unset('childNodes', children);
      expect(widget.firstChild).toBeUndefined();
      expect(widget.lastChild).toBeUndefined();
      
    })
  })
  
  describe("paired LSD.Properties.ChildNodes.Virtual", function() {
    describe("when given nodes", function() {
      it ("should transparently place the nodes from virtual collection to real children collection", function() {
        var parent = new LSD.Object({
          childNodes: new LSD.Properties.ChildNodes
        });
        var fragment = new LSD.Object({
          childNodes: new LSD.Properties.ChildNodes.Virtual
        });
        var subfragment = new LSD.Object({
          childNodes: new LSD.Properties.ChildNodes.Virtual
        });
        var a = new LSD.Object({id: 'a'});
        var b = new LSD.Object({id: 'b'});
        var c = new LSD.Object({id: 'c'});
        var d = new LSD.Object({id: 'd'});
        var e = new LSD.Object({id: 'e'});
        fragment.childNodes.push(a);
        parent.childNodes.push(fragment);
        expect(parent.childNodes.slice()).toEqual([fragment, a])
        parent.childNodes.push(e);
        expect(parent.childNodes.slice()).toEqual([fragment, a, e]);
        fragment.childNodes.push(b);
        expect(parent.childNodes.slice()).toEqual([fragment, a, b, e])
        parent.childNodes.erase(fragment);
        expect(parent.childNodes.slice()).toEqual([e])
        parent.childNodes.push(fragment);
        expect(parent.childNodes.slice()).toEqual([e, fragment, a, b])
        parent.childNodes.push(d);
        expect(parent.childNodes.slice()).toEqual([e, fragment, a, b, d])
        subfragment.childNodes.push(c);
        fragment.childNodes.push(subfragment)
        expect(parent.childNodes[0]).toEqual(e);
        expect(parent.childNodes[1]).toEqual(fragment);
        expect(parent.childNodes[2]).toEqual(a);
        expect(parent.childNodes[3]).toEqual(b);
        expect(parent.childNodes[4]).toEqual(subfragment);
        expect(parent.childNodes[5]).toEqual(c);
        expect(parent.childNodes[6]).toEqual(d);
        subfragment.childNodes.pop();
        expect(parent.childNodes[0]).toEqual(e);
        expect(parent.childNodes[1]).toEqual(fragment);
        expect(parent.childNodes[2]).toEqual(a);
        expect(parent.childNodes[3]).toEqual(b);
        expect(parent.childNodes[4]).toEqual(subfragment);
        expect(parent.childNodes[6]).toEqual(d);
      })
    })
  })
});

