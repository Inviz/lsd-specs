describe('LSD.Element', function() {
  describe('#initialize', function() {
    describe('when given no arguments', function() {
      it ('should create an instance of a widget', function() {
        var widget = new LSD.Element;
        expect(widget.appendChild).toEqual(LSD.Element.prototype.appendChild)
      })
    })
    
    
    describe("when given arguments", function() {
      it ("should instantiate without arguments", function() {
        var instance = new LSD.Element;
        expect(instance instanceof LSD.Element).toBeTruthy()
      });

      it ('should instantiate with element as argument', function() {
        var element = new Element('div');
        var instance = new LSD.Element(element);
        expect(instance.origin == element).toBeTruthy();
      });

      it ('should instantiate with options as argument', function() {
        var options = {magic: 784};
        var instance = new LSD.Element(options);
        expect(instance.magic == 784).toBeTruthy();
      });

      it ('should instantiate with options and element as arguments', function() {
        var options = {'honk': 'kong'};
        var element = new Element('div');
        var instance = new LSD.Element(options, element);
        expect(instance.honk == 'kong').toBeTruthy();
        expect(instance.origin == element).toBeTruthy();
      });

      it ('should instantiate with element and options as arguments', function() {
        var options = {'honk': 'kong'};
        var element = new Element('div');
        var instance = new LSD.Element(element, options);
        expect(instance.honk == 'kong').toBeTruthy();
        expect(instance.origin == element).toBeTruthy();
      });
    });
  })
  
  describe('#properties', function() {
    describe('.attributes', function() {
      it ('when an attributes are given', function() {
        var widget = new LSD.Element({
          attributes: {
            title: 'Click here'
          }
        });
        expect(widget.attributes.title).toEqual('Click here');
        widget.set('attributes.title', 'Click there');
        expect(widget.attributes instanceof LSD.Properties.Attributes).toBeTruthy()
        expect(widget.attributes.title).toEqual('Click there');
        widget.unset('attributes.title', 'Click there');
        widget.set('attributes.title', 'Click here');
      })
    });
    describe('.origin', function() {
      describe('when widget doesnt have its own attributes', function() {
        it ('should extract attributes', function() {
          var widget = new LSD.Element;
          var element = document.createElement('button');
          element.setAttribute('onclick', 'roll');
          widget.set('origin', element);
          expect(widget.attributes.onclick).toEqual('roll');
        })
      });
      describe('when widget has its own attributes', function() {
        describe('and widget attributes dont overlap with element attributes', function() {
          it ('should merge attributes together', function() {
            var widget = new LSD.Element({attributes: {id: 'josh'}});
            var element = document.createElement('button');
            element.setAttribute('name', 'jack');
            widget.set('origin', element);
            expect(widget.attributes.name).toEqual('jack');
            expect(widget.attributes.id).toEqual('josh');
          })
        })
        describe('and widget attributes overlap with element attributes', function() {
          it ('should give priority to widget attributes and restore to element attributes when overlapping widget attribute is removed', function() {
            var widget = new LSD.Element({attributes: {name: 'josh'}});
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
      });
      describe('when attributes contain interpolated values', function() {
        describe('when value is interpolated', function() {
          it ('should watch for values and update attribute', function() {
            var widget = new LSD.Element;
            var element = document.createElement('button');
            element.setAttribute('tabindex', '${x + 1}')
            widget.set('origin', element);
            expect(widget.attributes.tabindex).toBeUndefined();
            widget.variables.set('x', 5);
            expect(widget.attributes.tabindex).toBe(6);
            widget.variables.set('x', -1)
            expect(widget.attributes.tabindex).toBe(0);
            widget.unset('origin', element)
            expect(widget.attributes.tabindex).toBeUndefined();
          })
        })
        describe('when interpolation is within a single attribute', function() {
          it ('should watch for values and update attribute', function() {
            var widget = new LSD.Element;
            var element = document.createElement('button');
            element.setAttribute('title', 'xxx${x + 1}xx')
            widget.set('origin', element);
            expect(widget.attributes.title).toBeUndefined();
            widget.variables.set('x', 5);
            expect(widget.attributes.title).toBe('xxx6xx');
            widget.variables.set('x', -1)
            expect(widget.attributes.title).toBe('xxx0xx');
            widget.unset('origin', element)
            expect(widget.attributes.title).toBeUndefined();
          })
        });
        describe('when interpolation is not within a value of attribute', function() {
          describe('and interpolation is simple', function() {
            it ('should watch for values and update attribute', function() {
              var widget = new LSD.Element;
              var wrapper = document.createElement('div');
              wrapper.innerHTML = '<button ${object} />';
              var element = wrapper.firstChild;
              widget.set('origin', element);
              expect(widget.attributes.title).toBeUndefined();
              widget.variables.set('object', {title: 'Jeeez nigga'})
              expect(widget.attributes.title).toBe('Jeeez nigga');
              widget.variables.set('object', {title: 'Jeeezos chr0ss'})
              expect(widget.attributes.title).toBe('Jeeezos chr0ss');
              widget.unset('origin', element);
              expect(widget.attributes.title).toBeUndefined();
            })
          });
          describe('and interpolation is complex - contains spaces', function() {
            it ('should watch for values and update attribute', function() {
              var widget = new LSD.Element;
              var wrapper = document.createElement('div');
              wrapper.innerHTML = '<button ${condition && object} />';
              var element = wrapper.firstChild;
              widget.set('origin', element);
              expect(widget.attributes.title).toBeUndefined();
              widget.variables.set('object', {title: 'Jeeez nigga'})
              expect(widget.attributes.title).toBeUndefined();
              widget.variables.set('condition', true)
              expect(widget.attributes.title).toBe('Jeeez nigga');
              widget.variables.set('condition', false)
              expect(widget.attributes.title).toBeUndefined();
              widget.variables.set('object', {title: 'Jeeezos chr0ss'})
              expect(widget.attributes.title).toBeUndefined();
              widget.variables.set('condition', true)
              expect(widget.attributes.title).toBe('Jeeezos chr0ss');
              widget.variables.set('object', {title: 'Jeeezos chr0sZ'})
              expect(widget.attributes.title).toBe('Jeeezos chr0ssZ');
              widget.unset('origin', element);
              expect(widget.attributes.title).toBeUndefined();
            })
          })
        })
      })
    });
    describe('.sourceIndex', function() {
      describe('when used out of document', function() {
        it('should assign a property to element structures', function() {
          var f = new LSD.Element
          var a = new LSD.Element;
          var b = new LSD.Element;
          var c = new LSD.Element;
          var bb = new LSD.Element;
          var bb2 = new LSD.Element;
          var cc = new LSD.Element;
          var d = new LSD.Element;
          a.childNodes.push(c);
          //expect(a.sourceIndex).toEqual(0);
          expect(c.sourceIndex).toEqual(1);
          a.childNodes.unshift(b);
          expect(b.sourceIndex).toEqual(1);
          expect(c.sourceIndex).toEqual(2);
          b.childNodes.push(bb)
          expect(b.sourceIndex).toEqual(1);
          expect(b.sourceLastIndex).toEqual(2);
          expect(bb.sourceIndex).toEqual(2);
          expect(c.sourceIndex).toEqual(3);
          c.childNodes.push(cc)
          expect(c.sourceLastIndex).toEqual(4);
          a.childNodes.unshift(f);
          expect(f.sourceIndex).toEqual(1);
          expect(b.sourceIndex).toEqual(2);
          expect(b.sourceLastIndex).toEqual(3);
          expect(bb.sourceIndex).toEqual(3);
          expect(c.sourceIndex).toEqual(4);
          expect(c.sourceLastIndex).toEqual(5);
          expect(cc.sourceIndex).toEqual(5);
          a.childNodes.push(d)
          expect(d.sourceIndex).toEqual(6);
          a.childNodes.shift()
          expect(b.sourceIndex).toEqual(1);
          expect(b.sourceLastIndex).toEqual(2);
          expect(bb.sourceIndex).toEqual(2);
          expect(c.sourceIndex).toEqual(3);
          expect(c.sourceLastIndex).toEqual(4);
          expect(cc.sourceIndex).toEqual(4);
          expect(d.sourceIndex).toEqual(5);
          a.childNodes.splice(1, 1);
          expect(b.sourceIndex).toEqual(1);
          expect(bb.sourceIndex).toEqual(2);
          expect(d.sourceIndex).toEqual(3);
          a.childNodes.shift()
          expect(d.sourceIndex).toEqual(1);
          a.childNodes.push(b)
          expect(b.sourceIndex).toEqual(2);
          expect(bb.sourceIndex).toEqual(3);
        })
        
        it ("should be kept when doing regular manipulations", function() {
            var root = new LSD.Element({tag: 'root'})

            var pane1 = new LSD.Element({tag: 'pane'});
            var pane2 = new LSD.Element({tag: 'pane'});
            var pane3 = new LSD.Element({tag: 'pane'});

            pane2.appendChild(pane3);
            expect(pane2.sourceIndex).toBeUndefined()
            expect(pane3.sourceIndex).toEqual(1);
            expect(pane2.sourceLastIndex).toEqual(1);
            expect(pane3.sourceLastIndex).toBeFalsy();

            root.appendChild(pane2)
            expect(root.sourceLastIndex).toEqual(2);
            expect(root.sourceIndex).toBeUndefined()
            expect(pane2.sourceIndex).toEqual(1);
            expect(pane2.sourceLastIndex).toEqual(2);
            expect(pane3.sourceIndex).toEqual(2);
            expect(pane3.sourceLastIndex).toBeFalsy();
            
            expect(pane2.sourceLastIndex).toEqual(2);
            root.appendChild(pane1);
            expect(root.sourceLastIndex).toEqual(3);
            expect(pane1.sourceIndex).toEqual(3);
            
            var rooty = new LSD.Element({tag: 'root'})
            rooty.appendChild(root);
            expect(rooty.sourceLastIndex).toEqual(4);
            expect(rooty.sourceIndex).toBeUndefined()
            expect(root.sourceLastIndex).toEqual(4);
            expect(root.sourceIndex).toEqual(1);
            expect(pane2.sourceIndex).toEqual(2);
            expect(pane2.sourceLastIndex).toEqual(3);
            expect(pane3.sourceIndex).toEqual(3);
            expect(pane3.sourceLastIndex).toBeFalsy();
            
            var pane4 = new LSD.Element({tag: 'kane'});
            pane2.appendChild(pane4);
            expect(rooty.sourceLastIndex).toEqual(5);
            expect(rooty.sourceIndex).toBeUndefined()
            expect(root.sourceLastIndex).toEqual(5);
            expect(root.sourceIndex).toEqual(1);
            expect(pane1.sourceIndex).toEqual(5);
            expect(pane2.sourceIndex).toEqual(2);
            expect(pane2.sourceLastIndex).toEqual(4);
            expect(pane3.sourceLastIndex).toBeFalsy();
            expect(pane3.sourceIndex).toEqual(3);
            expect(pane4.sourceIndex).toEqual(4);
        })
      })
    });
    describe('.inline', function() {
      describe('when localName is given', function() {
        describe('when inline is set to true', function() {
          it('should build widget with tag from the localName', function() {
            var widget = new LSD.Element({
              localName: 'h2',
              inline: true
            });
            expect(widget.localName).toEqual('h2');
          })
        })
        describe('when inline is set to false', function() {
          it('should build widget with tag from the localName', function() {
            var widget = new LSD.Element({
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
            var widget = new LSD.Element({
              inline: true
            });
            expect(widget.localName).toEqual('span');
          })
        })
        describe('when inline is set to false', function() {
          it('should build widget with tag from the localName', function() {
            var widget = new LSD.Element({
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
        var widget = new LSD.Element;
        widget.build();
        expect(widget.element).toBeTruthy();
        expect(widget.tagName).toBeNull();
        expect(widget.localName).toEqual('div')
        expect(widget.element.tagName).toEqual('DIV')
      })
    });
    describe('when localName was given', function() {
      it ('should use that tagName to build a new element', function() {
        var widget = new LSD.Element({
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
        var widget = new LSD.Element({
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
        var widget = new LSD.Element({
          attributes: {
            hidden: true,
            title: 'Click me'
          }
        });
        widget.build();
        expect(widget.element.getAttribute('hidden')).toNotEqual(null);
        expect(widget.element.getAttribute('title')).toEqual('Click me');
      });
    });
  });
  
  describe('#test', function() {
    describe('when specific tag is used in selector', function() {
      describe('and tag is not defined', function() {
        it ('should not match that selector', function() {
          var widget = new LSD.Element;
          expect(widget.test('div')).toBeFalsy();
        })
      });
      describe('and tag is defined', function() {
        describe('and tags match', function() {
          it ('should be truthy', function() {
            var widget = new LSD.Element({tagName: 'div'});
            expect(widget.test('div')).toBeTruthy();
          })
        })
        describe('and tags dont match', function() {
          it ('should be falsy', function() {
            var widget = new LSD.Element({tagName: 'h2'});
            expect(widget.test('div')).toBeFalsy();
          })
        })
      });
    });
    describe('when attributes are used in selector', function() {
      describe('when attribute is defined', function() {
        it ('should not match the selector', function() {
          var widget = new LSD.Element;
          expect(widget.test('[hidden]')).toBeFalsy();
        })
      });
      describe('when attribute is defined', function() {
        describe('and attribute value is not given', function() {
          it ('should match the selector', function() {
            var widget = new LSD.Element({attributes: {hidden: true}});
            expect(widget.test('[hidden]')).toBeTruthy();
          })
        })
        describe('and attributes match', function() {
          it ('should match the selector', function() {
            var widget = new LSD.Element({attributes: {title: 'lol'}});
            expect(widget.test('[title=lol]')).toBeTruthy();
          })
        });
        describe('and attributes dont match', function() {
          it ('should not match the selector', function() {
            var widget = new LSD.Element({attributes: {title: 'lol'}});
            expect(widget.test('[title=lul]')).toBeFalsy();
          })
        });
      });
    })
  })
})