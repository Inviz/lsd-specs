describe("LSD.Type.Matches", function() {
  describe("when given a selector and a callback", function() {
    it ("should store the callback by a parsed selector", function() {
      var matches = new LSD.Type.Matches;
      var callback = function(widget, state) {
        
      };
      var button = new LSD.Object({
        lsd: true,
        matches: new LSD.Type.Matches
      });
      matches.set('button + a', callback);
      expect(matches['button + a']).toEqual([])
      expect(matches._callbacks[' ']['button'][0][0]).toEqual(Slick.parse('button + a').expressions[0][0])
      expect(matches._callbacks[' ']['button'][0][1].expressions).toEqual(Slick.parse('button + a').expressions[0])
      expect(matches._callbacks[' ']['button'][0][1].index).toEqual(1)
      expect(matches._callbacks[' ']['button'][0][1].callback).toEqual(callback)
      expect(button.matches._callbacks).toBeFalsy()
      matches.set('button', button, null, null, true);
      expect(button.matches._callbacks['+']).toBeTruthy()
      matches.unset('button + a', callback);
      expect(matches['button + a']).toEqual([])
      expect(matches._callbacks[' ']['button']).toEqual([])
      expect(matches._callbacks['+']).toBeFalsy()
    })
  })
})