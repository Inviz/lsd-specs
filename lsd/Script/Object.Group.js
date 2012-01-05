describe("LSD.Object.Group", function() {
  describe("when values are set", function() {
    it("should create a group of values by key", function() {
      var object = new LSD.Object.Group;
      var jack = new LSD.Object, 
          josh = new LSD.Object;
      object.set('boys', jack);
      expect(object.boys).toEqual([jack])
      object.set('boys', josh);
      expect(object.boys).toEqual([jack, josh])
      object.unset('boys', jack);
      expect(object.boys).toEqual([josh])
      object.unset('boys', josh);
      expect(object.boys).toEqual([])
    })
  })
});

describe("LSD.Object.Group.Array", function() {
  describe("when values are set", function() {
    it("should create a group of values by key", function() {
      var object = new LSD.Object.Group.Array;
      var jack = new LSD.Object({name: 'Jack'}), 
          josh = new LSD.Object({name: "Josh"});
      object.set('boys', jack);
      expect(object.boys).toEqual(LSD.Array(jack))
      object.set('boys', josh);
      expect(object.boys).toEqual(LSD.Array(jack, josh))
      object.unset('boys', jack);
      expect(object.boys).toEqual(LSD.Array(josh))
      object.unset('boys', josh);
      expect(object.boys).toEqual(LSD.Array())
    })
  });
  describe("when values are mixed", function() {
    it ("should apply those to every value that was set in a group", function() {
      var object = new LSD.Object.Group.Array;
      object._construct = Function.from(null);
      var jack = new LSD.Object({name: 'Jack'}), 
          josh = new LSD.Object({name: "Josh"});
      object.mix('boys', {title: 'Overlord'})
      object.set('boys', jack);
      expect(jack.title).toEqual('Overlord');
      object.set('boys', josh);
      expect(josh.title).toEqual('Overlord');
      object.unset('boys', jack);
      expect(jack.title).toBeUndefined();
      object.unset('boys', josh);
      expect(josh.title).toBeUndefined();
    });
    
    describe("and _delegate method is defined", function() {
      it ("should call that method to delegate properties to groupped items", function() {
        var Group = function() {}
        Group.implement(new LSD.Object.Group.Array);
        Group.implement({
          _construct: function(name, value) {
            return null;
          },
          _delegate: function(object, name, value, state, memo) {
            for (var property in value)
              object.mix(property, value[property] + 123, memo, state);
            return true;
          }
        });
        var object = new Group;
        var jack = new LSD.Object({name: 'Jack'}), 
            josh = new LSD.Object({name: "Josh"});
        object.mix('boys', {title: 'Overlord'})
        object.set('boys', jack);
        expect(jack.title).toEqual('Overlord123');
        object.set('boys', josh);
        expect(josh.title).toEqual('Overlord123');
        object.unset('boys', jack);
        expect(jack.title).toBeUndefined();
        object.unset('boys', josh);
        expect(josh.title).toBeUndefined();
      })
    })
  });
  describe("when values are merged", function() {
    describe("and objects in group are observable objects", function() {
      it ("should notify each value in the group to updates in the object that was merged", function() {
        var object = new LSD.Object.Group.Array;
        object._construct = Function.from(null);
        var jack = new LSD.Object({name: 'Jack'}), 
            josh = new LSD.Object({name: "Josh"});
        var values = new LSD.Object({boys: {title: 'Overlord'}});
        object.merge(values)
        object.set('boys', jack);
        expect(jack.title).toEqual('Overlord');
        object.set('boys', josh);
        expect(josh.title).toEqual('Overlord');
        values.boys.set('title', 'Underlord');
        expect(josh.title).toEqual('Underlord');
        expect(jack.title).toEqual('Underlord');
        object.unset('boys', jack);
        expect(jack.title).toBeUndefined();
        object.unset('boys', josh);
        expect(josh.title).toBeUndefined();
      })
    })
    describe("and objects in group are stack based observable objects", function() {
      it ("should notify each value in the group to updates in the object that was reverse-merged", function() {
        var object = new LSD.Object.Group.Array;
        object._construct = Function.from(null);
        var jack = new LSD.Object.Stack({name: 'Jack'}), 
            josh = new LSD.Object.Stack({name: "Josh", title: 'Glorious'}), 
            jeff = new LSD.Object.Stack({name: "Josh", title: 'Wikid'});
        var values = new LSD.Object({boys: {title: 'Overlord'}});
        object.merge(values, true)
        object.set('boys', jack);
        expect(jack.title).toEqual('Overlord');
        object.set('boys', josh);
        expect(josh.title).toEqual('Glorious');
        object.set('boys', jeff);
        expect(jeff.title).toEqual('Wikid');
        values.boys.set('title', 'Underlord');
        expect(josh.title).toEqual('Glorious');
        expect(jack.title).toEqual('Underlord');
        expect(jeff.title).toEqual('Wikid');
        josh.unset('title', 'Glorious');
        expect(josh.title).toEqual('Underlord');
        object.unset('boys', jack);
        expect(jack.title).toBeUndefined();
        object.unset('boys', josh);
        expect(josh.title).toBeUndefined();
        expect(jeff.title).toEqual('Wikid');
      });
      
      it ("should be able to unmerge the object and remove values from all groupped objects", function() {
        var object = new LSD.Object.Group.Array;
        object._construct = Function.from(null);
        var jack = new LSD.Object.Stack({name: 'Jack'}), 
            josh = new LSD.Object.Stack({name: "Josh", title: 'Glorious'}), 
            jeff = new LSD.Object.Stack({name: "Josh", title: 'Wikid'});
        var values = new LSD.Object({boys: {title: 'Overlord'}});
        object.merge(values, true)
        object.set('boys', jack);
        expect(jack.title).toEqual('Overlord');
        object.set('boys', josh);
        expect(josh.title).toEqual('Glorious');
        object.set('boys', jeff);
        expect(jeff.title).toEqual('Wikid');
        josh.unset('title', 'Glorious');
        expect(josh.title).toEqual('Overlord');
        object.unmerge(values, true)
        expect(jack.title).toBeUndefined();
        expect(josh.title).toBeUndefined();
        expect(jeff.title).toEqual('Wikid');
      });
    })
  })
});