describe("LSD.Properties.Matches", function() {
  describe("when given a selector and a callback", function() {
    it ("should store the callback by a parsed selector", function() {
      var matches = new LSD.Properties.Matches;
      var index = 0;
      var callback = function(widget, old) {
        index += widget ? 1 : -1;
      };
      var button = new LSD.Object({
        lsd: true,
        tagName: 'button',
        matches: new LSD.Properties.Matches
      });
      var link = new LSD.Element({
        lsd: true,
        tagName: 'a',
        matches: new LSD.Properties.Matches
      })
      matches.set('button + a', callback);
      expect(matches._callbacks[' ']['button'][0][0]).toEqual(Slick.parse('button + a').expressions[0][0])
      expect(matches._callbacks[' ']['button'][0][1].expressions).toEqual(Slick.parse('button + a').expressions[0])
      expect(matches._callbacks[' ']['button'][0][1].index).toEqual(1)
      expect(matches._callbacks[' ']['button'][0][1].callback).toEqual(callback);
      expect(matches._callbacks[' ']['button'].length).toEqual(1)
      expect(button.matches._callbacks).toBeFalsy();
      matches.add(' ', 'button', button);
      expect(button.matches._callbacks['+']['a'].length).toEqual(1)
      expect(button.matches._callbacks['+']['a'][0][0]).toEqual(Slick.parse('button + a').expressions[0][1])
      expect(index).toEqual(0)
      button.matches.add('+', 'a', link);
      expect(index).toEqual(1);
      matches.unset('button + a', callback);
      expect(matches._callbacks[' ']['button'].length).toEqual(0)
      expect(button.matches._callbacks['+']['a'].length).toEqual(0)
      expect(matches._callbacks[' ']['button']).toEqual([]);
      expect(matches._callbacks['+']).toBeFalsy();
      expect(index).toEqual(0);
      matches.set('button + a', callback);
      expect(matches._callbacks[' ']['button'].length).toEqual(1)
      expect(button.matches._callbacks['+']['a'].length).toEqual(1)
      expect(index).toEqual(1);
      matches.remove(' ', 'button', button);
      expect(index).toEqual(0);
      expect(button.matches._callbacks['+']['a'].length).toEqual(0);
      expect(matches._callbacks[' ']['button'].length).toEqual(1);
      matches.add(' ', 'button', button);
      expect(index).toEqual(1);
      expect(button.matches._callbacks['+']['a'].length).toEqual(1);
      expect(matches._callbacks[' ']['button'].length).toEqual(1);
      button.matches.remove('+', 'a', link);
      expect(index).toEqual(0);
      expect(button.matches._callbacks['+']['a'].length).toEqual(1);
      expect(matches._callbacks[' ']['button'].length).toEqual(1);
      matches.unset('button + a', callback);
      expect(button.matches._callbacks['+']['a'].length).toEqual(0);
      expect(matches._callbacks[' ']['button'].length).toEqual(0);
    });
    
    describe('and expression contains', function() {
      describe('space combinator', function() {
        it ('should match direct and indirect children', function() {
          var grandparent = new LSD.Element;
          var parent = new LSD.Element({tagName: 'a'})
          var a = new LSD.Element({tagName: 'a'})
          var b = new LSD.Element({tagName: 'b'})
          var index = 0;
          grandparent.matches.set('a', function(value, old) {
            if (value) index ++;
            if (old) index--;
          });
          grandparent.appendChild(parent);
          expect(index).toEqual(1)
          parent.appendChild(a)
          expect(index).toEqual(2)
          parent.appendChild(b)
          expect(index).toEqual(2)
          parent.removeChild(a)
          expect(index).toEqual(1)
          parent.appendChild(a)
          expect(index).toEqual(2)
          grandparent.removeChild(parent);
          expect(index).toEqual(0)
        })
      })
      describe('+', function() {
        it ('should match siblings following immediately after', function() {
          var parent = new LSD.Element;
          var a = new LSD.Element('a');
          var b = new LSD.Element('b');
          var c = new LSD.Element('c');
          var index = 0, last;
          a.matches.set('+ b', function(value, old) {
            if (value) last = value;
            if (value) index ++;
            if (old) index--;
          })
          parent.appendChild(a)
          parent.appendChild(b)
          expect(index).toEqual(1)
          parent.appendChild(c);
          expect(index).toEqual(1)
          parent.removeChild(b);
          expect(index).toEqual(0)
          c.set('tagName', 'b')
          expect(index).toEqual(1)
          c.set('tagName', 'c')
          expect(index).toEqual(0)
          c.set('tagName', 'b')
          expect(index).toEqual(1)
          parent.insertBefore(new LSD.Textnode, c)
          expect(index).toEqual(1)
          expect(last).toEqual(c)
          parent.insertBefore(b, c)
          expect(index).toEqual(1)
          expect(last).toEqual(b)
          parent.removeChild(a)
          expect(index).toEqual(0)
        })
      });
      describe('!+ combinator', function() {
        it ('should match sibling elements preceding immediately before the node', function() {
          var parent = new LSD.Element;
          var a = new LSD.Element('a');
          var b = new LSD.Element('b');
          var c = new LSD.Element('c');
          var index = 0, last;
          c.matches.set('!+ b', function(value, old) {
            if (value) last = value;
            if (value) index ++;
            if (old) index--;
          })
          parent.appendChild(a)
          parent.appendChild(b)
          parent.appendChild(c);
          expect(index).toEqual(1)
          parent.removeChild(b);
          expect(index).toEqual(0)
          a.set('tagName', 'b')
          expect(index).toEqual(1)
          a.set('tagName', 'c')
          expect(index).toEqual(0)
          a.set('tagName', 'b')
          expect(index).toEqual(1)
          parent.insertBefore(new LSD.Textnode, a)
          expect(index).toEqual(1)
          expect(last).toEqual(a)
          parent.insertBefore(b, c)
          expect(index).toEqual(1)
          expect(last).toEqual(b)
          parent.removeChild(c)
          expect(index).toEqual(0)
          parent.appendChild(c)
          expect(index).toEqual(1)
        })
      });
      describe('space combinator', function() {
        it ('should match all nested elements', function() {
          var grandparent = new LSD.Element;
          var parent = new LSD.Element('div');
          var a1 = new LSD.Element('a');
          var a2 = new LSD.Element('a');
          grandparent.appendChild(parent);
          grandparent.appendChild(a1);
          var index = 0, last;
          grandparent.matches.set('a', function(value, old) {
            if (value) last = value;
            if (value) index ++;
            if (old) index--;
          })
          expect(last).toEqual(a1);
          expect(index).toEqual(1);
          a1.set('tagName', 'b')
          expect(index).toEqual(0);
          parent.appendChild(a2)
          expect(index).toEqual(1);
          expect(last).toEqual(a2);
          a2.set('tagName', 'b')
          expect(index).toEqual(0);
          a2.set('tagName', 'a')
          expect(index).toEqual(1);
          a1.set('tagName', 'a')
          expect(index).toEqual(2);
          expect(last).toEqual(a1);
        })
      })
      describe('! combinator', function() {
        it ('should match all parent elements', function() {
          var grandparent = new LSD.Element('div');
          var parent = new LSD.Element('div');
          var a = new LSD.Element('a');
          grandparent.appendChild(parent);
          grandparent.appendChild(a);
          var index = 0, last;
          a.matches.set('! div', function(value, old) {
            if (value) last = value;
            if (value) index ++;
            if (old) index--;
          })
          expect(last).toEqual(grandparent);
          expect(index).toEqual(1);
          grandparent.set('tagName', 'em')
          expect(index).toEqual(0);
          parent.appendChild(a)
          expect(index).toEqual(1);
          expect(last).toEqual(parent);
          parent.set('tagName', 'em')
          expect(index).toEqual(0);
          parent.set('tagName', 'div')
          expect(index).toEqual(1);
          grandparent.set('tagName', 'div')
          expect(index).toEqual(2);
          expect(last).toEqual(grandparent);
          grandparent.removeChild(parent);
          expect(index).toEqual(1);
          parent.removeChild(a);
          expect(index).toEqual(0);
          grandparent.appendChild(a)
          expect(index).toEqual(1);
          parent.appendChild(grandparent)
          expect(index).toEqual(2);
          parent.appendChild(a)
          expect(index).toEqual(1);
        })
      })
      describe('!> combinator', function() {
        it ('should match direct parent element', function() {
          var grandparent = new LSD.Element('div');
          var parent = new LSD.Element('div');
          var a = new LSD.Element('a');
          grandparent.appendChild(parent);
          grandparent.appendChild(a);
          var index = 0, last;
          a.matches.set('!> div', function(value, old) {
            if (value) last = value;
            if (value) index ++;
            if (old) index--;
          })
          expect(last).toEqual(grandparent);
          expect(index).toEqual(1);
          grandparent.set('tagName', 'em')
          expect(index).toEqual(0);
          parent.appendChild(a)
          expect(index).toEqual(1);
          expect(last).toEqual(parent);
          parent.set('tagName', 'em')
          expect(index).toEqual(0);
          parent.set('tagName', 'div')
          expect(index).toEqual(1);
          grandparent.set('tagName', 'div')
          expect(index).toEqual(1);
          expect(last).toEqual(parent);
          grandparent.removeChild(parent);
          expect(index).toEqual(1);
          parent.removeChild(a);
          expect(index).toEqual(0);
          grandparent.appendChild(a)
          expect(index).toEqual(1);
          parent.appendChild(grandparent)
          grandparent.set('tagName', 'a')
          expect(index).toEqual(0);
          parent.appendChild(a)
          expect(index).toEqual(1);
        })
      });
      describe('~ combinator', function() {
        it ('should match all nodes following the node', function() {
          var parent = new LSD.Element;
          var a = new LSD.Element('a')
          var b1 = new LSD.Element('b');
          var b2 = new LSD.Element('b')
          var c = new LSD.Element('c')
          var d = new LSD.Element('d')
          var index = 0, last;
          a.matches.set('~ b', function(value, old) {
            if (value) last = value;
            if (value) index ++;
            if (old) index--;
          })
          parent.appendChild(a);
          expect(index).toEqual(0);
          parent.appendChild(b1);
          expect(index).toEqual(1);
          parent.appendChild(c);
          expect(index).toEqual(1);
          parent.appendChild(b2);
          expect(index).toEqual(2);
          parent.appendChild(d);
          b2.set('tagName', 'hr')
          expect(index).toEqual(1);
          b1.set('tagName', 'h1')
          expect(index).toEqual(0);
          b2.set('tagName', 'b')
          expect(index).toEqual(1);
          c.appendChild(b1);
          expect(c.previousElementSibling).toEqual(a)
          expect(index).toEqual(1);
          b1.set('tagName', 'b')
          expect(index).toEqual(1);
          parent.appendChild(b1);
          expect(index).toEqual(2);
          parent.insertBefore(b1, a)
          expect(index).toEqual(1);
          b1.set('tagName', 'a')
          parent.appendChild(b1);
          expect(index).toEqual(1);
          b1.set('tagName', 'b')
          expect(index).toEqual(2);
          parent.removeChild(a)
          expect(index).toEqual(0);
          parent.appendChild(a);
          expect(index).toEqual(0);
          parent.appendChild(b1);
          expect(index).toEqual(1);
          parent.appendChild(b2);
          expect(index).toEqual(2);
          parent.removeChild(a)
          expect(index).toEqual(0);
          parent.insertBefore(a, c)
          expect(index).toEqual(2);
          window.z = true;
          parent.childNodes.splice(2, 2)
          expect(index).toEqual(1);
          parent.childNodes.splice(2, 2)
          expect(index).toEqual(0);
        })
      })
      describe('!~ combinator', function() {
        it ('should match all nodes preceeding the node', function() {
          var parent = new LSD.Element;
          var a = new LSD.Element('a')
          var b1 = new LSD.Element('b');
          var b2 = new LSD.Element('b')
          var c = new LSD.Element('c')
          var d = new LSD.Element('d')
          var index = 0, last;
          d.matches.set('!~ b', function(value, old) {
            if (value) last = value;
            if (value) index ++;
            if (old) index--;
          })
          parent.appendChild(a);
          parent.appendChild(b1);
          parent.appendChild(c);
          parent.appendChild(b2);
          parent.appendChild(d);
          expect(index).toEqual(2);
          b2.set('tagName', 'hr')
          expect(index).toEqual(1);
          b1.set('tagName', 'h1')
          expect(index).toEqual(0);
          b2.set('tagName', 'b')
          expect(index).toEqual(1);
          c.appendChild(b1);
          b1.set('tagName', 'b')
          expect(index).toEqual(1);
          parent.insertBefore(b1, d);
          expect(index).toEqual(2);
          parent.appendChild(b1)
          expect(index).toEqual(1);
          b1.set('tagName', 'a')
          expect(index).toEqual(1);
          parent.appendChild(b1);
          expect(index).toEqual(1);
          b1.set('tagName', 'b')
          expect(index).toEqual(1);
          parent.insertBefore(b1, d);
          expect(index).toEqual(2);
        })
      })
      describe('~~ combinator', function() {
        it ('should match all nodes around the node', function() {
          var parent = new LSD.Element;
          var a = new LSD.Element('a')
          var b1 = new LSD.Element('b');
          var b2 = new LSD.Element('b')
          var c = new LSD.Element('c')
          var d = new LSD.Element('d')
          var index = 0, last;
          c.matches.set('~~ b', function(value, old) {
            if (value) last = value;
            if (value) index ++;
            if (old) index--;
          })
          parent.appendChild(a);
          parent.appendChild(b1);
          expect(index).toEqual(0);
          parent.appendChild(c);
          expect(index).toEqual(1);
          parent.appendChild(b2);
          expect(index).toEqual(2);
          parent.appendChild(d);
          b2.set('tagName', 'hr')
          expect(index).toEqual(1);
          b1.set('tagName', 'h1')
          expect(index).toEqual(0);
          b2.set('tagName', 'b')
          expect(index).toEqual(1);
          c.appendChild(b1);
          expect(index).toEqual(1);
          b1.set('tagName', 'b')
          expect(index).toEqual(1);
          parent.appendChild(b1);
          expect(index).toEqual(2);
          parent.insertBefore(b1, a)
          expect(index).toEqual(2)
          b1.set('tagName', 'a')
          expect(index).toEqual(1);
          parent.appendChild(b1);
          expect(index).toEqual(1);
          b1.set('tagName', 'b')
          expect(index).toEqual(2);
          parent.removeChild(c)
          expect(index).toEqual(0);
          parent.appendChild(c);
          expect(index).toEqual(2);
          parent.appendChild(b1);
          expect(index).toEqual(2);
          parent.appendChild(b2);
          expect(index).toEqual(2);
        })
      })
    })
  })
})