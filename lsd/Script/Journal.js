describe('LSD.Journal', function() {
  describe('set', function() {
    describe('when given old value', function() {
      describe('and no new value', function() {
        it ('should unset old value', function() {
          var object = new LSD.Journal({title: 'object', body: 'text'});
          expect(object.set('title', undefined, 'object', undefined)).toBe(true)
          expect(object.title).toBeUndefined();
          expect(object.set('body', undefined, 'object', undefined, true)).toBe(false)
          expect(object.body).toBe('text');
          expect(object.set('body', undefined, 'text', undefined, true)).toBe(true)
          expect(object.body).toBeUndefined()
        })
      })
      describe('and a new value', function() {
        it ('should set new value and unset old one', function() {
          var calls = []
          var callback = function(key, value, old, meta) {
            calls.push([key, value, old])
          }
          var object = new LSD.Journal
          object.watch(callback)
          object.set('title', 'object')
          expect(calls.pop()).toEqual(['title', 'object', undefined]);
          expect(object.title).toBe('object');
          expect(object.set('title', 'bazooka', 'object')).toBe(true)
          expect(calls.pop()).toEqual(['title', 'bazooka', 'object']);
          expect(object.title).toBe('bazooka');
          expect(object.set('title', 'voodoo', 'object')).toBe(true)
          expect(calls.pop()).toEqual(['title', 'voodoo', 'bazooka']);
          expect(object.title).toBe('voodoo');
          expect(object.set('title')).toBe(true);
          expect(calls.pop()).toEqual(['title', 'bazooka', 'voodoo']);
          expect(object.title).toBe('bazooka');
          expect(object.set('title')).toBe(true);
          expect(calls.pop()).toEqual(['title', undefined, 'bazooka']);
          expect(object.title).toBeUndefined();
        })
      })
    })
  })
})