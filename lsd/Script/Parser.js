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
      ]}
                                                            
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
        expect(clean(LSD.Script.parse(example))).toEqual(value);
      })
    })
  })
})