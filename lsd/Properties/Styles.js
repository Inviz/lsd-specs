describe('LSD.RegExp', function() {
  var big = {
    'block_arguments': '[^|]*',
    'block_body': '<inside_curlies>*',
    'block': '\\{(?:\\s*\\|\\s*(<block_arguments>)\\s*\\|\\s*)?(<block_body>)\\}',
    
    'fn_tail': '\\.',
    'fn_arguments': '<inside_parens>*',
    'fn_name': '<unicode>+',
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
      expect(re.exec('3em')).toEqual(['3', 'em'])
      expect(re.exec('a(1%, 3em)')).toEqual(['a', [['1', '%'], ['3', 'em']]]);
      expect(re.exec('a(b(1%, 3em))')).toEqual(['a', ['b', [['1', '%'], ['3', 'em']]]]);
      expect(re.exec('a(b(1%, 3em))')).toEqual(['a', ['b', [['1', '%'], ['3', 'em']]]]);
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
      expect(re.exec('"a"')).toEqual("a")
      expect(re.exec(' "a",   "b"')).toEqual(["a", 'b'])
      expect(re.exec('\'a\',  "b"')).toEqual(["a", 'b'])
      expect(re.exec('\'a\', \'b\'')).toEqual(["a", 'b'])
      expect(re.exec(' "a",  \'b\'')).toEqual(["a", 'b'])
      expect(re.exec('{|a| b(c)}')).toEqual(['a', ['b', 'c']])
      expect(re.exec('{|a, c| b(c)}')).toEqual([['a', 'c'], ['b', 'c']])
      expect(re.exec('{|a| b(c, "a")}')).toEqual(['a', ['b', ['c', 'a']]])
      expect(re.exec('o(){|a| b(c)}')).toEqual([['o', undefined], ['a', ['b', 'c']]])
      expect(re.exec('o(){|a, b| b("c", \'d\', o(){|a, b| b(c, d)})}')).toEqual([['o', undefined], [['a', 'b'], ['b', ['c', 'd', ['o', undefined], [['a', 'b'], ['b', ['c', 'd']]]]]]])
      expect(re.exec('o([a]){|a| b(c)}')).toEqual([['o', 'a'], ['a', ['b', 'c']]])
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
  Object.each(Examples, function(value, key) {
    it ('should parse ' + key, function() {
      expect(LSD.Styles.Parser.exec(key)).toEqual(value)
    })
  });
});

describe('LSD.Styles.Property', function() {
  var Type = LSD.Styles.Type;
  var Examples = { 
    zIndex: {
      '0': 0,
      '1': 1,
      '999999': 999999,
      '-1': -1,
      '+1': 1,
      'f': false,
      'none': false,
      'inherit': false,
      'f99999': false
    },
    display: {
      'block': 'block',
      'inline-block': 'inline-block',
      'bkoz': false,
      '-moz-inline-block': false
    },
    color: {
      'rgb(1, 1, 1)': Type.color([1, 1, 1]),
      'rgba(1, 2, 1)': Type.color([1, 2, 1]),
      'rgba(1, 2, 1, 1)': Type.color([1, 2, 1, 1]),
      'rgba(1, 2, 1, 1%)': Type.color([1, 2, 1, 0.01]),
      'rgba(1, 2, 1, 0.5)': Type.color([1, 2, 1, 0.5]),
      'hsb(0, 30, 100, 0.5)': Type.color([0, 30, 100, 0.5], 'hsb'),
      '#ccc': Type.color('#ccc'),
      '#cccccc': Type.color('#cccccc'),
      '#ccccc': false,
      'rgbo(1, 2, 1, 0.5)': false,
      'rdb(1, 2, 1, 0.5)': false
      //'black'
      //'cyan' - Color map takes 4kb. Does it worth it?    
    },
    lineHeight: {
      'normal': 'normal',
      'normol': false,
      '1': 1,
      '1.5': 1.5,
      '50%': Type.length(50, '%'),
      '55.4%': Type.length(55.4, '%'),
      '5f.5%': false,
      'none': false
    },
    cursor: {
      'sw-resize': 'sw-resize',
      'ws-resize': false
    },
    fontWeight: {
      '100': 100,
      'bold': 'bold',
      'normal': 'normal',
      '100%': false,
      'big': false
    },
    borderTop: {
      '3px solid #ccc': {borderTopWidth: Type.length(3, 'px'), borderTopStyle: 'solid', borderTopColor: Type.color('#ccc')},
      '1em dotted rgba(1,1,1, 0.5)': {borderTopWidth: Type.length({number: 1, unit: 'em'}), borderTopStyle: 'dotted', borderTopColor: Type.color({rgba: [1, 1, 1, 0.5]})},
      '1.3pt solid hsb(0, 0, 30, 30)': {borderTopWidth: Type.length({number: 1.3, unit: 'pt'}), borderTopStyle: 'solid', borderTopColor: Type.color({hsb: [0, 0, 30, 30]})},
    
      '1.3% solid hsb(0, 0, 30, 30)': false,    
      '1em soled rgba(1,1,1, 0.5)': false,    
      '1em solid #cccccz': false,   
      //'1 solid #ccc': false,    //unitless length is valid now
  //    '3px solid black': {borderTopWidth: Type.length(3, 'px'), borderTopStyle: 'solid', borderTopColor: 'black'},
    },
    font: {
      '7px Georgia': {fontSize: Type.length(7, 'px'), fontFamily: 'Georgia'},
      'normal 3pt Georgia': {fontStyle: 'normal', fontSize: Type.length(3, 'pt'), fontFamily: 'Georgia'},
      'normal bold medium "Tahoma"': {fontStyle: 'normal', fontWeight: 'bold', fontSize: 'medium', fontFamily: 'Tahoma'},
      'normal italic medium "Tahoma"': {fontVariant: 'normal', fontStyle: 'italic', fontSize: 'medium', fontFamily: 'Tahoma'},
      'bold italic medium "Tahoma"': {fontWeight: 'bold', fontStyle: 'italic', fontSize: 'medium', fontFamily: 'Tahoma'},
      //'bold italic medium 3px "Tahoma"': {fontWeight: 'bold', fontStyle: 'italic', fontSize: 'medium', fontFamily: 'Tahoma'},
      'bold italic small-caps medium "Tahoma"': {fontWeight: 'bold', fontStyle: 'italic', fontVariant: 'small-caps', fontSize: 'medium', fontFamily: 'Tahoma'},
    
      'Georgia 7px': false,
      'Georgia': false,
      '7px': false,
      '3pt normal 3px Tahoma': false,
      '3pz Georgia': false,
      //'3pt normal normal Tahoma': false,
      'normal normal normal Tahoma': false
      //'normal bold medium normal "Tahoma"': {fontStyle: 'normal', fontWeight: 'bold', fontSize: 'medium', lineHeight: 'normal', fontFamily: 'Tahoma'}
    },
    
    margin: {
      '4px': {marginTop: Type.length(4, 'px'), marginRight: Type.length(4, 'px'), marginBottom: Type.length(4, 'px'), marginLeft: Type.length(4, 'px')},
      '50% 4px': {marginTop: Type.length(50, '%'), marginRight: Type.length(4, 'px'), marginBottom: Type.length(50, '%'), marginLeft: Type.length(4, 'px')},
      '4px 4px 4px': {marginTop: Type.length(4, 'px'), marginRight: Type.length(4, 'px'), marginBottom: Type.length(4, 'px'), marginLeft: Type.length(4, 'px')},
      '4px -4fr 4px 4px': {marginTop: Type.length(4, 'px'), marginRight: Type.length(-4, 'fr'), marginBottom: Type.length(4, 'px'), marginLeft: Type.length(4, 'px')},
    },
    
    border: {
      '1px solid #ccc': {
        borderTopWidth: Type.length({number: 1, unit: 'px'}), 
        borderTopStyle: 'solid', 
        borderTopColor: Type.color("#ccc"),
        borderRightWidth: Type.length({number: 1, unit: 'px'}), 
        borderRightStyle: 'solid', 
        borderRightColor: Type.color("#ccc"),
        borderBottomWidth: Type.length({number: 1, unit: 'px'}), 
        borderBottomStyle: 'solid', 
        borderBottomColor: Type.color("#ccc"),
        borderLeftWidth: Type.length({number: 1, unit: 'px'}), 
        borderLeftStyle: 'solid', 
        borderLeftColor: Type.color("#ccc")
      },
      '2pt dotted rgba(0, 10, 37, 50%), 5px dashed #c31': {
        borderTopWidth: Type.length(2, 'pt'), 
        borderTopStyle: 'dotted', 
        borderTopColor: Type.color({rgba: [0, 10, 37, 0.5]}),
        borderRightWidth: Type.length(5, 'px'), 
        borderRightStyle: 'dashed', 
        borderRightColor: Type.color("#c31"),
        borderBottomWidth: Type.length(2, 'pt'), 
        borderBottomStyle: 'dotted', 
        borderBottomColor: Type.color({rgba: [0, 10, 37, 0.5]}),
        borderLeftWidth: Type.length(5, 'px'), 
        borderLeftStyle: 'dashed', 
        borderLeftColor: Type.color("#c31")
      },
      '1px solid #ccc, 2px solid #ccc, 3px solid #ccc': {
        borderTopWidth: Type.length(1, 'px'), 
        borderTopStyle: 'solid', 
        borderTopColor: Type.color("#ccc"),
        borderRightWidth: Type.length(2, 'px'), 
        borderRightStyle: 'solid', 
        borderRightColor: Type.color("#ccc"),
        borderBottomWidth: Type.length(3, 'px'), 
        borderBottomStyle: 'solid', 
        borderBottomColor: Type.color("#ccc"),
        borderLeftWidth: Type.length(2, 'px'), 
        borderLeftStyle: 'solid', 
        borderLeftColor: Type.color("#ccc")
      },
    },
    
    background: {
      '#cc0': { 
        backgroundColor: Type.color('#cc0')
      },
      'no-repeat #cd1': { 
        backgroundRepeat: 'no-repeat', 
        backgroundColor: Type.color('#cd1')
      },
      '#cd2 repeat-x fixed': { 
        backgroundColor: Type.color('#cd2'),
        backgroundRepeat: 'repeat-x',
        backgroundAttachment: 'fixed'
      },
      '#e33 url("http://google.png") center': { 
        backgroundColor: Type.color('#e33'), 
        backgroundImage: new Type.url("http://google.png"), 
        backgroundPositionX: 'center'
      },
      'url("//cc.cc") rgba(0, 3, 2, 1.5%) 3px': {
        backgroundImage: Type.url({url: "//cc.cc"}), 
        backgroundColor: Type.color([0, 3, 2, 0.015]), 
        backgroundPositionX: Type.length(3, 'px')
      },
      '-55.5% right repeat url("//cc.cc#ach.gif") hsb(20, 10, -10, 5%)': { 
        backgroundPositionY: Type.length(-55.5, '%'),
        backgroundPositionX: 'right',
        backgroundRepeat: 'repeat',
        backgroundImage: new Type.url("//cc.cc#ach.gif"), 
        backgroundColor: Type.color({hsb: [20, 10, -10, 0.05]})
      },
    
      '-55.5% bottom repeat-y url("#pic") #ccc fixed': {
        backgroundPositionX: Type.length(-55.5, '%'),
        backgroundPositionY: 'bottom',
        backgroundRepeat: 'repeat-y',
        backgroundImage: new Type.url("#pic"),
        backgroundColor: Type.color('#ccc'),
        backgroundAttachment: 'fixed'
      },
      '-55.5f bottom repeat-y url("#pic") #ccc fixed': false,
      '-55.5% bodtom repeat-y url("#pic") #ccc fixed': false,
      '-55.5% bottom repead-y url("#pic") #ccc fixed': false,
      '-55.5% bottom repeat-y uzl("#pic") #ccc fixed': false,
      '-55.5% bottom repeat-y url #ccc fixed': false,
      '-55.5% bottom repeat-y url("#pic") #zzz fixed': false,
      '-55.5% bottom repeat-y url("#pic") #ccc fixes': false,
      '-55.5% bottom repeat-y url("#pic") #ccc fixed fixed': false,
    
    
      '#cc0, #cc2': [
        { 
          backgroundColor: Type.color('#cc0')
        },
        { 
          backgroundColor: Type.color('#cc2')
        }
      ],
      'url(decoration.png) left top no-repeat, url(ribbon.png) right bottom repeat-x, url(old_paper.jpg) left top no-repeat': [
        {
          backgroundImage: new Type.url('decoration.png'),
          backgroundPositionX: 'left',
          backgroundPositionY: 'top',
          backgroundRepeat: 'no-repeat'
        },
        {
          backgroundImage: new Type.url('ribbon.png'),
          backgroundPositionX: 'right',
          backgroundPositionY: 'bottom',
          backgroundRepeat: 'repeat-x'
        },
        {
          backgroundImage: new Type.url('old_paper.jpg'),
          backgroundPositionX: 'left',
          backgroundPositionY: 'top',
          backgroundRepeat: 'no-repeat'
        }
      ]
    },
    
    padding: {
      '4pt': {paddingTop: Type.length(4, 'pt'), paddingRight: Type.length(4, 'pt'), paddingBottom: Type.length(4, 'pt'), paddingLeft: Type.length(4, 'pt')},
      '4px 4px': {paddingTop: Type.length(4, 'px'), paddingRight: Type.length(4, 'px'), paddingBottom: Type.length(4, 'px'), paddingLeft: Type.length(4, 'px')},
      '4px 1pt 4px': {paddingTop: Type.length(4, 'px'), paddingRight: Type.length(1, 'pt'), paddingBottom: Type.length(4, 'px'), paddingLeft: Type.length(1, 'pt')},
      '4px 4px 4px 4px': {paddingTop: Type.length(4, 'px'), paddingRight: Type.length(4, 'px'), paddingBottom: Type.length(4, 'px'), paddingLeft: Type.length(4, 'px')},    
    
      '4pz 4px 4px 4px': false,
      '4px 4pz 4px 4px': false,
      '4px 4px 4pz 4px': false,
      '4px 4px 4px 4pz': false,
    
      '4pz 4px 4px': false,
      '4px 4pz 4px': false,
      '4px 4px 4pz': false,
    
      '4pz 4px': false,
      '4px 4pz': false,
    
      '4pz': false
    }
  }
  Object.each(Examples, function(examples, property) {
    describe ('#' + property, function() {
      Object.each(examples, function(output, input) {
        it('should parse ' + input, function() {
          var value = LSD.Styles.Parser.exec(input);
          expect(LSD.Styles[property][value && value.push ? 'apply' : 'call'](null, value)).toEqual(output);
        })
      })
    })
  });
  
  
  
  describe("#setStyle", function() {
    
    var tests = {
      "when given a simple style": {
        "that is built in": {
          "and value is a hex string": {
            property: 'color',
            input: "#333",
            output: '#333333'
          },
          "and value is rgb-string": {
            property: 'color',
            input: "rgb(12, 22, 34)",
            output: '#0c1622'
          },
          "and value is rgba-string": {
            property: 'color',
            input: "rgb(12, 22, 34, 0)",
            output: 'transparent'
          },
          "and value is hsb-string": {
            property: 'color',
            input: "hsb(12, 22, 34)",
            output: '#574744'
          },
          "and value is an array": {
            property: 'color',
            input: [[51, 52, 51]],
            output: '#333433'
          },
          "and value is an object": {
            property: 'color',
            input: Color.hsb(25, 22, 11),
            output: '#1c1816'
          }
        },
        "that has a protected name": {
          "and value is a keyword": {
            property: 'float',
            input: 'left',
            output: 'left'
          },
          "and value is an unknown keyword": {
            property: 'float',
            input: 'zip-zap',
            output: null
          }
        },
        "that is emulated in IE": {
          "and value is a string": {
            property: 'opacity',
            input: '0.5',
            output: 0.5
          },
          "and value is a number": {
            property: 'opacity',
            input: 0.5,
            output: 0.5
          }
        }
      },
      "when given a shortcut property": {
        "and values are padded": {
          "and there's a single value given": {
            property: 'margin',
            input: 3,
            output: '3px 3px 3px 3px',
            properties: {
              marginTop: '3px',
              marginRight: '3px',
              marginBottom: '3px',
              marginLeft: '3px'
            }
          },
          "and there're two values given": {
            property: 'margin',
            input: [3, 5],
            output: '3px 5px 3px 5px',
            properties: {
              marginTop: '3px',
              marginRight: '5px',
              marginBottom: '3px',
              marginLeft: '5px'
            }
          },
          "and there're two values given that can be collapsed to one": {
            property: 'margin',
            input: [3, 3],
            output: '3px 3px 3px 3px',
            properties: {
              marginTop: '3px',
              marginRight: '3px',
              marginBottom: '3px',
              marginLeft: '3px'
            }
          },
          "and there're two values given, one parsed and one unparsed": {
            property: 'margin',
            input: [5, '3px'],
            output: '5px 3px 5px 3px',
            properties: {
              marginTop: '5px',
              marginRight: '3px',
              marginBottom: '5px',
              marginLeft: '3px'
            }
          },
          "and there're two values given, one parsed and one unparsed with unit different from pixels": {
            property: 'margin',
            input: ['5em', 3],
            output: '5em 3px 5em 3px',
            properties: {
              marginTop: '5em',
              marginRight: '3px',
              marginBottom: '5em',
              marginLeft: '3px'
            }
          },
          "and there're three values given": {
            property: 'margin',
            input: [3, 4, 5],
            output: '3px 4px 5px 4px',
            properties: {
              marginTop: '3px',
              marginRight: '4px',
              marginBottom: '5px',
              marginLeft: '4px'
            }
          },
          "and there're three values given and they can be collapsed to one": {
            property: 'margin',
            input: [3, 3, 3],
            output: '3px 3px 3px 3px',
            properties: {
              marginTop: '3px',
              marginRight: '3px',
              marginBottom: '3px',
              marginLeft: '3px'
            }
          },
          "and there're four values given": {
            property: 'margin',
            input: [3, 4, 5, 6],
            output: '3px 4px 5px 6px',
            properties: {
              marginTop: '3px',
              marginRight: '4px',
              marginBottom: '5px',
              marginLeft: '6px'
            }
          },
          "and there're four values given and they can be collapsed to three": {
            property: 'margin',
            input: [3, 4, 5, 4],
            output: '3px 4px 5px 4px',
            properties: {
              marginTop: '3px',
              marginRight: '4px',
              marginBottom: '5px',
              marginLeft: '4px'
            }
          },
          "and there're four values given and they can be collapsed to two": {
            property: 'margin',
            input: [3, 4, 3, 4],
            output: '3px 4px 3px 4px',
            properties: {
              marginTop: '3px',
              marginRight: '4px',
              marginBottom: '3px',
              marginLeft: '4px'
            }
          },
          "and there're four values given and they can be collapsed to one": {
            property: 'margin',
            input: [3, 3, 3, 3],
            output: '3px 3px 3px 3px',
            properties: {
              marginTop: '3px',
              marginRight: '3px',
              marginBottom: '3px',
              marginLeft: '3px'
            }
          }
        }
      },
      "when given a property that is a shortcut of shortcuts": {
        "and a single value is given": {
          property: 'border',
          input: 3,
          properties: null
        },
        "and two values are given": {
          property: 'border',
          input: [3, 'solid'],
          properties: null
        },
        "and three values are given": {
          property: 'border',
          input: [1, 'solid', '#ccc'],
          properties: {
            borderTopWidth: '1px', 
            borderTopStyle: 'solid', 
            borderTopColor: "#cccccc",
            borderRightWidth: '1px', 
            borderRightStyle: 'solid', 
            borderRightColor: "#cccccc",
            borderBottomWidth: '1px', 
            borderBottomStyle: 'solid', 
            borderBottomColor: "#cccccc",
            borderLeftWidth: '1px',
            borderLeftStyle: 'solid', 
            borderLeftColor: "#cccccc"
          }
        },
        "and four values are given": {
          property: 'border',
          input: [3, 'solid', '#ccc', 'dashed'],
          properties: null
        },
        "and two sets of values are given": {
          property: 'border',
          input: [['2pt', 'dotted', {rgb: [0, 10, 37]}], ['5px', 'dashed', '#c31']],
          output: '2pt dotted rgb(0, 10, 37), 5px dashed #c31, 2pt dotted rgb(0, 10, 37), 5px dashed #c31',
          properties: {
            borderTopWidth: '2pt', 
            borderTopStyle: 'dotted', 
            borderTopColor: {rgb: [0, 10, 37]},
            borderRightWidth: '5px', 
            borderRightStyle: 'dashed', 
            borderRightColor: "#cc3311",
            borderBottomWidth: '2pt', 
            borderBottomStyle: 'dotted', 
            borderBottomColor: {rgb: [0, 10, 37]},
            borderLeftWidth: '5px',
            borderLeftStyle: 'dashed', 
            borderLeftColor: "#cc3311"
          }
        },
        "and three sets of values are given": {
          property: 'border',
          input: '1px solid #cccccc, 2px solid #cccccc, 3px solid #cccccc',
          output: '1px solid #cccccc, 2px solid #cccccc, 3px solid #cccccc, 2px solid #cccccc',
          properties: {
            borderTopWidth: '1px',
            borderTopStyle: 'solid', 
            borderTopColor: "#cccccc",
            borderRightWidth: '2px',
            borderRightStyle: 'solid', 
            borderRightColor: "#cccccc",
            borderBottomWidth: '3px',
            borderBottomStyle: 'solid', 
            borderBottomColor: "#cccccc",
            borderLeftWidth: '2px',
            borderLeftStyle: 'solid', 
            borderLeftColor: "#cccccc"
          },
        },
        "and four sets of values are given": {
          property: 'border',
          input: '1px solid #cccccc, 2px solid #cccccc, 3px solid #cccccc, 4em dashed #000000',
          output: '1px solid #cccccc, 2px solid #cccccc, 3px solid #cccccc, 4em dashed #000000',
          properties: {
            borderTopWidth: '1px',
            borderTopStyle: 'solid', 
            borderTopColor: "#cccccc",
            borderRightWidth: '2px',
            borderRightStyle: 'solid', 
            borderRightColor: "#cccccc",
            borderBottomWidth: '3px',
            borderBottomStyle: 'solid', 
            borderBottomColor: "#cccccc",
            borderLeftWidth: '4em', 
            borderLeftStyle: 'dashed', 
            borderLeftColor: "#000000"
          },
        }
      },
      "when given property is a shortcut of non-ambiguous properties": {
        "and value is given as simple string": {
          property: 'background',
          input: '#ccc',
          output: '#cccccc',
          properties: {
            background: '#cccccc'
          }
        },
        "and value is given as complex string": {
          property: 'background',
          input: '#123456 url("http://google.com/1.png") center',
          output: '#123456 url(http://google.com/1.png) 50%',
          properties: { 
            backgroundColor: '#123456', 
            backgroundImage: 'url(http://google.com/1.png)', 
            backgroundPositionX: '50%'
          }
        }
      }
    }
    var assert = function(a, b) {
      if (b == null) b = '';
      else b = String(b)
      return expect(a).toEqual(b);
    }
    //var walk = function(object) {
    //  Object.each(object, function(value, name) {
    //    describe(name, function() {
    //      if (!value.property) {
    //        walk(value);
    //      } else {
    //        it("should set styles", function() {
    //          var element = new Element('div');
    //          element.setStyle(value.property, value.input);
    //          if (value.properties)
    //            for (var i in value.properties) {
    //              assert(element.getStyle(i), value.properties[i])
    //            }
    //          if (typeof value.output != 'undefined')
    //            assert(element.getStyle(value.property), value.output)
    //        })
    //      }
    //    })
    //  })
    //};
    //walk(tests);
  })
})