describe('LSD.Mixin.Datalist', function() {
  describe('#getCurrentValue', function() {
    describe('on a simple value', function() {
      it ('should return whole string', function() {
        var widget = new LSD.Widget({tag: 'input', attributes: {list: true}, pseudos: {value: true}});
        widget.toElement().inject(document.body)
        widget.element.set('value', 'abc')
        expect(widget.getCurrentValue()).toEqual('abc')
      })
      it ('should return trimmed string', function() {
        var widget = new LSD.Widget({tag: 'input', attributes: {list: true}, pseudos: {value: true}});
        widget.toElement().inject(document.body)
        widget.element.set('value', ' abc')
        expect(widget.getCurrentValue()).toEqual('abc')
      })
      it ('should return current bit in left part comma separated expression', function() {
        var widget = new LSD.Widget({tag: 'input', attributes: {list: true}, pseudos: {value: true}});
        widget.toElement().inject(document.body)
        widget.element.set('value', 'abc, def').selectRange(1, 1);
        expect(widget.getCurrentValue()).toEqual('abc')
      })
      it ('should return current bit in middle of comma separated expression', function() {
        var widget = new LSD.Widget({tag: 'input', attributes: {list: true}, pseudos: {value: true}});
        widget.toElement().inject(document.body)
        widget.element.set('value', 'abc, def').selectRange(4, 4);
        expect(widget.getCurrentValue()).toEqual('def')
      })
      it ('should return empty string between two commas', function() {
        var widget = new LSD.Widget({tag: 'input', attributes: {list: true}, pseudos: {value: true}});
        widget.toElement().inject(document.body)
        widget.element.set('value', 'abc,, def').selectRange(4, 4);
        expect(widget.getCurrentValue()).toEqual('')
      })
      it ('should return current bit in right part of comma separated expression', function() {
        var widget = new LSD.Widget({tag: 'input', attributes: {list: true}, pseudos: {value: true}});
        widget.toElement().inject(document.body)
        widget.element.set('value', 'abc, def, efg').selectRange(4, 4);
        expect(widget.getCurrentValue()).toEqual('def')
      })
    })
  })
  describe('#setCurrentValue', function() {
    describe('on a simple value', function() {
      it ('should set whole string', function() {
        var widget = new LSD.Widget({tag: 'input', attributes: {list: true}, pseudos: {value: true}});
        widget.toElement().inject(document.body)
        widget.setCurrentValue('abc')
        expect(widget.element.get('value')).toEqual('abc')
      })
      it ('should replace old string', function() {
        var widget = new LSD.Widget({tag: 'input', attributes: {list: true}, pseudos: {value: true}});
        widget.toElement().inject(document.body)
        widget.element.set('value', ' a');
        widget.setCurrentValue('abc')
        expect(widget.element.get('value')).toEqual('abc')
      })
      it ('should set current bit in left part of comma separated expression', function() {
        var widget = new LSD.Widget({tag: 'input', attributes: {list: true}, pseudos: {value: true}});
        widget.toElement().inject(document.body)
        widget.element.set('value', 'abc, def').selectRange(1, 1);
        widget.setCurrentValue('cba')
        expect(widget.element.get('value')).toEqual('cba, def')
      })
      it ('should set current bit in the middle comma separated expression', function() {
        var widget = new LSD.Widget({tag: 'input', attributes: {list: true}, pseudos: {value: true}});
        widget.toElement().inject(document.body)
        widget.element.set('value', 'abc, def').selectRange(4, 4);
        widget.setCurrentValue('fed')
        expect(widget.element.get('value')).toEqual('abc, fed')
      })
      it ('should set current bit between two commas', function() {
        var widget = new LSD.Widget({tag: 'input', attributes: {list: true}, pseudos: {value: true}});
        widget.toElement().inject(document.body)
        widget.element.set('value', 'abc,, def').selectRange(4, 4);
        widget.setCurrentValue('fed')
        expect(widget.element.get('value')).toEqual('abc, fed, def');
        expect(widget.element.getSelectedRange()).toEqual({start: 4, end: 8})
      })
      it ('should set current bit in right part of comma separated expression', function() {
        var widget = new LSD.Widget({tag: 'input', attributes: {list: true}, pseudos: {value: true}});
        widget.toElement().inject(document.body)
        widget.element.set('value', 'abc, def, efg').selectRange(4, 4);
        widget.setCurrentValue('defence')
        expect(widget.element.get('value')).toEqual('abc, defence, efg')
        expect(widget.element.getSelectedRange()).toEqual({start: 4, end: 12})
      })
      it ('should set current bit in right part of comma separated expression and clear selection', function() {
        var widget = new LSD.Widget({tag: 'input', attributes: {list: true}, pseudos: {value: true}});
        widget.toElement().inject(document.body)
        widget.element.set('value', 'abc, def, efg').selectRange(4, 4);
        widget.setCurrentValue('defence', false)
        expect(widget.element.get('value')).toEqual('abc, defence, efg')
        expect(widget.element.getSelectedRange()).toEqual({start: 12, end: 12})
      })
      it ('should set current bit and highlight the suggested part', function() {
        var widget = new LSD.Widget({tag: 'input', attributes: {list: true}, pseudos: {value: true}});
        widget.toElement().inject(document.body)
        widget.element.set('value', 'abc, def, efg').selectRange(8, 8);
        widget.setCurrentValue('defence')
        expect(widget.element.get('value')).toEqual('abc, defence, efg')
        expect(widget.element.getSelectedRange()).toEqual({start: 8, end: 12})
      })
    })
  })
})