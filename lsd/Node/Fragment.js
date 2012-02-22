describe("LSD.Fragment", function() {
  describe("constructor", function() {
    describe('when given no arguments', function() {
      it ("should create empty fragment", function() {
        
      })
    });
    describe('when given widget', function() {
      it ("should create a fragment with a single widget", function() {
        
      })
    })
    describe('when given a node', function() {
      it ("should create a fragment with a text element", function() {
        
      })
    })
    describe('when given multiple nodes', function() {
      it ("should create a fragment with those nodes", function() {
        
      })
    })
    describe('when given node collection', function() {
      it ("should create a fragment elements of the node collection", function() {
        
      })
      describe('and other nodes', function() {
        it ("should create a fragment with elements of node collection and other nodes together", function() {

        })
      })
    })
    describe('when given document fragment', function() {
      it("should create a fragment with nodes of the given fragment", function() {
        
      });
      describe('and other nodes', function() {
        it ("should create a fragment with nodes of the given fragment and other nodes together", function() {

        })
      })
    });
    describe('when given html', function() {
      it("should parse html and create a fragment with nodes parsed from html", function() {
        
      })
    });
    describe('when given object', function() {
      it("create a nodes of all keys in the object", function() {
        
      })
    })
  });
  describe('#render', function() {
    describe('when given string', function() {
      it ("should render text node", function() {
        var fragment = new LSD.Fragment;
        fragment.render('Gold Digger');
        expect(fragment.childNodes[0].nodeType).toEqual(3);
        expect(fragment.childNodes[0].nodeValue).toEqual('Gold Digger');
      });
      describe('and string contains html', function() {
        it ("should parse html and render widgets", function() {
          var fragment = new LSD.Fragment('<b>Gold</b> Digger');
          expect(fragment.childNodes[0].nodeType).toEqual(1);
          expect(fragment.childNodes[0].nodeName).toEqual('b');
          expect(fragment.childNodes[0].childNodes[0].nodeValue).toEqual('Gold');
        })
        describe('and html contains conditional comments', function() {
          it ("should recognize conditional branches in HTML and render widgets accordingly", function() {
            var fragment = new LSD.Fragment('<!--if (a)-->1<!--else-->2<!--end-->');
            console.log(fragment)
            expect(fragment.childNodes[0].nodeType).toEqual(5);
            expect(fragment.childNodes[0].childNodes[0].nodeValue).toEqual('1');
            expect(fragment.childNodes[1].nodeType).toEqual(5);
            console.log(fragment)
          });
        })
      })
    })
    describe('when given object', function() {
      describe('with a single key', function() {
        it ('should render a single node', function() {
          var fragment = new LSD.Fragment;
          fragment.render({'button': 'Okay'});
          expect(fragment.childNodes[0].nodeType).toEqual(1);
          expect(fragment.childNodes[0].nodeName).toEqual('button');
          expect(fragment.childNodes.length).toEqual(1);
        })
      });
      describe('with multiple keys', function() {
        it ('should render nodes from keys of the object', function() {
          var fragment = new LSD.Fragment;
          fragment.render({'button': 'Okay', 'a.cancel': 'Cancel'});
          expect(fragment.childNodes[0].nodeType).toEqual(1);
          expect(fragment.childNodes[0].nodeName).toEqual('button');
          expect(fragment.childNodes[1].nodeType).toEqual(1);
          expect(fragment.childNodes[1].nodeName).toEqual('a');
          expect(fragment.childNodes[1].classList.cancel).toBeTruthy();
          expect(fragment.childNodes[1].className).toEqual('cancel')
          expect(fragment.childNodes[1].childNodes[0].nodeValue).toEqual('Cancel');
        })
      });
      describe('and it has a nested object', function() {
        describe('and the key to nested object contains keyword', function() {
          it ('should create an instruction for the keyword', function() {
            var fragment = new LSD.Fragment({
              'if (a > 1)': {
                'button': 'JEEEZ',
                'if (b < 1)': 'Test',
                'section': null
              },
              'footer': null
            });
            expect(fragment.childNodes[0].nodeType).toEqual(5);
            expect(fragment.childNodes[0].name).toEqual('if');
            expect(fragment.childNodes[0].args[0].name).toEqual('>');
            expect(fragment.childNodes[0].childNodes[0].nodeType).toEqual(1);
            expect(fragment.childNodes[0].childNodes[0].nodeName).toEqual('button');
            expect(fragment.childNodes[0].childNodes[0].childNodes[0].nodeType).toEqual(3);
            expect(fragment.childNodes[0].childNodes[0].childNodes[0].nodeValue).toEqual('JEEEZ');
            expect(fragment.childNodes[0].childNodes[1].nodeType).toEqual(5);
            expect(fragment.childNodes[0].childNodes[1].name).toEqual('if');
            expect(fragment.childNodes[0].childNodes[1].args[0].name).toEqual('<');
            expect(fragment.childNodes[0].childNodes[1].childNodes[0].nodeType).toEqual(3);
            expect(fragment.childNodes[0].childNodes[1].childNodes[0].nodeValue).toEqual('Test');
            expect(fragment.childNodes[1].nodeName).toEqual('footer');
          })
        })
      })
    });
    describe('when given element', function() {
      describe('and .clone option is not given', function() {
        describe('and element is not a widget', function() {
          var element = document.createElement('section');
          var fragment = new LSD.Fragment;
          fragment.render(element);
          expect(fragment.childNodes[0].origin).toEqual(element)
          expect(fragment.childNodes[0].tagName).toEqual('section')
          fragment.childNodes[0].build();
          expect(fragment.childNodes[0].element).toBe(element)
        });
        describe('and element is a widget already', function() {
          it ("should append that widget into the fragment", function() {
            var widget = new LSD.Element;
            var element = widget.toElement();
            var fragment = new LSD.Fragment;
            fragment.render(element);
            expect(fragment.childNodes[0].origin).toBeUndefined()
            expect(fragment.childNodes[0].tagName).toEqual(null)
            fragment.childNodes[0].set('clone', true);
            fragment.childNodes[0].build();
            expect(fragment.childNodes[0]).toBe(widget);
            expect(fragment.childNodes[0].element).toBe(element);
            expect(fragment.childNodes[0].element.tagName).toEqual('DIV');
          })
        });
      })
      describe('and .clone option is given', function() {
        describe('and element is not a widget', function() {
          it ("should clone the element and create the widget", function() {
            var element = document.createElement('section');
            var fragment = new LSD.Fragment;
            fragment.render(element);
            expect(fragment.childNodes[0].origin).toEqual(element)
            expect(fragment.childNodes[0].tagName).toEqual('section')
            fragment.childNodes[0].set('clone', true);
            fragment.childNodes[0].build();
            expect(fragment.childNodes[0].element).toNotBe(element);
            expect(fragment.childNodes[0].element.tagName).toEqual('SECTION');
          })
        });
        describe('and element is a widget already', function() {
          it ("should clone the element and create the widget", function() {
            var widget = new LSD.Element;
            var element = widget.toElement();
            var fragment = new LSD.Fragment;
            fragment.render(element, null, {clone: true});
            expect(fragment.childNodes[0].origin).toEqual(element)
            expect(fragment.childNodes[0].tagName).toEqual('div')
            fragment.childNodes[0].build();
            expect(fragment.childNodes[0]).toNotBe(widget);
            expect(fragment.childNodes[0].element).toNotBe(element);
            expect(fragment.childNodes[0].element.tagName).toEqual('DIV');
          })
        });
      })
    });
    describe('when given a tree of elements', function() {
      describe('and .clone option is given', function() {
        
      });
      describe('and .clone option is not given', function() {
        describe("and none of the elements are widgets", function() {
          it ("should walk the tree of elements and use each element to create a widget", function() {
            var form     = document.createElement('form');
            var fieldset = document.createElement('fieldset');
            var label    = document.createElement('label');
            form.appendChild(fieldset);
            form.appendChild(label); 
            var fragment = new LSD.Fragment(form);
            expect(fragment.childNodes[0].tagName).toEqual('form');
            expect(fragment.childNodes[0].childNodes[0].tagName).toEqual('fieldset');
            expect(fragment.childNodes[0].childNodes[1].tagName).toEqual('label');
            fragment.childNodes[0].build();
            expect(fragment.childNodes[0].element).toEqual(form)
            expect(fragment.childNodes[0].childNodes[0].element).toEqual(fieldset);
            expect(fragment.childNodes[0].childNodes[1].element).toEqual(label);
          })
        });
        describe("and some elements are widgets", function() {
          it ("should skip elements that are already widgets and initialize the rest", function() {
            
          })
        });
        describe("and all elements are widgets", function() {
          it ("should walk through elements and render nothing", function() {
            
          })
        })
      });
    })
  })
})