describe("LSD.Type.Resource", function() {
  describe("called with new", function() {
    describe("when given a name", function() {
      
    });
    describe("when given a name and an object", function() {
      
    });
    describe("when given an object", function() {
      
    });
  });
  describe("when used as constructor", function() {
    it ("should provide fair constructor", function() {
      var resource = new LSD.Resource;
      var model = new resource;
      expect(model instanceof resource).toEqual(true)
      expect(model.constructor).toBe(resource)
      expect(model.save).toBeTruthy()
    })
  })
  describe("when .name is changed", function() {
    it ("should affect path", function() {
      var resource = new LSD.Resource
      expect(resource.path).toBe('')
      resource.set('name', 'comments');
      expect(resource.path).toBe('comments')
      resource.reset('name', 'publishers');
      expect(resource.path).toBe('publishers')
      resource.unset('name', 'publishers');
      expect(resource.path).toBe('')
    })
    describe("and .prefix is given", function() {
      it ("should build path from name and prefix", function() {
        var resource = new LSD.Resource
        expect(resource.path).toBe('')
        expect(resource.prefix).toBe('')
        resource.set('prefix', 'staff');
        expect(resource.path).toBe('staff')
        resource.set('name', 'comments');
        expect(resource.path).toBe('staff/comments')
        resource.reset('name', 'publishers');
        expect(resource._name).toEqual('publishers');
        expect(resource.path).toBe('staff/publishers')
        resource.reset('prefix', 'guest');
        expect(resource._name).toEqual('publishers');
        expect(resource.path).toBe('guest/publishers')
        resource.unset('name', 'publishers');
        expect(resource.path).toBe('guest')
        resource.unset('prefix', 'guest');
        expect(resource.path).toBe('')
      })
    })
  });
  describe("#dispatch", function() {
    describe('when called with a simple url', function() {
      describe('and given no params', function() {
        it ("should dispatch request to a top level resource", function() {
          var resource = new LSD.Resource({
            customers: {}
          });
          var request = resource.match('/customers');
          expect(request.resource._name).toEqual('customers');
          expect(request.action).toEqual('index');
          expect(request.method).toEqual('get');
        })
      })
    })
    describe('when called with a url with model identifier', function() {
      it ("should dispatch request to a top level resource and find id", function() {
        var resource = new LSD.Resource({
          customers: {}
        });
        var request = resource.match('/customers/jack');
        expect(request.resource._name).toEqual('customers');
        expect(request.action).toEqual('show');
        expect(request.id).toEqual('jack');
        expect(request.method).toEqual('get');
      })
    });
    describe('when called with namespace prefix, resource name and identifier', function() {
      it ("should dispatch request to a controller in a namespace resource and find id", function() {
        var resource = new LSD.Resource({
          staff: {
            customers: {}
          }
        });
        var request = resource.match('/staff/customers/jack');
        expect(request.resource._name).toEqual('customers');
        expect(request.action).toEqual('show');
        expect(request.id).toEqual('jack');
        expect(request.method).toEqual('get');
      })
    });
    describe('when called with nested resource url', function() {
      it ("should dispatch request to a nested resource", function() {
        var resource = new LSD.Resource({
          customers: {
            placements: {}
          }
        });
        var request = resource.match('/customers/jack/placements');
        expect(request.resource._name).toEqual('placements');
        expect(request.action).toEqual('index');
        expect(request.customer_id).toEqual('jack');
        expect(request.id).toBeUndefined();
        expect(request.method).toEqual('get');
      })
    })
    describe('when called with nested resource url and identifier', function() {
      it ("should dispatch request to a nested resource", function() {
        var resource = new LSD.Resource({
          customers: {
            placements: {}
          }
        });
        var request = resource.match('/customers/jack/placements/25');
        expect(request.resource._name).toEqual('placements');
        expect(request.action).toEqual('show');
        expect(request.customer_id).toEqual('jack');
        expect(request.id).toEqual(25);
        expect(request.method).toEqual('get');
      })
    })
    describe('when called with nested resource url and identifier', function() {
      it ("should dispatch request to a nested resource", function() {
        var resource = new LSD.Resource({
          customers: {
            placements: {}
          }
        });
        var request = resource.match('/customers/jack/placements/25/edit');
        expect(request.resource._name).toEqual('placements');
        expect(request.action).toEqual('edit');
        expect(request.customer_id).toEqual('jack');
        expect(request.id).toEqual(25);
        expect(request.method).toEqual('get');
      })
    })
    describe("when namespace is used", function() {
      describe('when called with nested resource url', function() {
        it ("should dispatch request to a nested resource", function() {
          var resource = new LSD.Resource({
            staff: {
              customers: {
                placements: {}
              }
            }
          });
          var request = resource.match('/staff/customers/jack/placements');
          expect(request.resource._name).toEqual('placements');
          expect(request.action).toEqual('index');
          expect(request.customer_id).toEqual('jack');
          expect(request.id).toBeUndefined();
          expect(request.method).toEqual('get');
        })
      })
      describe('and called with nested resource url and identifier', function() {
        it ("should dispatch request to a nested resource", function() {
          var resource = new LSD.Resource({
            staff: {
              customers: {
                placements: {}
              }
            }
          });
          var request = resource.match('/staff/staff/customers/jack/placements/25');
          expect(request.resource._name).toEqual('placements');
          expect(request.action).toEqual('show');
          expect(request.customer_id).toEqual('jack');
          expect(request.id).toEqual(25);
          expect(request.method).toEqual('get');
        })
      })
      describe('and called with nested resource url and identifier', function() {
        it ("should dispatch request to a nested resource", function() {
          var resource = new LSD.Resource({
            staff: {
              customers: {
                placements: {}
              }
            }
          });
          var request = resource.match('/staff/customers/jack/placements/25/edit');
          expect(request.resource._name, 'customers');
          expect(request.action).toEqual('edit');
          expect(request.customer_id).toEqual('jack');
          expect(request.id).toEqual(25);
          expect(request.method).toEqual('get');
        })
      })
    })
  })
  describe('when given urls option', function() {
    
  })
  describe("when an object is merged in", function() {
    
  })
})