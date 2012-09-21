describe("LSD.Layout", function() {
  describe("Templates", function() {
    describe("when DOM tree is used as a template", function() {
      describe("and comments are used to indicate conditional blocks", function() {
        it ("should parse comments and interpolate them", function() {
          var fragment = new LSD.Fragment('\
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
          ')
          var parent = new LSD.Element;
          parent.appendChild(fragment)
          expect(element.getElement('h2')).toBeFalsy();
          expect(element.getElement('h3').innerHTML).toEqual('That only takes 5 minutes to do! Come on, copy and paste what we have already');
          expect(element.getElements('h3').length).toEqual(1);
          widget.variables.set('urgency', true);
          expect(element.getElement('h2')).toBeFalsy();
          expect(element.getElement('h3').innerHTML).toEqual('I want it right now');
          expect(element.getElements('h3').length).toEqual(1);
          widget.removeAttribute('urgency')
          expect(element.getElement('h2')).toBeFalsy();
          expect(element.getElement('h3').innerHTML).toEqual('That only takes 5 minutes to do! Come on, copy and paste what we have already');
          expect(element.getElements('h3').length).toEqual(1);
          widget.variables.set('urgency', true);
          expect(element.getElement('h2')).toBeFalsy();
          expect(element.getElement('h3').innerHTML).toEqual('I want it right now');
          expect(element.getElements('h3').length).toEqual(1);
          widget.removeAttribute('urgency')
          expect(element.getElement('h3').innerHTML).toEqual('That only takes 5 minutes to do! Come on, copy and paste what we have already');
          expect(element.getElements('h3').length).toEqual(1);
          widget.variables.set('a', 2);
          expect(element.getElement('h3')).toBeFalsy();
          expect(element.getElements('h2').length).toEqual(1);
          expect(element.getElement('h2').innerHTML).toEqual('This is not urgent, but hell, we need this today');
          widget.variables.set('urgency', true);
          expect(element.getElements('h2').length).toEqual(1);
          expect(element.getElement('h2').innerHTML).toEqual('This is so urgent..');
          expect(element.getElement('h3')).toBeFalsy();
          widget.variables.set('a', 1);
          expect(element.getElement('h2')).toBeFalsy();
          expect(element.getElements('h3').length).toEqual(1);
          expect(element.getElement('h3').innerHTML).toEqual('I want it right now');
          widget.variables.set('a', 2);
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
          var widget = new LSD.Element(element, {
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
                <h2>${item.title}</h2>        \
              <!-- end -->                   '
            });
            var widget = new LSD.Element(element, {
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
                    Is it <strong>${kid.name}</strong>?                     \
                  </li>                                                    \
                <!-- end -->                                               '
              });                                                          
              var widget = new LSD.Element(element, {
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
                html: LSD.Test.Template.blogposts                                   
              })
              var widget = new LSD.Element(element, {
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
              var posts = new LSD.Array(post)
              widget.variables.set('posts', posts)
              expect(element.get('text').clean()).toEqual('Hello world');
              alex.set('role', 'administrator')
              expect(element.get('text').clean()).toEqual('Hello world');
            })
          })
        });



        describe("when removing a of a conditional blocks is involved", function() {
          describe("and conditional was never displayed", function() {
            it ("should detach them and remove the nodes", function() {
              var element = new Element('div', {
                html:                              '\
                  <section class=content>           \
                  <!-- if condition -->             \
                    <li><b>123</b> <b>321</b></li>  \
                  <!-- end -->                      \
                  </section>                        '
              });
              var widget = new LSD.Element(element, {
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
              var widget = new LSD.Element(element, {
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
              var widget = new LSD.Element(element, {
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
              var nodes = Array.prototype.slice.call(section.element.childNodes)
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
              var element = $e =new Element('div', {
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
              var widget = new LSD.Element(element, {
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
                    Lol ${debug}                 \
                    <!-- end -->                \
                  </div></div></form></section> \
                <!-- end -->                    \
                </div>                          '
              });
              var widget = $w = new LSD.Element(element, {
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
            it ("should display each nested conditional when appropriate", function() {
              var element = new Element('div', {
                html:                          '\
                <div>                           \
                <!-- if condition -->           \
                  <section><div><div><form>     \
                    <!-- if a -->               \
                    <section><div>              \
                    ${a}                        \
                    <!-- if b -->               \
                    <section><div>              \
                    ${b}                        \
                    <!-- if c -->               \
                    <section><div>              \
                    ${c}                        \
                    <!-- if d -->               \
                    <section><div>              \
                    ${d}                        \
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
              var widget = new LSD.Element(element, {
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
              $w = widget
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
            it ("should display each of the deep nested conditional when appropriate", function() {
              var element = new Element('div', {
                html:                          '\
                <div>                           \
                <!-- if condition -->           \
                  <section><div><div><form>     \
                    <!-- if a -->               \
                    <section><div>              \
                    ${a}                        \
                    <!-- if b -->               \
                    <section><div>              \
                    ${b}                        \
                    <!-- if c -->               \
                    <section><div>              \
                    ${c}                        \
                    <!-- if d -->               \
                    <section><div>              \
                    ${d}                        \
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
              var widget = new LSD.Element(element, {
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
              expect(get(section)).toEqual('')
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
          describe("and multiple conditions linked together are used", function() {
            it ("should show conditional blocks at the place", function() {
              var element = new Element('div', {
                html: LSD.Test.Template.greetings_owners
              });
              var widget = $w = new LSD.Element(element, {
                context: 'clean',
                mutations: {
                  'div': true
                }
              });
                expect(String.trim(String.clean(element.get('text')))).toEqual('');
              widget.variables.set('condition', true);
              expect(String.trim(String.clean(element.get('text')))).toEqual('Very Bad Evening Dad');
              widget.variables.set('time', 11);
              expect(String.trim(String.clean(element.get('text')))).toEqual('Very Bad Morning Dad');
              widget.variables.set('good', true);
              expect(String.trim(String.clean(element.get('text')))).toEqual('Very Good Morning Dad');
              widget.variables.set('good', false);
              expect(String.trim(String.clean(element.get('text')))).toEqual('Very Bad Morning Dad');
              widget.variables.set('time', 13);
              expect(String.trim(String.clean(element.get('text')))).toEqual('Very Bad Day Dad');
              widget.variables.set('mom', true);
              expect(String.trim(String.clean(element.get('text')))).toEqual('Very Bad Day Mom');
              widget.variables.set('good', true);
              expect(String.trim(String.clean(element.get('text')))).toEqual('Very Good Day Mom');
              widget.variables.set('good', false);
              expect(String.trim(String.clean(element.get('text')))).toEqual('Very Bad Day Mom');
              widget.variables.set('respect', false);
              expect(String.trim(String.clean(element.get('text')))).toEqual('Very Bad Day Mom');
              widget.variables.set('respect', true);
              expect(String.trim(String.clean(element.get('text')))).toEqual('Very Bad Day Mother');
              widget.variables.set('good', true);
              expect(String.trim(String.clean(element.get('text')))).toEqual('Very Good Day Mother');
              widget.variables.set('good', false);
              expect(String.trim(String.clean(element.get('text')))).toEqual('Very Bad Day Mother');
              widget.variables.set('mom', false);
              expect(String.trim(String.clean(element.get('text')))).toEqual('Very Bad Day Father');
              widget.variables.set('condition', false);
              expect(String.trim(String.clean(element.get('text')))).toEqual('');
              widget.variables.set('condition', true);
              expect(String.trim(String.clean(element.get('text')))).toEqual('Very Bad Day Father');
              widget.variables.set('respect', false);
              expect(String.trim(String.clean(element.get('text')))).toEqual('Very Bad Day Dad');
              widget.variables.set('mom', true);
              expect(String.trim(String.clean(element.get('text')))).toEqual('Very Bad Day Mom');
              widget.variables.set('good', true);
              expect(String.trim(String.clean(element.get('text')))).toEqual('Very Good Day Mom');
              widget.variables.set('time', 4);
              expect(String.trim(String.clean(element.get('text')))).toEqual('Very Good Night Mom');
              widget.variables.set('chill', true);
              expect(String.trim(String.clean(element.get('text')))).toEqual('Good Night Mom');
              widget.variables.set('time', 23);
              expect(String.trim(String.clean(element.get('text')))).toEqual('Good Evening Mom');
              widget.variables.set('good', false);
              expect(String.trim(String.clean(element.get('text')))).toEqual('Bad Evening Mom');
              widget.variables.set('respect', true);
              expect(String.trim(String.clean(element.get('text')))).toEqual('Bad Evening Mother');
              widget.variables.set('mom', false);
              expect(String.trim(String.clean(element.get('text')))).toEqual('Bad Evening Father');
              widget.variables.set('chill', false);
              expect(String.trim(String.clean(element.get('text')))).toEqual('Very Bad Evening Father');
              widget.variables.set('respect', false);
              expect(String.trim(String.clean(element.get('text')))).toEqual('Very Bad Evening Dad');
              widget.variables.set('time', 13);
              expect(String.trim(String.clean(element.get('text')))).toEqual('Very Bad Day Dad');
            })
          })
          describe("when multiple chained elseif blocks used", function() {
            it ("should display things in place", function() {
              var element = new Element('div', {
                html: LSD.Test.Template.time_range
              });
              var widget = new LSD.Element(element, {
                context: 'clean',
                mutations: {
                  'div': true
                }
              });
              $w = widget;
              var range = new LSD.Object;
              var params = new LSD.Journal;
              widget.variables.merge({params: params})
              expect(element.getElements('fieldset').length).toEqual(0);
              params.merge({'time_range': range});
              range.set('recurrence.type', 'weekly');
              expect(element.getElements('fieldset').length).toEqual(2)
              expect(element.getElement('fieldset.weekly').nextSibling.nextSibling.nextSibling.data).toEqual(" elsif params.time_range.recurrence.type == 'monthly' ")
              range.set('recurrence.type', 'monthly')
              expect(element.getElements('fieldset').length).toEqual(2);
              expect(element.getElement('fieldset.weekly')).toBeFalsy()
              expect(element.getElement('fieldset.monthly')).toBeTruthy()
              expect(element.getElement('fieldset.monthly').nextSibling.nextSibling.nextSibling.data).toEqual(" elsif params.time_range.recurrence.type == 'yearly' ")
              
              range.set('recurrence.type', 'yearly');
              expect(element.getElement('fieldset.monthly')).toBeFalsy()
              expect(element.getElement('fieldset.yearly')).toBeTruthy()
              expect(element.getElements('fieldset').length).toEqual(2);
              expect(element.getElement('fieldset.yearly').nextSibling.nextSibling.nextSibling.data).toEqual(" end ")
              range.set('recurrence.end_on', 'recurrence');
              expect(element.getElements('fieldset').length).toEqual(3);
              expect(element.getElement('fieldset.after.time').nextSibling.nextSibling.nextSibling.data).toEqual(" elsif params.time_range.recurrence.end_on == 'date' ")
              range.set('recurrence.end_on', 'date');
              expect(element.getElements('fieldset').length).toEqual(3);
              expect(element.getElement('fieldset.after.time')).toBeFalsy()
              expect(element.getElement('fieldset.after.date').nextSibling.nextSibling.nextSibling.data).toEqual(" end ")
              range.set('recurrence.type', 'daily');
              expect(element.getElements('fieldset').length).toEqual(3);
              expect(element.getElement('fieldset.yearly')).toBeFalsy()
              expect(element.getElement('fieldset.daily').nextSibling.nextSibling.nextSibling.data).toEqual(" elsif params.time_range.recurrence.type == 'weekly' ")
              range.set('recurrence.type', false);
              expect(element.getElements('fieldset').length).toEqual(0);
              range.set('recurrence.end_on', 'recurrence');
              expect(element.getElements('fieldset').length).toEqual(0);
              range.set('recurrence.type', 'weekly');
              expect(element.getElements('fieldset').length).toEqual(3);
              var other = new LSD.Object;
              params.merge({'time_range': other});
              params.unmerge({'time_range': range});
              expect(element.getElements('fieldset').length).toEqual(0);
              params.merge({'time_range': range});
              params.unmerge({'time_range': other});
              expect(element.getElements('fieldset').length).toEqual(3);
              params.merge({'time_range': other});
              params.unmerge({'time_range': range});
              expect(element.getElements('fieldset').length).toEqual(0);
              other.set('recurrence.type', 'daily')
              expect(element.getElements('fieldset').length).toEqual(2);
              expect(element.getElement('fieldset.daily').nextSibling.nextSibling.nextSibling.data).toEqual(" elsif params.time_range.recurrence.type == 'weekly' ")
              other.set('recurrence.end_on', 'date');
              expect(element.getElement('fieldset.after.date').nextSibling.nextSibling.nextSibling.data).toEqual(" end ")
              expect(element.getElements('fieldset').length).toEqual(3);
              range.set('recurrence.end_on', false);
              params.unmerge({'time_range': other});
              params.merge({'time_range': range});
              expect(element.getElements('fieldset').length).toEqual(2);
              expect(element.getElement('fieldset.weekly').nextSibling.nextSibling.nextSibling.nextSibling.data).toEqual(" elsif params.time_range.recurrence.type == 'monthly' ")
            });
          })
        })
      })
      
      describe("complex reallife setup", function() {
        it ("should clone, mutate and adopt elements to manipulate them with data", function() {
          var layout = new LSD.Layout;
          var parent = new LSD.Element({document: Factory('document')});
          var element = layout.render(document.createFragment(LSD.Test.Template.resource_field), parent);
          var widget = $w = new LSD.Element({
            mutations: {
              '>  fieldset': 'fieldset'
            },
            document: Factory('document')
          });
          LSD.Template.resource_field.clone().inject(widget)
          var element = widget.element;
          var fieldset = widget.childNodes[0];
          expect(widget.getElements('*')).toEqual([fieldset]);
          expect(element.get('text').clean()).toEqual('${field.type} ${field.title} false');
          fieldset.pseudos.include('editing');
          expect(element.get('text').clean()).toEqual('${field.type} ${field.title} [object Object]');
          var field = new LSD.Object;
          fieldset.variables.merge({'field': field});
          expect(element.get('text').clean()).toEqual('${field.type} ${field.title} [object Object]');
          field.set('title', 'Title');
          expect(element.get('text').clean()).toEqual('${field.type} Title [object Object]');
          field.set('reorderable', true)
          expect(element.get('text').clean()).toEqual('${field.type} Title [object Object] Menu: Move up Move down');
          field.set('type', 'text');
          expect(element.get('text').clean()).toEqual('text Title [object Object] Menu: Move up Move down Multiline?');
          fieldset.pseudos.erase('editing');
          expect(element.get('text').clean()).toEqual('text Title false Menu: Move up Move down Text field');
          field.set('editable', true)
          expect(element.get('text').clean()).toEqual('text Title false Menu: Move up Move down Edit Text field');
          field.set('reorderable', false)
          expect(element.get('text').clean()).toEqual('text Title false Menu: Edit Text field');
          field.set('deletable', true)
          expect(element.get('text').clean()).toEqual('text Title false Menu: Edit Delete Text field');
          field.set('type', 'date');
          expect(element.get('text').clean()).toEqual('date Title false Menu: Edit Delete Date');
          fieldset.pseudos.include('editing');
          expect(element.get('text').clean()).toEqual('date Title [object Object] Menu: Edit Delete Notifications:');
          field.set('type', 'file');
          expect(element.get('text').clean()).toEqual('file Title [object Object] Menu: Edit Delete Attachment file File upload');
          field.set('title', 'Avatar');
          expect(element.get('text').clean()).toEqual('file Avatar [object Object] Menu: Edit Delete Attachment file File upload');
          field.set('options.multiple', true);
          expect(element.get('text').clean()).toEqual('file Avatar [object Object] Menu: Edit Delete Attachment file File upload , multiple');
          fieldset.pseudos.erase('editing');
          expect(element.get('text').clean()).toEqual('file Avatar false Menu: Edit Delete Attachment file File upload , multiple');
          field.set('type', 'text');
          expect(element.get('text').clean()).toEqual('text Avatar false Menu: Edit Delete Text field , multiline');
          fieldset.pseudos.include('editing');
          expect(element.get('text').clean()).toEqual('text Avatar [object Object] Menu: Edit Delete Multiline?');
          field.set('type', 'price');
          expect(element.get('text').clean()).toEqual('price Avatar [object Object] Menu: Edit Delete Tax applies?');
          fieldset.pseudos.erase('editing');
          expect(element.get('text').clean()).toEqual('price Avatar false Menu: Edit Delete Price');
          field.set('deletable', false)
          expect(element.get('text').clean()).toEqual('price Avatar false Menu: Edit Price');
          field.set('options.tax_applies', true)
          expect(element.get('text').clean()).toEqual('price Avatar false Menu: Edit Price , tax_applies');
          field.set('editable', false);
          expect(element.get('text').clean()).toEqual('price Avatar false Price , tax_applies');
          field.set('options.tax_applies', false)
          expect(element.get('text').clean()).toEqual('price Avatar false Price');
          field.set('type', 'undefinefefe');
          expect(element.get('text').clean()).toEqual('undefinefefe Avatar false');
          field.set('title', '~');
          expect(element.get('text').clean()).toEqual('undefinefefe ~ false');
          field.set('type', 'date');
          expect(element.get('text').clean()).toEqual('date ~ false Date');
          fieldset.pseudos.include('editing');
          expect(element.get('text').clean()).toEqual('date ~ [object Object] Notifications:');
          field.set('deletable', true);
          expect(element.get('text').clean()).toEqual('date ~ [object Object] Menu: Delete Notifications:');
        })
      });
      
      describe("and there is microdata in conditional branches", function() {
        it ("should only use microdata from branches that are visible", function() {
          var element = new Element('div', {
            html: LSD.Test.Template.dynamic_microdata
          });
          var doc = Factory('document');
          doc.layout = new LSD.Layout;
          var widget = $w = new LSD.Element(element, {
            context: 'clean',
            document: doc,
          });
          expect(element.getElement('> header h1').get('text')).toEqual('${person.name}')
          expect(element.getElement('> header p')).toBeNull()
          expect(element.getElement('summary').get('text').clean()).toEqual('Unemployed, likes video games')
          widget.variables.set('character', 'thief')
          expect(element.getElement('> header h1').get('text')).toEqual('Sneak Stealer')
          expect(element.getElement('> header p').get('text')).toEqual('thief')
          expect(element.getElement('summary').get('text').clean()).toEqual('Fish stealer individual')
          widget.variables.set('alignment', 'good')
          expect(element.getElement('summary').get('text').clean()).toEqual('Fisher individual')
          widget.variables.set('character', 'noob')
          expect(element.getElement('> header h1').get('text')).toEqual('Newbie guy')
          expect(element.getElement('> header p').get('text')).toEqual('noob')
          expect(element.getElement('summary').get('text').clean()).toEqual('Unemployed, likes video games')
          widget.variables.set('character', 'bard')
          expect(element.getElement('> header h1').get('text')).toEqual('Sweetvoice')
          expect(element.getElement('summary').get('text').clean()).toEqual('Singer in Indie records of Unknown location')
          widget.variables.unset('alignment', 'good')
          expect(element.getElement('summary').get('text').clean()).toEqual('Singer in Music records of Holywood')
          widget.variables.set('character', 'mage')
          expect(element.getElement('> header h1').get('text')).toEqual('Sir Overrule')
          expect(element.getElement('summary').get('text').clean()).toEqual('Lawyer in Immigration of Washington')
          widget.variables.set('alignment', 'good')
          expect(element.getElement('summary').get('text').clean()).toEqual('Lawyer in High court of Washington')
          widget.variables.set('character', 'bard')
          expect(element.getElement('> header h1').get('text')).toEqual('Sweetvoice')
          expect(element.getElement('summary').get('text').clean()).toEqual('Singer in Indie records of Unknown location')
          widget.variables.set('character', 'noob')
          expect(element.getElement('> header h1').get('text')).toEqual('Newbie guy')
          expect(element.getElement('summary').get('text').clean()).toEqual('Unemployed, likes video games')
        })
      });
      
      describe('when multiple checkboxes are dependent on each other and lsd script is given inline to control them', function() {
        it ('should use the script as the rules for checkbox checkedness', function() {
          var element = new Element('div', {
            html: LSD.Test.Template.checkboxes_with_inline_lsd_script
          });
          var context = Factory('type', {'input[type=checkbox]': 'checkbox'})
          var widget = $w = Factory.Widget.Root({
            context: context,
          }, element);
          var masters = widget.getElements('input[type=checkbox].master');
          var master = masters[0]
          var slaves = widget.getElements('input[type=checkbox].slave');
          var slave = slaves[0];
          master.check();
          $script = element.getElement('script')
          console.log(3, widget.getElements('input[type=checkbox].slave, input[type=checkbox].master').map(function(c) { return c.checked }))
          expect(widget.getElements('input[type=checkbox].slave, input[type=checkbox].master').every(function(c) { return c.checked })).toBeTruthy()
          master.uncheck();
          
          $master = master
          expect(widget.getElements('input[type=checkbox].slave, input[type=checkbox].master').every(function(c) { return !c.checked })).toBeTruthy()
          //debugger
          console.log(3, widget.getElements('input[type=checkbox].slave, input[type=checkbox].master').map(function(c) { return c.checked }))
          $debug = true;
          master.check();
          expect(widget.getElements('input[type=checkbox].slave, input[type=checkbox].master').every(function(c) { return c.checked })).toBeTruthy()
          console.log(3, widget.getElements('input[type=checkbox].slave, input[type=checkbox].master').map(function(c) { return c.checked }))
          slave.uncheck();
          console.log(4, widget.getElements('input[type=checkbox].slave, input[type=checkbox].master').map(function(c) { return c.checked }))
          expect(widget.getElements('input[type=checkbox].slave, input[type=checkbox].master').every(function(c) { return !c.checked })).toBeTruthy()
          slave.check();
          //expect(widget.getElements('input[type=checkbox].slave, input[type=checkbox].master').every(function(c) { return c == slave || !c.checked })).toBeTruthy();
          //var newmaster = Factory.Widget.Checkbox({
          //  tag: 'input',
          //  attributes: {
          //    type: 'checkbox'
          //  },
          //  classes: {
          //    master: true
          //  }
          //})
          //newmaster.getCommand();
          //newmaster.check();
          //newmaster.inject(widget)
          //expect(widget.getElements('input[type=checkbox].slave, input[type=checkbox].master').every(function(c) { return c.checked })).toBeTruthy()
          //slave.uncheck();
          //expect(widget.getElements('input[type=checkbox].slave, input[type=checkbox].master').every(function(c) { return !c.checked })).toBeTruthy();
          //for (var i = 0, j = slaves.length; i < j; i++) {
          //  slaves[i].check();
          //  expect(masters.every(function(m) { return m.checked })).toEqual(i == j - 1);
          //}
          //slave.uncheck();
          //newmaster.check();
          //expect(widget.getElements('input[type=checkbox].slave, input[type=checkbox].master').every(function(c) { return c.checked })).toBeTruthy()
        })
      })
    })
  })
});


if (!LSD.Test.Template) LSD.Test.Template = {};
Object.append(LSD.Test.Template, {
  'urgency': '\
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
  ',
  
  
  'blogposts':                                           '\
  <h1>Posts</h1>.                                         \
  <!-- if posts -->                                       \
    <ul>                                                  \
      <!-- for post in posts -->                          \
        <li>                                              \
          <h2>${post.title}</h2>                          \
          <menu type="toolbar">                           \
            <!-- if post.state == "published" -->         \
              <!-- if user.role == "administrator" -->    \
                <li>                                      \
                  Unpublish                               \
                </li>                                     \
              <!-- end -->                                \
              <li>                                        \
                Read                                      \
              </li>                                       \
            <!-- else -->                                 \
              <!-- if user.role == "administrator" -->    \
                <li>                                      \
                  Publish                                 \
                </li>                                     \
              <!-- else -->                               \
                <li>                                      \
                  Ask to publish                          \
                </li>                                     \
              <!-- end -->                                \
            <!-- end -->                                  \
          </menu>                                         \
        </li>                                             \
      <-- end -->                                         \
    </ul>                                                 \
  <!-- else -->                                           \
    <h2>No posts yet.</h2>                                \
    <!-- if user.role == "administrator" -->              \
    <li>                                                  \
      Write a new post                                    \
    </li>                                                 \
    <!-- end -->                                          \
  <!-- end -->                                            ',
  
  'greetings_owners':           '\
  <div>                           \
  <!-- if condition -->           \
    <section><div><div><form>     \
      <!-- unless chill -->       \
      Very                        \
      <!-- end -->                \
      <!-- if good -->            \
        Good                      \
        <!-- if time < 6 -->      \
          Night                   \
        <!-- elsif time < 12 -->  \
          Morning                 \
        <!-- elsif time < 18 -->  \
          Day                     \
        <!-- else -->             \
          Evening                 \
        <!-- end -->              \
        <!-- if mom -->           \
          <!-- if respect -->     \
            Mother                \
          <!-- else -->           \
            Mom                   \
          <!-- end -->            \
        <!-- else -->             \
          <!-- if respect -->     \
            Father                \
          <!-- else -->           \
            Dad                   \
          <!-- end -->            \
        <!-- end -->              \
      <!-- else -->               \
        Bad                       \
        <!-- if time < 6 -->      \
          Night                   \
        <!-- elsif time < 12 -->  \
          Morning                 \
        <!-- elsif time < 18 -->  \
          Day                     \
        <!-- else -->             \
          Evening                 \
        <!-- end -->              \
        <!-- if mom -->           \
          <!-- if respect -->     \
            Mother                \
          <!-- else -->           \
            Mom                   \
          <!-- end -->            \
        <!-- else -->             \
          <!-- if respect -->     \
            Father                \
          <!-- else -->           \
            Dad                   \
          <!-- end -->            \
        <!-- end -->              \
      <!-- end -->                \
    </div></div></form></section> \
  <!-- end -->                    \
  </div>                          ',
  
  
  'time_range':                                                   "\
  <!-- unless condition -->                                        \
  <form>                                                           \
    <!-- if params.time_range.recurrence.type -->                  \
    <!--                                                           \
      <!- if params.time_range.recurrence.type == 'daily' ->       \
        <!-                                                        \
          <fieldset class='repeat daily'>                          \
            <label>Every</label>                                   \
            <input>                                                \
            day                                                    \
          </fieldset>                                              \
         ->                                                        \
      <!- elsif params.time_range.recurrence.type == 'weekly' ->   \
        <!-                                                        \
          <fieldset class='repeat weekly'>                         \
            <label>Every</label>                                   \
            <input>                                                \
            week                                                   \
          </fieldset>                                              \
         ->                                                        \
      <!- elsif params.time_range.recurrence.type == 'monthly' ->  \
        <!-                                                        \
          <fieldset class='repeat monthly'>                        \
            <label>Every</label>                                   \
            <input>                                                \
            month                                                  \
          </fieldset>                                              \
         ->                                                        \
      <!- elsif params.time_range.recurrence.type == 'yearly' ->   \
        <!-                                                        \
          <fieldset class='repeat yearly'>                         \
            <label>Every</label>                                   \
            <input>                                                \
            year                                                   \
          </fieldset>                                              \
         ->                                                        \
      <!- end ->                                                   \
      <fieldset>                                                   \
        <label>End:</label>                                        \
        <select name='time_range[end_on]'>                         \
          <option value=''>Never</option>                          \
          <option value='recurrence'>After</option>                \
          <option value='date'>On date</option>                    \
        </select>                                                  \
      </fieldset>                                                  \
      <!- if params.time_range.recurrence.end_on == 'recurrence' ->\
        <!-                                                        \
          <fieldset class='after time'>                            \
            <label>After</label>                                   \
            <input>                                                \
            time                                                   \
          </fieldset>                                              \
        ->                                                         \
      <!- elsif params.time_range.recurrence.end_on == 'date' ->   \
        <!-                                                        \
          <fieldset class='after date'>                            \
            <label>After</label>                                   \
            <input>                                                \
            day                                                    \
          </fieldset>                                              \
        ->                                                         \
      <!- end ->                                                   \
    -->                                                            \
    <!-- end -->                                                   \
  </form>                                                          \
  <!-- end -->",
  
  'resource_field':                                                            "\
  <!-- template resource_field -->                                              \
  <!--                                                                          \
  <fieldset class='reorderable'>                                                \
    ${field.type}                                                               \
    ${field.title}                                                              \
    ${&:editing}                                                                \
    <!- if field.reorderable || field.editable || field.deletable ->            \
      Menu:                                                                     \
      <menu type='toolbar'>                                                     \
        <!- if field.reorderable ->                                             \
          <li>                                                                  \
            <a class='icon up' href='#'>Move up</a>                             \
          </li>                                                                 \
          <li>                                                                  \
            <a class='icon down' href='#'>Move down</a>                         \
          </li>                                                                 \
        <!- end ->                                                              \
        <!- if field.editable ->                                                \
          <li class='separate'>                                                 \
            <a class='icon edit' href='#'>Edit</a>                              \
          </li>                                                                 \
        <!- end ->                                                              \
        <!- if field.deletable ->                                               \
          <li class='separate'>                                                 \
            <a class='icon delete' href='#'>Delete</a>                          \
          </li>                                                                 \
        <!- end ->                                                              \
      </menu>                                                                   \
    <!- end ->                                                                  \
    <!- if field.type == 'text' ->                                              \
      <!- <fieldset class='text' itemprop='field' itemscope itemtype='field'>   \
        <!- if &:editing ->                                                     \
          <!- <label>                                                           \
            <select id='field_property' name='field[property]'></select>        \
          </label>                                                              \
          <section>                                                             \
            <select id='field_type' name='field[type]'></select>                \
            <br>                                                                \
            <label>                                                             \
              <input name='field[options][multiple]' type='checkbox'>           \
              Multiline?                                                        \
            </label>                                                            \
          </section>                                                            \
           ->                                                                   \
        <!- else ->                                                             \
          <section>                                                             \
            <meta content='text' itemprop='type' />                             \
            <strong>Text field</strong>                                         \
            <!- if field.options.multiple ->                                    \
              <!- , multiline                                                   \
               ->                                                               \
            <!- end ->                                                          \
          </section>                                                            \
        <!- end ->                                                              \
      </fieldset> ->                                                            \
    <!- elsif field.type == 'date' ->                                           \
      <!- <fieldset class='price' itemprop='field' itemscope itemtype='field'>  \
        <!- if &:editing ->                                                     \
            <!- <label>                                                         \
              <select id='field_property' name='field[property]'></select>      \
            </label>                                                            \
            <section>                                                           \
              <select id='field_type' name='field[type]'></select>              \
              <br>                                                              \
              <label>                                                           \
                Notifications:                                                  \
                <select name='field[options][notification]'>                    \
                </select>                                                       \
              </label>                                                          \
            </section>                                                          \
             ->                                                                 \
        <!- else ->                                                             \
            <!-                                                                 \
            <section>                                                           \
              <meta content='date' itemprop='type' />                           \
              <strong>Date</strong>                                             \
            </section>                                                          \
             ->                                                                 \
        <!- end ->                                                              \
      </fieldset>                                                               \
       ->                                                                       \
    <!- elsif field.type == 'file' ->                                           \
      <!- <fieldset class='reorderable'>                                        \
        <label>                                                                 \
          Attachment file                                                       \
        </label>                                                                \
        <section><strong>File upload</strong>                                   \
        <!- if field.options.multiple ->                                        \
          <!- , multiple                                                        \
           ->                                                                   \
        <!- end ->                                                              \
        </section>                                                              \
      </fieldset>                                                               \
       ->                                                                       \
    <!- elsif field.type == 'price' ->                                          \
      <!- <fieldset class='price' itemprop='field' itemscope itemtype='field'>  \
        <!- if &:editing ->                                                     \
            <!- <label>                                                         \
              <select id='field_property' name='field[property]'></select>      \
            </label>                                                            \
            <section>                                                           \
              <select id='field_type' name='field[type]'></select>              \
              <label>                                                           \
                <input name='field[options][tax_applies]' type='checkbox'>      \
                Tax applies?                                                    \
              </label>                                                          \
            </section>                                                          \
             ->                                                                 \
        <!- else ->                                                             \
            <!-                                                                 \
            <section>                                                           \
              <meta content='price' itemprop='type' />                          \
              <strong>Price</strong>                                            \
              <!- if field.options.tax_applies ->                               \
                  <!- , tax_applies                                             \
                   ->                                                           \
              <!- end ->                                                        \
            </section>                                                          \
             ->                                                                 \
        <!- end ->                                                              \
      </fieldset>                                                               \
       ->                                                                       \
    <!- end ->                                                                  \
  </fieldset>                                                                   \
   -->                                                                          \
  <!-- end -->                                                                  ",

  'dynamic_microdata':                                                                  "\
    <header>                                                                             \
      <h1>${person.name}</h1>                                                            \
      <!-- if character -->                                                              \
        <p>${character}</p>                                                              \
      <!-- end -->                                                                       \
    </header>                                                                            \
    <section>                                                                            \
      <article itemscope itemprop='person' itemtype='people'>                            \
        <!-- if character == 'thief' -->                                                 \
          <b itemprop='name'>Sneak Stealer</b>                                           \
          <b itemprop='interest'>fish</b>                                                \
        <!-- elsif character == 'mage' -->                                               \
          <b itemprop='name'>Sir Overrule</b>                                            \
          <b itemprop='interest'>law</b>                                                  \
        <!-- elsif character == 'bard' -->                                               \
          <b itemprop='name'>Sweetvoice</b>                                              \
          <b itemprop='interest'>media</b>                                               \
        <!-- elsif character == 'noob' -->                                               \
          <b itemprop='name'>Newbie guy</b>                                              \
        <!-- end -->                                                                     \
        <h2>Occupation</h2>                                                              \
        <!-- if person.occupation -->                                                    \
          <summary class='occupation'>                                                   \
            ${person.occupation}                                                         \
            <!-- if person.organization.name -->                                         \
              in                                                                         \
              ${person.organization.name} of ${person.organization.location || 'Unknown location'}\
            <!-- else -->                                                                \
              individual                                                                 \
            <!-- end -->                                                                 \
          </summary>                                                                     \
        <!-- else -->                                                                    \
          <summary class='unemployment'>                                                 \
            Unemployed, likes ${person.industry || 'video games'}                        \
          </summary>                                                                     \
        <!-- end -->                                                                     \
        <!-- if person.interest == 'media' -->                                           \
          <details>                                                                      \
            <dl>                                                                         \
              <dt>Occupation</dt>                                                        \
              <dd itemprop='occupation'>Singer</dd>                                      \
              <dt>Organization</dt>                                                      \
              <dd itemscope itemprop='organization' itemtype='organization'>             \
                <!-- if alignment == 'good' -->                                          \
                  <h2 itemprop='name'>Indie records</h2>                                 \
                <!-- else -->                                                            \
                  <h2 itemprop='name'>Music records</h2>                                 \
                  <p itemprop='location'>Holywood</p>                                    \
                <!-- end -->                                                             \
              </dd>                                                                      \
            </dl>                                                                        \
          </details>                                                                     \
        <!-- elsif person.interest == 'law' -->                                          \
          <details>                                                                      \
            <dl>                                                                         \
              <dt>Occupation</dt>                                                        \
              <dd itemprop='occupation'>Lawyer</dd>                                      \
              <dd itemscope itemprop='organization' itemtype='organization'>             \
                <!-- if alignment == 'good' -->                                          \
                  <h2 itemprop='name'>High court</h2>                                    \
                <!-- else -->                                                            \
                  <h2 itemprop='name'>Immigration</h2>                                   \
                <!-- end -->                                                             \
                <h2 itemprop='location'>Washington</h2>                                  \
              </dd>                                                                      \
            </dl>                                                                        \
          </details>                                                                     \
        <!-- elsif person.interest == 'fish' -->                                         \
          <details>                                                                      \
            <dl>                                                                         \
              <!-- if alignment == 'good' -->                                            \
                <dt>Occupation</dt>                                                      \
                <dd itemprop='occupation'>Fisher</dd>                                    \
              <!-- else -->                                                              \
                <dt>Occupation</dt>                                                      \
                <dd itemprop='occupation'>Fish stealer</dd>                              \
              <!-- end -->                                                               \
            </dl>                                                                        \
          </details>                                                                     \
        <!-- end -->                                                                     \
      </article>                                                                         \
    </section>                                                                           ",
    
    'checkboxes_with_inline_lsd_script': "                \n\
    <input type='checkbox' class='master'>                \n\
    <section>                                             \n\
      <input type='checkbox' class='slave'>               \n\
      <input type='checkbox' class='subslave'>            \n\
      <input type='checkbox' class='subslave'>            \n\
    </section>                                            \n\
    <section>                                             \n\
      <input type='checkbox' class='slave'>               \n\
      <input type='checkbox' class='subslave'>            \n\
      <input type='checkbox' class='subslave'>            \n\
    </section>                                            \n\
    <section>                                             \n\
      <input type='checkbox' class='slave'>               \n\
      <input type='checkbox' class='subslave'>            \n\
      <input type='checkbox' class='subslave'>            \n\
    </section>                                            \n\
    <input type='checkbox' class='master'>                \n\
    <script type='text/lsd'>                              \n\
      masters = (&& input.master)                         \n\
      slaves = (&& input.slave)                           \n\
      if (some(masters) {|master| master.states.checked != null}) \n\
        each(slaves) |slave|                            \n\
          slave.states.set('checked', true)             \n\
      if (every(slaves) {|slave| slave.states.checked}) \n\
        each(masters) |master|                              \n\
          master.check()              \n\
    </script>                                             \n"
})




