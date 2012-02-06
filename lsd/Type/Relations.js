describe('LSD.Type.Relations', function() {
  describe('when initialized on an object', function() {
    describe('and related widget is set explicitly', function() {
      it ('should assign widget', function() {
        var widget = new LSD.Element({
          relations: {
            buttons: {}
          }
        });
        var button = new LSD.Element({tagName: 'button'});
        widget.relations.set('buttons', button);
        expect(widget.buttons.clone()).toEqual(LSD.Array(button))
        widget.relations.unset('buttons', button)
        expect(widget.buttons.clone()).toEqual(LSD.Array())
      })
    })
    describe('and related widget is found', function() {
      describe('and relation has options to be passed to widget', function() {
        describe('and relation defines events to be passed to widget', function() {
          it ("should add events to the widget when it matches, and remove them when it matches no more", function() {
            var click = function() {};
            var widget = new LSD.Element({
              relations: {
                buttons: {
                  events: {
                    click: click
                  }
                }
              }
            })
            var button = new LSD.Element({tagName: 'button'})
            widget.relations.set('buttons', button);
            expect(button.events.click).toEqual([click])
            widget.relations.unset('buttons', button);
            expect(button.events.click).toEqual([])
          });
        });
        describe('and relation defines attributes to be passed to widget', function() {
          it ("should set the attributes to the widget when it matches, and unset them when it matches no more", function() {
            var widget = new LSD.Element({
              relations: {
                buttons: {
                  attributes: {
                    title: 'Click me bro!'
                  }
                }
              }
            })
            var button = new LSD.Element({tagName: 'button'})
            widget.relations.set('buttons', button);
            expect(button.attributes.title).toEqual('Click me bro!');
            widget.relations.unset('buttons', button);
            expect(button.attributes.title).toBeUndefined()
          });
        });
        describe('and relation defines custom options set to be passed to widget', function() {
          it ("should merge those unknown options into the widget", function() {
            var widget = new LSD.Element({
              relations: {
                buttons: {
                  buffalos: {
                    title: 'Click me bro!'
                  }
                }
              }
            })
            var button = new LSD.Element({tagName: 'button'})
            widget.relations.set('buttons', button);
            expect(widget.buffalos).toBeFalsy();
            expect(button.buffalos.title).toEqual('Click me bro!');
            widget.relations.unset('buttons', button);
            expect(button.buffalos.title).toBeUndefined()
          })
        })
      });
      describe('and relation has special configuration', function() {
        describe('and relation defines proxy (`proxy` option is used)', function() {
          it ('should define proxy on a widget holder and automatically match the widgets that match the proxy', function() {
            
          });
        });
        describe('and relation defines a selector to find widgets (`match` option is used)', function() {
          it ('should find widgets by selector and assign them', function() {
            
          });
        });
        describe('and relation defines a selector to filter found widgets (`filter` option is used)', function() {
          it ('should filter the found widgets by that criteria', function() {
            
          })
        });
        describe('and relation defines subrelations (`scopes` option is used)', function() {
          it ('should define subrelations on a widget holder', function() {
            
          })
        })
        describe('and relation is a subrelation (`scope` option is used)', function() {
          it ('should use the widgets from original relation', function() {
            
          })
        })
        describe('and relation registers the relation holder in related widgets (`as` option is used)', function() {
          it ('should write the relation origin to related widgets', function() {
            var as = {
              as: 'weedget'
            }
            var widget = new LSD.Element({
              relations: {
                buttons: as
              }
            })
            var button = new LSD.Element({tagName: 'button'});
            var button2 = new LSD.Element({tagName: 'button'})
            widget.relations.set('buttons', button);
            expect(button.as).toBeUndefined();
            expect(button.weedget).toEqual(widget);
            expect(button2.as).toBeUndefined();
            expect(button2.weedget).toBeUndefined();
            widget.relations.set('buttons', button2);
            expect(button.weedget).toEqual(widget);
            expect(button2.weedget).toEqual(widget);
            widget.relations.unset('buttons', button);
            expect(button.weedget).toBeUndefined()
            expect(button2.weedget).toEqual(widget);
            widget.relations.unset('buttons', button2);
            expect(button.weedget).toBeUndefined()
            expect(button2.weedget).toBeUndefined()
            widget.relations.set('buttons', button2);
            expect(button2.weedget).toEqual(widget);
            widget.relations.set('buttons', button);
            expect(button.weedget).toEqual(widget);
            widget.relations.mix({buttons: as}, null, null, false);
            expect(button.weedget).toBeUndefined()
            expect(button2.weedget).toBeUndefined()
            widget.relations.unset('buttons', button2);
            expect(button2.weedget).toBeUndefined()
            widget.relations.set('buttons', button2);
            expect(button2.weedget).toBeUndefined()
            widget.relations.mix({buttons: as});
            expect(button2.weedget).toEqual(widget)
            expect(button.weedget).toEqual(widget)
            widget.relations.mix({buttons: as}, null, null, false);
            expect(button.weedget).toBeUndefined()
            expect(button2.weedget).toBeUndefined()
          })
        })
        describe('and relation registers all relation holders that match the widget (`collection` option is used)', function() {
          it ('should write collection of all relation origins that related to that widget', function() {
            var collection = {
              collection: 'labels'
            }
            var widget = new LSD.Element({
              relations: {
                buttons: collection
              }
            })
            var widget2 = new LSD.Element({
              relations: {
                buttons: collection
              }
            })
            var button = new LSD.Element({tagName: 'button'});
            var button2 = new LSD.Element({tagName: 'button'});
            widget.relations.set('buttons', button);
            expect(button.collection).toBeUndefined();
            expect(button.labels.clone()).toEqual(LSD.Array(widget));
            expect(button2.collection).toBeUndefined();
            expect(button2.labels).toBeUndefined();
            widget.relations.set('buttons', button2);
            expect(button.labels.clone()).toEqual(LSD.Array(widget));
            expect(button2.labels.clone()).toEqual(LSD.Array(widget));
            widget2.relations.set('buttons', button2);
            expect(button.labels.clone()).toEqual(LSD.Array(widget));
            expect(button2.labels.clone()).toEqual(LSD.Array(widget, widget2));
            widget2.relations.set('buttons', button);
            expect(button.labels.clone()).toEqual(LSD.Array(widget, widget2));
            expect(button2.labels.clone()).toEqual(LSD.Array(widget, widget2));
            widget.relations.unset('buttons', button);
            expect(button.labels.clone()).toEqual(LSD.Array(widget2));
            expect(button2.labels.clone()).toEqual(LSD.Array(widget, widget2));
            widget2.relations.unset('buttons', button2);
            expect(button.labels.clone()).toEqual(LSD.Array(widget2));
            expect(button2.labels.clone()).toEqual(LSD.Array(widget));
            widget.relations.unset('buttons', button2);
            expect(button.labels.clone()).toEqual(LSD.Array(widget2));
            expect(button2.labels.clone()).toEqual(LSD.Array());
            widget2.relations.unset('buttons', button);
            expect(button.labels.clone()).toEqual(LSD.Array());
            expect(button2.labels.clone()).toEqual(LSD.Array());
          })
        })
        describe('and relation defines callbacks (`callbacks` option is used)', function() {
          it ('should assign callbacks and call them when applicable', function() {
            var index = 0, filled = 0;
            var fill = function() {
              filled ++;
            }
            var empty = function() {
              filled --;
            }
            var add = function() {
              index ++;
            };
            var remove = function() {
              index --;
            }
            var callbacks = {
              fill: fill,
              empty: empty,
              add: add,
              remove: remove
            };
            var widget = new LSD.Element({
              relations: {
                buttons: {
                  callbacks: callbacks
                }
              }
            })
            var button = new LSD.Element({tagName: 'button'});
            var button2 = new LSD.Element({tagName: 'button'});
            expect(button.callbacks).toBeUndefined()
            widget.relations.set('buttons', button);
            expect(button.callbacks).toBeUndefined()
            expect(index).toEqual(1);
            expect(filled).toEqual(1);
            widget.relations.set('buttons', button2);
            expect(index).toEqual(2);
            expect(filled).toEqual(1);
            widget.relations.unset('buttons', button);
            expect(index).toEqual(1);
            expect(filled).toEqual(1);
            widget.relations.unset('buttons', button2);
            expect(index).toEqual(0);
            expect(filled).toEqual(0);
            widget.relations.mix({buttons: {callbacks: callbacks}}, null, null, false);
            widget.relations.set('buttons', button);
            expect(index).toEqual(0);
            expect(filled).toEqual(0);
            widget.relations.set('buttons', button2);
            expect(index).toEqual(0);
            expect(filled).toEqual(0);
          })
        });
        describe('and relation is defined as `singular`', function() {
          it ('should write the first matched widget', function() {
            var widget = new LSD.Element({
              relations: {
                button: {
                  singular: true
                }
              }
            });
            var button = new LSD.Element({tagName: 'button'});
            var button2 = new LSD.Element({tagName: 'button'});
            widget.relations.set('button', button);
            expect(widget.relations.button.slice()).toEqual([button]);
            expect(widget.button).toEqual(button);
            widget.relations.mix({button: {singular: true}}, null, null, false);
            expect(widget.button.slice()).toEqual([button]);
            widget.relations.set('button', button2);
            expect(widget.button.slice()).toEqual([button, button2]);
            widget.relations.mix({button: {singular: true}});
            expect(widget.button).toEqual(button);
            widget.relations.unset('button', button);
            expect(widget.relations.button.slice()).toEqual([button2]);
            expect(widget.button).toEqual(button2);
            widget.relations.mix({button: {singular: true}}, null, null, false);
            expect(widget.button.slice()).toEqual([button2]);
            widget.relations.mix({button: {singular: true}});
            expect(widget.button).toEqual(button2);
            widget.relations.set('button', button);
            expect(widget.button).toEqual(button2);
            widget.relations.unset('button', button2);
            expect(widget.button).toEqual(button);
            widget.relations.unset('button', button);
            expect(widget.button).toBeNull()
            widget.relations.mix({button: {singular: true}}, null, null, false);
            expect(widget.button.slice()).toEqual([]);
          })
        })
      })
    })
  })
})