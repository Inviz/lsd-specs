describe('LSD.RegExp', function() {
  var big = {
    'block_arguments': '[^|]*',
    'block_body': '<inside_curlies>*',
    'block': '\\{(?:\\s*\\|\\s*(<block_arguments>)\\s*\\|\\s*)?(<block_body>)\\}',
    
    'fn_tail': '\\.',
    'fn_arguments': '<inside_parens>*',
    'fn_name': '<unicode>',
    'fn': '(<fn_tail>)?(<fn_name>)\\((<fn_arguments>)\\)',

    'length_number': '[-+]?(?:\\d+\\.\\d*|\\d*\\.\\d+|\\d)',
    'length_unit': 'em|px|pt|%|fr|deg|(?=$|[^a-zA-Z0-9.])',
    'length': '(<length_number>)(<length_unit>)',
    
    'token_tail': '\\.',
    'token_name': '<unicode>',
    'token': '(<token_tail>)?(<token_name>)',
    
    'separator': '(\\s+|\\s*,\\s*|\\s*;\\s*)',
    'index': '\\[\\s*(<inside_squares>*)\\s*\\]',
    'operator': '([-+]|[\\/%^~=><*\\^!|&$]+)',
    'string': '<string>'
  };
  describe('#constructor', function() {
    
    it('should find and replace subgroups', function() {
      var re = new LSD.RegExp({
        'length_number': '\\d+',
        'length_unit': 'em|px|pt|%',
        'length': '(<length_number>)(<length_unit>)?'
      });
      expect(re.source).toEqual("(\\d+)(em|px|pt|%)?")
      expect(re.groups).toEqual({1: 'length', 2: 'length'})
      expect(re.exec('25em')).toEqual({length: ['25', 'em']})
      expect(re.exec('25%')).toEqual({length: ['25', '%']})
      expect(re.exec('25')).toEqual({length: '25'})
    })
    it("should create around-wrappers for parenthesis", function() {
      var source = LSD.RegExp.prototype.inside("parens")
      expect(source).toEqual("(?:[^\\(\\)]|\\((?:[^\\(\\)]|\\((?:[^\\(\\)]|\\((?:[^\\(\\)]|\\([^\\(\\)]*\\))*\\))*\\))*\\))")
      expect(new RegExp(source).source).toEqual("(?:[^\\(\\)]|\\((?:[^\\(\\)]|\\((?:[^\\(\\)]|\\((?:[^\\(\\)]|\\([^\\(\\)]*\\))*\\))*\\))*\\))")
    })
    it("should create around-wrappers for curlies", function() {
      var source = LSD.RegExp.prototype.inside("curlies")
      expect(source).toEqual("(?:[^\\{\\}]|\\{(?:[^\\{\\}]|\\{(?:[^\\{\\}]|\\{(?:[^\\{\\}]|\\{[^\\{\\}]*\\})*\\})*\\})*\\})")
      expect(new RegExp(source).source).toEqual("(?:[^\\{\\}]|\\{(?:[^\\{\\}]|\\{(?:[^\\{\\}]|\\{(?:[^\\{\\}]|\\{[^\\{\\}]*\\})*\\})*\\})*\\})")
    })
    it("should create around-wrappers for curlies of four levels", function() {
      var source = LSD.RegExp.prototype.inside("curlies", 4)
      expect(source).toEqual("(?:[^\\{\\}]|\\{(?:[^\\{\\}]|\\{(?:[^\\{\\}]|\\{[^\\{\\}]*\\})*\\})*\\})")
      expect(new RegExp(source).source).toEqual("(?:[^\\{\\}]|\\{(?:[^\\{\\}]|\\{(?:[^\\{\\}]|\\{[^\\{\\}]*\\})*\\})*\\})")
    })
    it("should create around-wrappers for curlies of one level", function() {
      var source = LSD.RegExp.prototype.inside("curlies", 2)
      expect(source).toEqual("(?:[^\\{\\}]|\\{[^\\{\\}]*\\})")
      expect(new RegExp(source).source).toEqual("(?:[^\\{\\}]|\\{[^\\{\\}]*\\})")
    })
    it ("should call prototype functions when no key matches", function() {
      var re = new LSD.RegExp({
        'block_arguments': '[^\\|]*',
        'block_body': '<inside_curlies>',
        'block': '\\{(?:\\|\\s*(<block_arguments>)\\s*\\|\\s*)?(<block_body>*)\\}'
      });
      expect(re.groups).toEqual({1: 'block', 2: 'block'})
      expect(re.source).toEqual('\\{(?:\\|\\s*([^\\|]*)\\s*\\|\\s*)?((?:[^\\{\\}]|\\{(?:[^\\{\\}]|\\{(?:[^\\{\\}]|\\{(?:[^\\{\\}]|\\{[^\\{\\}]*\\})*\\})*\\})*\\})*)\\}')
      expect(re.exec('{a}')).toEqual({'block': [undefined, 'a']})
      expect(re.exec('{|a|b}')).toEqual({'block': ['a', 'b']})
      expect(re.exec('{|a|}')).toEqual({'block': 'a'})
    })
    it('should support builtin groups', function() {
      var re = new LSD.RegExp({
        'length_number': '\\d',
        'length_unit': '<unicode>',
        'length': '(<length_number>)(<length_unit>+)'
      });
      expect(re.source).toEqual("(\\d)((?:[\\w\\u00a1-\\uFFFF-]|\\\\[^\\s0-9a-f])+)")
      expect(re.exec('2руб')).toEqual({length: ['2', 'руб']})
    })
    it ('should support alternative groups', function() {
      var re = new LSD.RegExp({
        string: "(?:<string_double>|<string_single>)"
      })
      expect(re.source).toEqual("(?:\"((?:[^\"]|\\\\\")*)\"|'((?:[^']|\\\\')*)')")
      expect(re.exec("'abc'")).toEqual({string: 'abc'})
      expect(re.exec('"abc"')).toEqual({string: 'abc'})
      expect(re.exec("123")).toEqual(undefined)
    });
    it ('should support mixed alternative groups on the right', function() {
      var re = new LSD.RegExp({
        string_something: '123',
        string: "(?:<string_single>|(<string_something>))"
      })
      expect(re.source).toEqual("(?:'((?:[^']|\\\\')*)'|(123))")
      expect(re.exec("'abc'")).toEqual({string: 'abc'})
      expect(re.exec("123")).toEqual({string: '123'})
      
    });
    it ('should NOT support alternative escaped groups on the right', function() {
      var re = new LSD.RegExp({
        string_something: '123',
        string_single: "'((?:[^']|\\\\')*)'",
        string: "(?:<string_single>\\|(<string_something>))"
      })
      expect(re.source).toEqual("(?:'((?:[^']|\\\\')*)'\\|(123))")
      expect(re.exec("123")).toBeUndefined()
      expect(re.exec("'123'")).toBeUndefined()
      expect(re.exec("'a'|123")).toEqual({string: ['a', '123']})
      expect(re.exec("123|'a'")).toBeUndefined()
    });
    it ('should support alternative groups on the left', function() {
      var re = new LSD.RegExp({
        string_something: '123',
        string_single: "'((?:[^']|\\\')*)'",
        string: "(?:(<string_something>)|<string_single>)"
      })
      expect(re.source).toEqual("(?:(123)|'((?:[^']|\\')*)')")
      expect(re.exec("'abc'")).toEqual({string: 'abc'})
      expect(re.exec("123")).toEqual({string: '123'})
    });
    it ('should NOT support alternative escaped groups on the left', function() {
      var re = new LSD.RegExp({
        string_something: '123',
        string_single: "'((?:[^']|\\')*)'",
        string: "(?:(<string_something>)\\|<string_single>)"
      })
      expect(re.source).toEqual("(?:(123)\\|'((?:[^']|\\')*)')")
    });
    it('should concat multiple groups', function() {
      var re = new LSD.RegExp({
        'length_number': '\\d',
        'length_unit': 'em|px|pt',
        'length': '(<length_number>)(<length_unit>)'
      });
      expect(re.source).toEqual("(\\d)(em|px|pt)")
      expect(re.exec('1em')).toEqual({length: ['1', 'em']})
      expect(re.exec('1ez')).toBeUndefined()
    })
    it ('should build a big regexp', function() {
      var re = new LSD.RegExp(big)
      expect(re.groups).toEqual({ 1 : 'block', 2 : 'block', 3 : 'fn', 4 : 'fn', 5 : 'fn', 6 : 'length', 7 : 'length', 8 : 'token', 9 : 'token', 10 : 'separator', 11 : 'index', 12 : 'operator', 13 : 'string', 14 : 'string' });
      re.exec('');
      expect(re.compiled.exec('{|a|b}')[1]).toEqual('a')
      re.compiled.lastIndex = 0;
      expect(re.compiled.exec('{|a|b}')[2]).toEqual('b')
      re.compiled.lastIndex = 0;
      expect(re.compiled.exec('.a(b)')[3]).toEqual('.')
      re.compiled.lastIndex = 0;
      expect(re.compiled.exec('.a(b)')[4]).toEqual('a')
      re.compiled.lastIndex = 0;
      expect(re.compiled.exec('.a(b)')[5]).toEqual('b')
      re.compiled.lastIndex = 0;
      expect(re.compiled.exec('1em')[6]).toEqual('1')
      re.compiled.lastIndex = 0;
      expect(re.compiled.exec('1em')[7]).toEqual('em')
      re.compiled.lastIndex = 0;
      expect(re.compiled.exec('.a')[8]).toEqual('.')
      re.compiled.lastIndex = 0;
      expect(re.compiled.exec('.b')[9]).toEqual('b')
      re.compiled.lastIndex = 0;
      expect(re.compiled.exec(',')[10]).toEqual(',')
      re.compiled.lastIndex = 0;
      expect(re.compiled.exec('[a]')[11]).toEqual('a')
      re.compiled.lastIndex = 0;
      expect(re.compiled.exec('+')[12]).toEqual('+')
      re.compiled.lastIndex = 0;
      expect(re.compiled.exec('"abc"')[13]).toEqual('abc')
      re.compiled.lastIndex = 0;
      expect(re.compiled.exec("'cba'")[14]).toEqual('cba')
      re.compiled.lastIndex = 0;
    })
  })
  describe('#exec', function() {
    it ('should be able to call a limited subset of callbacks', function() {
      var re = new LSD.RegExp(big, {
        length: function(number, unit) {
          return [number, unit]
        },
        fn: function(tail, name, args) {
          return [name, this.exec(args)]
        }
      });
      expect(re.exec('3em')).toEqual([['3', 'em']])
      expect(re.exec('a(1%, 3em)')).toEqual([['a', [['1', '%'], ['3', 'em']]]]);
      expect(re.exec('a(b(1%, 3em))')).toEqual([['a', [['b', [['1', '%'], ['3', 'em']]]]]]);
      expect(re.exec('a(b(1%, 3em))')).toEqual([['a', [['b', [['1', '%'], ['3', 'em']]]]]]);
      expect(re.exec('a(1%, 3em), a(1%, 3em)')).toEqual([['a', [['1', '%'], ['3', 'em']]], ['a', [['1', '%'], ['3', 'em']]]]);
    });
    it ('should be able to parse blocks', function() {
      var re = new LSD.RegExp(big, {
        block: function(args, body) {
          return [this.exec(args), body && this.exec(body)]
        },
        token: function(tail, name) {
          return name;
        },
        string: function(string) {
          return string;
        },
        fn: function(tail, name, args) {
          return [name, args && this.exec(args)]
        },
        index: function(args) {
          return this.exec(args)
        }
      });
      expect(re.exec('"a"')).toEqual(["a"])
      expect(re.exec(' "a",   "b"')).toEqual(["a", 'b'])
      expect(re.exec('\'a\',  "b"')).toEqual(["a", 'b'])
      expect(re.exec('\'a\', \'b\'')).toEqual(["a", 'b'])
      expect(re.exec(' "a",  \'b\'')).toEqual(["a", 'b'])
      expect(re.exec('{|a| b(c)}')).toEqual([[['a'], [['b', ['c']]]]])
      expect(re.exec('o(){|a| b(c)}')).toEqual([['o', undefined], [['a'], [['b', ['c']]]]])
      expect(re.exec('o(){|a, b| b("c", \'d\', o(){|a, b| b(c, d)})}')).toEqual([['o', undefined], [['a', 'b'], [['b', ['c', 'd', ['o', undefined], [['a', 'b'], [['b', ['c', 'd']]]]]]]]])
      expect(re.exec('o([a]){|a| b(c)}')).toEqual([['o', [['a']]], [['a'], [['b', ['c']]]]])
    });
  })
})


describe('LSD.Styles.Parser', function() {
  var Examples = {
    '1': 1,
    '3.5': 3.5,
    '5f.5': '5f.5',
    '"5f.5"': '5f.5',
    '2em': {number: 2, unit: 'em'},
    '3px': {number: 3, unit: 'px'},
    '4pt': {number: 4, unit: 'pt'},
    '5fr': {number: 5, unit: 'fr'},
    '65%': {number: 65, unit: '%'},
    '1 1': [1, 1],
    '1 +1': [1, 1],
    '1 -1': [1, -1],
    '(1 -1)': [1, '-', 1],
    '(1 +1)': [1, '+', 1],
    '(1-1)': [1, '-', 1],
    '(1+1)': [1, '+', 1],
    '(a)': 'a',
    '-(1)': -1,
    '-(1 - 5)': ['-', [1, '-', 5]],
    '+(1 - 5)': ['+', [1, '-', 5]],
    '+(1 - 5)': ['+', [1, '-', 5]],
    '*(1 - 5)': ['*', [1, '-', 5]],
    '-(1 +-5)': ['-', [1, '+', -5]],
    '+(1 +-5)': ['+', [1, '+', -5]],
    '+(1 +-5)': ['+', [1, '+', -5]],
    '*(1 +-5)': ['*', [1, '+', -5]],
    '-(1 -+5)': ['-', [1, '-', 5]],
    '+(1 -+5)': ['+', [1, '-', 5]],
    '+(1 -+5)': ['+', [1, '-', 5]],
    '*(1 -+5)': ['*', [1, '-', 5]],
    '1 1 1': [1, 1, 1],
    '1 1 9 1': [1, 1, 9, 1],
    '1 2 4 8 1': [1, 2, 4, 8, 1],
    '1 1, 1 3': [[1, 1], [1, 3]],
    'a != b': ['a', '!=', 'b'],
    'a ~= b': ['a', '~=', 'b'],
    'not screen and (pixel--moz-density: 3)': ['not', 'screen', {'and': ['pixel--moz-density:', 3]}],
    'count()': {count: []},
    'count(#publications[a=1]::items > li ~ a[href])': {count: ['#publications[a=1]::items', '>', 'li', '~', 'a[href]']},
    'count(#publications[a=1]::items !> li !~ a[href])': {count: ['#publications[a=1]::items', '!>', 'li', '!~', 'a[href]']},
    'count(#publications[a=1]::items ++ li ~~ a[href])': {count: ['#publications[a=1]::items', '+', '+', 'li', '~~', 'a[href]']},
    'a(b)': {a: "b"},
    '(b)': "b",
    '(b a)': ["b", "a"],
    '(b / a + 3)': ["b", "/", "a", "+", 3],
    "(a / (b - 2)(2 - 3)) / 2": [['a', '/', ['b', '-', 2], [2, '-', 3]], '/', 2],
    'url("http://jesus.com.abc/white.xml?q=a[b][]=c&a#perfect")': {url: "http://jesus.com.abc/white.xml?q=a[b][]=c&a#perfect"},
    'url(\'http://jesus.com.abc/white.xml?q=a[b][]=c&a#perfect\')': {url: "http://jesus.com.abc/white.xml?q=a[b][]=c&a#perfect"},
    'url(http://jesus.com.abc/white.xml?q=a[b][]=c&a#perfect)': {url: "http://jesus.com.abc/white.xml?q=a[b][]=c&a#perfect"},
    'local(http://jesus.com.abc/white.xml?q=a[b][]=c&a#perfect)': {local: "http://jesus.com.abc/white.xml?q=a[b][]=c&a#perfect"},
    'url(1px solid)': {url: '1px solid'},
    'local(1px solid)': {local: '1px solid'},
    'src(1px solid)': {src: '1px solid'},
    'srk(1px solid)': {srk: [{number: 1, unit: 'px'}, 'solid']},
    'lokal(1px solid)': {lokal: [{number: 1, unit: 'px'}, 'solid']},
    'uzl(1px solid)': {uzl: [{number: 1, unit: 'px'}, 'solid']},
    'rgba(1, 1, 1, 40%)': {rgba: [1, 1, 1, {number: 40, unit: '%'}]},
    //'each(items) { hello() }': {each: ['items', {hello: []}]},
    //'each(items) { hello(), bye() }': {each: ['items', [{hello: []}, {bye: []}]]},
    //'each(items) { hello() + bye() }': {each: ['items', [{hello: []}, '+', {bye: []}]]},
    '1em, 2em 3em, 4em 5em 6em, 7em 9em 3pt auto': [
      [{number: 1, unit: 'em'}], 
      [{number: 2, unit: 'em'}, {number: 3, unit: 'em'}], 
      [{number: 4, unit: 'em'}, {number: 5, unit: 'em'}, {number: 6, unit: 'em'}],
      [{number: 7, unit: 'em'}, {number: 9, unit: 'em'}, {number: 3, unit: 'pt'}, 'auto']],

    //edge case in CSS: string separated list
    //two arrays instead of one
    'normal normal 3px/5pt Georgia, "Times New Roman"': [['normal', 'normal', {number: 3, unit: 'px'}, '/', {number: 5, unit: 'pt'}, 'Georgia'], ['Times New Roman']]
  };
  console.log(1)
  Object.each(Examples, function(value, key) {
    it ('should parse ' + key, function() {
      expect(LSD.Styles.Parser.exec(key)).toEqual(value)
    })
  });
});