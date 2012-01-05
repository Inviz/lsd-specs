describe("LSD.Type.Children", function() {
  describe("when given objects", function() {
    it ("should update length", function() {
      var children = new LSD.Type.Children;
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
        var children = new LSD.Type.Children;
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
        var children = new LSD.Type.Children;
        var a = new LSD.Object({id: 'a'});
        var b = new LSD.Object({id: 'b'});;
        var c = new LSD.Object({id: 'c'});;
        var d = new LSD.Object({id: 'd'});;
        expect(children.first).toBeUndefined();
        expect(children.last).toBeUndefined();
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
        var children = new LSD.Type.Children;
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
        var children = new LSD.Type.Children;
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
        var children = new LSD.Type.Children;
        var a = new LSD.Object.Stack({id: 'a'});
        var b = new LSD.Object.Stack({id: 'b'});;
        var c = new LSD.Object.Stack({id: 'c'});;
        var d = new LSD.Object.Stack({id: 'd'});;
        expect(children.first).toBeUndefined();
        expect(children.last).toBeUndefined();
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
        var children = new LSD.Type.Children;
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
})