describe('LSD.Module.Tag', function() {
  
  describe('#setSource', function() {
    LSD.SourceTest = new LSD.Type;
    LSD.SourceTest.Body = new Class({
      options: {
        element: {
          tag: 'body'
        }
      },
      getBody: function() {
        return true;
      }
    });
    LSD.SourceTest.Button = new Class({
      options: {
        element: {
          tag: 'button'
        }
      },
      clickaz: function() {
        return true;
      }
    });
    LSD.SourceTest.Button.Submit = new Class({
      Extends: LSD.SourceTest.Button
    })
    LSD.SourceTest.Button.Submit.Bang = new Class({
      Extends: LSD.SourceTest.Button.Submit
    })
    
    it ('should set the widget class and implement its methods', function() {
      var widget = new LSD.Widget({
        context: 'source_test'
      });
      expect(widget.getBody).toBeFalsy();
      widget.properties.set('tag', 'body');
      expect(widget.getBody).toBeTruthy();
    });
    
    it ('should change the class after it was set once', function() {
      var widget = new LSD.Widget({
        context: 'source_test'
      });
      widget.property = 1;
      widget.properties.set('tag', 'body');
      expect(widget.clickaz).toBeFalsy();
      expect(widget.getBody).toBeTruthy();
      expect(widget.property).toEqual(1);
      widget.properties.set('tag', 'button');
      expect(widget.clickaz).toBeTruthy();
      expect(widget.getBody).toBeFalsy();
      expect(widget.property).toEqual(1);
    });
    
    it ('should create a functioning widget', function() {
      var widget = new LSD.Widget({
        context: 'source_test'
      });
      widget.properties.set('tag', 'button');
      widget.build()
      expect(widget.element.tagName.toLowerCase()).toEqual('button');
    });
    
    describe('when given a tag name', function() {
      describe('and type attribute', function() {
        describe('and there is no subclassed widget', function() {
          it ('should find original widget role by tag name', function() {
            var instance = new LSD.Widget({
              tag: 'button',
              context: 'source_test',
              attributes: {
                type: 'zippety'
              }
            });
            expect(instance.role).toEqual(LSD.SourceTest.Button)
          })
        })
        describe('and there is subclassed widget', function() {
          it ('should find a subclassed widget role by tag name and type attribute', function() {
            var instance = new LSD.Widget({
              tag: 'button',
              context: 'source_test',
              attributes: {
                type: 'submit'
              }
            });
            expect(instance.role).toEqual(LSD.SourceTest.Button.Submit)
          })
        })
        describe('and kind attribute', function() {
          describe('and there is a deeply subclassed widget role', function() {
            it ('should find a deeply subclassed widget role by tag name, type and kind attribute', function() {
              var instance = new LSD.Widget({
                tag: 'button',
                context: 'source_test',
                attributes: {
                  type: 'submit',
                  kind: 'bang'
                }
              });
              expect(instance.role).toEqual(LSD.SourceTest.Button.Submit.Bang)
            })
            describe('but type doesnt match', function() {
              it ('should find original widget role', function() {
                var instance = new LSD.Widget({
                  tag: 'button',
                  context: 'source_test',
                  attributes: {
                    type: 'hobbit',
                    kind: 'bang'
                  }
                });
                expect(instance.role).toEqual(LSD.SourceTest.Button)
              })
            })
          })
          describe('and there is no deeply subclassed widget role', function() {
            describe('and there is no subclassed widget role', function() {
              it ('should find original widget role by tag name', function() {
                var instance = new LSD.Widget({
                  tag: 'body',
                  context: 'source_test',
                  attributes: {
                    type: 'submit',
                    kind: 'zap'
                  }
                });
                expect(instance.role).toEqual(LSD.SourceTest.Body)
              })
            })
            describe('and there is subclassed widget role', function() {
              it ('should find a subclassed widget role by tag name and type', function() {
                var instance = new LSD.Widget({
                  tag: 'button',
                  context: 'source_test',
                  attributes: {
                    type: 'submit',
                    kind: 'zap'
                  }
                });
                expect(instance.role).toEqual(LSD.SourceTest.Button.Submit)
              })
            })
          })
        });
      });
      describe('and kind attribute', function() {
        describe('and there is no subclassed widget', function() {
          it ('should find an original widget role by tag name', function() {
            var instance = new LSD.Widget({
              tag: 'button',
              context: 'source_test',
              attributes: {
                kind: 'zap'
              }
            });
            expect(instance.role).toEqual(LSD.SourceTest.Button)
          })
        })
        describe('and there is subclassed widget', function() {
          it ('should find subclassed widget role by tag name and kind attribute', function() {
            var instance = new LSD.Widget({
              tag: 'button',
              context: 'source_test',
              attributes: {
                kind: 'submit'
              }
            });
            expect(instance.role).toEqual(LSD.SourceTest.Button.Submit)
          })
        });
      })
    });
    
    describe('when given a source', function() {
      describe('and tag name', function() {
        it('should use source instead of a tag name', function() {
          var instance = new LSD.Widget({
            tag: 'button',
            source: 'body',
            context: 'source_test'
          });
          expect(instance.role).toEqual(LSD.SourceTest.Body)
        })

        describe('and type attribute', function() {
          describe('and there is no subclassed widget', function() {
            it ('should find original widget role by source option', function() {
              var instance = new LSD.Widget({
                tag: 'body',
                source: 'button',
                context: 'source_test',
                attributes: {
                  type: 'zippety'
                }
              });
              expect(instance.role).toEqual(LSD.SourceTest.Button)
            })
          })
          describe('and there is subclassed widget', function() {
            it ('should find a subclassed widget by source option and type attribute', function() {
              var instance = new LSD.Widget({
                tag: 'body',
                source: 'button',
                context: 'source_test',
                attributes: {
                  type: 'submit'
                }
              });
              expect(instance.role).toEqual(LSD.SourceTest.Button.Submit)
            })
          })
          describe('and kind attribute', function() {
            describe('and there is a deeply subclassed widget role', function() {
              it ('should find a deeply subclassed widget role by source option, kind and tag attributes', function() {
                var instance = new LSD.Widget({
                  tag: 'body',
                  source: 'button',
                  context: 'source_test',
                  attributes: {
                    type: 'submit',
                    kind: 'bang'
                  }
                });
                expect(instance.role).toEqual(LSD.SourceTest.Button.Submit.Bang)
              })
              describe('but type doesnt match', function() {
                it ('should find an original widget role by source', function() {
                  var instance = new LSD.Widget({
                    tag: 'body',
                    source: 'button',
                    context: 'source_test',
                    attributes: {
                      type: 'hobbit',
                      kind: 'bang'
                    }
                  });
                  expect(instance.role).toEqual(LSD.SourceTest.Button)
                  //expect(instance.source).toEqual('button')
                })
              })
            });
            describe('and there is no deeply subclassed widget', function() {
              describe('and there is no subclassed widget', function() {
                it ('should find original widget role by source option', function() {
                  var instance = new LSD.Widget({
                    tag: 'button',
                    source: 'body',
                    context: 'source_test',
                    attributes: {
                      type: 'submit',
                      kind: 'zap'
                    }
                  });
                  expect(instance.role).toEqual(LSD.SourceTest.Body)
                })
              })
              describe('and there is subclassed widget', function() {
                it ('should find a subclassed widget by source option and type attribute', function() {
                  var instance = new LSD.Widget({
                    tag: 'body',
                    source: 'button',
                    context: 'source_test',
                    attributes: {
                      type: 'submit',
                      kind: 'zap'
                    }
                  });
                  expect(instance.role).toEqual(LSD.SourceTest.Button.Submit)
                })
              })
            })
          });
        });
        describe('and kind attribute', function() {
          describe('and there is no subclassed widget', function() {
            it ('should find original widget role', function() {
              var instance = new LSD.Widget({
                tag: 'body',
                source: 'button',
                context: 'source_test',
                attributes: {
                  kind: 'submit'
                }
              });
              expect(instance.role).toEqual(LSD.SourceTest.Button.Submit)
            })
          })
          describe('and there is subclassed widget', function() {
            it ('should find a subclassed widget', function() {
              var instance = new LSD.Widget({
                tag: 'body',
                source: 'button',
                context: 'source_test',
                attributes: {
                  kind: 'zap'
                }
              });
              expect(instance.role).toEqual(LSD.SourceTest.Button)
            })
          });
        })
      });
      
      describe("when given an element", function() {
        describe("with type and kind", function() {
          it ("should find a deep subclass", function() {
            var element = document.createElement('button');
            element.setAttribute('type', 'submit');
            element.setAttribute('kind', 'bang')
            var instance = new LSD.Widget(element, {context: 'source_test'});
            expect(instance.role).toEqual(LSD.SourceTest.Button.Submit.Bang);
          });
          describe("and source is given too", function() {
            it ("should find a deep subclass", function() {
              var element = document.createElement('body');
              element.setAttribute('type', 'submit');
              element.setAttribute('kind', 'bang')
              var instance = new LSD.Widget(element, {context: 'source_test', source: 'button'});
              expect(instance.role).toEqual(LSD.SourceTest.Button.Submit.Bang);
            });
            describe("but the role path doesnt match", function() {
              it ("should find whatever it matches", function() {
                var element = document.createElement('button');
                element.setAttribute('type', 'submit');
                element.setAttribute('kind', 'bang')
                var instance = new LSD.Widget(element, {context: 'source_test', source: 'body'});
                expect(instance.role).toEqual(LSD.SourceTest.Body);
              })
            })
          })
        })
      })
    });
    
    it ('should create a widget off an element and replace it when tag is changed', function() {
      var element = document.createElement('body');
      var widget = new LSD.Widget(element, {context: 'source_test'});
      widget.build();
      expect(widget.tagName).toEqual('body');
      expect(widget.getBody).toBeTruthy();
      widget.properties.set('tag', 'button')
      expect(widget.getBody).toBeFalsy();
      //xit expect(widget.element.get('tag')).toEqual('button')
    })
    
    it('should implement options and methods from a button role', function() {
      var clicked = false;
      LSD.Widget.Buttonesque = new Class({
        options: {
          events: {
            element: {
              'click': 'onClick'
            }
          }
        },

        onClick: function(event) {
          clicked = true;
        }
      });
      var element = new Element('div');
      var instance = new LSD.Widget(element, {tag:'buttonesque', context: 'widget'});
      expect(instance.role).toEqual(LSD.Widget.Buttonesque)
      element.fireEvent('click');
      expect(clicked).toBeTruthy();
    });
  });
  
  describe('mixin', function() {
    it ('should respect multiple mixin requests', function() {
      LSD.Mixin.Zizzoro = new Class({
        bang: function() {}
      })
      var instance = new LSD.Widget;
      expect(instance.bang).toBeFalsy()
      instance.mixins.include('zizzoro');
      expect(instance.bang).toBeTruthy()
      instance.mixins.erase('zizzoro');
      expect(instance.bang).toBeFalsy()
      instance.mixins.include('zizzoro');
      expect(instance.bang).toBeTruthy()
      instance.mixins.include('zizzoro');
      expect(instance.bang).toBeTruthy()
      instance.mixins.erase('zizzoro');
      expect(instance.bang).toBeTruthy()
      instance.mixins.erase('zizzoro');
      expect(instance.bang).toBeFalsy()
    });
  });
  
});