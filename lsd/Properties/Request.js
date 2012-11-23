describe('LSD.Request', function() {
  
  describe('#negotiate', function() {
    describe('when not given qualities', function() {
      it ('should choose first type that matches', function() {
        var resource = new LSD.Request;
        expect(resource.negotiate('text/html, text/xml', ['text/html'])).toBe('text/html')
        expect(resource.negotiate('text/html, text/xml', ['text/xml'])).toBe('text/xml')
        expect(resource.negotiate('text/html, text/xml', ['text/xml'])).toBe('text/xml')
        expect(resource.negotiate('*/html, text/xml', ['text/xml'])).toBe('text/xml')
        expect(resource.negotiate('text/html, */xml', ['text/xml'])).toBe('text/xml')
        expect(resource.negotiate('*/html, */xml', ['text/xml'])).toBe('text/xml')
        expect(resource.negotiate('*/*, */xml', ['text/xml'])).toBe('text/xml')
        expect(resource.negotiate('*/xml, */*', ['text/xml'])).toBe('text/xml')
        expect(resource.negotiate('*/*', ['text/xml'])).toBe('text/xml')
      })
    })
    describe('when given qualities', function() {
      describe('and only one matches', function() {
        it ('should ignore qualities and choose matching variant', function() {
          var resource = new LSD.Request;
          expect(resource.negotiate('text/html; q=0.5, text/xml; q=1', ['text/html'])).toBe('text/html')
          expect(resource.negotiate('text/html; q=1, text/xml; q=0.5', ['text/html'])).toBe('text/html')
          expect(resource.negotiate('text/html; q=0.5, text/xml; q=1', ['text/xml'])).toBe('text/xml')
          expect(resource.negotiate('text/html; q=1, text/xml; q=0.5', ['text/xml'])).toBe('text/xml')
          expect(resource.negotiate('*/html; q=0.5, */xml; q=1', ['text/html'])).toBe('text/html')
          expect(resource.negotiate('*/html; q=1, */xml; q=0.5', ['text/html'])).toBe('text/html')
          expect(resource.negotiate('*/html; q=0.5, */xml; q=1', ['text/xml'])).toBe('text/xml')
          expect(resource.negotiate('*/html; q=1, */xml; q=0.5', ['text/xml'])).toBe('text/xml')
          expect(resource.negotiate('text/*; q=0.5, text/*; q=1', ['text/html'])).toBe('text/html')
          expect(resource.negotiate('text/*; q=1, text/*; q=0.5', ['text/html'])).toBe('text/html')
          expect(resource.negotiate('text/*; q=0.5, text/*; q=1', ['text/xml'])).toBe('text/xml')
          expect(resource.negotiate('text/*; q=1, text/*; q=0.5', ['text/xml'])).toBe('text/xml')
          expect(resource.negotiate('*/*; q=0.5, */*; q=1', ['text/html'])).toBe('text/html')
          expect(resource.negotiate('*/*; q=1, */*; q=0.5', ['text/html'])).toBe('text/html')
          expect(resource.negotiate('*/*; q=0.5, */*; q=1', ['text/xml'])).toBe('text/xml')
          expect(resource.negotiate('*/*; q=1, */*; q=0.5', ['text/xml'])).toBe('text/xml')
          expect(resource.negotiate('*/html; q=0.5, text/xml; q=1', ['text/html'])).toBe('text/html')
          expect(resource.negotiate('text/*; q=1, */*; q=0.5', ['text/html'])).toBe('text/html')
          expect(resource.negotiate('*/*; q=0.5, */xml; q=1', ['text/xml'])).toBe('text/xml')
          expect(resource.negotiate('*/html; q=1, text/*; q=0.5', ['text/xml'])).toBe('text/xml')
        })
      })
      describe('and multiple types match', function() {
        it ('should return the one with higher quality', function() {
          var resource = new LSD.Request;
          expect(resource.negotiate('text/html; q=1, text/xml; q=0.5', ['text/html', 'text/xml'])).toBe('text/html')
          expect(resource.negotiate('text/xml; q=0.5, text/html; q=1', ['text/html', 'text/xml'])).toBe('text/html')
          expect(resource.negotiate('text/html, text/xml; q=0.5', ['text/html', 'text/xml'])).toBe('text/html')
          expect(resource.negotiate('text/xml; q=0.5, text/html', ['text/html', 'text/xml'])).toBe('text/html')
          expect(resource.negotiate('*/html; q=1, */xml; q=0.5', ['text/html', 'text/xml'])).toBe('text/html')
          expect(resource.negotiate('*/xml; q=0.5, */html; q=1', ['text/html', 'text/xml'])).toBe('text/html')
          expect(resource.negotiate('*/html, */xml; q=0.5', ['text/html', 'text/xml'])).toBe('text/html')
          expect(resource.negotiate('*/xml; q=0.5, */html', ['text/html', 'text/xml'])).toBe('text/html')
          expect(resource.negotiate('text/*; q=1, text/*; q=0.5', ['text/html', 'text/xml'])).toBe('text/html')
          expect(resource.negotiate('text/*; q=0.5, text/*; q=1', ['text/html', 'text/xml'])).toBe('text/html')
          expect(resource.negotiate('text/*, text/*; q=0.5', ['text/html', 'text/xml'])).toBe('text/html')
          expect(resource.negotiate('text/*; q=0.5, text/*', ['text/html', 'text/xml'])).toBe('text/html')
          expect(resource.negotiate('*/*; q=1, */*; q=0.5', ['text/html', 'text/xml'])).toBe('text/html')
          expect(resource.negotiate('*/*; q=0.5, */*; q=1', ['text/html', 'text/xml'])).toBe('text/html')
          expect(resource.negotiate('*/*, */*; q=0.5', ['text/html', 'text/xml'])).toBe('text/html')
          expect(resource.negotiate('*/*; q=0.5, */*', ['text/html', 'text/xml'])).toBe('text/html')
          expect(resource.negotiate('*/html; q=0.5, text/xml; q=1', ['text/html', 'text/xml'])).toBe('text/xml')
          expect(resource.negotiate('text/*; q=1, */*; q=0.5', ['text/html', 'text/xml'])).toBe('text/html')
          expect(resource.negotiate('*/*; q=0.5, */xml; q=1', ['text/html', 'text/xml'])).toBe('text/xml')
          expect(resource.negotiate('*/html; q=1, text/*; q=0.5', ['text/html', 'text/xml'])).toBe('text/html')
        })
      })
    })
  })
})