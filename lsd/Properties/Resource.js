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
  describe("when .name property is given", function() {
    it ("should affect path", function() {
      var resource = new LSD.Resource
      expect(resource.path).toBe('')
      resource.set('name', 'comments');
      expect(resource.path).toBe('comments')
      resource.change('name', 'publishers');
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
        resource.change('name', 'publishers');
        expect(resource._name).toEqual('publishers');
        expect(resource.path).toBe('staff/publishers')
        resource.change('prefix', 'guest');
        expect(resource._name).toEqual('publishers');
        expect(resource.path).toBe('guest/publishers')
        resource.unset('name', 'publishers');
        expect(resource.path).toBe('guest')
        resource.unset('prefix', 'guest');
        expect(resource.path).toBe('')
      })
    })
  });
  describe("when .domain is property is given", function() {
    it ("should affect url", function() {
      var resource = new LSD.Resource;
      expect(resource.url).toBe('');
      resource.set('domain', 'twitter.com');
      expect(resource.url).toBe('twitter.com');
      resource.set('name', 'events');
      expect(resource.url).toBe('twitter.com/events');
      resource.set('domain', 'login.twitter.com');
      expect(resource.url).toBe('login.twitter.com/events');
      resource.set('prefix', 'sessions');
      expect(resource.url).toBe('login.twitter.com/sessions/events');
    })
  })
  describe("#match", function() {
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
  });
  describe('#dispatch', function() {
    describe('when not given any options', function() {
      it ('should dispatch the action', function() {
        var resource = new LSD.Resource({
          customers: {}
        });
        var result = resource.dispatch('/customers');
        expect(result.origin).toEqual(resource.customers)
      })
    })
    describe('when given urls option', function() {
      describe('for a collection method', function() {
        it ('should use the url when the action is dispatched', function() {
          var resource = new LSD.Resource({
            customers: {
              urls: {
                index: '/jeebles.cgi'
              }
            }
          });
          var result = resource.dispatch('/customers');
          expect(result.url).toEqual('/jeebles.cgi')
          expect(result.method).toEqual('get');
          expect(result.action).toEqual('index');
        })
        describe('and url has a method name in it', function() {
          it ('should use the url when the action is dispatched', function() {
            var resource = new LSD.Resource({
              customers: {
                urls: {
                  index: 'POST /jeebles.cgi'
                }
              }
            });
            var result = resource.dispatch('/customers');
            expect(result.url).toEqual('/jeebles.cgi')
            expect(result.method).toEqual('post');
            expect(result.action).toEqual('index');
          })
        })
      })
      describe('for a member method', function() {
        it ('should use the url when the action is dispatched', function() {
          var resource = new LSD.Resource({
            customers: {
              urls: {
                show: '/jeebles.cgi'
              }
            }
          });
          var result = resource.dispatch('/customers/destroy_of_the_worlds');
          expect(result.url).toEqual('/jeebles.cgi')
          expect(result.method).toEqual('get');
          expect(result.action).toEqual('show');
          expect(result.id).toEqual('destroy_of_the_worlds');
        })
        describe('and url has a method name in it', function() {
          describe('and its value is not specified', function() {
            it ('should use the url when the action is dispatched', function() {
              var resource = new LSD.Resource({
                customers: {
                  urls: {
                    show: 'POST /jeebles.cgi?uid'
                  }
                }
              });
              var result = resource.dispatch('/customers/destroy_of_the_worlds');
              expect(result.url).toEqual('/jeebles.cgi')
              expect(result.method).toEqual('post');
              expect(result.action).toEqual('show');
              expect(result.id).toEqual('destroy_of_the_worlds');
              expect(result.uid).toEqual('destroy_of_the_worlds');
            })
          });
          describe('and its value is set', function() {
            describe('to a random value', function() {
              describe('and it\'s a random property', function() {
                it ('should treat that key and value pair like additional param', function() {
                  var resource = new LSD.Resource({
                    customers: {
                      urls: {
                        show: '/jeebles.cgi?uid=abcdef'
                      }
                    }
                  });
                  var result = resource.dispatch('/customers/destroy_of_the_worlds');
                  expect(result.url).toEqual('/jeebles.cgi')
                  expect(result.action).toEqual('show');
                  expect(result.id).toEqual('destroy_of_the_worlds');
                  expect(result.uid).toEqual('abcdef');
                })
              })
              describe('and the property is recognized', function() {
                describe('but resource supports a defines name', function() {
                  it ('should normalize the property', function() {
                    var resource = new LSD.Resource({
                      customers: {
                        urls: {
                          index: '/jeebles.cgi?n'
                        }
                      }
                    });
                    var result = resource.dispatch('/customers', {per_page: 20});
                    expect(result.url).toEqual('/jeebles.cgi')
                    expect(result.action).toEqual('index');
                    expect(result.n).toEqual(20);
                    expect(result.per_page).toEqual(20);
                  })
                })
              });
            });
            describe('to a primitive name (e.g. string)', function() {
              describe('and id matches the type', function() {
                it ("should include that param", function() {
                  var resource = new LSD.Resource({
                    customers: {
                      urls: {
                        show: '/jeebles.cgi?uid=string'
                      }
                    }
                  });
                  var result = resource.dispatch('/customers/destroy_of_the_worlds');
                  expect(result.url).toEqual('/jeebles.cgi')
                  expect(result.id).toEqual('destroy_of_the_worlds');
                  expect(result.uid).toEqual('destroy_of_the_worlds');
                })
              });
              describe('and id doesnt match the type', function() {
                it ("should not include param that does not match the type", function() {
                  var resource = new LSD.Resource({
                    customers: {
                      urls: {
                        show: '/jeebles.cgi?uid=number'
                      }
                    }
                  });
                  var result = resource.dispatch('/customers/destroy_of_the_worlds');
                  expect(result.url).toEqual('/jeebles.cgi')
                  expect(result.id).toEqual('destroy_of_the_worlds');
                  expect(result.uid).toBeUndefined()
                });
                describe('but there\'s another param that matches', function() {
                  it ("should include param that matches the type", function() {
                    var resource = new LSD.Resource({
                      customers: {
                        urls: {
                          show: '/jeebles.cgi?uid=number&screen_name=string'
                        }
                      }
                    });
                    var result = resource.dispatch('/customers/destroy_of_the_worlds');
                    expect(result.url).toEqual('/jeebles.cgi')
                    expect(result.id).toEqual('destroy_of_the_worlds');
                    expect(result.screen_name).toEqual('destroy_of_the_worlds');
                    expect(result.uid).toBeUndefined()
                  });
                  describe('and some params are given after', function() {
                    it ("should include param that matches the type and include additional params", function() {
                      var resource = new LSD.Resource({
                        customers: {
                          urls: {
                            show: '/jeebles.cgi?uid=number&screen_name=string&key=123'
                          }
                        }
                      });
                      var result = resource.dispatch('/customers/destroy_of_the_worlds');
                      expect(result.url).toEqual('/jeebles.cgi')
                      expect(result.id).toEqual('destroy_of_the_worlds');
                      expect(result.screen_name).toEqual('destroy_of_the_worlds');
                      expect(result.key).toEqual('123');
                      expect(result.uid).toBeUndefined()
                    });
                  })
                  describe('and some params are given before', function() {
                    it ("should include param that matches the type and include additional params", function() {
                      var resource = new LSD.Resource({
                        customers: {
                          urls: {
                            show: '/jeebles.cgi?key=123&uid=number&screen_name=string'
                          }
                        }
                      });
                      var result = resource.dispatch('/customers/destroy_of_the_worlds');
                      expect(result.url).toEqual('/jeebles.cgi')
                      expect(result.id).toEqual('destroy_of_the_worlds');
                      expect(result.screen_name).toEqual('destroy_of_the_worlds');
                      expect(result.key).toEqual('123');
                      expect(result.uid).toBeUndefined()
                    });
                  })
                  describe('and some params are given around', function() {
                    it ("should include param that matches the type and include additional params", function() {
                      var resource = new LSD.Resource({
                        customers: {
                          urls: {
                            show: '/jeebles.cgi?yek=321&uid=number&screen_name=string&key=123'
                          }
                        }
                      });
                      var result = resource.dispatch('/customers/destroyer_of_the_worlds');
                      expect(result.url).toEqual('/jeebles.cgi')
                      expect(result.id).toEqual('destroyer_of_the_worlds');
                      expect(result.screen_name).toEqual('destroyer_of_the_worlds');
                      expect(result.key).toEqual('123');
                      expect(result.yek).toEqual('321');
                      expect(result.uid).toBeUndefined()
                    });
                  })
                })
              })
            });
          })
        })
      })
    })
  })
  describe("when an object is merged in", function() {
    
  })
})