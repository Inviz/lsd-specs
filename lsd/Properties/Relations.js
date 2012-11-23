describe('LSD.Relation', function() {
  describe('when relation has defined options', function() {
    it ('should apply options to related widgets before or after options were given', function() {
      var relation = new LSD.Relation
      var parent = new LSD.Element({related: relation});
      var child = new LSD.Element, other = new LSD.Element;
      parent.set('related', relation);
      relation.push(child);
      parent.mix('related', {
        attributes: {
          title: "HEY"
        }
      });
      expect(child.attributes.title).toEqual('HEY')
      relation.push(other);
      expect(other.attributes.title).toEqual('HEY')
      relation.pop()
      expect(other.attributes.title).toBeUndefined()
      relation.pop()
      expect(child.attributes.title).toBeUndefined()
    })
  });
  describe('when relation uses match option to find related widgets', function() {
    it ('should observe DOM and add elements to relation as they are found', function() {
      var relation = new LSD.Relation({
        match: 'a'
      })
      var parent = new LSD.Element({related: relation});
      var a = new LSD.Element('a');
      var b = new LSD.Element('b');
      debugger
      parent.appendChild(a);
      expect(relation.slice()).toEqual([a])
      parent.appendChild(b);
      a.set('tagName', 'z');
      expect(relation.slice()).toEqual([])
      b.set('tagName', 'a');
      expect(relation.slice()).toEqual([b])
      a.set('tagName', 'a');
      expect(relation.slice()).toEqual([a, b])
      parent.unset('related', relation);
      expect(relation._owner).toBeUndefined()
      expect(relation.slice()).toEqual([])
      parent.set('related', relation)
      expect(relation._owner).toBe(parent)
      expect(relation.slice()).toEqual([a, b])
      b.set('tagName', 'b')
      expect(relation.slice()).toEqual([a])
      relation.change('match', 'b')
      expect(relation.slice()).toEqual([b])
      parent.set('related.attributes.title', 'hey')
      expect(b.attributes.title).toBe('hey')
      b.set('tagName', 'a')
      expect(b.attributes.title).toBeUndefined();
      a.set('tagName', 'b')
      expect(a.attributes.title).toBe('hey')
      relation.set('attributes.alt', 'oyy')
      expect(a.attributes.alt).toBe('oyy')
      relation.set('tabindex', 3)
      expect(a.tabindex).toBe(3)
      b.set('tagName', 'b')
      expect(b.tabindex).toBe(3)
      expect(b.attributes.alt).toBe('oyy')
      expect(b.attributes.title).toBe('hey')
      b.set('tagName', 'a')
      expect(b.tabindex).toBeUndefined()
    });
  })
});