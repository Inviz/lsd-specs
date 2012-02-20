describe("LSD.Position", function() {
  describe("#calculate", function() {
    describe("when an object is positioned one in another", function() {
      describe("and it does NOT fit", function() {
        describe("hotizontally", function() {
          it ("should not return position", function() {
            expect(LSD.Position.calculate({x: 1024, y: 256}, {x: 512, y: 512})).toBeFalsy();
          })
        })
        describe("vertically", function() {
          it ("should not return position", function() {
            expect(LSD.Position.calculate({x: 256, y: 1024}, {x: 512, y: 512})).toBeFalsy();
          })
        })
        describe("vertically and horizontally", function() {
          it ("should not return position", function() {
            expect(LSD.Position.calculate({x: 1024, y: 1024}, {x: 512, y: 512})).toBeFalsy();
          })
        })
      })
      describe("and it fits", function() {
        var coordinates = {
          'top': {x: 128, y: 0},
          'left': {x: 0, y: 128},
          'right': {x: 256, y: 128},
          'bottom': {x: 128, y: 256},
          'top-right': {x: 256, y: 0},
          'top-center': {x: 128, y: 0},
          'top-left': {x: 0, y: 0},
          'center-right': {x: 256, y: 128},
          'center-center': {x: 128, y: 128},
          'center-left': {x: 0, y: 128},
          'bottom-right': {x: 256, y: 256},
          'bottom-center': {x: 128, y: 256},
          'bottom-left': {x: 0, y: 256},
        };
        Object.each(coordinates, function(result, position) {
          describe("and the position is given as " + position, function() {
            it ("should return correct position", function() {
              expect(LSD.Position.calculate({x: 256, y: 256}, {x: 512, y: 512}, position.split('-'))).toEqual(result)
            });
          });
        });
      });
    });
    describe("when the object is positioned relative to another", function() {
      describe("with external boundaries", function() {
        describe("and it doesnt NOT fit", function() {
          describe("vertically", function() {
            describe("without fallback given", function() {
              it ("should not return results", function() {
                expect(LSD.Position.calculate({x: 256, y: 256}, {x: 1024, y: 1024}, ['top', 'right'], {y: 256, x: 256, left: 384, top: 128})).toBeFalsy()
              });
            });
            describe("with fallbacks given", function() {
              var fallbacks = {
                'flip': {x: 640, y: 128},
                'hug': {x: 128, y: 128},
                'invert': {x: 384, y: 384}
              };
              Object.each(fallbacks, function(result, expression) {
                describe("to " + expression, function() {
                  it ("should place it in a free place", function() {
                    expect(LSD.Position.calculate({x: 256, y: 256}, {x: 1024, y: 1024}, ['top', 'right'], {y: 256, x: 256, left: 384, top: 128}, expression)).toEqual(result)
                  });
                });
              });
              describe("and it doesnt help", function() {
                it("should not return results", function() {
                  expect(LSD.Position.calculate({x: 256, y: 256}, {x: 1024, y: 1024}, ['top', 'right'], {y: 256, x: 768, left: 128, top: 128}, 'hug')).toBeFalsy()
                })
              })
            });
            describe("with multiple fallbacks given", function() {
              it ("should iterate fallbacks until it finds the one that does the job", function() {
                expect(LSD.Position.calculate({x: 256, y: 256}, {x: 1024, y: 1024}, ['top', 'right'], {y: 256, x: 768, left: 128, top: 128}, ['hug', 'invert'])).toEqual({x: 640, y: 384})
              })
              describe("and all of them dont help", function() {
                it("should not return results", function() {
                  expect(LSD.Position.calculate({x: 256, y: 256}, {x: 1024, y: 1024}, ['top', 'right'], {y: 256, x: 768, left: 128, top: 128}, ['hug', 'flip'])).toBeFalsy()
                })
              })
            })
          });
        });
        describe("and it fits", function() {
          describe("and the anchor is bigger than object", function() {
            var coordinates = {
              'top': {x: 192, y: 0},
              'left': {x: 0, y: 192},
              'right': {x: 384, y: 192},
              'bottom': {x: 192, y: 384},
              'top-right': {x: 256, y: 0},
              'top-center': {x: 192, y: 0},
              'top-left': {x: 128, y: 0},
              'bottom-right': {x: 256, y: 384},
              'bottom-center': {x: 192, y: 384},
              'bottom-left': {x: 128, y: 384},
            };
            Object.each(coordinates, function(coordinates, position) {
              describe("and the position is given as " + position, function() {
                it ("should return correct position", function() {
                  expect(LSD.Position.calculate({x: 128, y: 128}, {x: 512, y: 512}, position, {y: 256, x: 256, left: 128, top: 128})).toEqual(coordinates)
                });
              });
            });
          })
          describe("and the anchor is smaller than the object", function() {
            var coordinates = {
              'top': {x: 192, y: 0},
              'left': {x: 0, y: 192},
              'right': {x: 384, y: 192},
              'bottom': {x: 192, y: 384},
              'top-right': {x: 128, y: 0},
              'top-center': {x: 192, y: 0},
              'top-left': {x: 256, y: 0},
              'bottom-right': {x: 128, y: 384},
              'bottom-center': {x: 192, y: 384},
              'bottom-left': {x: 256, y: 384},
            };
            Object.each(coordinates, function(coordinates, position) {
              describe("and the position is given as " + position, function() {
                it ("should return correct position", function() {
                  expect(LSD.Position.calculate({x: 256, y: 256}, {x: 768, y: 768}, position, {y: 128, x: 128, left: 256, top: 256})).toEqual(coordinates)
                });
              });
            });
          })
        });
      });
      describe("without external boundaries", function() {
        
      });
    })
  });
  describe("object", function() {
    describe("when given an element", function() {
      describe("without anchor", function() {
        it ("should position it in document", function() {
          var div = new Element('div', {styles: {width: 100, height: 100}}).inject(document.body);
          var size = document.body.getSize();
          var position = new LSD.Position(div, {attachment: ['top', 'right'], boundaries: true});
          expect(position.coordinates.x).toEqual(size.x - 100);
          expect(position.coordinates.y).toEqual(0);
          expect(div.style.left).toEqual((size.x - 100) + 'px');
          expect(div.style.top).toEqual('0px');
          div.destroy();
        });
      });
      describe("with anchor", function() {
        it ("should position it in document", function() {
          var div = new Element('div', {styles: {width: 100, height: 100}}).inject(document.body);
          var anchor = new Element('div', {styles: {width: 50, height: 200, top: 150, left: 125, position: 'absolute'}}).inject(document.body);
          var size = document.body.getSize();
          var position = new LSD.Position(div, {attachment: ['top', 'left'], boundaries: true, anchor: anchor});
          expect(position.coordinates.x).toEqual(125);
          expect(position.coordinates.y).toEqual(50);
          expect(div.style.left).toEqual('125px');
          expect(div.style.top).toEqual('50px');
          div.destroy();
          anchor.destroy();
        });
      });
    });
  });
});