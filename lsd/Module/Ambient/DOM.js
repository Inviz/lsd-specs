describe("LSD.Module.Ambient.DOM", function() {
  if (!LSD.document) new LSD.Document;
  LSD.Widget.Root = new Class({
    options: {
      tag: 'root',
      pseudos: ['root'],
      document: LSD.document
    }
  });
  describe("#dom manipulations", function() {
    
    it ("contains", function() {
      var root = new LSD.Widget({tag: 'root'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'pane'});

      root.appendChild(pane1);
      expect(root.contains(pane1)).toBeTruthy();
      expect(pane1.sourceIndex).toEqual(2)

      root.removeChild(pane1);
      root.appendChild(pane2);
      expect(root.sourceIndex).toEqual(1);
      expect(pane2.sourceIndex).toEqual(2);
      expect(root.contains(pane1)).toBeFalsy();

      pane2.appendChild(pane1);
      expect(root.contains(pane1)).toBeTruthy();
      expect(pane2.sourceIndex).toEqual(2);
      expect(pane1.sourceIndex).toEqual(3);
    });

    it ("getChildren", function() {
      var root = new LSD.Widget({tag: 'root'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      pane1.addClass("first");

      var pane2 = new LSD.Widget({tag: 'pane'});
      pane2.addClass("second");

      var pane3 = new LSD.Widget({tag: 'pane'});
      pane3.addClass("second");


      root.appendChild(pane1);
      root.appendChild(pane2);
      expect(root.getChildren()).toEqual([pane1,pane2]);

      root.appendChild(pane3);
      expect(root.getChildren()).toEqual([pane1,pane2, pane3]);

      root.removeChild(pane1);
      expect(root.getChildren()).toEqual([pane2, pane3]);

      pane3.appendChild(pane1);
      expect(root.getChildren()).toEqual([pane2, pane3]);
    });

    it (".root", function() {
      var root = new LSD.Widget({tag: 'root', pseudos: ['root']});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'pane'});
      var pane3 = new LSD.Widget({tag: 'pane'});

      root.appendChild(pane1);
      pane1.appendChild(pane2);
      pane2.appendChild(pane3);  // d > 1 > 2 > 3
      expect(pane1.root).toEqual(root);
      expect(pane2.root).toEqual(root);
      expect(pane3.root).toEqual(root);

      root.removeChild(pane1); // d & 1 > 2 > 3
      expect(pane1.root).toBeFalsy();
      expect(pane2.root).toBeFalsy();
      expect(pane3.root).toBeFalsy();

      pane2.removeChild(pane3); // 1 > 2 & 3
      expect(pane1.contains(pane3)).toBeFalsy();

      pane3.appendChild(pane1); // 3 > 1 > 2
      expect(pane1.root).toBeFalsy();
      expect(pane2.root).toBeFalsy();
      expect(pane3.root).toBeFalsy();
      
      root.appendChild(pane3);
      expect(pane1.root).toEqual(root);
      expect(pane2.root).toEqual(root);
      expect(pane3.root).toEqual(root);

      // test with setParent unsetParent

    });


    describe ("setParent", function() {
      it ("should set properties right", function() {
        var root = new LSD.Widget({tag: 'root'});

        var pane1 = new LSD.Widget({tag: 'pane'});
        var pane2 = new LSD.Widget({tag: 'pane'});
        var pane3 = new LSD.Widget({tag: 'pane'});

        root.appendChild(pane1);
        expect(root.firstChild).toEqual(pane1); 
        expect(root.lastChild).toEqual(pane1);
        expect(pane1.previousSibling).toBeUndefined();
        expect(pane1.nextSibling).toBeUndefined();

        root.appendChild(pane2);
        expect(root.firstChild).toEqual(pane1);  
        expect(root.lastChild).toEqual(pane2);
        expect(pane1.previousSibling).toBeUndefined();
        expect(pane1.nextSibling).toEqual(pane2);  
        expect(pane2.previousSibling).toEqual(pane1);  
        expect(pane2.nextSibling).toBeUndefined();

        root.appendChild(pane3);
        expect(root.firstChild).toEqual(pane1);  
        expect(root.lastChild).toEqual(pane3);
        expect(pane1.previousSibling).toBeUndefined();
        expect(pane1.nextSibling).toEqual(pane2);   
        expect(pane2.previousSibling).toEqual(pane1);  
        expect(pane2.nextSibling).toEqual(pane3);  
        expect(pane3.previousSibling).toEqual(pane2);  
        expect(pane3.nextSibling).toBeUndefined();
      })
      
      xit ("should keep sourceIndex", function() {
        
        var root = new LSD.Widget({tag: 'root'});

        var pane1 = new LSD.Widget({tag: 'pane'});
        var pane2 = new LSD.Widget({tag: 'pane'});
        var pane3 = new LSD.Widget({tag: 'pane'});
        
        pane2.appendChild(pane3);
        expect(pane2.sourceIndex).toEqual(1);
        expect(pane3.sourceIndex).toEqual(2);
        expect(pane2.sourceLastIndex).toEqual(2);
        expect(pane3.sourceLastIndex).toBeFalsy();
        
        root.appendChild(pane2)
        expect(root.sourceLastIndex).toEqual(3);
        expect(root.sourceIndex).toEqual(1);
        expect(pane2.sourceIndex).toEqual(2);
        expect(pane2.sourceLastIndex).toEqual(3);
        expect(pane3.sourceIndex).toEqual(3);
        expect(pane3.sourceLastIndex).toBeFalsy();
        
        expect(pane2.sourceLastIndex).toEqual(3);
        root.appendChild(pane1);
        expect(root.sourceLastIndex).toEqual(4);
        expect(pane1.sourceIndex).toEqual(4);
        
        var rooty = new LSD.Widget({tag: 'root'});
        rooty.appendChild(root);
        expect(rooty.sourceLastIndex).toEqual(5);
        expect(rooty.sourceIndex).toEqual(1);
        expect(root.sourceLastIndex).toEqual(5);
        expect(root.sourceIndex).toEqual(2);
        expect(pane2.sourceIndex).toEqual(3);
        expect(pane2.sourceLastIndex).toEqual(4);
        expect(pane3.sourceIndex).toEqual(4);
        expect(pane3.sourceLastIndex).toBeFalsy();
        
        var pane4 = new LSD.Widget({tag: 'kane'});
        pane2.appendChild(pane4);
        expect(rooty.sourceLastIndex).toEqual(6);
        expect(rooty.sourceIndex).toEqual(1);
        expect(root.sourceLastIndex).toEqual(6);
        expect(root.sourceIndex).toEqual(2);
        expect(pane1.sourceIndex).toEqual(5);
        expect(pane2.sourceIndex).toEqual(3);
        expect(pane2.sourceLastIndex).toEqual(5);
        expect(pane3.sourceLastIndex).toBeFalsy();
        expect(pane3.sourceIndex).toEqual(6);
        expect(pane4.sourceIndex).toEqual(4);
        
        expect(rooty.expectations.tag.pane.map(function(e) { return e.sourceIndex})).toEqual([])
      })
    });
    

    it ("unsetParent", function() {
      var root = new LSD.Widget({tag: 'root'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'pane'});
      var pane3 = new LSD.Widget({tag: 'pane'});

      root.appendChild(pane1);
      root.appendChild(pane2);
      root.appendChild(pane3);

      root.removeChild(pane3);
      expect(root.firstChild).toEqual(pane1);
      expect(root.lastChild).toEqual(pane2);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toEqual(pane2);
      expect(pane2.previousSibling).toEqual(pane1);
      expect(pane2.nextSibling).toBeUndefined();

      root.removeChild(pane2);
      expect(root.firstChild).toEqual(pane1);
      expect(root.lastChild).toEqual(pane1);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toBeUndefined();

      root.removeChild(pane1);
      expect(root.firstChild).toBeUndefined();
      expect(root.lastChild).toBeUndefined();

      expect(pane1.parentNode).toBeFalsy();
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toBeUndefined();

    });

    it ("removeChild", function() {
      var root = new LSD.Widget({tag: 'root'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'pane'});
      var pane3 = new LSD.Widget({tag: 'pane'});

      root.appendChild(pane1);
      root.appendChild(pane2);
      root.appendChild(pane3);

      root.removeChild(pane3);
      expect(root.firstChild).toEqual(pane1);
      expect(root.lastChild).toEqual(pane2);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toEqual(pane2);
      expect(pane2.previousSibling).toEqual(pane1);
      expect(pane2.nextSibling).toBeUndefined();

      root.removeChild(pane2);
      expect(root.firstChild).toEqual(pane1);
      expect(root.lastChild).toEqual(pane1);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toBeUndefined();

      root.removeChild(pane1);
      expect(root.firstChild).toBeUndefined();
      expect(root.lastChild).toBeUndefined();

      expect(pane1.parentNode).toBeFalsy();
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toBeUndefined();

    });

    it ("insertBefore", function() {
      var root = new LSD.Widget({tag: 'root'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'label'});
      var pane3 = new LSD.Widget({tag: 'textbox'});

      root.appendChild(pane3);
      root.insertBefore(pane1, pane3);
      expect(root.firstChild).toEqual(pane1);
      expect(root.lastChild).toEqual(pane3);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toEqual(pane3);
      expect(pane3.previousSibling).toEqual(pane1);
      expect(pane3.nextSibling).toBeUndefined();
      root.insertBefore(pane2, pane3);
      expect(root.firstChild).toEqual(pane1);
      expect(root.lastChild).toEqual(pane3);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toEqual(pane2);
      expect(pane2.previousSibling).toEqual(pane1);
      expect(pane2.nextSibling).toEqual(pane3);
      expect(pane3.previousSibling).toEqual(pane2);
      expect(pane3.nextSibling).toBeUndefined();

    });

    it ("replaceChild", function() {
      var root = new LSD.Widget({tag: 'root'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'pane'});

      root.appendChild(pane1);
      root.replaceChild(pane2, pane1);
      expect(root.firstChild).toEqual(pane2);
      expect(root.lastChild).toEqual(pane2);
      expect(pane2.previousSibling).toBeUndefined();
      expect(pane2.nextSibling).toBeUndefined();

    });

    it ("replaceChild", function() {
      var root = new LSD.Widget({tag: 'root'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'pane'});
      var pane3 = new LSD.Widget({tag: 'pane'});
      var pane4 = new LSD.Widget({tag: 'pane'});

      root.appendChild(pane1);
      root.appendChild(pane4);
      root.appendChild(pane3);

      root.replaceChild(pane2, pane4);
      
      expect(root.firstChild).toEqual(pane1);
      expect(root.lastChild).toEqual(pane3);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toEqual(pane2);
      expect(pane2.previousSibling).toEqual(pane1);
      expect(pane2.nextSibling).toEqual(pane3);
      expect(pane3.previousSibling).toEqual(pane2);
      expect(pane3.nextSibling).toBeUndefined();

    });

    it ("inject horizontal", function() {
      var root = new LSD.Widget({tag: 'root'});

      var pane1 = new LSD.Widget({tag: 'pane1'});
      var pane2 = new LSD.Widget({tag: 'pane2'});
      var pane3 = new LSD.Widget({tag: 'pane3'});

      root.appendChild(pane2);
      pane1.inject(pane2, "before");
      pane3.inject(pane2, "after");
      expect(root.firstChild).toEqual(pane1);
      expect(root.lastChild).toEqual(pane3);
      expect(pane1.previousSibling).toBeUndefined();
      expect(pane1.nextSibling).toEqual(pane2);
      expect(pane2.previousSibling).toEqual(pane1);
      expect(pane2.nextSibling).toEqual(pane3);
      expect(pane3.previousSibling).toEqual(pane2);
      expect(pane3.nextSibling).toBeUndefined();

    });

    it ("inject vertical", function() {
      var root = new LSD.Widget({tag: 'root'});

      var pane1 = new LSD.Widget({tag: 'pane'});
      var pane2 = new LSD.Widget({tag: 'pane'});
      var pane3 = new LSD.Widget({tag: 'pane'});

      root.appendChild(pane1);
      pane2.inject(pane1, "top");
      pane3.inject(pane2, "bottom");

      expect(root.firstChild).toEqual(pane1);
      expect(pane1.firstChild).toEqual(pane2);
      expect(pane2.firstChild).toEqual(pane3);
    });
    
    describe("appendChild", function() {
      describe("without proxies", function() {
        describe("when given widget", function() {
          it ("should set all the links around", function() {
            var root = new LSD.Widget({tag: 'root'});

            var pane1 = new LSD.Widget({tag: 'pane'});
            var pane2 = new LSD.Widget({tag: 'pane'});
            var pane3 = new LSD.Widget({tag: 'pane'});

            root.appendChild(pane1);
            expect(root.firstChild).toEqual(pane1);
            expect(root.lastChild).toEqual(pane1);
            expect(pane1.previousSibling).toBeUndefined();
            expect(pane1.nextSibling).toBeUndefined();

            root.appendChild(pane2);
            expect(root.firstChild).toEqual(pane1);
            expect(root.lastChild).toEqual(pane2);
            expect(pane1.previousSibling).toBeUndefined();
            expect(pane1.nextSibling).toEqual(pane2);
            expect(pane2.previousSibling).toEqual(pane1);
            expect(pane2.nextSibling).toBeUndefined();

            root.appendChild(pane3);
            expect(root.firstChild).toEqual(pane1);
            expect(root.lastChild).toEqual(pane3);
            expect(pane1.previousSibling).toBeUndefined();
            expect(pane1.nextSibling).toEqual(pane2);
            expect(pane2.previousSibling).toEqual(pane1);
            expect(pane2.nextSibling).toEqual(pane3);
            expect(pane3.previousSibling).toEqual(pane2);
            expect(pane3.nextSibling).toBeUndefined();
          });
          
          it ("may be called repeatedly on one widget", function() {
            var root1 = new LSD.Widget({tag: 'root'});
            var root2 = new LSD.Widget({tag: 'root'});
            var child = new LSD.Widget({tag: 'child'});
            root1.appendChild(child);
            expect(root1.childNodes).toEqual([child]);
            expect(root1.element.getElements('*').slice(0)).toEqual([child.element])
            root2.appendChild(child);
            expect(root1.childNodes).toEqual([]);
            expect(root1.element.getElements('*').slice(0)).toEqual([])
            expect(root2.childNodes).toEqual([child]);
            expect(root2.element.getElements('*').slice(0)).toEqual([child.element])
          })
        })
        describe("when given element", function() {
          it ("should append element", function() {
            var element = new Element('li');
            var widget = new LSD.Widget({tag: 'ul'});
            widget.appendChild(element);
            expect(widget.element.getFirst()).toEqual(element);
          })
        })
      })
      describe("with proxy", function() {
        describe("given explicity", function() {
          describe("targeted on widget", function() {
            describe("having widget as a container", function() {
              it ("should redirect widget into that container widget", function() {
                var list = new LSD.Widget({tag: 'list'});
                var table = new LSD.Widget({tag: 'table'});
                table.addProxy('redirection', {
                  selector: 'li',
                  container: list
                });
                var item = new LSD.Widget({tag: 'li'});
                table.appendChild(item);
                expect(table.childNodes).toEqual([]);
                expect(list.childNodes).toEqual([item])
              })
            })
            describe("having element as a container", function() {
              it ("should redirect widget into that element", function() {
                var list = new Element('ul');
                var table = new LSD.Widget({tag: 'table'});
                table.addProxy('redirection', {
                  selector: 'li',
                  container: list
                });
                var item = new LSD.Widget({tag: 'li'});
                table.appendChild(item);
                expect(table.childNodes).toEqual([item]);
                expect(list.childNodes[0]).toEqual(item.element)
              })
            })
          })
          describe("targeted on element", function() {
            describe("having widget as a container", function() {
              it ("should redirect element into that container widget", function() {
                var list = new LSD.Widget({tag: 'list'});
                var table = new LSD.Widget({tag: 'table'});
                table.addProxy('redirection', {
                  mutation: 'li',
                  container: list
                });
                var item = new Element('li');
                table.appendChild(item);
                expect(table.childNodes).toEqual([]);
                expect(list.element.childNodes[0]).toEqual(item)
              })
            })
            describe("having element as a container", function() {
              it ("should redirect element into that container element", function() {
                var list = new Element('ul');
                var table = new LSD.Widget({tag: 'table'});
                table.addProxy('redirection', {
                  mutation: 'li',
                  container: list
                });
                var item = new Element('li');
                table.appendChild(item);
                expect(table.childNodes).toEqual([]);
                expect(list.childNodes[0]).toEqual(item)
              })
            })
          })
        })
      })
    });
    describe("insertBefore", function() {
      describe("without proxies", function() {
        describe("when inserted node is a widget", function() {
          describe("and before hook is a widget", function() {
            it("should insert the widget before the target", function() {
              var root = new LSD.Widget({tag: 'root'});
              var header = new LSD.Widget({tag: 'header'});
              var section = new LSD.Widget({tag: 'section'});
              var footer = new LSD.Widget({tag: 'footer'});
              root.appendChild(header);
              root.appendChild(footer);

              root.insertBefore(section, footer);
              expect(root.childNodes).toEqual([header, section, footer]);
              expect(root.element.getChildren().slice(0)).toEqual([header.element, section.element, footer.element]);
            })
          })
          describe("and before hook is an element", function() {
            describe("which has an initialized widget too", function() {
              it ("should insert the widget before the target element's widget", function() {
                var root = new LSD.Widget({tag: 'root'});
                var header = new LSD.Widget({tag: 'header'});
                var section = new LSD.Widget({tag: 'section'});
                var footer = new LSD.Widget({tag: 'footer'});
                root.appendChild(header);
                root.appendChild(footer);
                root.insertBefore(section, footer.element);
                expect(root.childNodes).toEqual([header, section, footer]);
                expect(root.element.getChildren().slice(0)).toEqual([header.element, section.element, footer.element]);
              })
            })
            describe("which is not widget", function() {
              describe("and there is a widget after it", function() {
                it("should insert the widget before the element and the widget", function() {
                  var root = new LSD.Widget({tag: 'root'});
                  var header = new LSD.Widget({tag: 'header'});
                  var section = new LSD.Widget({tag: 'section'});
                  var nav = new Element('nav');
                  var footer = new LSD.Widget({tag: 'footer'});
                  root.appendChild(header);
                  root.appendChild(nav);
                  root.appendChild(footer);
                  root.insertBefore(section, nav);
                  expect(root.childNodes).toEqual([header, section, footer]);
                })
              });
              describe("and there's no widget after it", function() {
                it("should insert the widget before the element and the widget", function() {
                  var root = new LSD.Widget({tag: 'root'});
                  var header = new LSD.Widget({tag: 'header'});
                  var section = new LSD.Widget({tag: 'section'});
                  var nav = new Element('nav');
                  var footer = new LSD.Widget({tag: 'footer'});
                  root.appendChild(header);
                  root.appendChild(footer);
                  root.appendChild(nav);
                  root.insertBefore(section, nav);
                  expect(root.childNodes).toEqual([header, footer, section]);
                  expect(root.element.getChildren().slice(0)).toEqual([header.element, footer.element, section.element, nav]);
                })
              })
            })
          });
          describe("and before hook is not given", function() {
            it ("should append that child", function() {
              var root = new LSD.Widget({tag: 'root'});
              var header = new LSD.Widget({tag: 'header'});
              var section = new LSD.Widget({tag: 'section'});
              var footer = new LSD.Widget({tag: 'footer'});
              root.appendChild(header);
              root.appendChild(footer);
              root.insertBefore(section);
              expect(root.childNodes).toEqual([header, footer, section]);
              expect(root.element.getChildren().slice(0)).toEqual([header.element, footer.element, section.element]);
            })
          })
        });
        describe("when inserted node is an element", function() {
          describe("and before hook is a widget", function() {
            it("should insert the node before the target", function() {
              var root = new LSD.Widget({tag: 'root'});
              var header = new LSD.Widget({tag: 'header'});
              var section = new Element('section');
              var footer = new LSD.Widget({tag: 'footer'});
              root.appendChild(header);
              root.appendChild(footer);
              root.insertBefore(section, footer);
              expect(root.childNodes).toEqual([header, footer]);
              expect(root.element.getChildren().slice(0)).toEqual([header.element, section, footer.element]);
            })
          })
          describe("and before hook is an element", function() {
            describe("which has an initialized widget too", function() {
              it ("should insert the widget before the target element's widget", function() {
                var root = new LSD.Widget({tag: 'root'});
                var header = new LSD.Widget({tag: 'header'});
                var section = new Element('section');
                var footer = new LSD.Widget({tag: 'footer'});
                root.appendChild(header);
                root.appendChild(footer);
                root.insertBefore(section, footer.element);
                expect(root.childNodes).toEqual([header, footer]);
                expect(root.element.getChildren().slice(0)).toEqual([header.element, section, footer.element]);
              })
            })
            describe("which is not widget", function() {
              it("should insert the node before the element", function() {
                var root = new LSD.Widget({tag: 'root'});
                var header = new LSD.Widget({tag: 'header'});
                var section = new Element('section');
                var nav = new Element('nav');
                var footer = new LSD.Widget({tag: 'footer'});
                root.appendChild(header);
                root.appendChild(footer);
                root.appendChild(nav);
                root.insertBefore(section, nav);
                expect(root.childNodes).toEqual([header, footer]);
                expect(root.element.getChildren().slice(0)).toEqual([header.element, footer.element, section, nav]);
              })
            })
          });
          describe("and before hook is not given", function() {
            it ("should append that child", function() {
              var root = new LSD.Widget({tag: 'root'});
              var header = new LSD.Widget({tag: 'header'});
              var section = new Element('section');
              var footer = new LSD.Widget({tag: 'footer'});
              root.appendChild(header);
              root.appendChild(footer);
              root.insertBefore(section);
              expect(root.childNodes).toEqual([header, footer]);
              expect(root.element.getChildren().slice(0)).toEqual([header.element, footer.element, section]);
            })
          })
        })
      });
      describe("with proxy", function() {
        describe("given explicity", function() {
          describe("targeted on widget", function() {
            describe("having widget as a container", function() {
              it ("should redirect widget into that container widget", function() {
                var list = new LSD.Widget({tag: 'list'});
                var table = new LSD.Widget({tag: 'table'});
                var thead = new LSD.Widget({tag: 'thead'});
                var tbody = new LSD.Widget({tag: 'tbody'});
                table.addProxy('redirection', {
                  selector: 'li',
                  container: list
                });
                var item = new LSD.Widget({tag: 'li'});
                table.appendChild(thead);
                table.appendChild(tbody);
                table.insertBefore(item, tbody);
                expect(table.childNodes).toEqual([thead, tbody]);
                expect(list.childNodes).toEqual([item])
              })
            })
            describe("having element as a container", function() {
              it ("should redirect widget into that element", function() {
                var list = new Element('ul');
                var table = new LSD.Widget({tag: 'table'});
                var thead = new LSD.Widget({tag: 'thead'});
                var tbody = new LSD.Widget({tag: 'tbody'});
                table.addProxy('redirection', {
                  selector: 'li',
                  container: list
                });
                var item = new LSD.Widget({tag: 'li'});
                table.appendChild(thead);
                table.appendChild(tbody);
                table.insertBefore(item, tbody);
                expect(table.childNodes).toEqual([thead, tbody, item]);
                expect(list.childNodes[0]).toEqual(item.element)
              })
            })
          })
          describe("targeted on element", function() {
            describe("having widget as a container", function() {
              it ("should redirect element into that container widget", function() {
                var list = new LSD.Widget({tag: 'list'});
                var table = new LSD.Widget({tag: 'table'});
                var thead = new LSD.Widget({tag: 'thead'});
                var tbody = new LSD.Widget({tag: 'tbody'});
                table.addProxy('redirection', {
                  mutation: 'li',
                  container: list
                });
                var item = new Element('li');
                table.appendChild(thead);
                table.appendChild(tbody);
                table.appendChild(item);
                expect(table.childNodes).toEqual([thead, tbody]);
                expect(list.element.childNodes[0]).toEqual(item)
              })
            })
            describe("having element as a container", function() {
              it ("should redirect element into that container element", function() {
                var list = new Element('ul');
                var table = new LSD.Widget({tag: 'table'});
                var thead = new LSD.Widget({tag: 'thead'});
                var tbody = new LSD.Widget({tag: 'tbody'});
                table.addProxy('redirection', {
                  mutation: 'li',
                  container: list
                });
                var item = new Element('li');
                table.appendChild(thead);
                table.appendChild(tbody);
                table.appendChild(item);
                expect(table.childNodes).toEqual([thead, tbody]);
                expect(list.childNodes[0]).toEqual(item)
              })
            })
          })
        })
      })
    })


  });




  describe(".destroy()", function() {
    describe("when given an tree of elements", function() {
      it ("should call destroy method on all containing widget and destroy all elements removing events", function() {
        var wrapper = new Element('div#wrapper');
        var target = new Element('section#target').inject(wrapper)
        var link = new Element('a').inject(target).addEvent('click', function(){});
        var widget = new LSD.Widget({tag: 'button'}).inject(link);
        expect(link.retrieve('events')).toBeTruthy();
        LSD.Module.DOM.destroy(target);
        expect(link.retrieve('events')).toBeFalsy(0);
      })
    });
  });

});