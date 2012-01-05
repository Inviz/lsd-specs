describe('Layout', function() {
  describe('Templates', function() {
    describe('when DOM tree is used as a template', function() {
      describe('and mutations are used to convert elements to widgets', function() {
        var Context = Factory('type');
        Context.Form = new Class({
          options: {
            tag: 'form',
            mutations: {
              '> progresz': 'meter',
              'i': true
            }
          }
        });
        Context.Meter = new Class({
          options: {
            mutations: {
              '+ strong': 'button',
              '~ strong': 'icon'
            }
          }
        })
        var parse = function(element, options) {
          if (element.indexOf) element = new Element('div', {html: element});
          return new LSD.Widget(element, Object.append({context: Context, document: Factory('document')}, options));
        }
        new LSD.Type('Clean');
        Context.Superform = new Class({
          options: {
            mutations: {
              'div > section > progresz': 'meter',
              'div ~ progresz + litrario': 'liter'
            }
          }
        });
        var superform = '<superform>\
          <strong></strong>\
          <progresz id="a"></progresz>\
          \
          <progresz id="b"></progresz>\
          <strong></strong>\
          \
          <div>\
            <section>\
              <div>\
                <section>\
                  <progresz id="bc"></progresz>\
                </section>\
              </div>\
              <section>\
                <progresz id="c"></progresz>\
                <progresz id="d"></progresz>\
              </section>\
              <progresz id="e"></progresz>\
              <litrario id="f"></litrario>\
            </section>\
            <progresz id="g"></progresz>\
            <progresz id="h"></progresz>\
          </div>\
        </superform>';

        it('should convert an element to widget with the same name as element\'s tag name', function() {
          var fragment = parse('<meter></meter>');
          expect(Slick.find(fragment, 'meter')).toBeTruthy()
        })

        it('should NOT convert an element based on class', function() {
          var fragment = parse('<div class="lsd meter"></div>');
          expect(Slick.find(fragment, 'meter')).toBeFalsy()
        })

        it('should mutate elements based on mutations from widget', function() {
          var fragment = parse('<form>\
            <progresz id="a"></progresz>\
            <i>Jesus</i>\
            </form>\
            <progresz id="b"></progresz>\
            <i>Jesus</i>');
          expect(Slick.find(fragment, 'form')).toBeTruthy()
          expect(Slick.find(fragment, 'meter#a')).toBeTruthy()
          expect(Slick.find(fragment, 'meter#b')).toBeFalsy()
          expect(Slick.search(fragment, 'i').length).toEqual(1)
        });

        it('should mutate elements to the right of the widget (+ and ~ combinators)', function() {
          var fragment = parse('<form>\
            <strong></strong>\
            <progresz id="a"></progresz>\
            \
            <progresz id="b"></progresz>\
            <strong></strong>\
            \
            <progresz id="c"></progresz>\
            <progresz id="d"></progresz>\
            <strong></strong>\
            <strong></strong>\
            \
            <progresz id="c"></progresz>\
            <progresz id="d"></progresz>\
            <progresz id="d"></progresz>\
            <strong></strong>\
            <strong></strong>\
            <i>Jesus</i>\
            </form>\
            <progresz id="e"></progresz>\
            <i>Jesus</i>\
            <strong></strong>');
            expect(Slick.search(fragment, 'meter').length).toEqual(7)
            expect(Slick.search(fragment, 'button').length).toEqual(3)
            expect(Slick.search(fragment, 'icon').length).toEqual(2)
            expect(Slick.search(fragment, 'i').length).toEqual(1)
          });

        it('should mutate elements by complex combinators', function() {
          var fragment = parse(superform);
          expect(Slick.search(fragment, 'meter').length).toEqual(2);
          expect(Slick.search(fragment, 'meter').map(function(e) { return e.attributes.id})).toEqual(['bc', 'e'])
          expect(Slick.search(fragment, 'liter').length).toEqual(1);
          expect(Slick.search(fragment, 'liter').map(function(e) { return e.attributes.id})).toEqual(['f']);
          expect(Slick.search(fragment.element, '*').length).toEqual(17)
        });
      
        it('should should simply clone complex layout', function() {
          var fragment = parse(superform);
          var html = fragment.element.innerHTML;
          var clone = new LSD.Widget(fragment.element, {clone: true, document: fragment.document});
          expect(html).toEqual(fragment.element.innerHTML)
          expect(Slick.search(fragment, 'meter').length).toEqual(2);
          expect(Slick.search(fragment, 'meter').map(function(e) { return e.attributes.id})).toEqual(['bc', 'e'])
          expect(Slick.search(fragment, 'liter').length).toEqual(1);
          expect(Slick.search(fragment, 'liter').map(function(e) { return e.attributes.id})).toEqual(['f']);
          expect(Slick.search(fragment.element, '*').length).toEqual(17)
          expect(Slick.search(clone, 'meter').length).toEqual(2);
          expect(Slick.search(clone, 'meter').map(function(e) { return e.attributes.id})).toEqual(['bc', 'e'])
          expect(Slick.search(clone, 'liter').length).toEqual(1);
          expect(Slick.search(clone, 'liter').map(function(e) { return e.attributes.id})).toEqual(['f']);
          expect(Slick.search(clone .element, '*').length).toEqual(17)
        });
      
        describe("when render restarts in the middle of mutation selector path", function() {
          it ("should pickup simple mutations even if render has started in the middle", function() {
            var fragment = parse(superform);
            var form = fragment.childNodes[0]
            var element = form.element;
            var target = Slick.find(element, '#bc');
            var copy = target.cloneNode(false);
            target.parentNode.insertBefore(copy, target);
            var widget = form.document.layout.render(copy, [form, target.parentNode]);
            expect(widget.tagName).toEqual('meter');
          })
      
          it ("should pickup simple mutations", function() {
            var Context = Factory('type');
            var element = new Element('div', {
              html:
            '<aside><div><section class=content>    \
              <ul>                                  \
                <li id=#aaa>                        \
                  <menu type=toolbar>               \
                    <li>123</li>                    \
                    <li>123</li>                    \
                  </menu>                           \
                </li>                               \
              </ul>                                 \
              </section></div></aside>'});
            Context.List = new Class({
              options: {
                mutations: {
                  '> li': 'item'
                }
              }
            });
            var widget = new LSD.Widget(element, {
              mutations: {
                'div > section.content > ul': 'list'
              },
              context: Context
            });
            expect(widget.getElements('*').map(function(w) { return w.tagName})).toEqual(['list', 'item']);
            widget.removeLayout(null, element.getElement('.content > ul'));
            expect(widget.getElements('*').map(function(w) { return w.tagName})).toEqual([]);
            var fragment = document.createFragment('\
              <ul>                                  \
                <li id=#aaa>                        \
                  <menu type=toolbar>               \
                    <li>123</li>                    \
                    <li>123</li>                    \
                  </menu>                           \
                </li>                               \
              </ul>')
            widget.addLayout(null, fragment, element.getElement('.content'))
              expect(widget.getElements('*').map(function(w) { return w.tagName})).toEqual(['list', 'item']);
          })
      
          it ("should pickup deep mutation", function() {
            var Context = Factory('type');
            var element = new Element('div', {
              html:
            '<aside><div><section class=content>    \
              <ul>                                  \
                <li id=#aaa>                        \
                  <menu type=toolbar>               \
                    <li>123</li>                    \
                    <li>123</li>                    \
                  </menu>                           \
                </li>                               \
              </ul>                                 \
              </section></div></aside>'});
            Context.List = new Class({
              options: {
                mutations: {
                  '> li': 'item'
                }
              }
            });
            Context.Div = new Class({
              options: {
                mutations: {
                  '> section > ul': 'list'
                }
              }
            });
            var widget = new LSD.Widget(element, {
              mutations: {
                'aside > div': 'div'
              },
              context: Context
            });
            expect(widget.getElements('*').map(function(w) { return w.tagName})).toEqual(['div', 'list', 'item']);
            widget.childNodes[0].removeLayout(null, element.getElement('section.content > ul'));
            expect(widget.getElements('*').map(function(w) { return w.tagName})).toEqual(['div']);
            var fragment = document.createFragment('\
              <ul>                                  \
                <li id=#aaa>                        \
                  <menu type=toolbar>               \
                    <li>123</li>                    \
                    <li>123</li>                    \
                  </menu>                           \
                </li>                               \
              </ul>')
            widget.addLayout(null, fragment, element.getElement('.content'))
              expect(widget.getElements('*').map(function(w) { return w.tagName})).toEqual(['div', 'list', 'item']);
          })
      
          describe("and mutations are all deep", function() {
            it("should not match elements that are too deep", function() {
              var element = new Element('div', {
                html: 
                '<section class=content>    \
                  <ul>                      \
                    <li id=#aaa>            \
                      <menu type=toolbar>   \
                        <li>123</li>        \
                        <li>123</li>        \
                      </menu>               \
                    </li>                   \
                    <li id=bbb>             \
                      <menu type=toolbar>   \
                        <li>                \
                         <menu type=toolbar>\
                            <li>123</li>    \
                            <li>123</li>    \
                          </menu>           \
                        </li>               \
                        <li>123</li>        \
                      </menu>               \
                    </li>                   \
                  </ul>                     \
                  </section>'
              })
              var widget = new LSD.Widget(element, {
                mutations: {
                  '> section.content > ul': 'list',
                  '> section.content > ul menu': 'menu',
                  '> section.content > ul > li': 'item',
                  'menu[type=toolbar]': 'menu'
                },
                context: Context
              });
              expect(widget.getElements('list').length).toEqual(1);
              expect(widget.getElements('item').length).toEqual(2);
              expect(widget.getElements('menu').length).toEqual(3);
            })
          })
        })
      })
    })
  })
})