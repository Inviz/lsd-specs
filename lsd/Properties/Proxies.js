describe("LSD.Properties.Proxies", function() {
  describe('when a proxy is set', function() {
    describe('with a key text', function() {
      it ("should proxy all text nodes", function() {
        var container = new LSD.Element;
        var target = new LSD.Element;
        var element = new LSD.Element;
        var textnode = new LSD.Textnode, textnode2 = new LSD.Textnode, textnode3 = new LSD.Textnode;
        container.mix('proxies', {text: target})
        container.childNodes.push(element, textnode);
        expect(container.childNodes.slice()).toEqual([element]);
        expect(target.childNodes.slice()).toEqual([textnode]);
        container.appendChild(textnode2)
        expect(target.childNodes.slice()).toEqual([textnode, textnode2]);
        container.proxies.unset('text', target);
        container.appendChild(textnode3)
        expect(container.childNodes.slice()).toEqual([element, textnode3]);
        expect(target.childNodes.slice()).toEqual([textnode, textnode2]);
      })
    });
    describe('with a key 3', function() {
      it ("should proxy all text nodes", function() {
        var container = new LSD.Element;
        var target = new LSD.Element;
        var element = new LSD.Element;
        var textnode = new LSD.Textnode, textnode2 = new LSD.Textnode, textnode3 = new LSD.Textnode;
        container.mix('proxies', {3: target})
        container.childNodes.push(element, textnode);
        expect(container.childNodes.slice()).toEqual([element]);
        expect(target.childNodes.slice()).toEqual([textnode]);
        container.appendChild(textnode2)
        expect(target.childNodes.slice()).toEqual([textnode, textnode2]);
        container.proxies.unset('text', target);
        container.appendChild(textnode3)
        expect(container.childNodes.slice()).toEqual([element, textnode3]);
        expect(target.childNodes.slice()).toEqual([textnode, textnode2]);
      })
    });
    describe('with a key element', function() {
      it ("should proxy all text nodes", function() {
        var container = new LSD.Element;
        var target = new LSD.Element;
        var element = new LSD.Element, element2 = new LSD.Element, element3 = new LSD.Element;
        var textnode = new LSD.Textnode
        container.mix('proxies', {element: target})
        container.childNodes.push(element, textnode);
        expect(container.childNodes.slice()).toEqual([textnode]);
        expect(target.childNodes.slice()).toEqual([element]);
        container.appendChild(element2)
        expect(target.childNodes.slice()).toEqual([element, element2]);
        container.proxies.unset('element', target);
        container.appendChild(element3)
        expect(container.childNodes.slice()).toEqual([textnode, element3]);
        expect(target.childNodes.slice()).toEqual([element, element2]);
      })
    });
    describe('with a key 1', function() {
      it ("should proxy all text nodes", function() {
        var container = new LSD.Element;
        var target = new LSD.Element;
        var element = new LSD.Element, element2 = new LSD.Element;
        var textnode = new LSD.Textnode
        container.mix('proxies', {1: target})
        container.childNodes.push(element, textnode);
        expect(container.childNodes.slice()).toEqual([textnode]);
        expect(target.childNodes.slice()).toEqual([element]);
        container.appendChild(element2)
        expect(target.childNodes.slice()).toEqual([element, element2]);
      })
    });
    describe('with a selector string key', function() {
      it ("should proxy all elements that match the selector", function() {
        
      })
    });
  })
})