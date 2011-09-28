describe("LSD.Interpolation", function() {
  it("should identify interpolations in html", function() {
    var html = "\
      <h2>{person_name}</h2>\
      <p>{person_organization}</p>\
      The person is {person_age} years old has left {pluralize(person_comments_count, '% comment')}."
      
    var element = new Element('div', {html: html});
    var widget = new LSD.Widget(element);
    expect(element.childNodes.length).toEqual(9)
    expect(element.childNodes[5].textContent).toEqual('{person_age}')
    widget.interpolations['person_age'][0](123)
    expect(element.childNodes[5].textContent).toEqual('123');
    widget.interpolations['person_age'][0](321)
    expect(element.childNodes[5].textContent).toEqual('321');
    expect(element.childNodes[7].textContent).toEqual("{pluralize(person_comments_count, '% comment')}");
    expect(Element.retrieve(element.childNodes[7], 'interpolation').args[0].input).toEqual('person_comments_count')
    widget.interpolations['person_comments_count'][0](321)
    expect(element.childNodes[7].textContent).toEqual('321 comments');
    widget.interpolations['person_comments_count'][0](1)
    expect(element.childNodes[7].textContent).toEqual('1 comment');
  });
  
  it ("should wait for multiple arguments", function() {
    var html = "\
      <p>{person_age + person_year - 1}</p>\
      Age is {person_age}, Year is {person_year}";
    var element = new Element('div', {html: html});
    var widget = new LSD.Widget(element);
    expect(element.childNodes.length).toEqual(6);
    expect(element.childNodes[1].textContent).toEqual('{person_age + person_year - 1}');
    expect(element.childNodes[3].textContent).toEqual('{person_age}');
    expect(element.childNodes[5].textContent).toEqual('{person_year}');
    widget.interpolations['person_age'][0](15)
    widget.interpolations['person_age'][1](15)
    expect(element.childNodes[1].textContent).toEqual('{person_age + person_year - 1}');
    expect(element.childNodes[3].textContent).toEqual('15');
    expect(element.childNodes[5].textContent).toEqual('{person_year}');
    widget.interpolations['person_year'][0](2005)
    widget.interpolations['person_year'][1](2005)
    expect(element.childNodes[1].textContent).toEqual('2019');
    expect(element.childNodes[3].textContent).toEqual('15');
    expect(element.childNodes[5].textContent).toEqual('2005');
    widget.interpolations['person_year'][0](2000)
    widget.interpolations['person_year'][1](2000)
    expect(element.childNodes[1].textContent).toEqual('2014');
    expect(element.childNodes[3].textContent).toEqual('15');
    expect(element.childNodes[5].textContent).toEqual('2000');
    widget.interpolations['person_age'][0](25)
    widget.interpolations['person_age'][1](25)
    expect(element.childNodes[1].textContent).toEqual('2024');
    expect(element.childNodes[3].textContent).toEqual('25');
    expect(element.childNodes[5].textContent).toEqual('2000');
  });
  
  xit ("should handle expressions without variables", function() {
    
    var html = "{666 - 616}{2 + 3 * 6 / 10}";
    var element = new Element('div', {html: html});
    var widget = new LSD.Widget(element);
    expect(element.childNodes[0].textContent).toEqual('50');
    expect(element.childNodes[1].textContent).toEqual('3.8');
  });
  
  it ("should do basic arythmetics", function() {
    var html = "{a + b * c + 1}{a * b + c - 1}{a * b + c - 1 * 3}";
    var element = new Element('div', {html: html});
    var widget = new LSD.Widget(element);
    expect(element.childNodes.length).toEqual(3)
    expect(element.childNodes[0].textContent).toEqual('{a + b * c + 1}');
    expect(element.childNodes[1].textContent).toEqual('{a * b + c - 1}');
    widget.interpolations['a'][0](1)
    widget.interpolations['b'][0](3)
    widget.interpolations['c'][0](7)
    widget.interpolations['a'][1](1)
    widget.interpolations['b'][1](3)
    widget.interpolations['c'][1](7)
    widget.interpolations['a'][2](1)
    widget.interpolations['b'][2](3)
    widget.interpolations['c'][2](7)
    //xitexpect(element.childNodes[0].textContent).toEqual('23');
    //xitexpect(element.childNodes[1].textContent).toEqual('9');
    //xitexpect(element.childNodes[1].textContent).toEqual('9');
  })
  
  it ("should not choke on a deeply nested arythmetics", function() {
    var html = "{a + a * a}";
    var element = new Element('div', {html: html});
    var widget = new LSD.Widget(element);
    widget.interpolations['a'].each(function(fn) { fn(2) })
    expect(element.childNodes[0].textContent).toEqual('6');
    
    var html = "{a + a * a + a}";
    var element = new Element('div', {html: html});
    var widget = new LSD.Widget(element);
    widget.interpolations['a'].each(function(fn) { fn(2) })
    expect(element.childNodes[0].textContent).toEqual('8');
    
    var html = "{a + a * a + a - a}";
    var element = new Element('div', {html: html});
    var widget = new LSD.Widget(element);
    widget.interpolations['a'].each(function(fn) { fn(2) })
    expect(element.childNodes[0].textContent).toEqual('6');
    
    var html = "{a + a * a + a - a / a}";
    var element = new Element('div', {html: html});
    var widget = new LSD.Widget(element);
    widget.interpolations['a'].each(function(fn) { fn(2) })
    expect(element.childNodes[0].textContent).toEqual('7');
    
    var html = "{a + a * a + a - a / a - a}";
    var element = new Element('div', {html: html});
    var widget = new LSD.Widget(element);
    widget.interpolations['a'].each(function(fn) { fn(2) })
    expect(element.childNodes[0].textContent).toEqual('5');
    
    var html = "{a + a * a + a - a / a - a - a}";
    var element = new Element('div', {html: html});
    var widget = new LSD.Widget(element);
    widget.interpolations['a'].each(function(fn) {
      fn(2)
    })
    expect(element.childNodes[0].textContent).toEqual('3');
    widget.interpolations['a'].each(function(fn) {
      fn(3)
    })
    expect(element.childNodes[0].textContent).toEqual('8');
    widget.interpolations['a'][5](6)
    expect(element.childNodes[0].textContent).toEqual('8.5');
  })
  
  xit ("should handle parenthesises", function() {
    var html = "{a + a * (a + a) - a}";
    var element = new Element('div', {html: html});
    var widget = new LSD.Widget(element);
    widget.interpolations['a'].each(function(fn) { fn(2) })
    expect(element.childNodes[0].textContent).toEqual('6');
    var html = "{a + a * a + a - a / a}";
    var element = new Element('div', {html: html});
    var widget = new LSD.Widget(element);
    widget.interpolations['a'].each(function(fn) { fn(2) })
    expect(element.childNodes[0].textContent).toEqual('7');
    
    var html = "{a + a * a + a - a / a - a}";
    var element = new Element('div', {html: html});
    var widget = new LSD.Widget(element);
    widget.interpolations['a'].each(function(fn) { fn(2) })
    expect(element.childNodes[0].textContent).toEqual('5');
  })
  
  it ("should do logical expressions", function() {
    var html = "{a && b}{a || b}{a ^ b}";
    var element = new Element('div', {html: html});
    var widget = new LSD.Widget(element);
    widget.interpolations['a'].each(function(fn) { fn(0) })
    widget.interpolations['b'].each(function(fn) { fn(1) })
    expect(element.childNodes.length).toEqual(3);
    expect(element.childNodes[0].textContent).toEqual('0');
    expect(element.childNodes[1].textContent).toEqual('1');
    expect(element.childNodes[2].textContent).toEqual('1');
    widget.interpolations['a'].each(function(fn) { fn(5) })
    expect(element.childNodes[0].textContent).toEqual('1');
    expect(element.childNodes[1].textContent).toEqual('5');
    expect(element.childNodes[2].textContent).toEqual('4');
  });
  
  it ("should use interpolators from widget", function() {
    var html = "Hello there {name}!";
    var element = new Element('div', {html: html});
    var widget = new LSD.Widget(element);
    expect(widget.interpolators).toBeFalsy();
    expect(element.childNodes[1].textContent).toEqual('{name}');
    expect(widget.interpolations['name'].length).toEqual(1);
    widget.setAttribute('data-name', 'Hippo');
    expect(widget.dataset.name).toEqual('Hippo');
    expect(widget.interpolators['name'].length).toEqual(1);
    expect(widget.interpolations['name'].length).toEqual(1);
    widget.setAttribute('data-name', 'Hippo the hippie');
    expect(element.childNodes[1].textContent).toEqual('Hippo the hippie');
    widget.removeAttribute('data-name');
    expect(element.childNodes[1].textContent).toEqual('{name}');
    widget.setAttribute('data-name', 'Hippo the hippie is back');
    expect(element.childNodes[1].textContent).toEqual('Hippo the hippie is back');
    widget.removeInterpolator(widget.dataset);
    expect(element.childNodes[1].textContent).toEqual('{name}');
    widget.addInterpolator(widget.dataset);
    expect(element.childNodes[1].textContent).toEqual('Hippo the hippie is back');
    widget.addInterpolator(widget.attributes);
    expect(element.childNodes[1].textContent).toEqual('Hippo the hippie is back');
    widget.attributes.set('name', 'Monkey')
    expect(element.childNodes[1].textContent).toEqual('Monkey');
    widget.removeInterpolator(widget.dataset);
    expect(element.childNodes[1].textContent).toEqual('Monkey');
    widget.addInterpolator(widget.dataset);
    expect(element.childNodes[1].textContent).toEqual('Hippo the hippie is back');
    widget.removeInterpolator(widget.dataset);
    expect(element.childNodes[1].textContent).toEqual('Monkey');
    widget.removeInterpolator(widget.attributes);
    expect(element.childNodes[1].textContent).toEqual('{name}');
  });
  
  
  it ("should fallback to parent interpolation", function() {
    var html = "Hello there {name}!";
    var element = new Element('div', {html: html});
    var widget = new LSD.Widget(element);
  })
  
  it ("should interpolate using microdata", function() {
    this.microdata
    var html = "\
      <li itemscope='itemscope' itemtype='Person' itemprop='person'>\
        <b itemprop='name'>Jesus</b>\
        <p itemprop='title'>Teh Savior</p>\
        <details itemscope='itemscope' itemtype='Organization' itemprop='organization'>\
          <h2>\
            <a href='http://heaven.org' itemprop='url'>\
              <span itemprop='name'>Heaven</span>\
            </a>\
          </h2>\
        </details>\
      </li>\
      <p>\
      Hey there {person.name}-boy!. \
      What is up for you man? How's {person.title} business going?\
      You may want to visit {person.organization.name}'s website at {person.organization.url}\
      </p>\
    "
    var element = new Element('div', {html: html});
    var widget = new LSD.Widget(element);
    expect(widget.interpolations.person.length).toEqual(4);
    expect(widget.interpolators.person.length).toEqual(1);
    expect($(widget).getLast().childNodes[1].textContent).toEqual('Jesus')
    expect($(widget).getLast().childNodes[3].textContent).toEqual('Teh Savior')
    expect($(widget).getLast().childNodes[5].textContent).toEqual('Heaven')
    expect($(widget).getLast().childNodes[7].textContent).toEqual('http://heaven.org/')
    $(widget).getFirst().retrieve('microdata:scope').set('name', 'Claudius');
    expect($(widget).getLast().childNodes[1].textContent).toEqual('Claudius');
    expect($(widget).getElement('[itemprop=name]').innerHTML).toEqual('Claudius');
  });
  
  it ("will create a local variable scope for widgets with itemscope and will not do it for itemscope elements", function() {
    var html = "\
      <article itemscope='itemscope' itemtype='Article' itemprop='article'>\
      {article.name} - <h2 itemprop='name'>Article of the year</h2> - {name}\
      <li itemscope='itemscope' itemtype='Person' itemprop='person'>\
        {person.name} - <b itemprop='name'>Jesus</b> - {name}\
        <p itemprop='title'>Teh Savior</p>\
        <details itemscope='itemscope' itemtype='Organization' itemprop='organization'>\
          <h2>\
            <a href='http://heaven.org' itemprop='url'>\
              <span itemprop='name'>Heaven</span>\
            </a>\
          </h2>\
        </details>\
      </li>\
      <p>\
      Hey there {person.name}-boy!. \
      What is up for you man? How's {person.title} business going?\
      You may want to visit {person.organization.name}'s website at {person.organization.url}\
      </p>\
      </article>\
      That {article.person.name} guy from {article.person.organization.name} is so sweet,\
      and who is the {person.name}?\
    "
    var element = new Element('div', {html: html});
    var widget = $w = new LSD.Widget(element, {mutations: {'article': true}});
    var wrap = $(widget).getLast().getLast();
    expect(widget.childNodes.length).toEqual(1);
    expect(element.getElement('article').childNodes[1].textContent).toEqual('Article of the year');
    expect(element.getElement('article').childNodes[5].textContent).toEqual('Article of the year');
    expect(element.getElement('li').childNodes[1].textContent).toEqual('Jesus');
    expect(element.getElement('li').childNodes[5].textContent).toEqual('Article of the year');
    expect(wrap.childNodes[1].textContent).toEqual('Jesus')
    expect(wrap.childNodes[3].textContent).toEqual('Teh Savior')
    expect(wrap.childNodes[5].textContent).toEqual('Heaven')
    expect(wrap.childNodes[7].textContent).toEqual('http://heaven.org/')
    expect(element.childNodes[element.childNodes.length - 6].textContent).toEqual('Jesus');
    expect(element.childNodes[element.childNodes.length - 4].textContent).toEqual('Heaven');
    expect(element.childNodes[element.childNodes.length - 2].textContent).toEqual('{person.name}');
  });
  
  it ("should use the value from the closest itemscope widget and fall back to parent itemscope when the local value is not available anymore", function() {
    this.microdata
    var html = "\
      <article itemscope='itemscope' itemtype='Article' itemprop='article'>\
      {toUpperCase(article.name)} - <h2 itemprop='name'>Article of the year</h2> - {name}\
      <li itemscope='itemscope' itemtype='Person' itemprop='person'>\
        {person.name} - <b itemprop='name'>Jesus</b> - {name}\
        <p itemprop='title'>Teh Savior</p>\
        <details itemscope='itemscope' itemtype='Organization' itemprop='organization'>\
          <h2>\
            <a href='http://heaven.org' itemprop='url'>\
              <span itemprop='name'>Heaven</span>\
            </a>\
          </h2>\
        </details>\
      </li>"
    var element = new Element('div', {html: html});
    var widget = $w = new LSD.Widget(element, {mutations: {'li': true}});
    var wrap = $(widget).getLast().getLast();
    expect(widget.childNodes.length).toEqual(1);
    expect(element.getElement('article').childNodes[1].textContent).toEqual('ARTICLE OF THE YEAR');
    expect(element.getElement('article').childNodes[5].textContent).toEqual('{name}');
    expect(element.getElement('li').childNodes[1].textContent).toEqual('Jesus');
    expect(element.getElement('li').childNodes[5].textContent).toEqual('Jesus');
    widget.firstChild.dispose()
  });
  
  it ("should parse selectors", function() {
    expect(LSD.Script.parse(':expected')).toEqual({type: 'selector', value: ':expected'})
    expect(LSD.Script.parse(':expected > div')).toEqual({type: 'selector', value: ':expected > div'})
    expect(LSD.Script.parse('& :expected > div')).toEqual({type: 'selector', value: '& :expected > div'})
  });

  it ("should watch selectors", function() {
    var html = "\
      <menu type='toolbar'>\
        <button>\
        </button>\
        <button>\
        </button>\
      </menu>\
      <menu type='context'>\
        <button>\
        </button>\
        <button>\
        </button>\
      </menu>\
      Menus count: {count(&& menu)}\
      Toolbars count: {count(menu[type=toolbar])}\
      Buttons in menus count: {count(&& menu button)}\
    ";
    var element = new Element('div', {html: html});
    var doc = LSD.document || new LSD.Document;
    var widget = $w = new LSD.Widget(element, {mutations: {'menu': true, 'button': true}, pseudos: {'root': true}, document: doc});
    var interpolation = Element.retrieve(element.childNodes[5], 'interpolation');
    expect(interpolation.name).toEqual('count');
    expect(interpolation.args[0].parent).toEqual(interpolation);
    expect(element.childNodes[5].textContent).toEqual('2');
    expect(element.childNodes[7].textContent).toEqual('1');
    expect(element.childNodes[9].textContent).toEqual('4');
    widget.getElement('menu[type=toolbar] button').dispose();
    expect(element.childNodes[5].textContent).toEqual('2');
    expect(element.childNodes[7].textContent).toEqual('1');
    expect(element.childNodes[9].textContent).toEqual('3');
    widget.getElement('menu[type=toolbar]').dispose();
    expect(element.childNodes[4].textContent).toEqual('1');
    expect(element.childNodes[6].textContent).toEqual('0');
    expect(element.childNodes[8].textContent).toEqual('2');
    widget.getElement('menu').dispose();
    expect(element.childNodes[3].textContent).toEqual('0');
    expect(element.childNodes[5].textContent).toEqual('0');
    expect(element.childNodes[7].textContent).toEqual('0');
  });
  
  it ("should watch selectors from the start", function() {
    var html = "{count(&& item)}";
    var element = new Element('div', {html: html});
    var doc = LSD.document || new LSD.Document;
    var widget = $w = new LSD.Widget(element, {pseudos: {'root': true}, document: doc});
    expect(element.get('text')).toEqual('0');
    var item = new LSD.Widget({tag: 'item'});
    widget.appendChild(item);
    expect(element.get('text')).toEqual('1');
  });
  
  it ("should interpolate attributes", function() {
    
  });
  
})