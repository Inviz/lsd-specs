LSD.RegExp = function(object, handlers) {
  this.definition = object;
  this.names = ['all'];
  this.groups = {};
  this.handlers = handlers;
  var source = '';
  var re = this, index = 0, old;
  var placeholder = function(all, token, start, input) {
    var value = object[token];
    if (typeof value == 'undefined') {
      if (typeof (value = re[token]) == 'string') return re[token];
      var bits = token.split('_');
      return (re[bits[0]]) ? re[bits.shift()].apply(re, bits) : token;
    }
    if (re.re_left_from_group.test(input.substring(0, start)) && re.re_right_from_group.test(input.substring(start + all.length))) {
      index = re.names.push(token) - 1;
      re.groups[index] = name;
    }
    var i = index;
    var replaced = value.replace(re.re_reference, placeholder);
    index = i;
    return replaced
  };
  for (var name in object) {
    old = index;
    var replaced = object[name].replace(this.re_reference, placeholder);
    if (old !== index) source += (source ? '|' : '') + replaced;
  }  
    console.log(re.groups, re.names)
  this.source = source;
};
LSD.RegExp.prototype = {
  exec: function(string, handlers) {
    if (!handlers) handlers = this.handlers;
    var regexp = this.compiled || (this.compiled = new RegExp(this.source, "g"));
    var lastIndex = regexp.lastIndex;
    regexp.lastIndex = 0;
    var old = this.stack, stack = this.stack = [];
    for (var match, group; match = regexp.exec(string);) {
      var args = [];
      for (var i = 1, j = match.length; i <= j; i++) {
        if (group) {
          if (group !== this.groups[i]) {
            stack.push(handlers[group].apply(this, args));
            group = null;
            args = [];
          }
        } else if (match[i] != null) {
          group = this.groups[i];
          for (var k = i; --k;) if (this.groups[k] == group) args.unshift(undefined);
        }
        if (group) args.push(match[i]);
      }
    }
    regexp.lastIndex = lastIndex;
    this.stack = old;
    z = this
    return stack;
  },
  inside: function(type, level) {
    var key = Array.prototype.join.call(arguments, '_');
    if (this.insiders[key]) return this.insiders[key];
    var group = this.insides[type]
    var l = '\\' + group[0], r = '\\' + group[1]
    for (var i = 1, bit, j = parseInt(level) || 5, source = '[^' + '\\' + group[0] + '' + r + ']'; i < j; i++)
      source = '(?:' + '[^' + '\\' + group[0] + '' + r + ']' + '|' + l + source +  "*" + r + ')'
    return (this.insiders[key] = source);
  },
  insides: {
    curlies: ['{', '}'],
    squares: ['[', ']'],
    parens:  ['(', ')']
  },
  insiders: {},
  handlers: {},
  re_reference: /\<([a-zA-Z][a-zA-Z0-9_]*)\>/g,
  re_left_from_group: /(?:(?:\\\\|[^\\]|^)(?:\(|\|))$/,
  re_right_from_group: /(?:(?:^\\\\|^[^\\]|^)(?:\)|\|))/,
  unicode: "(?:[\\w\\u00a1-\\uFFFF-]|\\\\[^\\s0-9a-f])"
}
describe('LSD.RegExp', function() {
  var big = {
    'fn_tail': '\\.',
    'fn_arguments': '<inside_parens>*',
    'fn_name': '<unicode>',
    'fn': '(<fn_tail>)?(<fn_name>)\\((<fn_arguments>)\\)',

    'block_arguments': '\|([^|]*)\|',
    'block_body': '<inside_curlies>*',
    'block': '\\{(<block_arguments>)?(<block_body>)\\}',

    'string_double': '"((?:[^"]|\\")*)"',
    'string_single': "'((?:[^']|\\')*)'",
    'string': '<double_string>|<single_string>',

    'separator': '(\\s+|,|;)',

    'index': '\\[\\s*(<inside_squares>)\\s*\\]',

    'length_number': '[-+]?(?:\\d+\\.\\d*|\\d*\\.\\d+|\\d)',
    'length_unit': 'em|px|pt|%|fr|deg|(?=$|[^a-zA-Z0-9.])',
    'length': '(<length_number>)(<length_unit>)',

    'token_tail': '\\.',
    'token_name': '<unicode>',
    'token': '(<token_tail>)?(<token_name>)',

    'operator': '([-+]|[\\/%^~=><*\\^!|&$]+)'
  };
  describe('#constructor', function() {
    
    it('should find and replace subgroups', function() {
      var re = new LSD.RegExp({
        'length_number': '\\d',
        'length_unit': 'em|px|pt',
        'length': '(<length_number>)(<length_unit>)'
      });
      expect(re.source).toEqual("(\\d)(em|px|pt)")
      expect(re.names).toEqual(['all', 'length_number', 'length_unit'])
      expect(re.groups).toEqual({1: 'length', 2: 'length'})
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
      expect(re.names).toEqual(['all', 'block_arguments', 'block_body'])
      expect(re.groups).toEqual({1: 'block', 2: 'block'})
      expect(re.source).toEqual('\\{(?:\\|\\s*([^\\|]*)\\s*\\|\\s*)?((?:[^\\{\\}]|\\{(?:[^\\{\\}]|\\{(?:[^\\{\\}]|\\{(?:[^\\{\\}]|\\{[^\\{\\}]*\\})*\\})*\\})*\\})*)\\}')
    })
    it('should support builtin groups', function() {
      var re = new LSD.RegExp({
        'length_number': '\\d',
        'length_unit': '<unicode>',
        'length': '(<length_number>)(<length_unit>)'
      });
      expect(re.source).toEqual("(\\d)((?:[\\w\\u00a1-\\uFFFF-]|\\\\[^\\s0-9a-f]))")
    })
    it ('should support alternative groups', function() {
      var re = new LSD.RegExp({
        string_double: '"((?:[^"]|\\")*)"',
        string_single: "'((?:[^']|\\')*)'",
        string: "(?:<string_double>|<string_single>)"
      })
      expect(re.source).toEqual("(?:\"((?:[^\"]|\\\")*)\"|'((?:[^']|\\')*)')")
      expect(re.names).toEqual(['all', 'string_double', 'string_single'])
    });
    it ('should support alternative groups with primitive on the right', function() {
      var re = new LSD.RegExp({
        string_single: "(abc)",
        string: "(?:<string_single>|123)"
      })
      expect(re.source).toEqual("(?:'((?:[^']|\\')*)'|123)")
    });
    it ('should NOT support alternative escaped groups with primitive on the right', function() {
      var re = new LSD.RegExp({
        string_single: "'((?:[^']|\\')*)'",
        string: "(?:<string_single>\\|123)"
      })
      expect(re.source).toEqual("")
    });
    it ('should support alternative groups with primitive on the left', function() {
      var re = new LSD.RegExp({
        string_single: "'((?:[^']|\\')*)'",
        string: "(?:123|<string_single>)"
      })
      expect(re.source).toEqual("(?:123|'((?:[^']|\\')*)')")
    });
    it ('should NOT support alternative escaped groups with primitive on the left', function() {
      var re = new LSD.RegExp({
        string_single: "'((?:[^']|\\')*)'",
        string: "(?:123\\|<string_single>)"
      })
      expect(re.source).toEqual("")
    });
    it('should concat multiple groups', function() {
      var re = new LSD.RegExp({
        'length_number': '\\d',
        'length_unit': 'em|px|pt',
        'length': '(<length_number>)(<length_unit>)'
      });
      expect(re.source).toEqual("(\\d)(em|px|pt)")
    })
    it ('should build a big regexp', function() {
      var re = new LSD.RegExp(big)
      expect(re.source).toEqual('(\\.)?((?:[\\w\\u00a1-\\uFFFF-]|\\\\[^\\s0-9a-f]))\\(((?:[^\\(\\)]|\\((?:[^\\(\\)]|\\((?:[^\\(\\)]|\\((?:[^\\(\\)]|\\([^\\(\\)]*\\))*\\))*\\))*\\)))\\)|\\{((?:[^\\{\\}]|\\{(?:[^\\{\\}]|\\{(?:[^\\{\\}]|\\{(?:[^\\{\\}]|\\{[^\\{\\}]*\\})*\\})*\\})*\\}))?((?:[^\\{\\}]|\\{(?:[^\\{\\}]|\\{(?:[^\\{\\}]|\\{(?:[^\\{\\}]|\\{[^\\{\\}]*\\})*\\})*\\})*\\}))\\}|([-+]?(?:\\d+\\.\\d*|\\d*\\.\\d+|\\d))(em|px|pt|%|fr|deg|(?=$|[^a-zA-Z0-9.]))|(\\.)?((?:[\\w\\u00a1-\\uFFFF-]|\\\\[^\\s0-9a-f]))')
      expect(re.names).toEqual([ 'all', 'fn_tail', 'fn_name', 'fn_arguments', 'block_arguments', 'block_body', 'length_number', 'length_unit', 'token_tail', 'token_name'])
      expect(re.groups).toEqual({ 1 : 'fn', 2 : 'fn', 3 : 'fn', 4 : 'block', 5 : 'block', 6 : 'length', 7 : 'length', 8 : 'token', 9 : 'token' })
      console.error(re.compiled.exec('1em'))
    })
  })
  describe('#exec', function() {
    it ('should call specific handlers', function() {
      var re = new LSD.RegExp(big, {
        length: function(number, unit) {
          return [number, unit]
        },
        fn: function(tail, name, args) {
          return [name, re.exec(args)]
        },
        operator: function(name) {
          return name
        }
      });
      expect(re.exec('a(1%, 3em)')).toEqual([['a', [[1, '%'], [3, 'em']]]]);
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