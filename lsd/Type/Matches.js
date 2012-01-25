describe("LSD.Type.Matches", function() {
  describe("when given a selector and a callback", function() {
    it ("should store the callback by a parsed selector", function() {
      var matches = new LSD.Type.Matches;
      var index = 0;
      var callback = function(widget, state) {
        index += state ? 1 : -1;
      };
      var button = new LSD.Object({
        lsd: true,
        tagName: 'button',
        matches: new LSD.Type.Matches
      });
      var link = new LSD.Element({
        lsd: true,
        tagName: 'a',
        matches: new LSD.Type.Matches
      })
      matches.set('button + a', callback);
      expect(matches['button + a']).toEqual([])
      expect(matches._callbacks[' ']['button'][0][0]).toEqual(Slick.parse('button + a').expressions[0][0])
      expect(matches._callbacks[' ']['button'][0][1].expressions).toEqual(Slick.parse('button + a').expressions[0])
      expect(matches._callbacks[' ']['button'][0][1].index).toEqual(1)
      expect(matches._callbacks[' ']['button'][0][1].callback).toEqual(callback);
      expect(matches._callbacks[' ']['button'].length).toEqual(1)
      expect(button.matches._callbacks).toBeFalsy();
      matches.set('button', button, null, null, true);
      expect(button.matches._callbacks['+']['a'].length).toEqual(1)
      expect(button.matches._callbacks['+']['a'][0][0]).toEqual(Slick.parse('button + a').expressions[0][1])
      expect(index).toEqual(0)
      button.matches.set('+ a', link, null, null, true);
      expect(index).toEqual(1);
      matches.unset('button + a', callback);
      expect(matches._callbacks[' ']['button'].length).toEqual(0)
      expect(button.matches._callbacks['+']['a'].length).toEqual(0)
      expect(matches['button + a']).toEqual([]);
      expect(matches._callbacks[' ']['button']).toEqual([]);
      expect(matches._callbacks['+']).toBeFalsy();
      expect(index).toEqual(0);
      matches.set('button + a', callback);
      expect(matches._callbacks[' ']['button'].length).toEqual(1)
      expect(button.matches._callbacks['+']['a'].length).toEqual(1)
      expect(index).toEqual(1);
      matches.unset('button', button, null, null, true);
      expect(index).toEqual(0);
      expect(button.matches._callbacks['+']['a'].length).toEqual(0);
      expect(matches._callbacks[' ']['button'].length).toEqual(1);
      matches.set('button', button, null, null, true);
      expect(index).toEqual(1);
      expect(button.matches._callbacks['+']['a'].length).toEqual(1);
      expect(matches._callbacks[' ']['button'].length).toEqual(1);
      button.matches.unset('+ a', link, null, null, true);
      expect(index).toEqual(0);
      expect(button.matches._callbacks['+']['a'].length).toEqual(1);
      expect(matches._callbacks[' ']['button'].length).toEqual(1);
    });
  })
})