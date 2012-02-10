describe("LSD.Mixin.Fieldset", function() {
  var context = Factory('type', 'input', 'form')
  describe("when used on a form widget", function() {
    describe("and the widget has inputs", function() {
      describe("and inputs have simple name and flat structure", function() {
        it ("should register each input in fields and params object", function() {
          var fieldset = Factory('form', {
            context: context,
            layout: {
              'input[name=name][value=Jack]': null,
              'input[name=organization][value="Wall Street"]': null
            }
          });
          fieldset.build();
          expect(fieldset.childNodes.length).toEqual(2);
          expect(fieldset.fields.name.getValue()).toEqual('Jack');
          expect(fieldset.fields.organization.getValue()).toEqual('Wall Street');
          expect(fieldset.values.name).toEqual('Jack');
          expect(fieldset.values.organization).toEqual('Wall Street')
          fieldset.childNodes[1].dispose();
          expect(fieldset.fields.organization).toBeUndefined()
          expect(fieldset.values.organization).toBeUndefined()
          fieldset.childNodes[0].dispose();
          expect(fieldset.fields.name).toBeUndefined()
          expect(fieldset.values.name).toBeUndefined()
        })
      });
      describe("and inputs have nested names", function() {
        describe("and property names are plain strings", function() {
          it ("should treat object as array", function() {
            var fieldset = Factory('form', {
              context: context,
              layout: {
                'input[name="person[name]"][value=Jack]': null,
                'input[name="person[organization]"][value="Wall Street"]': null
              }
            });
            fieldset.build();
            expect(fieldset.childNodes.length).toEqual(2);
            expect(fieldset.fields.person.name.getValue()).toEqual('Jack');
            expect(fieldset.fields.person.organization.getValue()).toEqual('Wall Street');
            expect(fieldset.values.person.name).toEqual('Jack');
            expect(fieldset.values.person.organization).toEqual('Wall Street')
            fieldset.childNodes[0].dispose();
            expect(fieldset.fields.person.name).toBeUndefined()
            expect(fieldset.values.person.name).toBeUndefined()
            fieldset.childNodes[0].dispose();
            expect(fieldset.fields.person.organization).toBeUndefined()
            expect(fieldset.values.person.organization).toBeUndefined()
          })
        });
        describe("and there is an object with numbers as all of its properties", function() {
          describe("and values in that objects are simple types like string or number", function() {
            it ("should treat object as array", function() {
              var fieldset = Factory('form', {
                context: context,
                layout: {
                  'input[name="people[0]"][value=Jack]': null,
                  'input[name="people[1]"][value=Adolf]': null
                }
              });
              fieldset.build();
              expect(fieldset.childNodes.length).toEqual(2);
              expect(fieldset.fields.people[0].getValue()).toEqual('Jack');
              expect(fieldset.fields.people[1].getValue()).toEqual('Adolf');
              expect(fieldset.values.people[0]).toEqual('Jack');
              expect(fieldset.values.people[1]).toEqual('Adolf')
            });
          })
          describe("and values in that objects are objects", function() {
            it ("should be able to access those objects in array", function() {
              var fieldset = Factory('form', {
                context: context,
                layout: {
                  'input[name="people[0][name]"][value=Jack]': null,
                  'input[name="people[1][name]"][value=Adolf]': null
                }
              });
              fieldset.build();
              expect(fieldset.childNodes.length).toEqual(2);
              expect(fieldset.fields.people[0].name.getValue()).toEqual('Jack');
              expect(fieldset.fields.people[1].name.getValue()).toEqual('Adolf');
              expect(fieldset.values.people[0].name).toEqual('Jack');
              expect(fieldset.values.people[1].name).toEqual('Adolf')
            })
          })
        });
        describe("and some of the properties are numbers and some are empty indecies", function() {
          it ("should treat object as array", function() {
            var fieldset = Factory('form', {
              context: context,
              layout: {
                'input[name="people[0][name]"][value=Jack]': null,
                'input[name="people[][name]"][value=Adolf]': null,
                'input[name="people[3][name]"][value=Helen]': null,
                'input[name="people[][name]"][value=Max]': null
              }
            });
            fieldset.build();
            expect(fieldset.childNodes.length).toEqual(4);
            expect(fieldset.fields.people[0].name.getValue()).toEqual('Jack');
            expect(fieldset.fields.people[1].name.getValue()).toEqual('Adolf');
            expect(fieldset.fields.people[3].name.getValue()).toEqual('Helen');
            expect(fieldset.fields.people[4].name.getValue()).toEqual('Max');
            expect(fieldset.values.people[0].name).toEqual('Jack');
            expect(fieldset.values.people[1].name).toEqual('Adolf')
            expect(fieldset.values.people[3].name).toEqual('Helen');
            expect(fieldset.values.people[4].name).toEqual('Max')
          });
        });
        describe("and some of the properties are numbers and some are not", function() {
          xit ("should treat that object as array", function() {
            
          })
        })
      });
      describe("and inputs have names with empty indecies (array-like)", function() {
        it ("should treat object as array", function() {
          var fieldset = Factory('form', {
            context: context,
            layout: {
              'input[name="name[]"][value=Jack]': null,
              'input[name="name[]"][value=Stewie]': null
            }
          });
          fieldset.build();
          expect(fieldset.childNodes.length).toEqual(2);
          expect(fieldset.fields.name[0].getValue()).toEqual('Jack');
          expect(fieldset.values.name[0]).toEqual('Jack');
          expect(fieldset.fields.name[1].getValue()).toEqual('Stewie');
          expect(fieldset.values.name[1]).toEqual('Stewie');
        })
      })
    })
  });
  describe("when used on a nested form widget", function() {
    describe("and input is nested in both fieldsets", function() {
      it ("should register that input in both fieldsets", function() {
        var fieldset = Factory('form', {
          context: context,
          layout: {
            'form': {
              'input[name=name][value=Jack]': null,
            }
          }
        });
        fieldset.build();
        var nested = fieldset.childNodes[0];
        expect(fieldset.childNodes.length).toEqual(1);
        expect(fieldset.fields.name.getValue()).toEqual('Jack');
        expect(fieldset.values.name).toEqual('Jack');
        expect(nested.fields.name.getValue()).toEqual('Jack');
        expect(nested.values.name).toEqual('Jack');
      })
    });
    describe("and input is nested in the parent fieldset", function() {
      it ("should not register that input in nested fieldset", function() {
        var fieldset = Factory('form', {
          context: context,
          layout: {
            'form': null,
            'input[name=name][value=Jack]': null
          }
        });
        fieldset.build();
        var nested = fieldset.childNodes[0];
        expect(fieldset.childNodes.length).toEqual(2);
        expect(fieldset.fields.name.getValue()).toEqual('Jack');
        expect(fieldset.values.name).toEqual('Jack');
        expect(nested.fields.name).toBeFalsy()
        expect(nested.values.name).toBeFalsy()
      })
    })
  })
});