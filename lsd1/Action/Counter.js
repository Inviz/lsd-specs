describe("LSD.Action.Counter", function() {
  
  var tests = {
    '1 comment': '2 comments',
    'just 1 comment': '2 comments',
    'just 1 comment yet': '2 comments',
    'only 1 person': '2 people',
    'only 1 person yet': '2 people',
    '231 people in this room': '232 people in this room',
    'only 1 person': '2 people',
    'only one challenge notification': '2 challenge notifications',
    'only one challenge at notification': '2 challenges at notification',
    'only one challenge. notification': '2 challenges. notification',
    'just one challenge on 21:00': '2 challenges on 21:00',
    'only <i>1</i> person': '<i>2</i> people',
    '<strong>only <i>1</i> person</strong>': '<strong><i>2</i> people</strong>',
    '<ul def="a{#}" cdef="3">1</ul> <strong>person</strong>': '<ul def="a{#}" cdef="3">2</ul> <strong>people</strong>'
  };
  
  Object.each(tests, function(expectation, input) {
    it("should increment: " + input, function() {
      var element = new Element('div', {html: input});
      var widget = new LSD.Widget;
      widget.execute({action: 'counter', target: element})
      expect(element.get('html')).toEqual(expectation);
    });
    it("should decrement: " + expectation, function() {
      var element = new Element('div', {html: expectation});
      var widget = new LSD.Widget;
      widget.execute({action: 'decrement', target: element})
      expect(element.get('html')).toEqual(input.replace(/only\s|just\s|\syet/g, '').replace('one', 1));
    });

  });
})