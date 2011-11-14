/*
---
name: Matchers
description: Redefined matchers for jasmine based on testling matchers
provides: Matchers
requires: Jasmine
...
*/

jasmine.testlings = [];
jasmine.getTestling = function() {
  return jasmine.testlings[jasmine.testlings.length - 1]
};

!function(jasmine) {
  jasmine.Matchers.prototype.toEqual = function(expected) {
    return jasmine.getTestling().deepEqual(this.actual, expected)
  }
  
  jasmine.Matchers.prototype.toNotEqual = function(expected) {
    return jasmine.getTestling().notDeepEqual(this.actual, expected)
  }
}(jasmine);

jasmine.Block.prototype.execute = function(onComplete) {
  var that = this;
  test(this.spec.description, function(t) {
    jasmine.testlings.push(t)
    that.func.call(that.spec);
    jasmine.testlings.pop();
    onComplete();
    t.end()
  })
};

