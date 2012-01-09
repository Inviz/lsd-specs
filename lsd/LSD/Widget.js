describe("LSD.Widget", function() {
  describe('#initialize', function() {
    describe('when given no arguments', function() {
      it ('should create an instance of a widget', function() {
        var widget = new LSD.Widget;
        expect(widget.appendChild).toEqual(LSD.Widget.prototype.appendChild)
      })
    })
  })
  
  describe('#properties', function() {
    describe('.attributes', function() {
      it ("when an attributes are given", function() {
        var widget = new LSD.Widget({
          attributes: {
            title: 'Click here'
          }
        });
        expect(widget.attributes.title).toEqual('Click here');
        widget.set('attributes.title', 'Click there');
        expect(widget.attributes instanceof LSD.Type.Attributes).toBeTruthy()
        expect(widget.attributes.title).toEqual('Click there');
        widget.unset('attributes.title', 'Click there');
        widget.set('attributes.title', 'Click here');
      })
    })
  });
  
  describe('#test', function() {
    describe('when specific tag is used in selector', function() {
      describe('and tag is not defined', function() {
        it ("should not match that selector", function() {
          var widget = new LSD.Widget;
          expect(widget.test('div')).toBeFalsy();
        })
      });
      describe('and tag is defined', function() {
        describe('and tags match', function() {
          it ("should be truthy", function() {
            var widget = new LSD.Widget({tagName: 'div'});
            expect(widget.test('div')).toBeFalsy();
          })
        })
        describe('and tags dont match', function() {
          it ("should be falsy", function() {
            var widget = new LSD.Widget({tagName: 'h2'});
            expect(widget.test('div')).toBeFalsy();
          })
        })
      });
    });
    describe('when attributes are used in selector', function() {
      describe('when attribute is defined', function() {
        it ("should not match the selector", function() {
          var widget = new LSD.Widget;
          expect(widget.test('[hidden]')).toBeFalsy();
        })
      });
      describe('when attribute is defined', function() {
        describe('and attribute value is not given', function() {
          it ("should match the selector", function() {
            var widget = new LSD.Widget({attributes: {hidden: true}});
            expect(widget.test('[hidden]')).toBeTruthy();
          })
        })
        describe('and attributes match', function() {
          it ("should match the selector", function() {
            var widget = new LSD.Widget({attributes: {title: 'lol'}});
            expect(widget.test('[title=lol]')).toBeTruthy();
          })
        });
        describe('and attributes dont match', function() {
          it ("should not match the selector", function() {
            var widget = new LSD.Widget({attributes: {title: 'lol'}});
            expect(widget.test('[title=lul]')).toBeFalsy();
          })
        });
      });
    })
  })
})