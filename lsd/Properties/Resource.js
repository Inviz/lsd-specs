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
    it ("should act as a true constructor", function() {
      var resource = new LSD.Resource;
      var model = new resource;
      expect(model instanceof resource).toEqual(true)
      expect(model.constructor).toBe(resource)
      expect(model.save).toBeTruthy()
    })
    
    it ('should create association objects', function() {
      var resource = new LSD.Resource({
        plural: 'Person',
        comments: {}
      });
      expect(resource.comments.constructor).toBe(LSD.Resource);
      var model = new resource;
      expect(model.comments.constructor).toBe(LSD.Association)
      var a = model.comments.build();
      expect(a.constructor).toBe(resource.comments)
      expect(a instanceof resource.comments).toBe(true)
      expect(a.person).toBe(model)
      expect(a.person_id).toBeUndefined()
      model.set('id', 'something')
      expect(a.person_id).toBe('something');
      var b = model.comments.build();
      expect(b.constructor).toBe(resource.comments)
      expect(b instanceof resource.comments).toBe(true)
      expect(a.person).toBe(model);
      expect(a.person_id).toBe('something');
      model.set('id', 'other')
      expect(a.person_id).toBe('other');
      expect(b.person_id).toBe('other');
      model.unset('id', 'other')
      expect(a.person_id).toBeUndefined()
      expect(b.person_id).toBeUndefined()
      //model.comments.push({  })
    })
  })
  describe('as 1:M association', function() {
    describe('when added or removed from array', function() {
      it ('should be able to erase foreign keys', function() {
        var resource = new LSD.Resource({
          plural: 'Person',
          comments: {}
        })
        var person = new resource({plural: 'Bob'});
        var comment = person.comments.build({text: 'Love it'});
        person.comments.push(comment);
        expect(comment.person).toBe(person);
        expect(comment.person_id).toBeUndefined();
        person.set('id', 'bob');
        expect(comment.person_id).toBe('bob')
        person.comments.push({text: 'Blargh'});
        var last = person.comments[person.comments._length - 1];
        expect(last instanceof resource.comments).toBe(true)
        expect(last.text).toBe('Blargh');
        expect(last.person_id).toBe('bob');
        expect(last.person).toBe(person);
        resource.set('exportKey', 'dude_id');
        expect(last.person_id).toBeUndefined()
        expect(last.dude_id).toBe('bob');
        person.set('id', 'jack')
        expect(last.dude_id).toBe('jack');
        resource.set('plural', 'dudes');
        expect(last.person).toBeUndefined()
        expect(last.dude).toBe(person);
        person.comments.pop();
        expect(last.person_id).toBeUndefined();
        expect(last.person).toBeUndefined();
        expect(last.dude_id).toBeUndefined();
        expect(last.dude).toBeUndefined();
      })
    })
  })
  describe('as M:M association', function() {
    describe('when added or removed from array', function() {
      it ('should also add model to foreign array', function() {
        var resources = new LSD.Resource({
          people: {
            groups: {
              collection: 'people'
            }
          },
          groups: {
            people: {
              collection: 'groups'
            }
          }
          /*
            Creates groups_people resource in a root resource
          */
        });
        var man = new resources.people;
        var woman = new resources.people;
        var weightlifters = new resources.groups;
        var photographers = new resources.groups;
        expect(resources.people.groups.through).toBe('groups_people');
        expect(resources.groups.people.through).toBe('groups_people');
        man.groups.push(weightlifters);
        expect(resources.groups.people.intermediate._length).toBe(1)
        man.set('id', 'joshua');
        var linker1 = resources.groups.people.intermediate[0];
        expect(linker1.person_id).toBe('joshua')
        expect(linker1.group).toBe(weightlifters);
        expect(linker1.person).toBe(man)
        expect(linker1.group_id).toBeUndefined()
        expect(weightlifters.people.slice()).toEqual([man])
        expect(man.group).toBeUndefined();
        expect(man.group_id).toBeUndefined();
        woman.set('id', 'julia');
        weightlifters.people.push(woman);
        expect(resources.groups.people.intermediate._length).toBe(2)
        var linker2 = resources.groups.people.intermediate[1];
        expect(linker2.group).toBe(weightlifters);
        expect(linker2.person).toBe(woman)
        expect(linker2.group_id).toBeUndefined()
        expect(linker2.person_id).toBe('julia');
        expect(weightlifters.people.slice()).toEqual([man, woman])
        expect(woman.groups.slice()).toEqual([weightlifters])
        expect(woman.group).toBeUndefined();
        expect(woman.group_id).toBeUndefined();
        weightlifters.set('id', 'wl');
        expect(linker2.group_id).toBe('wl');
        expect(linker1.group_id).toBe('wl');
        photographers.people.push(man);
        var linker3 = resources.groups.people.intermediate[2];
        expect(man.groups.slice()).toEqual([weightlifters, photographers])
        weightlifters.people.pop();
        expect(woman.groups.slice()).toEqual([])
        expect(linker2.person_id).toBeUndefined()
        expect(linker2.group).toBeUndefined()
        expect(linker2.person).toBeUndefined()
        expect(linker2.group_id).toBeUndefined()
        expect(resources.groups.people.intermediate._length).toBe(2);
        man.groups.shift()
        expect(man.groups.slice()).toEqual([photographers])
        expect(linker1.person_id).toBeUndefined()
        expect(linker1.group).toBeUndefined()
        expect(linker1.person).toBeUndefined()
        expect(linker1.group_id).toBeUndefined()
        expect(resources.groups.people.intermediate._length).toBe(1)
        expect(linker3.person_id).toBe('joshua');
        expect(linker3.person).toBe(man);
        expect(linker3.group_id).toBeUndefined();
        expect(linker3.group).toBe(photographers);
        photographers.set('id', 666)
        expect(linker3.group_id).toBe(666);
        expect(linker3.group).toBe(photographers);
        man.set('id', 'jim')
        expect(linker3.person_id).toBe('jim');
        expect(linker3.person).toBe(man);
        expect(photographers.people.slice()).toEqual([man])
        man.groups.pop()
        expect(linker3.person_id).toBeUndefined();
        expect(linker3.person).toBeUndefined();
        expect(linker3.group_id).toBeUndefined();
        expect(linker3.group).toBeUndefined();
        expect(photographers.people.slice()).toEqual([])
        expect(resources.groups.people.intermediate._length).toBe(0)
      })
    })
  })
  describe("when .plural property is given", function() {
    it ("should affect directory", function() {
      var resource = new LSD.Resource
      expect(resource.directory).toBeFalsy()
      resource.set('plural', 'comments');
      expect(resource.directory).toBe('comments')
      resource.change('plural', 'publishers');
      expect(resource.directory).toBe('publishers')
      resource.unset('plural', 'publishers');
      expect(resource.directory).toBeFalsy()
    })
    describe("and .prefix is given", function() {
      it ("should build directory from name and prefix", function() {
        var resource = new LSD.Resource
        expect(resource.directory).toBeFalsy()
        expect(resource.prefix).toBeFalsy()
        resource.change('prefix', 'staff');
        expect(resource.directory).toBe('staff')
        resource.change('plural', 'comments');
        expect(resource.directory).toBe('staff/comments')
        resource.change('plural', 'publishers');
        expect(resource.plural).toEqual('publishers');
        expect(resource.directory).toBe('staff/publishers')
        resource.change('prefix', 'guest');
        expect(resource.plural).toEqual('publishers');
        expect(resource.directory).toBe('guest/publishers')
        resource.unset('plural', 'publishers');
        expect(resource.directory).toBe('guest')
        resource.unset('prefix', 'guest');
        expect(resource.directory).toBeFalsy()
      })
    })
  });
  describe("when .host is property is given", function() {
    it ("should affect url", function() {
      var resource = new LSD.Resource;
      expect(resource.url).toBeFalsy()
      resource.set('host', 'twitter.com');
      expect(resource.url).toBe('twitter.com');
      resource.set('plural', 'events');
      expect(resource.url).toBe('twitter.com/events');
      resource.set('host', 'login.twitter.com');
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
          expect(request.resource.plural).toEqual('customers');
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
        expect(request.resource.plural).toEqual('customers');
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
        expect(request.resource.plural).toEqual('customers');
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
        expect(request.resource.plural).toEqual('placements');
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
        expect(request.resource.plural).toEqual('placements');
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
        expect(request.resource.plural).toEqual('placements');
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
          expect(request.resource.plural).toEqual('placements');
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
          expect(request.resource.plural).toEqual('placements');
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
          expect(request.resource.plural, 'customers');
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
        expect(result.resource).toEqual(resource.customers)
      })
    })
    describe('when given urls option', function() {
      it ('should not instantiate a resource named urls', function() {
        var resource = new LSD.Resource({
          urls: {
            index: '/jeebles.cgi'
          }
        });
        expect(resource.urls.constructor).toBe(Object)
      })
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
          var result = resource.dispatch('/customers/destroyer_of_the_worlds');
          expect(result.url).toEqual('/jeebles.cgi')
          expect(result.method).toEqual('get');
          expect(result.action).toEqual('show');
          expect(result.id).toEqual('destroyer_of_the_worlds');
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
              var result = resource.dispatch('/customers/destroyer_of_the_worlds');
              expect(result.url).toEqual('/jeebles.cgi')
              expect(result.method).toEqual('post');
              expect(result.action).toEqual('show');
              expect(result.id).toEqual('destroyer_of_the_worlds');
              expect(result.uid).toEqual('destroyer_of_the_worlds');
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
                  var result = resource.dispatch('/customers/destroyer_of_the_worlds');
                  expect(result.url).toEqual('/jeebles.cgi')
                  expect(result.action).toEqual('show');
                  expect(result.id).toEqual('destroyer_of_the_worlds');
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
                  var result = resource.dispatch('/customers/destroyer_of_the_worlds');
                  expect(result.url).toEqual('/jeebles.cgi')
                  expect(result.id).toEqual('destroyer_of_the_worlds');
                  expect(result.uid).toEqual('destroyer_of_the_worlds');
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
                  var result = resource.dispatch('/customers/destroyer_of_the_worlds');
                  expect(result.url).toEqual('/jeebles.cgi')
                  expect(result.id).toEqual('destroyer_of_the_worlds');
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
                    var result = resource.dispatch('/customers/destroyer_of_the_worlds');
                    expect(result.url).toEqual('/jeebles.cgi')
                    expect(result.id).toEqual('destroyer_of_the_worlds');
                    expect(result.screen_name).toEqual('destroyer_of_the_worlds');
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
                      var result = resource.dispatch('/customers/destroyer_of_the_worlds');
                      expect(result.url).toEqual('/jeebles.cgi')
                      expect(result.id).toEqual('destroyer_of_the_worlds');
                      expect(result.screen_name).toEqual('destroyer_of_the_worlds');
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
                      var result = resource.dispatch('/customers/destroyer_of_the_worlds');
                      expect(result.url).toEqual('/jeebles.cgi')
                      expect(result.id).toEqual('destroyer_of_the_worlds');
                      expect(result.screen_name).toEqual('destroyer_of_the_worlds');
                      expect(result.key).toEqual('123');
                      expect(result.uid).toBeUndefined()
                    });
                  })
                  describe('and some params are given', function() {
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
  describe('save', function() {
    describe('without dirty attributes', function() {
      describe('and there is no id yet', function() {
        it ('should save attributes and assign an id', function() {
          var resource = new LSD.Resource;
          var model = new resource;
          expect(model.id).toBeUndefined();
          model.save();
          expect(model.id).toBeDefined();
        })
      })
      describe('and there is id already', function() {
        it ('should not do anything', function() {
          var resource = new LSD.Resource;
          var model = new resource({id: 1})
          expect(model.id).toBe(1);
          expect(model._id).toBe(1);
          model.save();
          expect(model.id).toBe(1);
        })
      })
    });
    describe('with dirty attributes', function() {
      it ('should save attributes and assign an id', function() {
        var resource = new LSD.Resource;
        var model = new resource;
        expect(model.id).toBeUndefined();
        model.save();
        expect(model.id).toBeDefined();
      })
    })
    describe('with dirty 1:1 associations', function() {
      it ('should save associated models', function() {
        var resource = new LSD.Resource({
          plural: 'posts',
          author: {}
        });
        var model = new resource({
          author: {
            name: 'Babylon Bwoy'
          }
        });
        expect(model.author.post).toBe(model)
        var author = model.author;
        model.save()
        expect(model.id).toBeDefined();
        expect(author.name).toBeDefined();
        expect(author.id).toBeDefined();
        expect(author.post).toBe(model);
        expect(author.post_id).toBe(model.id);
        model.set('id', 'broccoli')
        expect(author.post_id).toBe('broccoli');
        model.unset('author');
        expect(author.post_id).toBeUndefined();
        expect(author.post).toBeUndefined();
        model.set('id', 'bonanza');
        expect(author.post_id).toBeUndefined();
        expect(author.post).toBeUndefined();
        model.set('author', author);
        expect(author.post_id).toBe('bonanza');
        expect(author.post).toBe(model);
        var other = new LSD.Object;
        model.set('author', other)
        expect(author.post_id).toBeUndefined();
        expect(author.post).toBeUndefined();
        expect(other.post_id).toBe('bonanza');
        expect(other.post).toBe(model);
        model.save()
      })
    })
    describe('with dirty 1:m associations', function() {
      it ('should save associated models', function() {
        var resource = new LSD.Resource({
          plural: 'posts',
          comments: {}
        });
        var post = new resource;
        post.comments.push({body: 'I like'});
        post.save();
        expect(post.id).toBeDefined();
        expect(post.comments[0].id).toBeDefined();
        expect(post.comments[0].post_id).toBe(post.id)
        post.comments.push({body: 'I dont'});
        expect(resource.comments._length).toBe(1);
        expect(post.comments[1].id).toBeUndefined();
        expect(post.comments[1].post_id).toBe(post.id)
        post.save();
        expect(post.comments[1].id).toBeDefined();
        expect(resource._length).toBe(1);
        expect(resource.comments._length).toBe(2);
      })
    })
    describe('with dirty m:m association', function() {
      it ('should save all models', function() {
        var resources = new LSD.Resource({
          people: {
            groups: {
              collection: 'people'
            }
          },
          groups: {
            people: {
              collection: 'groups'
            }
          }
        });
        var person = new resources.people;
        var group = new resources.groups;
        person.groups.push(group);
        person.save();
        expect(person.id).toBeDefined();
        expect(group.id).toBeDefined()
      });
    });
  })
})