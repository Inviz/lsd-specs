describe("LSD.Interpolation", function() {
  it("should identify interpolations in html", function() {
    var html = "\
      <h2>${person_name}</h2>\
      <p>${person_organization}</p>\
      The person is ${person_age} years old has left ${pluralize(person_comments_count, '% comment')}."

    var element = document.createElement('div');
    element.innerHTML = html;
    var widget = new LSD.Element(element);
    //expect(element.childNodes.length).toEqual(9)
    expect(element.childNodes[4].textContent.trim()).toEqual("The person is ${person_age} years old has left ${pluralize(person_comments_count, '% comment')}.")
    widget.variables.set('person_age', 123);
    expect(element.childNodes[4].textContent.trim()).toEqual("The person is 123 years old has left ${pluralize(person_comments_count, '% comment')}.");
    widget.variables.set('person_age', 666);
    expect(element.childNodes[4].textContent.trim()).toEqual("The person is 666 years old has left ${pluralize(person_comments_count, '% comment')}.");
    widget.variables.set('person_comments_count', 321);
    expect(element.childNodes[4].textContent.trim()).toEqual("The person is 666 years old has left 321 comments.");
    widget.variables.set('person_comments_count', 1);
    expect(element.childNodes[4].textContent.trim()).toEqual("The person is 666 years old has left 1 comment.");
  });

  it ("should wait for multiple arguments", function() {
    var html = "\
      <p>${person_age + person_year - 1}</p>\
      Age is ${person_age}, Year is ${person_year}";
    var element = document.createElement('div');
    element.innerHTML = html;
    var widget = new LSD.Element(element);
    expect(element.childNodes[2].textContent.trim()).toEqual('Age is ${person_age}, Year is ${person_year}');
    widget.variables.set('person_age', 15);
    expect(element.childNodes[1].textContent.trim()).toEqual('${person_age + person_year - 1}');
    expect(element.childNodes[2].textContent.trim()).toEqual('Age is 15, Year is ${person_year}');
    widget.variables.set('person_year', 2005);
    expect(element.childNodes[1].textContent).toEqual('2019');
    expect(element.childNodes[2].textContent.trim()).toEqual('Age is 15, Year is 2005');
    widget.variables.set('person_year', 2000);
    expect(element.childNodes[2].textContent.trim()).toEqual('Age is 15, Year is 2000');
    widget.variables.set('person_age', 25);
    expect(element.childNodes[2].textContent.trim()).toEqual('Age is 25, Year is 2000');
  });

  it ("should handle expressions without variables", function() {
    var html = "${666 - 616}~${3 * 6 / 10}";
    var element = document.createElement('div');
    element.innerHTML = html;
    var widget = new LSD.Element(element);
    expect(element.childNodes[0].textContent).toEqual('50~1.8');
  });

  it ("should do basic arythmetics", function() {
    var html = "${a + b * c + 1}~${a * b + c - 1}~${a * b + c - 1 * 3}";
    var element = document.createElement('div');
    element.innerHTML = html;
    var widget = new LSD.Element(element);
    expect(element.childNodes[0].textContent).toEqual('${a + b * c + 1}~${a * b + c - 1}~${a * b + c - 1 * 3}');
    widget.variables.set('a', 1);
    widget.variables.set('b', 3);
    widget.variables.set('c', 7);
    expect(element.childNodes[0].textContent).toEqual('23~9~7');
    widget.variables.set('a', 2);
    expect(element.childNodes[0].textContent).toEqual('24~12~10');
    widget.variables.set('c', 1);
    expect(element.childNodes[0].textContent).toEqual('6~6~4');
  })

  it ("should not choke on a deeply nested arythmetics", function() {
    var html = "${a + a * a}";
    var element = document.createElement('div');
    element.innerHTML = html;
    var widget = new LSD.Element(element);
    widget.variables.set('a', 2);
    expect(element.childNodes[0].textContent).toEqual('6');

    var html = "${a + a * a + a}";
    var element = document.createElement('div');
    element.innerHTML = html;
    var widget = new LSD.Element(element);
    widget.variables.set('a', 2);
    expect(element.childNodes[0].textContent).toEqual('8');

    var html = "${a + a * a + a - a}";
    var element = document.createElement('div');
    element.innerHTML = html;
    var widget = new LSD.Element(element);
    widget.variables.set('a', 2);
    expect(element.childNodes[0].textContent).toEqual('6');

    var html = "${a + a * a + a - a / a}";
    var element = document.createElement('div');
    element.innerHTML = html;
    var widget = new LSD.Element(element);
    widget.variables.set('a', 2);
    expect(element.childNodes[0].textContent).toEqual('7');

    var html = "${a + a * a + a - a / a - a}";
    var element = document.createElement('div');
    element.innerHTML = html;
    var widget = new LSD.Element(element);
    widget.variables.set('a', 2);
    expect(element.childNodes[0].textContent).toEqual('5');

    var html = "${a + a * a + a - a / a - a - a}";
    var element = document.createElement('div');
    element.innerHTML = html;
    var widget = new LSD.Element(element);
    widget.variables.set('a', 2);
    expect(element.childNodes[0].textContent).toEqual('3');
    widget.variables.set('a', 3);
    expect(element.childNodes[0].textContent).toEqual('8');
    widget.variables.set('a', -12);
    expect(element.childNodes[0].textContent).toEqual('143');
  })

  xit ("should handle parenthesises", function() {
    var html = "${a + a * (a + a) - a}";
    var element = document.createElement('div');
    element.innerHTML = html;
    var widget = new LSD.Element(element);
    widget.variables.set('a', 2);
    expect(element.childNodes[0].textContent).toEqual('6');
    var html = "${a + a * a + a - a / a}";
    var element = document.createElement('div');
    element.innerHTML = html;
    var widget = new LSD.Element(element);
    widget.variables.set('a', 2);
    expect(element.childNodes[0].textContent).toEqual('7');

    var html = "${a + a * a + a - a / a - a}";
    var element = document.createElement('div');
    element.innerHTML = html;
    var widget = new LSD.Element(element);
    widget.variables.set('a', 2);
    expect(element.childNodes[0].textContent).toEqual('5');
  })

  it ("should do logical expressions", function() {
    var html = "${a && b}${a || b}${a ^ b}";
    var element = document.createElement('div');
    element.innerHTML = html;
    var widget = new LSD.Element(element);
    widget.variables.set('a', 0);
    widget.variables.set('b', 1);
    expect(element.childNodes[0].textContent).toEqual('011');
    widget.variables.set('a', 5);
    expect(element.childNodes[0].textContent).toEqual('154');
  });

  it ("should lazily iterate expressions to set up interpolation placeholder", function() {
    var html = "Hello there ${name || 'boy'}!";
    var element = document.createElement('div');
    element.innerHTML = html;
    var widget = new LSD.Element(element);
    expect(element.childNodes[0].textContent).toEqual('Hello there boy!');
    widget.set('variables.name', 'dog');
    expect(element.childNodes[0].textContent).toEqual('Hello there dog!');
    widget.unset('variables.name', 'dog');
    expect(element.childNodes[0].textContent).toEqual('Hello there boy!');
    widget.set('variables.name', 'log');
    expect(element.childNodes[0].textContent).toEqual('Hello there log!');
  });

  it ("should lazily iterate expressions complex expressions to set up interpolation placeholder", function() {
    var html = "Hello there ${dog && name || 'boy'}!";
    var element = document.createElement('div');
    element.innerHTML = html;
    var widget = new LSD.Element(element);
    expect(element.childNodes[0].textContent).toEqual('Hello there boy!');
    widget.variables.set('name', 'dog');
    expect(element.childNodes[0].textContent).toEqual('Hello there boy!');
    widget.variables.set('dog', true);
    expect(element.childNodes[0].textContent).toEqual('Hello there dog!');
    widget.variables.unset('name', 'dog');
    expect(element.childNodes[0].textContent).toEqual('Hello there boy!');
    widget.variables.set('name', 'log');
    expect(element.childNodes[0].textContent).toEqual('Hello there log!');
    widget.variables.unset('dog', true);
    expect(element.childNodes[0].textContent).toEqual('Hello there boy!');
  });

  it ("should use interpolators from widget", function() {
    var html = "Hello there ${name}!";
    var element = document.createElement('div');
    element.innerHTML = html;
    var widget = new LSD.Element(element);
    expect(element.childNodes[0].textContent).toEqual('Hello there ${name}!');
    widget.setAttribute('data-name', 'Hippo');
    expect(element.childNodes[0].textContent).toEqual('Hello there Hippo!');
    widget.setAttribute('data-name', 'Hippo the hippie');
    expect(element.childNodes[0].textContent).toEqual('Hello there Hippo the hippie!');
    widget.removeAttribute('data-name');
    expect(element.childNodes[0].textContent).toEqual('Hello there ${name}!');
    widget.setAttribute('data-name', 'Hippo the hippie is back');
    expect(element.childNodes[0].textContent).toEqual('Hello there Hippo the hippie is back!');
    var node = widget.childNodes[0];
    node.dispose()
    expect(element.childNodes[0].textContent).toEqual('Hello there ${name}!');
    node.inject(widget)
    expect(element.childNodes[0].textContent).toEqual('Hello there Hippo the hippie is back!');
    widget.variables.merge(widget.attributes);
    expect(element.childNodes[0].textContent).toEqual('Hello there Hippo the hippie is back!');
    widget.attributes.set('name', 'Monkey')
    expect(element.childNodes[0].textContent).toEqual('Hello there Monkey!');
    widget.variables.unmerge(widget.attributes);
    expect(element.childNodes[0].textContent).toEqual('Hello there Hippo the hippie is back!');
  });

  it ("should interpolate using microdata", function() {
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
      Hey there ${person.name || ''}-boy! \
      What is up for you man? How's ${person.title || ''} business going?\
      You may want to visit ${person.organization.name || ''}'s website at ${person.organization.url || ''}\
      </p>\
    "
    var element = document.createElement('div');
    element.innerHTML = html;
    var widget = new LSD.Element(element);
    expect(widget.childNodes[3].textContent.replace(/[\s\t]+/g, ' ')).toEqual(' Hey there Jesus-boy! What is up for you man? How\'s Teh Savior business going? You may want to visit Heaven\'s website at http://heaven.org ')
    widget.childNodes[1].childNodes[1].childNodes[0].change('textContent', 'Judas')
    expect(widget.childNodes[3].textContent.replace(/\s+/g, ' ')).toEqual(' Hey there Judas-boy! What is up for you man? How\'s Teh Savior business going? You may want to visit Heaven\'s website at http://heaven.org ')
    widget.childNodes[1].childNodes[3].change('textContent', 'Betraya')
    expect(widget.childNodes[3].textContent.replace(/\s+/g, ' ')).toEqual(' Hey there Judas-boy! What is up for you man? How\'s Betraya business going? You may want to visit Heaven\'s website at http://heaven.org ')
    widget.childNodes[1].childNodes[5].childNodes[1].childNodes[1].childNodes[1].change('textContent', 'Hell')
    expect(widget.childNodes[3].textContent.replace(/\s+/g, ' ')).toEqual(' Hey there Judas-boy! What is up for you man? How\'s Betraya business going? You may want to visit Hell\'s website at http://heaven.org ')
    widget.childNodes[1].childNodes[5].childNodes[1].childNodes[1].setAttribute('href', 'http://hell.xxx')
    expect(widget.childNodes[3].textContent.replace(/\s+/g, ' ')).toEqual(' Hey there Judas-boy! What is up for you man? How\'s Betraya business going? You may want to visit Hell\'s website at http://hell.xxx ')
    widget.childNodes[1].microdata.organization.mix({
     name: 'Traitors, Inc',
     url: 'file://c://traitors.text'
    });
    expect(widget.childNodes[3].textContent.replace(/\s+/g, ' ')).toEqual(' Hey there Judas-boy! What is up for you man? How\'s Betraya business going? You may want to visit Traitors, Inc\'s website at file://c://traitors.text ')
    expect(widget.childNodes[1].childNodes[5].childNodes[1].childNodes[1].href).toEqual('file://c://traitors.text')
    expect(widget.childNodes[1].childNodes[5].childNodes[1].childNodes[1].href).toEqual('file://c://traitors.text')
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
      ${count(> menu)} ${count(> menu[type=toolbar])} ${count(> menu button)}\
    ";
    var element = document.createElement('div');
    element.innerHTML = html;
    element.innerHTML = html;
    var widget = new LSD.Element(element);
    var textnode = widget.childNodes[4];
    expect(textnode.textContent.trim()).toEqual('2 1 4')
    widget.childNodes[1].childNodes[1].dispose();
    expect(textnode.textContent.trim()).toEqual('2 1 3')
    widget.childNodes[1].dispose();
    expect(textnode.textContent.trim()).toEqual('1 0 2')
    widget.childNodes[2].dispose();
    expect(textnode.textContent.trim()).toEqual('0 0 0')
  });

  it ("should watch selectors from the start", function() {
    var html = "${count(> item)}";
    var element = document.createElement('div');
    element.innerHTML = html;
    var widget = new LSD.Element(element);
    expect(widget.childNodes[0].textContent).toBeUndefined()
    var item = new LSD.Element('item');
    widget.appendChild(item);
    expect(widget.childNodes[0].textContent).toEqual('1');
    item.dispose();
    expect(widget.childNodes[0].textContent).toEqual('0');
  });

  describe("when interpolation is found in attribute", function() {
    it ("should set the attribute with that value and update it when variables change", function() {
      var html = "\
        <video src='${url}'></video>\
      ";
      var element = document.createElement('div');
      element.innerHTML = html;
      var widget = new LSD.Element(element);
      var video = element.getElementsByTagName('video')[0];
      widget.build( )
      expect(video.getAttribute('src')).toEqual('${url}')
      widget.variables.set('url', 'video.mpg');
      expect(video.getAttribute('src')).toEqual('video.mpg')
    });

    describe("and value for the attribute is concatenated", function() {
      it ("should concatenate the value and set attribute each time variable changes", function() {
        var html = "\
          <video src='${id}.mpg'></video>\
        ";
        var element = document.createElement('div');
        element.innerHTML = html;
        var widget = new LSD.Element(element);
        widget.build();
        var video = element.getElementsByTagName('video')[0];
        expect(video.getAttribute('src')).toEqual('${id}.mpg')
        widget.variables.set('id', '123');
        expect(video.getAttribute('src')).toEqual('123.mpg')
      });

      describe("and there are many variables used in expression", function() {
        it ("should concatenate the value and set attribute each time variable changes", function() {
          var html = "\
            <video src='movies/${movie.type}/${movie.id}.${Player.extension}'></video>\
          ";
          var element = document.createElement('div');
          element.innerHTML = html;
          var widget = new LSD.Element(element);
          widget.build();
          var video = element.getElementsByTagName('video')[0];
          var ad = new LSD.Object({type: 'ad', id: 'weird'});
          var action = new LSD.Object({type: 'action', id: 'brucelee'});
          var HTML5 = new LSD.Object({extension: 'mpg'})
          var Flash = new LSD.Object({extension: 'flv'})
          expect(video.getAttribute('src')).toEqual('movies/${movie.type}/${movie.id}.${Player.extension}')
          widget.variables.set('Player', HTML5);
          expect(video.getAttribute('src')).toEqual('movies/${movie.type}/${movie.id}.${Player.extension}')
          widget.variables.set('movie', ad);
          expect(video.getAttribute('src')).toEqual('movies/ad/weird.mpg')
          widget.variables.unset('movie', ad);
          expect(video.getAttribute('src')).toEqual(null)
          widget.variables.set('movie', action);
          expect(video.getAttribute('src')).toEqual('movies/action/brucelee.mpg')
          widget.variables.set('Player', Flash);
          expect(video.getAttribute('src')).toEqual('movies/action/brucelee.flv')
        });
      })
    })
  });

})