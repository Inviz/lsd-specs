describe('LSD.Properties.Allocations', function() {
  describe('#set', function() {
    describe('with a known key', function() {
      describe('when second argument is not given', function() {
        it ('should allocate a widget with defined options', function() {
          var widget = new LSD.Element({
            allocations: {}
          })
          var allocation = widget.allocations.get('lightbox');
          expect(widget.allocations.lightbox).toEqual(allocation);
          expect(allocation.tagName).toEqual('body');
          expect(allocation.attributes.type).toEqual('lightbox');
          widget.allocations.unset('lightbox')
          expect(widget.allocations.lightbox).toBeUndefined()
        })
      });
    })
  })
})