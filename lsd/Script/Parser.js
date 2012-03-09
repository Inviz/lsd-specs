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