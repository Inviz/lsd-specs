describe('LSD.Script.Parser', function() {
  var Examples = { 
    '1 + 1': {type: 'function', name: '+', value: [1, 1]},
    'a = 1': {type: 'function', name: '=', value: [{type: 'variable', name: 'a'}, 1]},
    'a = ($$ buttons)': {type: 'function', name: '=', value: [{type: 'variable', name: 'a'}, {type: 'selector', value: '$$ buttons'}]},
    'a ||= 1': {type: 'function', name: '||=', value: [{type: 'variable', name: 'a'}, 1]},
    'ding("a", 2)': {type: 'function', name: 'ding', value: ["a", 2]},
    'item.ding': {type: 'variable', name: 'item.ding'},
    'item.ding()': {type: 'function', name: 'ding', value: [{type: 'variable', name: 'item'}]},
    'item.ding().ding()': {type: 'function', name: 'ding', value: [{type: 'function', name: 'ding', value: [{type: 'variable', name: 'item'}]}]},
    'item.delete(2)': {type: 'function', name: 'delete', value: [{type: 'variable', name: 'item'}, 2]},
    '$ buttons': {type: 'selector', value: '$ buttons'},
    'count(#zipper)': {type: 'function', name: 'count', value: [{type: 'selector', value: '#zipper'}]},
    '($ .buttons).dispose()': {type: 'function', name: 'dispose', value: [{type: 'selector', value: '$ .buttons'}]},
    'filter (& button) {|button| button.match(".gross")}': 
      {type: 'function', name: 'filter', value: [
        {type: 'selector', value: '& button'}, 
        {type: 'block', value: [
          {type: 'function', name: 'match', value: [
            {type: 'variable', name: 'button'},
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
              {type: 'variable', name: 'button'},
              ".gross"
            ]}
          ], locals: [{type: 'variable', name: 'button'}]}
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
            {type: 'variable', name: 'b'},
            {type: 'block', value: [
              {type: 'variable', name: 'r.body'}
            ], locals: [{type: 'variable', name: 'r'}]}
          ]}
        ], locals: [{type: 'variable', name: 'b'}]}
      ]},
    '($ button).filter() {|b| b.publish() {|r| r.body} }': 
      {type: 'function', name: 'filter', value: [
        {type: 'selector', value: '$ button'},
        {type: 'block', value: [
          {type: 'function', name: 'publish', value: [
            {type: 'variable', name: 'b'},
            {type: 'block', value: [
              {type: 'variable', name: 'r.body'}
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
                                                   \n\
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
              {type: 'variable', name: 'input.checked'},
              {type: 'block', value: [
                {type: 'function', name: 'check', value: [
                  {type: 'variable', name: 'checkbox'}
                ]}
              ]}
            ]}
          ], locals: [{type: 'variable', name: 'checkbox'}]}
        ]},
        {type: 'function', name: 'if', value: [
          {type: 'function', name: 'every', value: [
            {type: 'variable', name: 'checkboxes'},
            {type: 'block', value: [
              {type: 'variable', name: 'c.checked'}
            ], locals: [{type: 'variable', name: 'c'}]}
          ]},
          {type: 'block', value: [
            {type: 'function', name: 'check', value: [
              {type: 'variable', name: 'input'}
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
        destroy()': {exception: "Incorrect indentation: A line is 3 levels deeper then previous line"}
                                                            
    //'($ > button).length': [{type: 'selector', value: '$ > button'}, {type: 'variable', name: 'length'}],
    //'delete item': [{type: 'function', value: [{type: 'variable', value: 'item'}]}]
    
  };
  var clean = function(object) {
    if (object.push) return Array.each(object, clean);
    if (object.scope) delete object.scope;
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
})