describe('LSD.Widget', function() {
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
      it ('when an attributes are given', function() {
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
    });
    describe('.origin', function() {
      describe('when widget doesnt have its own attributes', function() {
        it ('should extract attributes', function() {
          var widget = new LSD.Widget;
          var element = document.createElement('button');
          element.setAttribute('onclick', 'roll');
          widget.set('origin', element);
          expect(widget.attributes.onclick).toEqual('roll');
        })
      });
      describe('when widget has its own attributes', function() {
        describe('and widget attributes dont overlap with element attributes', function() {
          it ('should merge attributes together', function() {
            var widget = new LSD.Widget({attributes: {id: 'josh'}});
            var element = document.createElement('button');
            element.setAttribute('name', 'jack');
            widget.set('origin', element);
            expect(widget.attributes.name).toEqual('jack');
            expect(widget.attributes.id).toEqual('josh');
          })
        })
        describe('and widget attributes overlap with element attributes', function() {
          it ('should give priority to widget attributes and restore to element attributes when overlapping widget attribute is removed', function() {
            var widget = new LSD.Widget({attributes: {name: 'josh'}});
            var element = document.createElement('button');
            element.setAttribute('name', 'jack');
            widget.set('origin', element);
            expect(widget.attributes.name).toEqual('josh');
            widget.attributes.unset('name', 'josh');
            expect(widget.attributes.name).toEqual('jack');
            widget.unset('origin', element);
            expect(widget.attributes.name).toBeUndefined()
            
          })
        })
      })
    });
    describe('.inline', function() {
      describe('when localName is given', function() {
        describe('when inline is set to true', function() {
          it('should build widget with tag from the localName', function() {
            var widget = new LSD.Widget({
              localName: 'h2',
              inline: true
            });
            expect(widget.localName).toEqual('h2');
          })
        })
        describe('when inline is set to false', function() {
          it('should build widget with tag from the localName', function() {
            var widget = new LSD.Widget({
              localName: 'h2',
              inline: false
            });
            expect(widget.localName).toEqual('h2');
          })
        })
      });
      describe('when no localName is given', function() {
        describe('when inline is set to true', function() {
          it('should build widget with tag from the localName', function() {
            var widget = new LSD.Widget({
              inline: true
            });
            expect(widget.localName).toEqual('span');
          })
        })
        describe('when inline is set to false', function() {
          it('should build widget with tag from the localName', function() {
            var widget = new LSD.Widget({
              inline: false
            });
            expect(widget.localName).toEqual('div');
          })
        })
      })
    })
  });
  
  describe('#build', function() {
    describe('when no tags was given', function() {
      it ('should create a div', function() {
        var widget = new LSD.Widget;
        widget.build();
        expect(widget.element).toBeTruthy();
        expect(widget.tagName).toBeNull();
        expect(widget.localName).toEqual('div')
        expect(widget.element.tagName).toEqual('DIV')
      })
    });
    describe('when localName was given', function() {
      it ('should use that tagName to build a new element', function() {
        var widget = new LSD.Widget({
          tagName: 'h2'
        });
        widget.build();
        expect(widget.tagName).toEqual('h2');
        expect(widget.localName).toEqual('h2');
        expect(widget.element.tagName).toEqual('H2')
      })
    });
    describe('when localName and tagName was given', function() {
      it ('should use localName for element and tagName for the widget', function() {
        var widget = new LSD.Widget({
          tagName: 'h2',
          localName: 'h3'
        });
        widget.build();
        expect(widget.tagName).toEqual('h2');
        expect(widget.localName).toEqual('h3');
        expect(widget.element.tagName).toEqual('H3')
      })
    });
    describe('when attributes are given', function() {
      it ('should build element with those attributes', function() {
        var widget = new LSD.Widget({
          attributes: {
            hidden: true,
            title: 'Click me'
          }
        });
        widget.build();
        expect(widget.element.getAttribute('hidden')).toBeTruthy();
        expect(widget.element.getAttribute('title')).toEqual('Click me');
      });
    });
  });
  
  describe('#test', function() {
    describe('when specific tag is used in selector', function() {
      describe('and tag is not defined', function() {
        it ('should not match that selector', function() {
          var widget = new LSD.Widget;
          expect(widget.test('div')).toBeFalsy();
        })
      });
      describe('and tag is defined', function() {
        describe('and tags match', function() {
          it ('should be truthy', function() {
            var widget = new LSD.Widget({tagName: 'div'});
            expect(widget.test('div')).toBeTruthy();
          })
        })
        describe('and tags dont match', function() {
          it ('should be falsy', function() {
            var widget = new LSD.Widget({tagName: 'h2'});
            expect(widget.test('div')).toBeFalsy();
          })
        })
      });
    });
    describe('when attributes are used in selector', function() {
      describe('when attribute is defined', function() {
        it ('should not match the selector', function() {
          var widget = new LSD.Widget;
          expect(widget.test('[hidden]')).toBeFalsy();
        })
      });
      describe('when attribute is defined', function() {
        describe('and attribute value is not given', function() {
          it ('should match the selector', function() {
            var widget = new LSD.Widget({attributes: {hidden: true}});
            expect(widget.test('[hidden]')).toBeTruthy();
          })
        })
        describe('and attributes match', function() {
          it ('should match the selector', function() {
            var widget = new LSD.Widget({attributes: {title: 'lol'}});
            expect(widget.test('[title=lol]')).toBeTruthy();
          })
        });
        describe('and attributes dont match', function() {
          it ('should not match the selector', function() {
            var widget = new LSD.Widget({attributes: {title: 'lol'}});
            expect(widget.test('[title=lul]')).toBeFalsy();
          })
        });
      });
    })
  })
})