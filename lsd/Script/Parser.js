LSD.RegExp = function(object, callbacks) {
  this.definition = object;
  this.callbacks = callbacks;
  this.groups = {};
  this.alternatives = {};
  var source = '', re = this, index = 0
  var placeholder = function(all, token, start, input) {
    var value = object[token], left, right;
    if ((value == null || token === name) && typeof (value = re[token]) != 'string') {
      var bits = token.split('_');
      value = (re[bits[0]]) ? re[bits.shift()].apply(re, bits) : token;
    }
    if ((left = input.substring(0, start).match(re.re_left))) left = left[0];
    if ((right = input.substring(start + all.length).match(re.re_right))) right = right[0];
    if (left || right) re.groups[++index] = name;
    if (left && left.charAt(left.length - 1) === '|' && left.charAt(0) !== '\\') 
      re.alternatives[index] = re.groups[index - 1] || re.alternatives[index - 1];
    return value.replace(re.re_reference, placeholder);
  };
  for (var name in object) {
    var old = index, value = object[name];
    var replaced = value.replace(this.re_reference, placeholder)
    var groupped = this.re_groupped.test(value);
    if (old !== index || groupped) source += (source ? '|' : '') + replaced;
    if (old === index && groupped) this.groups[++index] = name;
  }  
  this.source = source;
};
LSD.RegExp.prototype = {
  exec: function(string, callbacks) {
    if (typeof callbacks == 'undefined') callbacks = this.callbacks;
    var regexp = this.compiled || (this.compiled = new RegExp(this.source, "g"));
    var lastIndex = regexp.lastIndex, old = this.stack, groups = this.groups;;
    regexp.lastIndex = 0;
    for (var match, group, val, args; match = regexp.exec(string);) {
      for (var i = 1, s = null, j = match.length, group = null; i <= j; i++) {
        if (group != null && group !== groups[i]) {
          while (!match[i - 1]) i--
          while (!match[s - 1] && !this.alternatives[s] && groups[s - 1] === group) s--
          match = match.slice(s, i);
          if (!callbacks) {
            if (!stack) var stack = {};
            stack[group] = i - s == 1 ? match[0] : match;
          } else {
            if (!stack) var stack = this.stack = [];
            if (callbacks[group] && typeof (val = callbacks[group].apply(this, match)) != 'undefined')
              stack.push(val);
          }
          break;
        } else if (match[i]) {
          if (s == null) s = i;
          if (group == null) group = groups[i];
        }
      }
    }
    regexp.lastIndex = lastIndex;
    this.stack = old;
    return stack;
  },
  inside: function(type, level) {
    var key = Array.prototype.join.call(arguments, '_');
    if (this.insiders[key]) return this.insiders[key];
    var g = this.insides[type], s = '[^' + '\\' + g[0] + '\\' + g[1] + ']'
    for (var i = 1, bit, j = parseInt(level) || 5; i < j; i++)
      s = '(?:[^\\' + g[0] + '\\' + g[1] + ']' + '|\\' + g[0] + s +  '*\\' + g[1] + ')'
    return (this.insiders[key] = s);
  },
  re_reference: /\<([a-zA-Z][a-zA-Z0-9_]*)\>/g,
  re_left: /\(\?\:$|[^\\]\|(?=\()*?|\($/,
  re_right: /\||\)/,
  re_groupped: /^\([^\?].*?\)$/,
  insides: {
    curlies: ['{', '}'],
    squares: ['[', ']'],
    parens:  ['(', ')']
  },
  insiders: {},
  callbacks: {},
  unicode:       "(?:[\\w\\u00a1-\\uFFFF-]|\\\\[^\\s0-9a-f])",
  string_double: '"((?:[^"]|\\\\")*)"',
  string_single: "'((?:[^']|\\\\')*)'",
  string:        '<string_double>|<string_single>',
  whitespace:    '\\s',
  comma:         ','
}
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

describe('LSD.Script.Parser', function() {
  var Examples = { 
    'a': {type: 'variable', name: 'a'},
    'a, b': [{type: 'variable', name: 'a'}, {type: 'variable', name: 'b'}],
    '1': 1,
    '0': 0,
    '-1': -1,
    '"a"': 'a',
    '""': '',
    "'a'": 'a',
    "''": '',
    '1 + 1': {type: 'function', name: '+', value: [1, 1]},
    '1 + 2 + 3 + 4 + 5 + 6': {type: 'function', name: '+', value: [
      {type: 'function', name: '+', value: [
        {type: 'function', name: '+', value: [
          {type: 'function', name: '+', value: [
            {type: 'function', name: '+', value: [1, 2]}
          , 3]}
        , 4]}
      , 5]}
    , 6]},
    '1 * 2 + 3 - 4 * 5 / 6 + 7': {type: 'function', name: '+', value: [
      {type: 'function', name: '/', value: [
        {type: 'function', name: '-', value: [
          {type: 'function', name: '+', value: [
            {type: 'function', name: '*', value: [1, 2]}
          , 3]}
        , {type: 'function', name: '*', value: [4, 5]}]}
      , 6]}
    , 7]},  
    'a = 1': {type: 'function', name: '=', value: [{type: 'variable', name: 'a'}, 1]},
    'a = ($$ buttons)': {type: 'function', name: '=', value: [{type: 'variable', name: 'a'}, {type: 'selector', value: '$$ buttons'}]},
    'a ||= 1': {type: 'function', name: '||=', value: [{type: 'variable', name: 'a'}, 1]},
    'a(a)': {type: 'function', name: 'a', value: [{type: 'variable', name: 'a'}]},
    'a a': {type: 'function', name: 'a', value: [{type: 'variable', name: 'a'}]},
    'a 1': {type: 'function', name: 'a', value: [1]},
    'a 1 + 1': {type: 'function', name: 'a', value: [{type: 'function', name: '+', value: [1, 1]}]},
    'a 1 + 1, 2 + 2': {type: 'function', name: 'a', value: [{type: 'function', name: '+', value: [1, 1]}, {type: 'function', name: '+', value: [2, 2]}]},
    'a(a 1)': {type: 'function', name: 'a', value: [{type: 'function', name: 'a', value: [1]}]},
    'ding "a", 2': {type: 'function', name: 'ding', value: ["a", 2]},
    'ding("a", 2)': {type: 'function', name: 'ding', value: ["a", 2]},
    'item.ding': {type: 'variable', name: 'item.ding'},
    'item.ding()': {type: 'function', name: 'ding', value: [{type: 'variable', name: 'item'}]},
    'item.ding().dong': {type: 'function', name: '[]', value: [{type: 'function', name: 'ding', value: [{type: 'variable', name: 'item'}]}, "dong"]},
    'item.ding().dong.dizzle': {type: 'function', name: '[]', value: [{type: 'function', name: 'ding', value: [{type: 'variable', name: 'item'}]}, "dong.dizzle"]},
    'item.ding().dong.dizzle.zip()': {type: 'function', name: 'zip', value: [{type: 'function', name: '[]', value: [{type: 'function', name: 'ding', value: [{type: 'variable', name: 'item'}]}, "dong.dizzle"]}]},
    'item.ding().dong.dizzle.zip().dang': {type: 'function', name: '[]', value: [{type: 'function', name: 'zip', value: [{type: 'function', name: '[]', value: [{type: 'function', name: 'ding', value: [{type: 'variable', name: 'item'}]}, "dong.dizzle"]}]}, 'dang']},
    'item.ding().dong.dizzle.zip().dang 1': {type: 'function', name: 'dang', value: [{type: 'function', name: 'zip', value: [{type: 'function', name: '[]', value: [{type: 'function', name: 'ding', value: [{type: 'variable', name: 'item'}]}, "dong.dizzle"]}]}, 1]},
    'item.ding().dong.dizzle.zip().dang a': {type: 'function', name: 'dang', value: [{type: 'function', name: 'zip', value: [{type: 'function', name: '[]', value: [{type: 'function', name: 'ding', value: [{type: 'variable', name: 'item'}]}, "dong.dizzle"]}]}, {type: 'variable', name: 'a'}]},
    'item.ding().dong.dizzle.zip().dang 1, a': {type: 'function', name: 'dang', value: [{type: 'function', name: 'zip', value: [{type: 'function', name: '[]', value: [{type: 'function', name: 'ding', value: [{type: 'variable', name: 'item'}]}, "dong.dizzle"]}]}, 1, {type: 'variable', name: 'a'}]},
    'item.ding().dong.dizzle.zip().dang a, 1': {type: 'function', name: 'dang', value: [{type: 'function', name: 'zip', value: [{type: 'function', name: '[]', value: [{type: 'function', name: 'ding', value: [{type: 'variable', name: 'item'}]}, "dong.dizzle"]}]}, {type: 'variable', name: 'a'}, 1]},
    'item.ding().dong.dizzle.zip().zop.dang a, 1': 
      {type: 'function', name: 'dang', value: [
        {type: 'function', name: '[]', value: [
          {type: 'function', name: 'zip', value: [
            {type: 'function', name: '[]', value: [
              {type: 'function', name: 'ding', value: [
                {type: 'variable', name: 'item'}
              ]}, 
              "dong.dizzle"
            ]}
          ]},
          "zop"
        ]},
      {type: 'variable', name: 'a'}, 1]},
    'item.ding().dong.dizzle.zip(){3}["zop"].dang {a, 1}': 
      {type: 'function', name: 'dang', value: [
        {type: 'function', name: '[]', value: [
          {type: 'function', name: 'zip', value: [
            {type: 'function', name: '[]', value: [
              {type: 'function', name: 'ding', value: [
                {type: 'variable', name: 'item'}
              ]}, 
              "dong.dizzle"
            ]},
            {type: 'block', value: [3]}
          ]},
          "zop"
        ]},
      {type: 'block', value: [
        {type: 'variable', name: 'a'}, 1
      ]}]},
    'item.ding().dong.dizzle.zip(item.ding().dong.dizzle.zip(){3}["zop"].dang {a, 1}){3}["zop"].dang {a, 1}': 
      {type: 'function', name: 'dang', value: [
        {type: 'function', name: '[]', value: [
          {type: 'function', name: 'zip', value: [
            {type: 'function', name: '[]', value: [
              {type: 'function', name: 'ding', value: [
                {type: 'variable', name: 'item'}
              ]}, 
              "dong.dizzle"
            ]},
            {type: 'function', name: 'dang', value: [
              {type: 'function', name: '[]', value: [
                {type: 'function', name: 'zip', value: [
                  {type: 'function', name: '[]', value: [
                    {type: 'function', name: 'ding', value: [
                      {type: 'variable', name: 'item'}
                    ]}, 
                    "dong.dizzle"
                  ]},
                  {type: 'block', value: [3]}
                ]},
                "zop"
              ]},
            {type: 'block', value: [
              {type: 'variable', name: 'a'}, 1
            ]}]},
            {type: 'block', value: [3]}
          ]},
          "zop"
        ]},
      {type: 'block', value: [
        {type: 'variable', name: 'a'}, 1
      ]}]},
    'baby.item.ding()': {type: 'function', name: 'ding', value: [{type: 'variable', name: 'baby.item'}]},
    'item.ding().ding()': {type: 'function', name: 'ding', value: [{type: 'function', name: 'ding', value: [{type: 'variable', name: 'item'}]}]},
    'item.delete(2)': {type: 'function', name: 'delete', value: [{type: 'variable', name: 'item'}, 2]},
    'a[b]': {type: 'function', name: '[]', value: [{type: 'variable', name: 'a'}, {type: 'variable', name: 'b'}]},
    'a["b"]': {type: 'function', name: '[]', value: [{type: 'variable', name: 'a'}, 'b']},
    'a[\'b\']': {type: 'function', name: '[]', value: [{type: 'variable', name: 'a'}, 'b']},
    'a[\'b\' + \'c\']': {type: 'function', name: '[]', value: [{type: 'variable', name: 'a'}, 'b']},
    'a[\'b\' + \'c\']': 
      {type: 'function', name: '[]', value: [
        {type: 'variable', name: 'a'}, 
        {type: 'function', name: '+', value: [
          'b',
          'c'
        ]}
      ]},
    'a[b + \'c\']': 
      {type: 'function', name: '[]', value: [
        {type: 'variable', name: 'a'}, 
        {type: 'function', name: '+', value: [
          {type: 'variable', name: 'b'},
          'c'
        ]}
      ]},
    'a()[b + \'c\']': 
      {type: 'function', name: '[]', value: [
        {type: 'function', name: 'a', value: []}, 
        {type: 'function', name: '+', value: [
          {type: 'variable', name: 'b'},
          'c'
        ]}
      ]},
    'a[b[c[d()]]][e[f]]': 
      {type: 'function', name: '[]', value: [
        {type: 'function', name: '[]', value: [
          {type: 'variable', name: 'a'},
          {type: 'function', name: '[]', value: [
            {type: 'variable', name: 'b'},
            {type: 'function', name: '[]', value: [
              {type: 'variable', name: 'c'},
              {type: 'function', name: 'd', value: []}
            ]},
          ]}
        ]},
        {type: 'function', name: '[]', value: [
          {type: 'variable', name: 'e'},
          {type: 'variable', name: 'f'}
        ]}
      ]},
    '$ buttons': {type: 'selector', value: '$ buttons'},
    'count(#zipper)': {type: 'function', name: 'count', value: [{type: 'selector', value: '#zipper'}]},
    '($ .buttons).dispose()': {type: 'function', name: 'dispose', value: [{type: 'selector', value: '$ .buttons'}]},
    "time_range.starts_at && time_range.recurrence_rule.type || 'a'":
      {type: 'function', name: '||', value: [
        {type: 'function', name: '&&', value: [
          {type: 'variable', name: 'time_range.starts_at'},
          {type: 'variable', name: 'time_range.recurrence_rule.type'}
        ]},
        'a'
      ]},
    'filter buttons {|button| button.match(".gross")}': 
      {type: 'function', name: 'filter', value: [
        {type: 'variable', name: 'buttons'}, 
        {type: 'block', value: [
          {type: 'function', name: 'match', value: [
            {type: 'variable', name: 'button', local: true},
            ".gross"
          ]}
        ], locals: [{type: 'variable', name: 'button'}]}
      ]},
    'filter buttons + 25 {|button| button.match(".gross")}': 
      {type: 'function', name: 'filter', value: [
        {type: 'function', name: '+', value: [{
          type: 'variable', name: 'buttons'},
          25
        ]}, 
        {type: 'block', value: [
          {type: 'function', name: 'match', value: [
            {type: 'variable', name: 'button', local: true},
            ".gross"
          ]}
        ], locals: [{type: 'variable', name: 'button'}]}
      ]},
    'filter (& button) {|button| button.match(".gross")}': 
      {type: 'function', name: 'filter', value: [
        {type: 'selector', value: '& button'}, 
        {type: 'block', value: [
          {type: 'function', name: 'match', value: [
            {type: 'variable', name: 'button', local: true},
            ".gross"
          ]}
        ], locals: [{type: 'variable', name: 'button'}]}
      ]},
    'filtered = filter (& button) {|button| button.match(".gross")}': 
      {type: 'function', name: '=', value: [
        {type: 'variable', name: 'filtered'}, 
        {type: 'function', name: 'filter', value: [
          {type: 'selector', value: '& button'}, 
          {type: 'block', value: [
            {type: 'function', name: 'match', value: [
              {type: 'variable', name: 'button', local: true},
              ".gross"
            ]}
          ], locals: [{type: 'variable', name: 'button'}]}
        ]}
      ]},
    'if (a > 1) { 2 }':
      {type: 'function', name: 'if', value: [
        {type: 'function', name: '>', value: [
          {type: 'variable', name: 'a'},
          1
        ]},
        {type: 'block', value: [
          2
        ]}
      ]},
    'if a > 1 { 2 }':
      {type: 'function', name: 'if', value: [
        {type: 'function', name: '>', value: [
          {type: 'variable', name: 'a'},
          1
        ]},
        {type: 'block', value: [
          2
        ]}
      ]},
    'if (a > 1) { 2 } else { 0 }': [
      {type: 'function', name: 'if', value: [
        {type: 'function', name: '>', value: [
          {type: 'variable', name: 'a'},
          1
        ]},
        {type: 'block', value: [
          2
        ]}
      ]},
      {type: 'function', name: 'else', value: [
        {type: 'block', value: [
          0
        ]}
      ]}
    ],
    '($ button).filter {|b| b.publish {|r| r.body} }': 
      {type: 'function', name: 'filter', value: [
        {type: 'selector', value: '$ button'},
        {type: 'block', value: [
          {type: 'function', name: 'publish', value: [
            {type: 'variable', name: 'b', local: true},
            {type: 'block', value: [
              {type: 'variable', name: 'r.body', local: true}
            ], locals: [{type: 'variable', name: 'r'}]}
          ]}
        ], locals: [{type: 'variable', name: 'b'}]}
      ]},
    '($ button).filter() {|b| b.publish() {|r| r.body} }': 
      {type: 'function', name: 'filter', value: [
        {type: 'selector', value: '$ button'},
        {type: 'block', value: [
          {type: 'function', name: 'publish', value: [
            {type: 'variable', name: 'b', local: true},
            {type: 'block', value: [
              {type: 'variable', name: 'r.body', local: true}
            ], locals: [{type: 'variable', name: 'r'}]}
          ]}
        ], locals: [{type: 'variable', name: 'b'}]}
      ]},
    '     post()': {type: 'function', name: 'post', value: []},
    '             \n\
    post()        \n\
    destroy()':   [{type: 'function', name: 'post', value: []}, {type: 'function', name: 'destroy', value: []}],
    '             \n\
    post()        \n\
      destroy()'  : [{type: 'function', name: 'post', value: [{type: 'block', value: [{type: 'function', name: 'destroy', value: []}]}]}],
    '             \n\
    post()        \n\
      destroy()   \n\
        build()': [ {type: 'function', name: 'post', value: [
                    {type: 'block', value: [
                      {type: 'function', name: 'destroy', value: [
                        {type: 'block', value: [
                          {type: 'function', name: 'build', value: []}
                        ]}
                      ]}
                    ]}
                  ]}],
    '             \n\
    post()        \n\
      destroy()   \n\
        build()   \n\
      repair()':  [ {type: 'function', name: 'post', value: [
                    {type: 'block', value: [
                      {type: 'function', name: 'destroy', value: [
                        {type: 'block', value: [
                          {type: 'function', name: 'build', value: []}
                        ]}
                      ]},
                      {type: 'function', name: 'repair', value: []}
                    ]}
                  ]}],
    '             \n\
    post()        \n\
      destroy()   \n\
        build()   \n\
      repair()    \n\
        milk()':  [ {type: 'function', name: 'post', value: [
                    {type: 'block', value: [
                      {type: 'function', name: 'destroy', value: [
                        {type: 'block', value: [
                          {type: 'function', name: 'build', value: []}
                        ]}
                      ]},
                      {type: 'function', name: 'repair', value: [
                        {type: 'block', value: [
                          {type: 'function', name: 'milk', value: []}
                        ]}
                      ]}
                    ]}
                  ]}],
    '             \n\
    post()        \n\
      destroy()   \n\
                  \n\
        build()   \n\
                  \n\
                  \n\
        1         \n\
      2           \n\
      repair()    \n\
        3         \n\
        milk()':  [ {type: 'function', name: 'post', value: [
                    {type: 'block', value: [
                      {type: 'function', name: 'destroy', value: [
                        {type: 'block', value: [
                          {type: 'function', name: 'build', value: []},
                          1
                        ]}
                      ]},
                      2,
                      {type: 'function', name: 'repair', value: [
                        {type: 'block', value: [
                          3,
                          {type: 'function', name: 'milk', value: []}
                        ]}
                      ]}
                    ]}
                  ]}],
                  
    '                                              \n\
    (& input.parent[type=checkbox]).each() |input|     \n\
      checkboxes = (& input.child[type=checkbox])    \n\
      checkboxes.each() |checkbox|                \n\
        if (input.checked)                         \n\
          checkbox.check()                         \n\
      if (checkboxes.every() {|c| c.checked})        \n\
        input.check()                              \n\
    ': [{type: 'function', name: 'each', value: [
      {type: 'selector', value: '& input.parent[type=checkbox]'},
      {type: 'block', value: [
        {type: 'function', name: '=', value: [
          {type: 'variable', name: 'checkboxes'},
          {type: 'selector', value: '& input.child[type=checkbox]'}
        ]},
        {type: 'function', name: 'each', value: [
          {type: 'variable', name: 'checkboxes'},
          {type: 'block', value: [
            {type: 'function', name: 'if', value: [
              {type: 'variable', name: 'input.checked', local: true},
              {type: 'block', value: [
                {type: 'function', name: 'check', value: [
                  {type: 'variable', name: 'checkbox', local: true}
                ]}
              ]}
            ]}
          ], locals: [{type: 'variable', name: 'checkbox'}]}
        ]},
        {type: 'function', name: 'if', value: [
          {type: 'function', name: 'every', value: [
            {type: 'variable', name: 'checkboxes'},
            {type: 'block', value: [
              {type: 'variable', name: 'c.checked', local: true}
            ], locals: [{type: 'variable', name: 'c'}]}
          ]},
          {type: 'block', value: [
            {type: 'function', name: 'check', value: [
              {type: 'variable', name: 'input', local: true}
            ]}
          ]}
        ]}
      ], locals: [{type: 'variable', name: 'input'}]}
    ]}],
    '             \n\
    post()        \n\
     destroy()    \n\
     	destroy()' :{exception: "Inconsistent indentation: `\\s\\s\\s\\s\\s\\t` but `\\s\\s\\s\\s` is a baseline, and `\\s` is chosen indent level"},
    '             \n\
    post()        \n\
     destroy()    \n\
	   destroy()'   :{exception: "Inconsistent indentation: `\\t\\s\\s\\s` but `\\s\\s\\s\\s` is a baseline"},
    '             \n\
    post()        \n\
     destroy()    \n\
       destroy()':{exception: "Incorrect indentation: A line is 2 levels deeper then previous line"},
    '             \n\
    post()        \n\
     destroy()    \n\
        destroy()': {exception: "Incorrect indentation: A line is 3 levels deeper then previous line"},
        
    '                                                   \n\
    masters = (&& input.master)                         \n\
    slaves = (&& input.slave)                           \n\
    if (some(masters) {|master| master.states.checked}) \n\
      each(slaves) |slave|                              \n\
        slave.check()                                   \n\
    if (every(slaves) {|slave| slave.states.checked})   \n\
      each(masters) |master|                            \n\
        master.check()                                    ':
    [{type: 'function', name: '=', value: [
      {type: 'variable', name: 'masters'},
      {type: 'selector', value: '&& input.master'}
    ]},
    {type: 'function', name: '=', value: [
      {type: 'variable', name: 'slaves'},
      {type: 'selector', value: '&& input.slave'}
    ]},
    {type: 'function', name: 'if', value: [
      {type: 'function', name: 'some', value: [
        {type: 'variable', name: 'masters'},
        {type: 'block', value: [
          {type: 'variable', name: 'master.states.checked', local: true}
        ], locals: [{type: 'variable', name: 'master'}]}
      ]},
      {type: 'block', value: [
        {type: 'function', name: 'each', value: [
          {type: 'variable', name: 'slaves'},
          {type: 'block', value: [
            {type: 'function', name: 'check', value: [
              {type: 'variable', name: 'slave', local: true}
            ]}
          ], locals: [{type: 'variable', name: 'slave'}]}
        ]}
      ]}
    ]},
    {type: 'function', name: 'if', value: [
      {type: 'function', name: 'every', value: [
        {type: 'variable', name: 'slaves'},
        {type: 'block', value: [
          {type: 'variable', name: 'slave.states.checked', local: true}
        ], locals: [{type: 'variable', name: 'slave'}]}
      ]},
      {type: 'block', value: [
        {type: 'function', name: 'each', value: [
          {type: 'variable', name: 'masters'},
          {type: 'block', value: [
            {type: 'function', name: 'check', value: [
              {type: 'variable', name: 'master', local: true}
            ]}
          ], locals: [{type: 'variable', name: 'master'}]}
        ]}
      ]}
    ]}
    ]
                                                            
    //'($ > button).length': [{type: 'selector', value: '$ > button'}, {type: 'variable', name: 'length'}],
    //'delete item': [{type: 'function', value: [{type: 'variable', value: 'item'}]}]
    
  };
  var clean = function(object) {
    if (object.push) return Array.each(object, clean);
    if (object.stack) delete object.stack;
    if (object.precedence) delete object.precedence;
    if (object.index) delete object.index;
    if (object.value && object.value.length) Array.each(object.value, clean);
    return object;
  }
  Object.each(Examples, function(value, example) {
    describe("when given expression is " + example, function() {
      it ("should parse it correctly", function() {
        if (value === false || value.exception) {
          expect(function() {
            LSD.Script.parse(example)
          }).toThrow(value.exception)
        } else {
          var val = clean(LSD.Script.parse(example));
          expect(val).toEqual(value);
        }
      })
    })
  });
});

describe("LSD.Script.toJS", function() {
  it ("should compile native types", function() {
    expect(LSD.Script.toJS('""')).toEqual('""')
    expect(LSD.Script.toJS("''")).toEqual('""')
    expect(LSD.Script.toJS('1')).toEqual('1');
  });
  it ("should compile variables", function() {
    expect(LSD.Script.toJS('a')).toEqual('this.a')
    expect(LSD.Script.toJS('a_b')).toEqual('this.a_b')
    expect(LSD.Script.toJS('a_b', {get: 'get'})).toEqual('get("a_b")');
    expect(LSD.Script.toJS('a_b', {get: 'this.get'})).toEqual('this.get("a_b")');
  });
  it ("should compile function calls", function() {
    expect(LSD.Script.toJS('a()')).toEqual('a()')
    expect(LSD.Script.toJS('a.a()')).toEqual('a(this.a)')
    expect(LSD.Script.toJS('a.a(1)')).toEqual('a(this.a, 1)')
    expect(LSD.Script.toJS('a()', {call: 'dispatch'})).toEqual('this.dispatch("a")')
    expect(LSD.Script.toJS('a.a()', {call: 'dispatch'})).toEqual('this.dispatch("a", this.a)')
    expect(LSD.Script.toJS('a.a(1)', {call: 'dispatch'})).toEqual('this.dispatch("a", this.a, 1)')
    expect(LSD.Script.toJS('a.a(1, "jeez")', {call: '__dispatch'})).toEqual('this.__dispatch("a", this.a, 1, "jeez")')
  })
  it ("should compile operators", function() {
    expect(LSD.Script.toJS('a * b')).toEqual('this.a * this.b')
    expect(LSD.Script.toJS('a * b - c')).toEqual('this.a * this.b - this.c')
  })
  it ("should compile blocks", function() {
    expect(LSD.Script.toJS('{|a| a}')).toEqual('function(a) { return a }')
    expect(LSD.Script.toJS('{|a| b}')).toEqual('function(a) { return this.b }')
    expect(LSD.Script.toJS('{|a| b}', {get: 'get'})).toEqual('function(a) { return get("b") }')
    expect(LSD.Script.toJS('{|a| "l", a, b}')).toEqual('function(a) { "l"; a; return this.b }')
    expect(LSD.Script.toJS('{|a| 123, b, a}')).toEqual('function(a) { 123; this.b; return a }')
    expect(LSD.Script.toJS('{|a| 123, a}', {get: 'get'})).toEqual('function(a) { 123; return a }')
    expect(LSD.Script.toJS('{|a| 123, b}', {get: 'get'})).toEqual('function(a) { 123; return get("b") }')
  })
  //xit ("should compile multiline", function() {
  //  console.log(LSD.Script.toJS('                                  \n\
  //  (& input.parent[type=checkbox]).each() |input|     \n\
  //    checkboxes = (& input.child[type=checkbox])    \n\
  //    checkboxes.each() |checkbox|                \n\
  //      if (input.checked)                         \n\
  //        checkbox.check()                         \n\
  //    if (checkboxes.every() {|c| c.checked})        \n\
  //      input.check()                              \n\
  //  '))
  //})
})