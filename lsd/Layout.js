describe("LSD.Layout", function() {
  describe("#render", function() {
    new LSD.Type('Test')
    LSD.Test.Form = new Class({
      options: {
        tag: 'form',
        mutations: {
          '> progresz': 'meter',
          'i': true
        }
      }
    });
    LSD.Test.Meter = new Class({
      options: {
        mutations: {
          '+ strong': 'button',
          '~ strong': 'icon'
        }
      }
    })
    

    var doc = LSD.document || new LSD.Document
    var parse = function(element, options) {
      if (element.indexOf) element = new Element('div', {html: element});
      return new LSD.Widget(element, Object.append({context: 'test', document: doc}, options));
    }
    
    new LSD.Type('Clean');
    

    LSD.Test.Superform = new Class({
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
      
    describe("when DOM elements are used as the template", function() {
      describe("when clone option set to true", function() {
        it('should clone parts of initialized layout', function() {
          var fragment = parse('<form>Test<h2>Test</h2><progresz id="a"></progresz></form>');
          expect(Slick.search(fragment, '*').length).toEqual(2)
          expect(Slick.search(fragment.element, '*').length).toEqual(3)
          var div = new Element('div');
          var widget = new LSD.Widget(div, {document: fragment.document})
          var clone = fragment.document.layout.render(fragment.element, widget, {clone: true})
          expect(Slick.search(clone, '*').length).toEqual(2)
          expect(Slick.search(clone.element, '*').length).toEqual(3)
          expect(fragment.element.getElements('h2').length).toEqual(1);
          expect(fragment.element.getElement('h2')).toNotEqual(clone.element.getElement('h2'));
          expect(clone.element.childNodes[0].childNodes[0].textContent).toEqual('Test')
          expect(clone.element.childNodes[0].childNodes[1].childNodes[0].textContent).toEqual('Test')
        })
      })

      describe("when mutations are used to initialize widgets from elements", function() {
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

        it ("should pickup mutations even if layout has started in the middle", function() {
          var fragment = parse(superform);
          var form = fragment.childNodes[0]
          var element = form.element;
          var target = Slick.find(element, '#bc');
          var copy = target.cloneNode(false);
          target.parentNode.insertBefore(copy, target);
          var widget = form.document.layout.render(copy, [form, target.parentNode]);
          expect(widget.tagName).toEqual('meter');
        })
        
        describe("if a layout was updated in the middle of mutation", function() {
          it ("should pickup mutations", function() {
            new LSD.Type('ContinuedMutations')
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
              LSD.ContinuedMutations.List = new Class({
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
                context: 'continued_mutations'
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
            new LSD.Type('ContinuedMutations')
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
              LSD.ContinuedMutations.List = new Class({
                options: {
                  mutations: {
                    '> li': 'item'
                  }
                }
              });
              LSD.ContinuedMutations.Div = new Class({
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
                context: 'continued_mutations'
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
        })
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
            context: 'test'
          });
          expect(widget.getElements('list').length).toEqual(1);
          expect(widget.getElements('item').length).toEqual(2);
          expect(widget.getElements('menu').length).toEqual(3);
        })
      })

      describe("and comments are used to indicate conditional blocks", function() {
        
        it ("should parse comments and interpolate them", function() {
          var element = new Element('div', {html: '\
            <!-- if a > 1 -->\
              <!--\
                <!- if urgency ->\
                  <!- <h2>This is so urgent..</h2> ->\
                <!- else ->\
                  <h2>This is not urgent, but hell, we need this today</h2>\
                <!- end ->\
              -->\
            <!-- else -->\
              <!-- unless urgency -->\
                <h3>That only takes 5 minutes to do! Come on, copy and paste what we have already</h3>\
              <!-- else -->\
                <!--\
                  <h3>I want it right now</h3>\
                -->\
              <!-- end -->\
            <!-- end -->\
          '});
          $e = element
          var widget = $w = new LSD.Widget(element, {document: doc});
          widget.variables.merge(widget.attributes);
          expect(element.getElement('h2')).toBeFalsy();
          expect(element.getElement('h3').innerHTML).toEqual('That only takes 5 minutes to do! Come on, copy and paste what we have already');
          expect(element.getElements('h3').length).toEqual(1);

         widget.setAttribute('urgency', true);
         expect(element.getElement('h2')).toBeFalsy();
         expect(element.getElement('h3').innerHTML).toEqual('I want it right now');
         expect(element.getElements('h3').length).toEqual(1);
         widget.removeAttribute('urgency')
         expect(element.getElement('h2')).toBeFalsy();
         expect(element.getElement('h3').innerHTML).toEqual('That only takes 5 minutes to do! Come on, copy and paste what we have already');
         expect(element.getElements('h3').length).toEqual(1);
         widget.setAttribute('urgency', true);
         expect(element.getElement('h2')).toBeFalsy();
         expect(element.getElement('h3').innerHTML).toEqual('I want it right now');
         expect(element.getElements('h3').length).toEqual(1);
         widget.removeAttribute('urgency')
         expect(element.getElement('h3').innerHTML).toEqual('That only takes 5 minutes to do! Come on, copy and paste what we have already');
         expect(element.getElements('h3').length).toEqual(1);
          widget.setAttribute('a', 2);
          expect(element.getElement('h3')).toBeFalsy();
          expect(element.getElements('h2').length).toEqual(1);
          expect(element.getElement('h2').innerHTML).toEqual('This is not urgent, but hell, we need this today');
          widget.setAttribute('urgency', true);
          expect(element.getElements('h2').length).toEqual(1);
          expect(element.getElement('h2').innerHTML).toEqual('This is so urgent..');
          expect(element.getElement('h3')).toBeFalsy();
          widget.setAttribute('a', 1);
          expect(element.getElement('h2')).toBeFalsy();
          expect(element.getElements('h3').length).toEqual(1);
          expect(element.getElement('h3').innerHTML).toEqual('I want it right now');
          widget.setAttribute('a', 2);
          expect(element.getElements('h2').length).toEqual(1);
          expect(element.getElement('h2').innerHTML).toEqual('This is so urgent..');
          expect(element.getElement('h3')).toBeFalsy();
          widget.removeAttribute('urgency')
          expect(element.getElement('h2').innerHTML).toEqual('This is not urgent, but hell, we need this today');
          expect(element.getElement('h3')).toBeFalsy();
          expect(element.getElements('h2').length).toEqual(1);
        })
        
        
        it ("should remove and re-add widgets", function() {
          var element = new Element('div', {
            html:                              '\
              <li><b>123</b> <b>321</b></li>    \
              <!-- if a -->                     \
                <li><b>123</b> <b>321</b></li>  \
              <!-- end -->                      \
              <li><b>123</b> <b>321</b></li>    '
          });
          var widget = new LSD.Widget(element, {
            context: 'clean',
            mutations: {
              'li': true,
              'li > b': true
            }
          });
          expect(widget.getElements('*').map(function(w) { return w.tagName})).toEqual(['li', 'b', 'b', 'li', 'b', 'b']);
          widget.variables.set('a', 123);
          expect(widget.getElements('*').map(function(w) { return w.tagName})).toEqual(['li', 'b', 'b', 'li', 'b', 'b', 'li', 'b', 'b']);
          widget.variables.set('a', 0);
          expect(widget.getElements('*').map(function(w) { return w.tagName})).toEqual(['li', 'b', 'b', 'li', 'b', 'b']);
        });
        
        describe('when a for loop is used', function() {
          it ("should render a collection of repeated chunks of layout", function() {
            var element = new Element('div', {
              html:                         '\
              <!-- for item in items -->     \
                <h2>{item.title}</h2>        \
              <!-- end -->                   '
            });
            var widget = new LSD.Widget(element, {
              context: 'clean'
            });
            widget.variables.set('items', [
              {title: 'Bombs are flying'},
              {title: 'People are dying'}
            ]);
            expect(element.getElements('h2').map(function(e) { return e.innerHTML })).toEqual([
              'Bombs are flying',
              'People are dying'
            ])
          })
          describe('and a condition is defined inside loop body', function() {
            it ("should execute branch for each iteration of loop", function() {
              var element = new Element('div', {
                html:                                                     '\
                <!-- for kid in kids -->                                   \
                  <li>                                                     \
                    <!-- if kid.gender == "male" -->                       \
                      Hey Boy!                                             \
                    <!-- else -->                                          \
                      Hey Girl!                                            \
                    <!-- end -->                                           \
                    Is it <strong>{kid.name}</strong>?                     \
                  </li>                                                    \
                <!-- end -->                                               '
              });                                                          
              var widget = new LSD.Widget(element, {
                context: 'clean'
              });
              widget.variables.set('kids', [
                {name: 'George', gender: 'male'},
                {name: 'Lisa', gender: 'female'},
                {name: 'Jordan', gender: 'male'},
                {name: 'Marge', gender: 'female'},
                {name: 'Maggie', gender: 'female'},
                {name: 'Homer', gender: 'male'},
                {name: 'Bart', gender: 'male'},
                {name: 'Ned', gender: 'male'},
                {name: 'Bart', gender: 'male'},
                {name: 'Ned', gender: 'male'}
              ]);
              $element = element
              var texts = element.getElements('li').map(function(e) { return e.get('text').trim().replace(/\s+/gm, ' ') });
              expect(texts).toEqual([
                'Hey Boy! Is it George?',
                'Hey Girl! Is it Lisa?',
                'Hey Boy! Is it Jordan?',
                'Hey Girl! Is it Marge?',
                'Hey Girl! Is it Maggie?',
                'Hey Boy! Is it Homer?',
                'Hey Boy! Is it Bart?',
                'Hey Boy! Is it Ned?',
                'Hey Boy! Is it Bart?',
                'Hey Boy! Is it Ned?',
              ])
            })
          });
          
          describe('and have nested conditions too', function() {
            xit("should show nested blocks correctly", function() {
              var element = new Element('div', {
                html:                                         '\
                <h1>Posts</h1>.                              \
                <!-- if posts -->                    \
                  <!-- <ul> -->                        \
                    <!-- for post in posts -->        \
                      <!-- <li> -->                                            \
                        <h2>{post.title}</h2>                         \
                        <!-- <menu type="toolbar">  -->                         \
                          <!-- if post.state == "published" -->         \
                            <!-- if user.role == "administrator" -->    \
                              <li>                                 \
                                Unpublish                               \
                              </li>                                \
                            <!-- end -->                                \
                            <li>                                   \
                              Read                                      \
                            </li>                                  \
                          <!-- else -->                                 \
                            <!-- if user.role == "administrator" -->    \
                              <li>                                 \
                                Publish                                 \
                              </li>                                \
                            <!-- else -->                               \
                              <li>                                 \
                                Ask to publish                          \
                              </li>                                \
                            <!-- end -->                                \
                          <!-- end -->                                  \
                        <!--</menu>    -->                                   \
                      <!--</li>     -->                                      \
                    <-- end -->                                       \
                  <!-- </ul> -->                                             \
                <!-- else -->                                 \
                  <h2>No posts yet.</h2>                       \
                  <!-- if user.role == "administrator" -->    \
                  <li>                                     \
                    Write a new post                           \
                  </li>                                    \
                  <!-- end -->                                 \
                <!-- end -->                                 '
              })
              var widget = new LSD.Widget(element, {
                context: 'clean'
              });
              expect(element.get('text').clean()).toEqual('Posts. No posts yet.')
              var alex = new LSD.Object({name: 'Alex', role: 'user'})
              widget.variables.set('user', alex)
              expect(element.get('text').clean()).toEqual('Posts. No posts yet.')
              alex.set('role', 'administrator')
              expect(element.get('text').clean()).toEqual('Posts. No posts yet. Write a new post');
              var post = new LSD.Object({
                title: 'Hello world',
                author: alex
              });
              widget.variables.set('posts', [post])
                expect(element.get('text').clean()).toEqual('Hello world');
            })
          })
        });
      })
    })
    describe("when object is used as layout template", function() {
      it ("should create layouts from objects", function() {
        var widget = new LSD.Widget({tag: 'body', document: doc, context: 'test'});
        var result = widget.addLayout(null, {
          'form#c': {
            'label': 'Hello world',
            'fieldset': {
              'label': 'Your name:',
              'input[type=text]': true
            }
          }
        });
        expect(widget.getElements('form#c').length).toEqual(1);
        expect(widget.getElements('fieldset').length).toEqual(0);
        expect(widget.getElements('label').length).toEqual(0);
        expect(widget.getElements('input').length).toEqual(0);
        expect(widget.element.getElements('fieldset').length).toEqual(1);
        expect(widget.element.getElements('label').length).toEqual(2);
        expect(widget.element.getElements('input').length).toEqual(1);
      });
      describe("and combinators are used to tell where the children go", function() {
        describe("when a + combinator is used", function() {
          it("should render the child next to the parent element", function() {
            var widget = new LSD.Widget({tag: 'body', document: doc, context: 'test'});
            var result = widget.addLayout(null, {
              'form#c': {
                'label#hey': 'Hello world',
                '+ fieldset': null,
                'label': 'Your name:',
                'input[type=text]': true
              }
            });
            expect(widget.element.getElements('*').map(function(e) { return e.get('tag')})).toEqual(['form', 'label', 'label', 'input', 'fieldset'])
          });
          it("should match the node next to the parent element", function() {
            var element = new Element('section').adopt(
              new Element('form'),
              new Element('fieldset')
            )
            var widget = new LSD.Widget(element, {
              document: doc, 
              layout: {
                'form': {
                  '+ fieldset': 'Dead',
                  'label#hey': 'Hello world'
                }
              }
            });
            expect(element.getElements('*').map(function(e) { return e.get('tag')})).toEqual(['form', 'label', 'fieldset'])
          })
        })
        describe("when a ^ combinator is used", function() {
          it("should render the child as a first child in widget", function() {
            var widget = new LSD.Widget({tag: 'body', document: doc, context: 'test'});
            var result = widget.addLayout(null, {
              'form#c': {
                'label#hey': 'Hello world',
                'fieldset': null,
                'label': 'Your name:',
                '^ input[type=text]': true
              }
            });
            expect(widget.element.getElements('*').map(function(e) { return e.get('tag')})).toEqual(['form', 'input', 'label', 'fieldset', 'label'])
          });
        });
      });
      
      describe("and parts of the layout are conditional", function() {
        it ("should create layout from objects with blocks", function() {
          var widget = new LSD.Widget({tag: 'body', document: doc, context: 'test'});
          var result = widget.addLayout(null, {
            'form#c': {
              'summary': 'Hello world',
              'fieldset': {
                'if (a > 1)': {
                  'label': 'Your name:',
                  'input[type=text]': true
                }, 
                'else': {
                  'h2': 'Welcome back again!'
                }
              }
            }
          });
          expect(widget.getElements('form#c').length).toEqual(1);
          expect(result['form#c'][1]['summary'][0].tagName.toLowerCase()).toEqual('summary');
          expect(result['form#c'][1]['fieldset'][1]['if (a > 1)'][0].options.keyword).toEqual('if');
          expect(result['form#c'][1]['fieldset'][1]['if (a > 1)'][0].options.expression).toEqual('(a > 1)');
          expect(result['form#c'][1]['fieldset'][1]['if (a > 1)'][0].variable.name).toEqual('>');
          expect(result['form#c'][1]['fieldset'][1]['if (a > 1)'][0].checked).toBeFalsy();
          expect(result['form#c'][1]['fieldset'][1]['else'][0].options.keyword).toEqual('else');
          expect(result['form#c'][1]['fieldset'][1]['else'][0].checked).toBeTruthy();
          expect(widget.element.getElement('label')).toBeFalsy();
          expect(widget.element.getElement('input')).toBeFalsy();
          expect(widget.element.getElement('h2')).toBeTruthy();
          widget.variables.set('a', 2);
          expect(widget.element.getElement('label')).toBeTruthy();
          expect(widget.element.getElement('input')).toBeTruthy();
          expect(widget.element.getElement('h2')).toBeFalsy();
          widget.variables.set('a', 0);
          expect(widget.element.getElement('label')).toBeFalsy();
          expect(widget.element.getElement('input')).toBeFalsy();
          expect(widget.element.getElement('h2')).toBeTruthy();
          widget.variables.set('a', 2);
          expect(widget.element.getElement('label')).toBeTruthy();
          expect(widget.element.getElement('input')).toBeTruthy();
          expect(widget.element.getElement('h2')).toBeFalsy();
          widget.variables.set('a', 0);
          expect(widget.element.getElement('label')).toBeFalsy();
          expect(widget.element.getElement('input')).toBeFalsy();
          expect(widget.element.getElement('h2')).toBeTruthy();
        });
        
        describe("and a conditional part uses + selector", function() {
          it ("should create layout from objects with blocks and remove parts of the layout even if they are not nested in an object", function() {
            var widget = new LSD.Widget({tag: 'body', document: doc, context: 'test'});
            var result = widget.addLayout(null, {
              'form#c': {
                'if (a == "bad")': {
                  '+ p': 'Hey guys, im not in form',
                  'label': 'Your name:',
                  'input[type=text]': true
                }, 
                'else': {
                  'h2': 'Welcome back again!'
                }
              }
            });
            expect(widget.element.getElement('p')).toBeFalsy()
            widget.variables.set('a', 'bad');
            expect(widget.element.getElement('form + p')).toBeTruthy()
            widget.variables.set('a', 'good');
            expect(widget.element.getElement('p')).toBeFalsy()
            expect(widget.element.getElement('form + p')).toBeFalsy()
            widget.variables.set('a', 'bad');
            expect(widget.element.getElement('form + p')).toBeTruthy()
            widget.variables.set('a', 'good');
            expect(widget.element.getElement('p')).toBeFalsy()
            expect(widget.element.getElement('form + p')).toBeFalsy()
          });
        })
      })
      
      describe("and pseudo elements are used in template as placeholders for selector expressions", function() {
        LSD.Test.Body = new Class({
          options: {
            tag: 'body'
          }
        })
        LSD.Test.Body.Dialog = new Class({
          Implements: LSD.Test.Body
        })

        it ("should build widgets off expressions with pseudo-elements allocation queries", function() {
          var widget = new LSD.Widget({tag: 'input', document: doc, context: 'test'});
          var result = widget.addLayout(null, {
            '::dialog:of-kind(input-date)': {
              'h2': 'Hello world',
              'p': 'Jesus saves!'
            }
          });
          expect(widget.getElements('*').length).toEqual(1);
          expect(widget.getElements('body[type=dialog]').length).toEqual(1);
          //widget.dispose();
          //expect(document.body.getElements('body')).toEqual(0)
        })

        it ("should build widgets as pseudo elements conditionally", function() {
          var widget = new LSD.Widget({tag: 'input', document: doc, context: 'test'});
          var result = widget.addLayout(null, {
            'if &:expanded': {
              '::dialog:of-kind(input-time)': {
                'h2': 'Hello world',
                'p': 'Jesus saves!'
              }
            }
          });
          expect(widget.getElements('*').length).toEqual(0)
          expect(widget.getElements('body[type=dialog]').length).toEqual(0);
          widget.addPseudo('expanded');
          expect(widget.getElements('*').length).toEqual(1)
          expect(widget.getElements('body[type=dialog]').length).toEqual(1);
          expect(widget.getElement('body').element.getElement('h2').innerHTML).toEqual('Hello world');
          widget.removePseudo('expanded');
          expect(widget.getElements('*').length).toEqual(0)
          expect(widget.getElements('body[type=dialog]').length).toEqual(0);
          widget.addPseudo('expanded');
          expect(widget.getElements('*').length).toEqual(1)
          expect(widget.getElements('body[type=dialog]').length).toEqual(1);
          expect(widget.getElement('body').element.getElement('h2').innerHTML).toEqual('Hello world');
          widget.removePseudo('expanded');
          expect(widget.getElements('*').length).toEqual(0)
          expect(widget.getElements('body[type=dialog]').length).toEqual(0);
        })
      })
      
      describe("and proxies are used to move elements and widgets into desired place", function() {
        describe("to implement a container element, that holds widgets contents", function() {
          describe("when contents is text", function() {
            it("should wrap it with a container", function() {
              var fragment = document.createFragment('\
                <article>\
                  Sometimes I wish this never ends\
                </article>\
              ');
              (new LSD.Type('Container1')).Article = new Class({
                options: {
                  layout: {
                    '::container': true
                  }
                }
              });
              var root = new LSD.Widget({tag: 'body', pseudos: ['root'], document: doc, context: 'container1'});
              var built = root.addLayout(null, fragment)
              var article = root.childNodes[0];
              var container = article.element.getElement('div.container');
              expect(container.getAttribute('type')).toBeFalsy();
              expect(container.getAttribute('kind')).toBeFalsy();
              expect(container.innerHTML.trim()).toEqual('Sometimes I wish this never ends');
            })
          });
          describe("when contents is text nodes and elements", function() {
            it("should wrap it with a container", function() {
              var fragment = document.createFragment('\
                <article>\
                  This is going to be over soon\
                  <button>Agree</button>\
                  <button>Disagree</button>\
                </article>\
              ');
              (new LSD.Type('Container2')).Article = new Class({
                options: {
                  layout: {
                    '::container': true
                  },
                  mutations: {
                    'button': true
                  }
                }
              });
              var root = new LSD.Widget({tag: 'body', pseudos: ['root'], document: doc, context: 'container2'});
              var built = root.addLayout(null, fragment)
              var article = root.childNodes[0];
              expect(article.getElements('button').length).toEqual(2);
              expect(article.element.getElements('button').length).toEqual(2);
              expect(article.element.getElements('div.container button').length).toEqual(0);
              expect(article.element.getElement('div.container').innerHTML.trim()).toEqual('This is going to be over soon');
              expect(article.element.getElements('button')[0].get('text')).toEqual('Agree');
              expect(article.element.getElements('button')[1].get('text')).toEqual('Disagree');
            })
          });
          describe("when contents is widgets and elements", function() {
            it("should wrap it with a container", function() {
              var fragment = document.createFragment('\
                <article>\
                  You have come a long way, buddy. Here is a pic for you:\
                  <img src="bitches.png" />\
                  <button i-want-to-be-in-container-plz>See</button>\
                  <button>Unsee</button>\
                </article>\
              ');
              (new LSD.Type('Container3')).Article = new Class({
                options: {
                  layout: {
                    '::container': true,
                    'button': 'Glowspoke'
                  },
                  mutations: {
                    'button': true
                  },
                  allocations: {
                    container: {
                      proxy: {
                        selector: '[i-want-to-be-in-container-plz]'
                      }
                    }
                  }
                }
              });
              var root = new LSD.Widget({tag: 'body', pseudos: ['root'], document: doc, context: 'container3'});
              var built = root.addLayout(null, fragment)
              var article = root.childNodes[0];
              expect(article.getElements('button').length).toEqual(2);
              expect(article.element.getElements('button').length).toEqual(3);
              expect(article.element.getElements('> button').length).toEqual(2);
              expect(article.element.getElements('div.container button').length).toEqual(1);
              expect(article.element.getElements('div.container img').length).toEqual(1);
              expect(article.element.getElement('div.container').get('text').trim().replace(/\s+/gm, ' ')).toEqual('You have come a long way, buddy. Here is a pic for you: See');
            })
          });
          describe("when tag is given with pseudo element", function() {
            it ("should be able to create a container of that tag", function() {
              var fragment = document.createFragment('\
                <article>\
                  Sometimes I wish this never ends\
                </article>\
              ');
              (new LSD.Type('Container4')).Article = new Class({
                options: {
                  layout: {
                    'span.booty::container': true
                  }
                }
              });
              var root = new LSD.Widget({tag: 'body', pseudos: ['root'], document: doc, context: 'container4'});
              var built = root.addLayout(null, fragment)
              var article = root.childNodes[0];
              var container = article.element.getElement('span.booty.container');
              expect(container).toBeTruthy();
              expect(container.innerHTML.trim()).toEqual('Sometimes I wish this never ends');
            })
          })
        })
      });
      
      describe("when the layout is set lazy and used as pattern matcher", function() {
        describe("and widget was initialized with an element with nodes", function() {
          describe("and layout consists of a single item that is already in nodes", function() {
            it ("should not build that item", function() {
              var element = new Element('section').adopt(new Element('div.wrapper'));
              var instance = new LSD.Widget(element, {
                layout: {
                  'div.wrapper': null
                }
              });
              expect(element.getElements('div.wrapper').length).toEqual(1);
            });
          })
          describe("and layout consists of elements that partially are set in nodes and some should be built", function() {
            describe("in order of appearance in html", function() {
              describe("and layout is simple", function() {
                describe("and layout definition doesnt have content", function() {
                  it("should build only the missing parts of layout", function() {
                    var element = new Element('section').adopt(new Element('div.wrapper'));
                    var instance = new LSD.Widget(element, {
                      layout: {
                        'div.wrapper': null,
                        'h2': 'Pro tennis'
                      }
                    });
                    expect(element.getElements('div.wrapper').length).toEqual(1);
                    expect(element.getElements('div.wrapper').getNext('h2')).toBeTruthy();
                    expect(element.getElements('h2').length).toEqual(1);
                    expect(element.getElement('h2').innerHTML).toEqual('Pro tennis');
                  })
                })
                describe("and only layout has contents", function() {
                  it("should build only the missing parts of layout and use the content from layout", function() {
                    var element = new Element('section').adopt(new Element('div.wrapper'));
                    var instance = new LSD.Widget(element, {
                      layout: {
                        'div.wrapper': 'Life before Christ',
                        'h2': 'Pro tennis'
                      }
                    });
                    expect(element.getElements('div.wrapper').length).toEqual(1);
                    expect(element.getElement('div.wrapper').innerHTML).toEqual('Life before Christ');
                    expect(element.getElements('div.wrapper').getNext('h2')).toBeTruthy();
                    expect(element.getElements('h2').length).toEqual(1);
                    expect(element.getElement('h2').innerHTML).toEqual('Pro tennis');
                  })
                })
              
                describe("and both found element and a node in layout have contents", function() {
                  it("should build only the missing parts of layout and concat contents from node and layout", function() {
                    var element = new Element('section').adopt(new Element('div.wrapper', {html: 'Haters '}));
                    var instance = new LSD.Widget(element, {
                      layout: {
                        'div.wrapper': 'gonna hate',
                        'h2': 'Pro tennis'
                      }
                    });
                    expect(element.getElements('div.wrapper').length).toEqual(1);
                    expect(element.getElement('div.wrapper').innerHTML).toEqual('Haters gonna hate');
                    expect(element.getElements('div.wrapper').getNext('h2')).toBeTruthy();
                    expect(element.getElements('h2').length).toEqual(1);
                    expect(element.getElement('h2').innerHTML).toEqual('Pro tennis');
                  })
                })
                describe("and a widget layout has a conditional branch", function() {
                  it ("should initialize branch and render layout", function() {
                    var element = new Element('section').adopt(new Element('div.wrapper', {html: 'Haters '}));
                    var instance = new LSD.Widget(element, {
                      layout: {
                        'div.wrapper': [
                          'gonna ',
                          {'if 1': 'hate'}
                        ],
                        'h2': 'Pro tennis',
                      }
                    });
                    expect(element.getElements('div.wrapper').length).toEqual(1);
                    expect(element.getElement('div.wrapper').innerHTML).toEqual('Haters gonna hate');
                    expect(element.getElements('div.wrapper').getNext('h2')).toBeTruthy();
                    expect(element.getElements('h2').length).toEqual(1);
                    expect(element.getElement('h2').innerHTML).toEqual('Pro tennis');
                  });
                  
                  describe("and condition value changes", function() {
                    it ("should remove layout", function() {
                      var element = new Element('section').adopt(new Element('div.wrapper', {html: 'Haters'}));
                      var instance = new LSD.Widget(element, {
                        layout: {
                          'div.wrapper': [
                            ' gonna',
                            {'if &:bong': ' hate'}
                          ],
                          'h2': 'Pro tennis',
                        }
                      });
                      expect(element.getElements('div.wrapper').length).toEqual(1);
                      expect(element.getElements('div.wrapper').getNext('h2')).toBeTruthy();
                      expect(element.getElements('h2').length).toEqual(1);
                      expect(element.getElement('h2').innerHTML).toEqual('Pro tennis');
                      expect(element.getElement('div.wrapper').innerHTML).toEqual('Haters gonna');
                      instance.states.include('bong');
                      expect(element.getElement('div.wrapper').innerHTML).toEqual('Haters gonna hate');
                      instance.states.erase('bong');
                      expect(element.getElement('div.wrapper').innerHTML).toEqual('Haters gonna');
                      instance.states.include('bong');
                      expect(element.getElement('div.wrapper').innerHTML).toEqual('Haters gonna hate');
                      instance.states.erase('bong');
                      expect(element.getElement('div.wrapper').innerHTML).toEqual('Haters gonna');
                    })
                  })
                })
                
                describe("and nodes that are on the same level are given nested", function() {
                  describe("and the level is not enforced", function() {
                    it ("should reuse element", function() {
                      var element = new Element('section').adopt(
                        new Element('header').adopt(
                          new Element('footer')
                        ),
                        new Element('section')
                      );
                      var instance = new LSD.Widget(element, {
                        layout: {
                          'header': null,
                          'section': null,
                          'footer': null
                        }
                      });
                      expect(Slick.search(element, '*').map(function(e) { return e.tagName.toLowerCase()})).toEqual(['header', 'footer', 'section'])
                    })
                  })
                  describe("and the level is enforced by combinator", function() {
                    it ("should not reuse misnested element and build its own", function() {
                      var element = new Element('section').adopt(
                        new Element('header').adopt(
                          new Element('footer')
                        ),
                        new Element('section')
                      );
                      var instance = new LSD.Widget(element, {
                        layout: {
                          'header': null,
                          'section': null,
                          '> footer': null
                        }
                      });
                      expect(Slick.search(element, '*').map(function(e) { return e.tagName.toLowerCase()})).toEqual(['header', 'footer', 'section', 'footer'])
                    })
                  })
                });
                describe("and order is enforced", function() {
                  describe("and and + combinator is not satisfied", function() {
                    it ("should reorder things respecting + combinator", function() {
                      var element = new Element('section').adopt(
                        new Element('header'),
                        new Element('hr'),
                        new Element('article'),
                        new Element('hr'),
                        new Element('footer')
                      );
                      var instance = new LSD.Widget(element, {
                        layout: {
                          'header +': 'Headers are for dummies',
                          'article ~': 'Great article',
                          'footer': 'Humble footer'
                        }
                      });
                      expect(Slick.search(element, '*').map(function(e) { return e.tagName.toLowerCase()})).toEqual(['header', 'article', 'hr', 'hr', 'footer'])
                    })
                  });
                })
                describe("and multiple + combinator are not satisfied", function() {
                  it ("should reorder things respecting + combinator", function() {
                    var element = new Element('section').adopt(
                      new Element('header'),
                      new Element('hr'),
                      new Element('article'),
                      new Element('hr'),
                      new Element('footer')
                    );
                    var instance = new LSD.Widget(element, {
                      layout: {
                        'header +': 'Headers are for dummies',
                        'article +': 'Great article',
                        'footer': 'Humble footer'
                      }
                    });
                    expect(Slick.search(element, '*').map(function(e) { return e.tagName.toLowerCase()})).toEqual(['header', 'article', 'footer', 'hr', 'hr'])
                  })
                });
              })
              describe("and layout is complex", function() {
                describe("with two levels of elements", function() {
                  it ("should match elements two levels deep", function() {
                    var title = new Element('span.title');
                    var header = new Element('header');
                    var element = new Element('section').adopt(
                      header.adopt(
                        title,
                        new Element('span.meta')
                      )
                    );
                    var instance = new LSD.Widget(element, {
                      layout: {
                        'header': {
                          'span.title': 'Groan',
                          'span.meta.singularity': 'Nine oClick'
                        }
                      }
                    });
                    expect(Slick.search(element, 'header')).toEqual([header]);
                    expect(Slick.search(element, 'header span.title')).toEqual([title]);
                    expect(Slick.find(element, 'header span.title').innerHTML).toEqual('Groan');
                    expect(Slick.find(element, 'header span.title + span.meta')).toBeTruthy();
                    expect(Slick.find(element, 'header span.title + span.meta + span.meta.singularity')).toBeTruthy();
                  })
                });
                describe("with four levels of elements", function() {
                  describe("and all match", function() {
                    it ("reuses what's possible", function() {
                      
                      var element = new Element('section').adopt(
                        new Element('h1.high').adopt(
                          new Element('h2.medium').adopt(
                            new Element('h3.low').adopt(
                              new Element('h4.ding').set({
                                'html': 'Oh well'
                              }),
                              new Element('span.ding')
                            ),
                            new Element('span.low')
                          ),
                          new Element('span.medium')
                        ),
                        new Element('span.high')
                      );
                  
                      var instance = new LSD.Widget(element, {
                        layout: {
                          'h1.high': {
                            'h2.medium': {
                              'h3.low': {
                                'h4.ding': {
                                  'figcaption': '|_ [] |_'
                                },
                                'span.ding': 'Ding'
                              },
                              'span.blow': 'Blow' //doesnt match
                            },
                            'em.medium': 'Medium' //doesnt match
                          },
                          'span.high': 'High'
                        }
                      });
                      var selectors = {
                        'h1.high': null,
                        'h2.medium': null,
                        'h3.low': null,
                        'h4.ding': null,
                        'figcaption': '|_ [] |_',
                        'span.ding': 'Ding',
                        'span.low': null,
                        'span.blow': 'Blow',
                        'span.medium': null,
                        'em.medium': 'Medium',
                        'span.high': 'High',
                      }
                      var elements = Slick.search(element, '*');
                      var i = 0;
                      for (var selector in selectors) {
                        expect(Slick.match(elements[i], selector)).toBeTruthy();
                        if (selectors[selector]) expect(elements[i].innerHTML).toEqual(selectors[selector]);
                        i++;
                      }
                    })
                  });
                  describe("and it matches only on the level", function() {
                    describe("and the order is not enforced", function() {
                      
                      it("builds three more levels", function() {
                        var element = new Element('section').adopt(
                          new Element('h1.high').adopt(
                            new Element('h2.medium').adopt(
                              new Element('h3.low').adopt(
                                new Element('h4.ding').set({
                                  'html': 'Oh well'
                                }),
                                new Element('span.ding')
                              ),
                              new Element('span.low')
                            ),
                            new Element('span.medium')
                          ),
                          new Element('span.high')
                        );

                        var instance = new LSD.Widget(element, {
                          layout: {
                            'h1.high': {
                              'h2.sodium': { //doesnt match here
                                'h3.low': {
                                  'h4.ding': {
                                    'figcaption': '|_ [] |_'
                                  },
                                  'span.ding': 'Ding'
                                },
                                'span.blow': 'Blow'
                              },
                              'em.medium': 'Medium'
                            },
                            'span.high': 'High'
                          }
                        });
                        var selectors = { //classes are multipled for sake of key uniqueness
                          'h1.high': null,
                          'h2.medium': null,
                          'h3.low': null,
                          'h4.ding': 'Oh well',
                          'span.ding': '',
                          'span.low': '',
                          'span.medium': '',
                          'h2.sodium': null,
                          'h3.low.low': null,
                          'h4.ding.ding': null,
                          'figcaption': '|_ [] |_',
                          'span.ding.ding': 'Ding',
                          'span.blow': 'Blow',
                          'em.medium': 'Medium',
                          'span.high': 'High'
                        }
                        var elements = Slick.search(element, '*');
                        var i = 0;
                        for (var selector in selectors) {
                          expect(Slick.match(elements[i], selector)).toBeTruthy();
                          if (selectors[selector]) expect(elements[i].innerHTML).toEqual(selectors[selector]);
                          i++;
                        }
                      })
                    })
                  })
                })
              })
            });
            describe("in the reverse order of appearance in html", function() {
              describe("and order is not enforced", function() {
                it("should append missing bits", function() {
                  var element = new Element('section').adopt(new Element('div.wrapper'));
                  var instance = new LSD.Widget(element, {
                    layout: {
                      'h2': 'Pro tennis',
                      'div.wrapper': null
                    }
                  });
                  expect(element.getElements('div.wrapper').length).toEqual(1);
                  expect(element.getElements('div.wrapper').getNext('h2')).toBeTruthy();
                  expect(element.getElements('h2').length).toEqual(1);
                  expect(element.getElement('h2').innerHTML).toEqual('Pro tennis');
                });
              })
              describe("and order is enforced", function() {
                describe("by a simple combinator", function() {
                  it("should prepend missing bits", function() {
                    var element = new Element('section').adopt(new Element('div.wrapper'));
                    var instance = new LSD.Widget(element, {
                      layout: {
                        'h2 +': 'Pro tennis',
                        'div.wrapper': null
                      }
                    });
                    expect(element.getElements('div.wrapper').length).toEqual(1);
                    expect(element.getElements('div.wrapper').getPrevious('h2')).toBeTruthy();
                    expect(!!element.getElement('div.wrapper').getNext('h2')).toBeFalsy();
                    expect(element.getElements('h2').length).toEqual(1);
                    expect(element.getElement('h2').innerHTML).toEqual('Pro tennis');
                  });
                });
                describe("by a simple ~ combinator", function() {
                  it("should prepend missing bits", function() {
                    var element = new Element('section').adopt(new Element('footer'), new Element('header'), new Element('nav'));
                    var instance = new LSD.Widget(element, {
                      layout: {
                        'header ~': 'Pro tennis',
                        'footer': null
                      }
                    });
                    expect(element.getChildren().map(function(e) { return e.get('tag')})).toEqual(['header', 'footer', 'nav'])
                  });
                });
                describe("by multiple combinators", function() {
                  describe("and and + combinator is not satisfied", function() {
                    it ("should reorder things respecting + combinator", function() {
                      var element = new Element('section').adopt(
                        new Element('footer'),
                        new Element('hr'),
                        new Element('article'),
                        new Element('header'),
                        new Element('hr')
                      );
                      var instance = new LSD.Widget(element, {
                        layout: {
                          'header +': 'Headers are for dummies',
                          'article ~': 'Great article',
                          'footer': 'Humble footer'
                        }
                      });
                      expect(Slick.search(element, '*').map(function(e) { return e.tagName.toLowerCase()})).toEqual(['header', 'article', 'footer', 'hr', 'hr'])
                    })
                  });
                })
                describe("and multiple + combinator are not satisfied", function() {
                  it ("should reorder things respecting + combinator", function() {
                    var element = new Element('section').adopt(
                      new Element('hr'),
                      new Element('article'),
                      new Element('header'),
                      new Element('hr'),
                      new Element('footer')
                    );
                    var instance = new LSD.Widget(element, {
                      layout: {
                        'header +': 'Headers are for dummies',
                        'article +': 'Great article',
                        'footer': 'Humble footer'
                      }
                    });
                    expect(Slick.search(element, '*').map(function(e) { return e.tagName.toLowerCase()})).toEqual(['hr', 'header', 'article', 'footer', 'hr'])
                  })
                })
                describe("and multiple ~ and + combinators are not satisfied", function() {
                  describe("and order of elements is random", function() {
                    
                    it ("should reorder things respecting all combinators", function() {
                      var element = new Element('section').adopt(
                        new Element('hr'),
                        new Element('section'),
                        new Element('footer'),
                        new Element('article'),
                        new Element('header'),
                        new Element('hr'),
                        new Element('menu'),
                        new Element('div')
                      );
                      var instance = new LSD.Widget(element, {
                        layout: {
                          'nav ~ ': null,
                          'header +': 'Headers are for dummies',
                          'article +': 'Great article',
                          'footer ~': 'Humble footer',
                          'menu +': null,
                          'section': null
                        }
                      });
                      expect(Slick.search(element, '*').map(function(e) { return e.tagName.toLowerCase()})).toEqual(['hr', 'nav', 'header', 'article', 'footer', 'menu', 'section', 'hr', 'div'])
                    })
                    
                    describe("and some of the nodes have children", function() {
                      it ("should reorder things respecting all combinator", function() {
                        var element = new Element('section').adopt(
                          new Element('hr'),
                          new Element('section').adopt(
                            new Element('ul'),
                            new Element('ol')
                          ),
                          new Element('footer'),
                          new Element('article'),
                          new Element('header').adopt(
                            new Element('h2'),
                            new Element('h1')
                          ),
                          new Element('hr'),
                          new Element('menu').adopt(
                            new Element('ul'),
                            new Element('ol')
                          ),
                          new Element('div')
                        );
                        var instance = new LSD.Widget(element, {
                          layout: {
                            'nav ~ ': null,
                            'header +': {
                              'div.meta ~': null,
                              'h1 +': null,
                              'h2': null
                            },
                            'article +': 'Great article',
                            'footer ~': 'Humble footer',
                            'menu +': {
                              'ul +': null,
                              'h3': null
                            },
                            'section': {
                              'ul ~': null,
                              'h3': null
                            }
                          }
                        });
                        expect(Slick.search(element, '*').map(function(e) { return e.tagName.toLowerCase()})).toEqual(['hr', 'nav', 'header', 'div', 'h1', 'h2', 'article', 'footer', 'menu', 'ul', 'h3', 'ol', 'section', 'ul', 'ol', 'h3', 'hr', 'div'])
                      })
                    })
                    
                    describe("and matched elements are deeply in an unknown element", function() {
                      it("should find and reorder those elements", function() {
                        var element = new Element('section').adopt(
                          new Element('summary').adopt(
                            new Element('hr'),
                            new Element('section').adopt(
                              new Element('ul'),
                              new Element('ol')
                            ),
                            new Element('footer'),
                            new Element('article'),
                            new Element('header').adopt(
                              new Element('h2'),
                              new Element('h1')
                            ),
                            new Element('hr'),
                            new Element('menu').adopt(
                              new Element('ul'),
                              new Element('ol')
                            ),
                            new Element('div')
                          )
                        );
                        var instance = new LSD.Widget(element, {
                          layout: {
                            'nav ~ ': null,
                            'header +': {
                              'div.meta ~': null,
                              'h1 +': null,
                              'h2': null
                            },
                            'article +': 'Great article',
                            'footer ~': 'Humble footer',
                            'menu +': {
                              'ul +': null,
                              'h3': null
                            },
                            'section': {
                              'ul ~': null,
                              'h3': null
                            }
                          }
                        });
                        expect(Slick.search(element, '*').map(function(e) { return e.tagName.toLowerCase()})).toEqual(['summary', 'hr', 'nav', 'header', 'div', 'h1', 'h2', 'article', 'footer', 'menu', 'ul', 'h3', 'ol', 'section', 'ul', 'ol', 'h3', 'hr', 'div'])
                      })
                    })
                    describe("but some of the elements bound with combinators are on different levels", function() {
                      it ("should reorder elements in the matched 'islands' keeping the structure", function() {
                        var element = new Element('section').adopt(
                          new Element('summary').adopt( //additional container over all elements
                            new Element('hr'),
                            new Element('footer'),
                            new Element('article'),
                            new Element('header').adopt(
                              new Element('h2'),
                              new Element('h1')
                            ),
                            new Element('hr'),
                            new Element('details').adopt( //and here, menu and section is too deep
                              new Element('section').adopt(
                                new Element('ul'),
                                new Element('ol')
                              ),
                              new Element('menu').adopt(
                                new Element('ul'),
                                new Element('ol')
                              )
                            ),
                            new Element('div')
                          )
                        );
                        var instance = new LSD.Widget(element, {
                          layout: {
                            'nav ~ ': null,
                            'header +': {
                              'div.meta ~': null,
                              'h1 +': null,
                              'h2': null
                            },
                            'article +': 'Great article',
                            'footer ~': 'Humble footer',
                            'menu +': {
                              'ul +': null,
                              'h3': null
                            },
                            'section': {
                              'ul ~': null,
                              'h3': null
                            }
                          }
                        });
                        expect(Slick.search(element, '*').map(function(e) { return e.tagName.toLowerCase()})).toEqual(['summary', 'hr', 'nav', 'header', 'div', 'h1', 'h2', 'article', 'footer', 'hr', 'details', 'menu', 'ul', 'h3', 'ol', 'section', 'ul', 'ol', 'h3', 'div'])
                      })
                    });
                  })
                  
                  describe("and order of elements is less random", function() {
                    it ("should reorder things respecting all combinator", function() {
                      var element = new Element('section').adopt(
                        new Element('hr'),
                        new Element('footer'),
                        new Element('article'),
                        new Element('header'),
                        new Element('hr'),
                        new Element('section'),
                        new Element('menu'),
                        new Element('div')
                      );
                      var instance = new LSD.Widget(element, {
                        layout: {
                          'nav ~ ': null,
                          'header +': 'Headers are for dummies',
                          'article +': 'Great article',
                          'footer ~': 'Humble footer',
                          'menu +': null,
                          'section': null
                        }
                      });
                      expect(Slick.search(element, '*').map(function(e) { return e.tagName.toLowerCase()})).toEqual(['hr', 'nav', 'header', 'article', 'footer', 'hr', 'menu', 'section', 'div'])
                    })
                  })
                })
                
                describe("and layout contains interpolated patterns", function() {
                  it("should parse html contents and extract values", function() {
                    var element = new Element('article').adopt(
                      new Element('header').adopt(
                        new Element('h1', {html: '<span>Boobs</span> Dawgs at War'})
                      ),
                      new Element('section', {
                        html: 'Hey {object}, you are at {deed}! '
                      })
                    );
                    var instance = new LSD.Widget(element, {
                      layout: {
                        'header': {
                          'h1': '{object} at {deed}'
                        },
                        'section': {
                          'summary': 'Press for {deed} to happen'
                        },
                        'footer': [
                          {'p': 'Listen up here, {deed}-kid'},
                          {'p': 'We dunnae like {toLowerCase(object)} like you here'}
                        ]
                      }
                    });
                    expect(element.getElement('header h1').get('text')).toEqual('BoobsDawgs at War');
                    expect(element.getElement('section').get('text')).toEqual('Hey Dawgs, you are at War! Press for War to happen');
                    expect(element.getElement('section summary').get('text')).toEqual('Press for War to happen');
                    expect(element.getElements('footer p')[0].get('text')).toEqual('Listen up here, War-kid');
                    expect(element.getElements('footer p')[1].get('text')).toEqual('We dunnae like dawgs like you here');
                  })
                  
                  describe("and the values are in the repeating selector", function() {
                    it("should parse html contents and extract values", function() {
                      var element = new Element('article').adopt(
                        new Element('footer').adopt(
                          new Element('h3', {
                            html: 'Listen up here, bull-kid'
                          }),
                          new Element('p', {
                            html: 'We dunnae like dongs like you here'
                          })
                        )
                      );
                      var instance = new LSD.Widget(element, {
                        layout: {
                          'header': {
                            'h1': '{object} at {deed}'
                          },
                          'section': {
                            'summary': 'Press for {deed} to happen'
                          },
                          'footer': [
                            {'h3': 'Listen up here, {deed}-kid'},
                            {'p': 'We dunnae like {object} like you here'}
                          ]
                        }
                      });
                      expect(element.getElement('header h1').get('text')).toEqual('dongs at bull');
                      expect(element.getElement('section').get('text')).toEqual('Press for bull to happen');
                      expect(element.getElement('section summary').get('text')).toEqual('Press for bull to happen');
                      expect(element.getElement('footer h3').get('text')).toEqual('Listen up here, bull-kid');
                      expect(element.getElement('footer p').get('text')).toEqual('We dunnae like dongs like you here');
                    })
                  })
                });
                
                describe("and layout is complex", function() {
                  describe("and the order is wrong on many levels :)", function() {
                    it("should reorder things", function() {
                      var element = new Element('section').adopt(
                        new Element('article').adopt(
                          new Element('h3', {html: 'First'}),
                          new Element('h1', {html: 'Second'}),
                          new Element('h2', {html: 'Third'})
                        ),
                        new Element('footer'),
                        new Element('aside'),
                        new Element('header').adopt(
                          new Element('nav')
                        )
                      )
                      var instance = new LSD.Widget(element, {
                        layout: {
                          'header ~': {
                            'form': null
                          },
                          'article +': {
                            'h1 ~': 'First',
                            'h2 ~': 'Second',
                            'h3': 'Third'
                          },
                          'footer': {
                            'ul': [
                              {'li': ['Ha']},
                              {'li': ['Ha']},
                              {'li': ['Ha']}
                            ]
                          }
                        }
                      });
                      var selectors = [
                        'header',
                        'nav',
                        'form',
                        'article',
                        ['h1', 'SecondFirst'],
                        ['h2', 'ThirdSecond'],
                        ['h3', 'FirstThird'],
                        'footer',
                        'ul',
                        ['li', 'Ha'],
                        ['li', 'Ha'],
                        ['li', 'Ha'],
                        'aside'
                      ];
                      var elements = Slick.search(element, '*');
                      selectors.each(function(selector, i) {
                        if (selector.push) {
                          var text = selector[1];
                          selector = selector[0];
                        };
                        expect(Slick.match(elements[i], selector)).toBeTruthy();
                        if (text) expect(elements[i].innerHTML).toEqual(text);
                      });
                    });
                  });
                  
                  describe("and container is used with pattern matching", function() {
                    describe("and container order is not enforced", function() {
                      it ("should reuse elements and proxy all others", function() {
                        var element = new Element('section').adopt(
                          new Element('button'),
                          new Element('ul').adopt(
                            new Element('li', {html: 'Lol'})
                          ),
                          new Element('menu')
                        );
                        element.appendChild(document.createTextNode('Krist'));
                        var instance = new LSD.Widget(element, {
                          layout: {
                            'menu ~ ': null,
                            'button': null,
                            '::container': null
                          },
                          document: doc || new LSD.Document,
                          context: 'clean'
                        });
                        expect(element.getChildren().map(function(e) { return e.get('tag')})).toEqual(['menu', 'button', 'div']);
                        expect(element.getElement('div.container').get('text')).toEqual('LolKrist');
                      });
                    })
                    describe("and container order is enforced", function() {
                      it ("should reuse elements and proxy all others", function() {
                        var element = new Element('section').adopt(
                          new Element('button'),
                          new Element('ul').adopt(
                            new Element('li', {html: 'Lol'})
                          ),
                          new Element('menu')
                        );
                        element.appendChild(document.createTextNode('Krist'));
                        var instance = new LSD.Widget(element, {
                          layout: {
                            'menu ~ ': null,
                            '::container ~': null,
                            'button': null
                          },
                          document: doc || new LSD.Document,
                          context: 'clean'
                        });
                        expect(element.getChildren().map(function(e) { return e.get('tag')})).toEqual(['menu', 'div', 'button']);
                        expect(element.getElement('div.container').get('text')).toEqual('LolKrist');
                      });
                      it ("should reuse elements and proxy all others", function() {
                        var element = new Element('section').adopt(
                          new Element('button'),
                          new Element('ul').adopt(
                            new Element('li', {html: 'Lol'})
                          ),
                          new Element('menu')
                        );
                        element.appendChild(document.createTextNode('Krist'));
                        var instance = new LSD.Widget(element, {
                          layout: {
                            '::container +': null,
                            'button +': null,
                            'menu': null
                          },
                          document: doc || new LSD.Document,
                          context: 'clean'
                        });
                        expect(element.getChildren().map(function(e) { return e.get('tag')})).toEqual(['div', 'button', 'menu']);
                        expect(element.getElement('div.container').get('text')).toEqual('LolKrist');
                      });
                    });
                  });
                });
                
                describe("and global layout is used", function() {
                  describe("and multiple widgets use the same element as the source of children", function() {
                    it("should distribute children", function() {
                      var Type = new LSD.Type('Layoutmix1');
                      Type.Article = new Class({
                        options: {
                          tag: 'article',
                          layout: {
                            'input +': null,
                            'button': null
                          }
                        }
                      });
                      Type.Form = new Class({
                        options: {
                          tag: 'form',
                          layout: {
                            'label ~': 'Neat label',
                            'button': null,
                            'details': {
                              'progress': null
                            }
                          }
                        }
                      })
                      var root = new LSD.Widget({tag: 'body', pseudos: ['root'], context: 'layoutmix1', document: doc || LSD.document})
                      var element = new Element('section').adopt(
                        new Element('article').adopt(
                          new Element('form').adopt(
                            new Element('label'),
                            new Element('input'),
                            new Element('details')
                          )
                        )
                      )
                      var layout = new LSD.Layout(root, element)
                      expect(Slick.search(element, '*').map(function(e) { return e.tagName.toLowerCase()})).toEqual([
                        'article',
                        'form',
                        'label',
                        'input',
                        'button',
                        'details',
                        'progress',
                        'button'
                      ])
                    })
                  })
                })
              });
            });
            describe("and elements matched are on the sides", function() {
              describe("and order is not enforced", function() {
                it("should append missing bits", function() {
                  var element = new Element('section').adopt(new Element('header'), new Element('footer'));
                  var instance = new LSD.Widget(element, {
                    layout: {
                      'header': 'Pro tennis',
                      'section.doughnuts': null,
                      'footer': null
                    }
                  });
                  expect(element.getElements('section.doughnuts').length).toEqual(1);
                  expect(element.getChildren().map(function(e) { return e.tagName.toLowerCase()})).toEqual(['header', 'footer', 'section'])
                });
              })
              describe("and order is enforced", function() {
                it("should fill in the blanks", function() {
                  var element = new Element('section').adopt(new Element('header'), new Element('footer'));
                  var instance = new LSD.Widget(element, {
                    layout: {
                      'header +': 'Pro tennis',
                      'section.doughnuts +': null,
                      'footer': null
                    }
                  });
                  expect(element.getElements('section.doughnuts').length).toEqual(1);
                  expect(element.getChildren().map(function(e) { return e.tagName.toLowerCase()})).toEqual(['header', 'section', 'footer'])
                })
              })
            })
          });
          describe("and layout consists of elements that are already provided by the nodes, but with different content", function() {
            it("should append missing content", function() {
                var element = new Element('section').adopt(new Element('div.wrapper').adopt(new Element('h1', {html: 'Serious business'})));
                var instance = new LSD.Widget(element, {
                  layout: {
                    'div.wrapper': {
                      'h2': 'Pro tennis'
                    }
                  }
                });
                expect(element.getElements('div.wrapper').length).toEqual(1);
                expect(element.getElements('h1').length).toEqual(1);
                expect(element.getElement('h1').innerHTML).toEqual('Serious business');
                expect(element.getElements('h2').length).toEqual(1);
                expect(element.getElement('h2').innerHTML).toEqual('Pro tennis');
            })
          })
        })
        describe("and widget was initialized with elements that doesnt have nodes", function() {
          describe("and it's simple layout", function() {
            it ("should build that item", function() {
              var element = new Element('section');
              var instance = new LSD.Widget(element, {
                layout: {
                  'div.wrapper': null
                }
              });
              expect(element.getElements('div.wrapper').length).toEqual(1);
            });
          })
        })
      })
    })
    
    describe("#remove", function() {
      describe("when removing a conditionals", function() {
        describe("and conditional was not displayed", function() {
          it ("should detach them and remove the nodes", function() {
            var element = new Element('div', {
              html:                              '\
                <section class=content>           \
                <!-- if condition -->             \
                  <li><b>123</b> <b>321</b></li>  \
                <!-- end -->                      \
                </section>                        '
            });
            var widget = new LSD.Widget(element, {
              context: 'clean',
              mutations: {
                'section': true,
                'li': true
              }
            });
            var section = widget.childNodes[0];
            expect(section.childNodes.map(function(e) { return e.tagName })).toEqual([]);
            section.removeLayout(null, section.element.childNodes)
            expect(section.element.childNodes.length).toEqual(0)
            expect(section.childNodes.map(function(e) { return e.tagName })).toEqual([]);
            section.variables.set('condition', 'YES');
            expect(section.element.childNodes.length).toEqual(0)
            expect(section.childNodes.map(function(e) { return e.tagName })).toEqual([]);
          })
        })
        describe("and conditional was displayed", function() {
          it ("should detach them and remove the nodes", function() {
            var element = new Element('div', {
              html:                              '\
                <section class=content>           \
                <!-- unless condition -->         \
                  <li><b>123</b> <b>321</b></li>  \
                <!-- end -->                      \
                </section>                        '
            });
            var widget = new LSD.Widget(element, {
              context: 'clean',
              mutations: {
                'section': true,
                'li': true
              }
            });
            var section = widget.childNodes[0];
            expect(section.childNodes.map(function(e) { return e.tagName })).toEqual(['li']);
            section.removeLayout(null, section.element.childNodes)
            expect(section.element.childNodes.length).toEqual(0)
            expect(section.childNodes.map(function(e) { return e.tagName })).toEqual([]);
            section.variables.set('condition', 'YES');
            expect(section.element.childNodes.length).toEqual(0)
            expect(section.childNodes.map(function(e) { return e.tagName })).toEqual([]);
          })
        })
        describe("and conditional was overwritten", function() {
          it ("should remove the old condition and use the new one", function() {
            var element = new Element('div', {
              html:                              '\
                <section class=content>           \
                <!-- if condition != "YES" -->    \
                  <li><b>123</b> <b>321</b></li>  \
                <!-- end -->                      \
                </section>                        '
            });
            var widget = new LSD.Widget(element, {
              context: 'clean',
              mutations: {
                'section': true,
                'li': true
              }
            });
            var section = widget.childNodes[0];
            section.variables.set('condition', 'NO');
            expect(section.element.childNodes.length).toEqual(7)
            expect(section.childNodes.map(function(e) { return e.tagName })).toEqual(['li']);
            section.variables.set('condition', 'YES');
            expect(section.childNodes.map(function(e) { return e.tagName })).toEqual([]);
            var nodes = Array.from(section.element.childNodes)
            expect(section.element.childNodes.length).toEqual(4)
            section.removeLayout(null, nodes)
            expect(section.element.childNodes.length).toEqual(0)
            expect(section.childNodes.map(function(e) { return e.tagName })).toEqual([]);
            expect(section.element.childNodes.length).toEqual(0)
            expect(section.childNodes.map(function(e) { return e.tagName })).toEqual([]);
            section.addLayout(null, nodes)
            expect(section.element.childNodes.length).toEqual(4)
            expect(section.childNodes.map(function(e) { return e.tagName })).toEqual([]);
            section.variables.unset('condition', 'YES');
            expect(section.childNodes.map(function(e) { return e.tagName })).toEqual(['li']);
          })
        });
        describe("and the widget is inside of other elements", function() {
          it ("should remove and detach it", function() {
            var element = new Element('div', {
              html:                          '\
              <div>                           \
              <!-- if condition -->           \
                <section><div><div><form>     \
                  <article>                   \
                  </article>                  \
                </div></div></form></section> \
              <!-- end -->                    \
              </div>                          '
            });
            var widget = new LSD.Widget(element, {
              context: 'clean',
              mutations: {
                'div': true,
                'article': true
              }
            });
            expect(widget.getElements('div').length).toBe(1);
            expect(widget.getElement('article')).toBeNull();
            widget.variables.set('condition', true)
            expect(widget.getElements('div').length).toBe(3);
            expect(widget.getElement('article')).toBeTruthy();
            widget.variables.set('condition', false)
            expect(widget.getElements('div').length).toBe(1);
            expect(widget.getElement('article')).toBeNull();
          });
        });
        
        describe('and nested condition is inside of multiple, elements', function() {
          it ("should detach that nested conditional", function() {
            var element = new Element('div', {
              html:                          '\
              <div>                           \
              <!-- if condition -->           \
                <section><div><div><form>     \
                  <!-- if debug -->           \
                  Lol {debug}                 \
                  <!-- end -->                \
                </div></div></form></section> \
              <!-- end -->                    \
              </div>                          '
            });
            var widget = new LSD.Widget(element, {
              context: 'clean',
              mutations: {
                'div': true
              }
            });
            expect(element.getElement('section')).toBeFalsy();
            widget.variables.set('condition', true)
            var section = element.getElement('section');
            expect(section).toBeTruthy();
            expect(section.get('text').trim()).toEqual('')
            widget.variables.set('debug', true)
            expect(section.get('text').trim()).toEqual('Lol true')
            widget.variables.set('condition', false);
            expect(section.get('text').trim()).toEqual('')
            widget.variables.set('debug', false);
            expect(section.get('text').trim()).toEqual('')
            widget.variables.set('debug', 'word');
            expect(section.get('text').trim()).toEqual('')
            expect(element.getElement('section')).toBeFalsy();
            widget.variables.set('condition', true);
            expect(section.get('text').trim()).toEqual('Lol word')
            widget.variables.set('condition', false);
          })
        })
        describe('and multiple nested conditions are inside of multiple elements', function() {
          it ("should each nested conditional", function() {
            var element = new Element('div', {
              html:                          '\
              <div>                           \
              <!-- if condition -->           \
                <section><div><div><form>     \
                  <!-- if a -->               \
                  <section><div>              \
                  {a}                         \
                  <!-- if b -->               \
                  <section><div>              \
                  {b}                         \
                  <!-- if c -->               \
                  <section><div>              \
                  {c}                         \
                  <!-- if d -->               \
                  <section><div>              \
                  {d}                         \
                  </div></section>            \
                  <!-- end -->                \
                  </div></section>            \
                  <!-- end -->                \
                  </div></section>            \
                  <!-- end -->                \
                  </div></section>            \
                  <!-- end -->                \
                </div></div></form></section> \
              <!-- end -->                    \
              </div>                          '
            });
            var widget = new LSD.Widget(element, {
              context: 'clean',
              mutations: {
                'div': true
              }
            });
            expect(element.getElement('section')).toBeFalsy();
            expect(widget.getElements('div').length).toBe(1);
            widget.variables.set('condition', true)
            var section = element.getElement('section');
            expect(section).toBeTruthy();
            var get = function(element) {
              return element.get('text').trim().replace(/\s+/g, ' ')
            }
            expect(widget.getElements('div').length).toBe(3);
            expect(get(section)).toEqual('')
            widget.variables.set('b', 2);
            expect(widget.getElements('div').length).toBe(3);
            expect(get(section)).toEqual('')
            widget.variables.set('a', 1);
            expect(widget.getElements('div').length).toBe(5);
            expect(get(section)).toEqual('1 2')
            widget.variables.set('c', 3);
            expect(get(section)).toEqual('1 2 3')
            expect(widget.getElements('div').length).toBe(6);
            widget.variables.set('b', 0);
            expect(get(section)).toEqual('1')
            widget.variables.set('d', 4);
            widget.variables.set('b', -2);
            expect(get(section)).toEqual('1 -2 3 4')
            expect(widget.getElements('div').length).toBe(7);
            widget.variables.set('condition', false)
            expect(get(section)).toEqual('')
            widget.variables.set('b', 22);
            widget.variables.set('condition', true)
            expect(get(section)).toEqual('1 22 3 4')
            expect(widget.getElements('div').length).toBe(7);
            widget.variables.set('c', 4);
            expect(get(section)).toEqual('1 22 4 4')
            expect(widget.getElements('div').length).toBe(7);
            widget.variables.set('c', 0);
            expect(get(section)).toEqual('1 22')
            expect(widget.getElements('div').length).toBe(5);
          })
        })
        describe('and multiple nested conditions are inside of multiple elements', function() {
          it ("should each nested conditional", function() {
            var element = new Element('div', {
              html:                          '\
              <div>                           \
              <!-- if condition -->           \
                <section><div><div><form>     \
                  <!-- if a -->               \
                  <section><div>              \
                  {a}                         \
                  <!-- if b -->               \
                  <section><div>              \
                  {b}                         \
                  <!-- if c -->               \
                  <section><div>              \
                  {c}                         \
                  <!-- if d -->               \
                  <section><div>              \
                  {d}                         \
                  </div></section>            \
                  <!-- else -->               \
                  X                           \
                  <!-- end -->                \
                  </div></section>            \
                  <!-- else -->               \
                  X                           \
                  <!-- end -->                \
                  </div></section>            \
                  <!-- else -->               \
                  X                           \
                  <!-- end -->                \
                  </div></section>            \
                  <!-- else -->               \
                  X                           \
                  <!-- end -->                \
                </div></div></form></section> \
              <!-- end -->                    \
              </div>                          '
            });
            var widget = new LSD.Widget(element, {
              context: 'clean',
              mutations: {
                'div': true
              }
            });
            expect(element.getElement('section')).toBeFalsy();
            expect(widget.getElements('div').length).toBe(1);
            widget.variables.set('condition', true)
            var section = element.getElement('section');
            expect(section).toBeTruthy();
            var get = function(element) {
              return element.get('text').trim().replace(/\s+/g, ' ')
            }
            expect(widget.getElements('div').length).toBe(3);
            expect(get(section)).toEqual('X')
            widget.variables.set('b', 2);
            expect(widget.getElements('div').length).toBe(3);
            expect(get(section)).toEqual('X')
            widget.variables.set('a', 1);
            expect(widget.getElements('div').length).toBe(5);
            expect(get(section)).toEqual('1 2 X')
            widget.variables.set('c', 3);
            expect(get(section)).toEqual('1 2 3 X')
            expect(widget.getElements('div').length).toBe(6);
            widget.variables.set('b', 0);
            expect(get(section)).toEqual('1 X')
            widget.variables.set('d', 4);
            widget.variables.set('b', -2);
            expect(get(section)).toEqual('1 -2 3 4')
            expect(widget.getElements('div').length).toBe(7);
            widget.variables.set('condition', false)
            expect(get(section)).toEqual('X')
            widget.variables.set('b', 22);
            widget.variables.set('condition', true)
            expect(get(section)).toEqual('1 22 3 4')
            expect(widget.getElements('div').length).toBe(7);
            widget.variables.set('c', 4);
            expect(get(section)).toEqual('1 22 4 4')
            expect(widget.getElements('div').length).toBe(7);
            widget.variables.set('c', 0);
            expect(get(section)).toEqual('1 22 X')
            expect(widget.getElements('div').length).toBe(5);
          })
        })
        
      })
    });
  });
});