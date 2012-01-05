describe("LSD.Module.Element", function() {
  describe("#attach", function() {
    it ("should attach element from constructor", function() {
      var element = new Element('div');
      var instance = new LSD.Widget(element);
      expect(instance.attached).toBeTruthy();
      expect(instance.element).toBeTruthy();
      expect(element.retrieve('widget')).toEqual(instance);
    });
    
    it ("should not attach if no element is given to constructor", function() {
      var instance = new LSD.Widget();
      expect(instance.attached).toBeFalsy();
      expect(instance.element).toBeFalsy();
    });
    
    it ("should let attach element after construction", function() {
      var element = new Element('div');
      var instance = new LSD.Widget();
      
      instance.attach(element);
      expect(instance.attached).toBeTruthy();
      expect(instance.element).toBeTruthy();
    });
    
    it ("should let change element storage key through options", function() {
      var element = new Element('div');
      var instance = new LSD.Widget(element, {key: 'jesus'});
      expect(element.retrieve('jesus')).toEqual(instance)
    });
  });
  
  describe("#detach", function() {
    it ("should clean element on detach", function() {
      var element = new Element('div');
      var instance = new LSD.Widget(element);
      instance.detach();
      expect(instance.element).toBeFalsy();
      expect(element.retrieve('widget')).toBeFalsy();
    });
    
    it ("should let attach another element after", function() {
      var element = new Element('div'), another = new Element('a');
      var instance = new LSD.Widget(element);
      expect(instance.element == element).toEqual(true);
      instance.detach();
      expect(instance.element).toEqual(null);
      instance.attach(another);
      expect(instance.element).toEqual(another);
      expect(another.retrieve('widget')).toEqual(instance);
      expect(element.retrieve('widget')).toBeFalsy();
      instance.detach();
      instance.attach(element);
      expect(instance.element).toNotEqual(another);
      expect(instance.element).toEqual(element);
      expect(element.retrieve('widget')).toEqual(instance);
      expect(another.retrieve('widget')).toBeFalsy();
    });
  });
  
  describe("#build", function() {
    describe("with element given", function() {
      describe("and tag is not set", function() {
        it ('should build the attached element with the tag of that element', function() {
          var element = new Element('div');
          var instance = new LSD.Widget(element);
          expect(instance.built).toBeTruthy();
          expect(instance.tagName).toEqual('div');
        });
      })
      
      describe("and tag is set through options", function() {
        describe("and element.tag option is set", function() {
          it ('should replace that element with the new element with the tag of the widget', function() {
            var element = new Element('div');
            var instance = new LSD.Widget(element, {tag: 'button', element: {tag: 'button'}});
            expect(instance.element.tagName).toEqual('BUTTON');
            expect(instance.element).toNotEqual(element);
          })
        })
        describe("and inline option is not set", function() {
          it ('should use that element', function() {
            var element = new Element('div');
            var instance = new LSD.Widget(element, {tag: 'button', inline: true});
            expect(instance.element.tagName).toEqual('DIV');
            expect(instance.element).toEqual(element);
          })
        })
        describe("and inline option set to true", function() {
          it ('should use that element', function() {
            var element = new Element('div');
            var instance = new LSD.Widget(element, {tag: 'button', inline: true});
            expect(instance.element.tagName).toEqual('DIV');
            expect(instance.element).toEqual(element);
          })
        })
      })
      describe("tag is not set", function() {
        describe("and inline option is not set", function() {
          it("should use the element and its tag", function() {
            var element = new Element('div');
            var instance = new LSD.Widget(element);
            expect(instance.tagName).toEqual('div');
            expect(instance.element).toEqual(element);
          })
        })
      })
    })
    
    describe("without element", function() {
      it ("should attach the built element", function() {
        var instance = new LSD.Widget({tag: 'h2'});
        instance.build();
        expect(instance.element).toBeTruthy();
        expect(instance.attached).toBeTruthy();    
      });
      
      describe("with inline option set to true", function() {
        it ("should build inline span element", function() {
          var instance = new LSD.Widget({inline: true});
          instance.build();
          expect(instance.element.tagName).toEqual('SPAN');
        })
      });
      
      describe("with inline option set to false", function() {
        it ("should build block div element", function() {
          var instance = new LSD.Widget({inline: false});
          instance.build();
          expect(instance.element.tagName).toEqual('DIV');
          expect(instance.tagName).toBeFalsy()
        })
      })
      
      describe("with inline option set to null", function() {
        describe("when tag is given too", function() {
          describe("and it's a standart html tag", function() {
            it ("should use that tag for the element", function() {
              var instance = new LSD.Widget({inline: null, tag: 'h2'});
              instance.build();
              expect(instance.element.tagName).toEqual('H2');
            })
          });
          describe("and it's a custom tag that is not in html", function() {
            it ("should build a div element", function() {
              var instance = new LSD.Widget({inline: null, tag: 'h177'});
              instance.build();
              expect(instance.element.tagName).toEqual('DIV');
            })
          })
        })
      })
    });
  });
  
  describe("#destroy", function() {
    it ('should detach the destroyed element', function() {
      var element = new Element('div');
      var instance = new LSD.Widget(element);
      expect(element.retrieve('widget') == instance).toBeTruthy();
      instance.destroy();
      expect(instance.attached).toBeFalsy();
    });
    
    it ('should destroy element', function() {
      var element = new Element('div');
      var child = new Element('a').inject(element);
      var instance = new LSD.Widget(child);
      instance.destroy();
      expect(element.getChildren().length).toEqual(0)
    });
  });
  
  describe("#toElement", function() {
    it ('should pick up attached element', function() {
      var element = new Element('div');
      var instance = new LSD.Widget(element);
      expect(instance.toElement()).toEqual(element);
    });
    
    it ('should build element when there\'s no attached element', function() {
      var instance = new LSD.Widget({inline: false});
      expect(instance.toElement().nodeName).toEqual('DIV');
    });
    
    it ('should be used in document.id (aka $ function)', function() {
      var instance = new LSD.Widget({inline: true});
      expect($(instance).nodeName).toEqual('SPAN');
    });
  });

});