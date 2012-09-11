describe("LSD.Struct", function() {
  describe("when initialized with set of properties", function() {
    describe("and the property is callback", function() {
      it ("should call the callback when the observed value is changed", function() {
        var title;
        var Struct = LSD.Struct({
          title: function(value) {
            title = value
          }
        });
        var instance = new Struct({title: 'Lord'})
        expect(title).toEqual('Lord')
        instance.unset('title', 'Lord');
        expect(title).toBeUndefined();
      });
      it ("should mutate the value if callback returns the value", function() {
        var Struct = LSD.Struct({
          title: function(value) {
            return value + 123
          }
        });
        var instance = new Struct({title: 'Lord'})
        expect(instance.title).toEqual('Lord123')
        instance.unset('title', 'Lord123');
        expect(instance.title).toBeUndefined();
      })
    });
    describe("and the property is a data structure", function() {
      it ("should construct that object on demand", function() {
        var Person = LSD.Struct({
          title: function(value) {
            return value + 123
          }
        });
        var Struct = LSD.Struct({
          person: Person
        });
        var instance = new Struct({person: {title: 'Lord'}});
        expect(instance.person instanceof Person).toBeTruthy()
        expect(instance.person.title).toEqual('Lord123')
        instance.person.unset('title', 'Lord123');
        expect(instance.person.title).toBeUndefined();
      })
    });
    describe("and the property is string", function() {
      describe("and that string is a simple alias of the value within the same object", function() {
        it ("should redirect calls to the alias object", function() {
          var Person = LSD.Struct({
            title: function(value) {
              return value + 123
            }
          });
          var Struct = LSD.Struct({
            person: Person,
            author: 'person'
          });
          var instance = new Struct({author: {title: 'Lord'}});
          expect(instance.person instanceof Person).toBeTruthy()
          expect(instance.person).toEqual(instance.author)
          expect(instance.person.title).toEqual('Lord123')
          expect(instance.author.title).toEqual('Lord123')
          var person = new Person({name: 'Jackie'});
          instance.set('person', person);
          expect(instance.person).toEqual(person);
          expect(instance.author).toEqual(person);
          expect(instance.person.title).toEqual('Lord123')
          expect(instance.author.title).toEqual('Lord123')
          expect(instance.person.name).toEqual('Jackie')
          expect(instance.author.name).toEqual('Jackie')
        })
      });
      describe("and that string is a nested dot-separated property", function() {
        it ("should assign nested parameters and initialize all objects on its path", function() {
          var Person = LSD.Struct({
            title: function(value) {
              return value + 123
            }
          });
          var Post = LSD.Struct({
            person: Person,
            author: 'person'
          });
          var Struct = LSD.Struct({
            post: Post,
            author: 'post.person'
          });
          var instance = new Struct({author: {title: 'Lord'}});
          expect(instance.author instanceof Person).toBeTruthy()
          expect(instance.post.person).toEqual(instance.author)
          expect(instance.post.person.title).toEqual('Lord123')
          expect(instance.author.title).toEqual('Lord123')
          instance.post.person.unset('title', 'Lord123');
          expect(instance.post.person.title).toBeUndefined();
          expect(instance.author.title).toBeUndefined();
        })
      })
      describe("and that string is a nested dot-separated property that starts with dot", function() {
        it ("should find the holder first and then assign nested parameters and initialize all objects on its path", function() {
          var Person = LSD.Struct({
            title: function(value) {
              return value + 123
            }
          });
          var Struct = LSD.Struct({
            post: LSD.Struct({
              author: '.person'
            }),
            person: Person
          });
          var instance = new Struct({post: {author: {title: 'Lord'}}});
          expect(instance.person instanceof Person).toBeTruthy()
          expect(instance.post.author).toEqual(instance.person)
          expect(instance.post.author.title).toEqual('Lord123')
          expect(instance.person.title).toEqual('Lord123')
          instance.post.author.unset('title', 'Lord123');
          expect(instance.post.author.title).toBeUndefined();
          expect(instance.person.title).toBeUndefined();
        })
        
        it ("should be able to-reapply proxied values when linked object changes", function() {
          var Person = LSD.Struct({
            title: function(value) {
              return value + 123
            }
          }, 'Journal');
          var Animal = LSD.Struct({
            title: function(value) {
              return value + 321
            }
          }, 'Journal');
          var Post = LSD.Struct({
            author: '.person'
          });
          var Struct = LSD.Struct({
            post: Post,
            person: Person
          }, 'Journal');
          var data = {post: {author: {title: 'Lord'}}};
          var instance = new Struct(data);
          expect(instance.person.title).toEqual('Lord123')
          var person = instance.person;
          var animal = new Animal;
          instance.set('person', animal)
          expect(instance.person).toNotEqual(person)
          expect(instance.person instanceof Animal).toBeTruthy()
          expect(instance.person.title).toEqual('Lord321');
          expect(person.title).toBeUndefined();
          var post = instance.post;
          instance.unset('post', post)
          expect(post.author).toBeUndefined()
          expect(post.title).toBeUndefined()
          expect(post._owner).toBeUndefined()
          expect(instance.person.title)
          expect(instance.person).toEqual(animal)
          var announcement = new Post
          instance.set('post', announcement)
          expect(announcement.author).toEqual(instance.person)
          expect(instance.person.title).toEqual('Lord321');
          instance.unmix(data)
          expect(instance.person.title).toBeUndefined()
          instance.set('person', new Person)
          expect(instance.person.title).toBeUndefined()
          instance.set('post', new Post)
          expect(instance.person.title).toBeUndefined();
          instance.mix('post', {author: {title: 'Sir'}})
          expect(instance.person.title).toEqual('Sir123')
          instance.set('person', animal);
          // up to this point, person was set 4 times: 1 implicitly & 3 explicitly
          expect(instance.person.title).toEqual('Sir321')
          instance.unset('person', animal)
          expect(instance.person.title).toEqual('Sir123')
          instance.unset('person', instance.person)
          expect(instance.person.title).toEqual('Sir321')
          instance.unset('person', instance.person)
          expect(instance.person.title).toEqual('Sir123')
          instance.unset('person', instance.person)
          expect(instance.person).toBeUndefined()
          expect(instance.post.author).toBeUndefined()
        })
      });
      
      describe("and data is given asynchronously", function() {
        it ("should apply the data when the watched property match", function() {
          var Person = LSD.Struct({
            name: function(name) {
              return name + 123;
            }
          }, 'Journal')
          var Post = LSD.Struct({
            author: '.person'
          }, 'Journal');
          var Struct = LSD.Struct({
            post: Post,
            person: Person
          }, 'Journal');
          var post = new Post({author: {name: "George"}});
          var struct = new Struct
          struct.set('post', post);
          var george = struct.person;
          expect(struct.person instanceof Person).toBeTruthy()
          expect(struct.person).toBe(post.author);
          expect(struct.person.name).toBe("George123");
          struct.unset('post', post);
          expect(post.author).toBeUndefined()
          expect(struct.person instanceof Person).toBeTruthy()
          expect(struct.person.name).toBeUndefined()
          var hollie = new Person({name: 'Hollie'})
          expect(hollie.name).toBe("Hollie123");
          struct.set('person', hollie);
          expect(struct.person).toBe(hollie)
          expect(struct.person.name).toBe("Hollie123");
        })
      });
      
      describe("and a link is linked to another link", function() {
        it ("it should resolve deep links", function() {
            var Person = LSD.Struct({
              name: function(name) {
                return name + 123;
              }
            }, 'Journal')
            var Post = LSD.Struct({
              author: '.topic.person',
              person: '.person'
            }, 'Journal');
            var Struct = LSD.Struct({
              post: Post,
              topic: 'post',
              person: Person
            }, 'Journal');
            var post = new Post({author: {name: "George"}});
            var struct = new Struct
            struct.set('post', post);
            var george = struct.person;
            expect(struct.person instanceof Person).toBeTruthy()
            expect(struct.person).toEqual(post.author);
            expect(post.person).toEqual(post.author);
            expect(struct.post).toEqual(struct.topic);
            expect(struct.person.name).toEqual("George123");
            struct.unset('post', post);
            expect(post.author).toBeUndefined()
            expect(struct.person instanceof Person).toBeTruthy()
            expect(struct.person.name).toBeUndefined()
            var hollie = new Person({name: 'Hollie'})
            expect(hollie.name).toEqual("Hollie123");
            struct.set('person', hollie);
            expect(struct.person).toEqual(hollie)
            expect(struct.person.name).toEqual("Hollie123");
        })
      })
      
      
      describe("and a struct has _delegate method defined", function() {
        it ("should call that method whenever setting linked object properties", function() {
          var Events = LSD.Struct({
            'matches': '.matches'
          }, 'Group');
          Events.implement({
            _delegate: function(object, name, value, memo, old, origin) {
              if (this._properties[name]) return;
              if (object.mix) object.mix('events', value, memo, old);
              return true;
            }
          })
          var Matches = LSD.Struct('Group');
          Matches.implement({
            _construct: function() {
              return null;
            }
          })
          var Widget = LSD.Struct({
            events:   Events,
            matches:  Matches
          });
          var widget = new Widget({
            events: {
              matches: {
                'button + bar': {
                  click: function() {}
                }
              }
            }
          });
          var found = new Widget;
          widget.matches.set('button + bar', found);
          expect(widget.events.click).toBeUndefined();
          expect(found.events.click).toBeTruthy();
          widget.matches.unset('button + bar', found);
          expect(found.events.click).toEqual([]);
        })
        
        it ("should use that method to take back the control after a chain through other modules", function() {
          var Matches = LSD.Struct('Group');
          Matches.implement({
            _construct: function() {
              return null;
            }
          })
          var Relations = LSD.Struct('Group');
          Relations.implement({
            _construct: function() {
              return null;
            }
          })
          var Events = LSD.Struct({
            'matches': '.matches',
            'relations': '.relations'
          }, 'Group');
          Events.implement({
            _delegate: function(object, name, value, memo, old) {
              if (this._properties[name]) return;
              object.mix('events', value, memo, old)
              return true;
            }
          })
          var Widget = LSD.Struct({
            events:    Events,
            matches:   Matches,
            relations: Relations
          })
          var click = function() {};
          var widget = new Widget({
            events: {
              relations: {
                grid: {
                  matches: {
                    'button + bar': {
                      click: click
                    }
                  }
                }
              }
            }
          });
          var found = new Widget;
          expect(found.events).toBeFalsy();
          expect(widget.matches).toBeFalsy();
          var grid = new Widget
          widget.relations.set('grid', grid)
          expect(grid.matches).toBeTruthy();
          expect(found.events).toBeFalsy();
          grid.matches.set('button + bar', found);
          expect(widget.events.click).toBeUndefined();
          expect(found.events.click).toEqual([click]);
          grid.matches.unset('button + bar', found);
          expect(found.events.click).toEqual([]);
          grid.matches.set('button + bar', found);
          expect(found.events.click).toEqual([click])
          widget.relations.unset('grid', grid)
          expect(found.events.click).toEqual([]);
          widget.relations.set('grid', grid)
          expect(found.events.click).toEqual([click])
          widget.relations.unset('grid', grid)
          expect(found.events.click).toEqual([]);
          grid.matches.unset('button + bar', found);
          expect(found.events.click).toEqual([]);
          widget.relations.set('grid', grid)
          expect(found.events.click).toEqual([]);
          grid.matches.set('button + bar', found);
          expect(found.events.click).toEqual([click])
          widget.relations.unset('grid', grid)
          expect(found.events.click).toEqual([]);
          widget.relations.set('grid', grid)
          expect(found.events.click).toEqual([click])
        })
      })
    });
    describe('when dynamic properties are defined', function() {
      describe('and the property is defined on the top level', function() {

      });
      describe('and the property is defined in imports object', function() {
        describe('and the property is a link to another property', function() {
          it ('should update the dynamic property when the linked property is updated', function() {
            var Struct = new LSD.Struct({
              imports: {
                name: 'title'
              }
            });
            var object = new Struct;
            expect(object.name).toBeUndefined();
            object.set('title', 'Rock');
            expect(object.name).toEqual(object.title);
            expect(object.name).toEqual('Rock');
            object.change('title', 'Jazz');
            expect(object.name).toEqual(object.title);
            expect(object.name).toEqual('Jazz');
            object.unset('title', 'Jazz');
            expect(object.name).toEqual(object.title);
            expect(object.name).toBeUndefined();
          })
        });
        describe('and the property is a link to a property in another object', function() {
          it ('should update the dynamic property when the linked property is updated', function() {
            var Struct = new LSD.Struct({
              imports: {
                name: 'post.title'
              }
            });
            var post = new Struct;
            var object = new Struct({post: post});
            expect(object.name).toBeUndefined();
            post.set('title', 'Rock');
            expect(object.name).toEqual(object.post.title);
            expect(object.name).toEqual('Rock');
            post.change('title', 'Jazz');
            expect(object.name).toEqual(object.post.title);
            expect(object.name).toEqual('Jazz');
            post.unset('title', 'Jazz');
            expect(object.name).toEqual(object.post.title);
            expect(object.name).toBeUndefined();
          })
        });
        describe('and the property is a script', function() {
          it ('should compile script, watch all variables, and update result on changes', function() {
            var Struct = new LSD.Struct({
              imports: {
                total: 'cash * ratio - 1'
              }
            });
            var object = new Struct();
            object.set('cash', 500);
            expect(object.total).toBeUndefined()
            object.set('ratio', 0.5);
            expect(object.total).toEqual(249)
            object.set('cash', 600)
            expect(object.total).toEqual(299)
            object.set('ratio', 0.3);
            expect(object.total).toEqual(179)
          })
        })
      });
      //describe('and the property is defined in exports object', function() {
      //  describe('and the property is a link to another property', function() {
      //    it ('should update the dynamic property when the linked property is updated', function() {
      //      
      //    })
      //  });
      //  describe('and the property is a link to a property in another object', function() {
      //    it ('should update the dynamic property when the linked property is updated', function() {
      //      
      //    })
      //  });
      //  describe('and the property is a script', function() {
      //    it ('should compile script, watch all variables, and update result on changes', function() {
      //      
      //    })
      //  })
      //})
    })
  });
  describe('Extends', function() {
    describe('when given object', function() {
      
    });
    describe('when given LSD.Struct', function() {
      it ('should clone prototype objects', function() {
        var Class = new LSD.Struct({
          first: function(){}
        });
        var Subclass = new LSD.Struct({
          Extends: Class,
          second: function(){}
        });
        expect(Class.prototype._properties.first).toBeDefined()
        expect(Class.prototype._properties.second).toBeUndefined()
        expect(Subclass.prototype._properties).toNotBe(Class.prototype._properties)
        expect(Subclass.prototype._properties.first).toBeDefined()
        expect(Subclass.prototype._properties.second).toBeDefined()
      })
    });
    describe('when given mootools class', function() {
      
    });
    describe('when constructor', function() {
      
    });
    describe('when given function', function() {
    });
  });
})