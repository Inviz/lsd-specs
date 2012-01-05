describe("Element.Style", function() {
  describe("#setStyle", function() {
    
    var tests = {
      "when given a simple style": {
        "that is built in": {
          "and value is a hex string": {
            property: 'color',
            input: "#333",
            output: '#333333'
          },
          "and value is rgb-string": {
            property: 'color',
            input: "rgb(12, 22, 34)",
            output: '#0c1622'
          },
          "and value is rgba-string": {
            property: 'color',
            input: "rgb(12, 22, 34, 0)",
            output: 'transparent'
          },
          "and value is hsb-string": {
            property: 'color',
            input: "hsb(12, 22, 34)",
            output: '#574744'
          },
          "and value is an array": {
            property: 'color',
            input: [[51, 52, 51]],
            output: '#333433'
          },
          "and value is an object": {
            property: 'color',
            input: Color.hsb(25, 22, 11),
            output: '#1c1816'
          }
        },
        "that has a protected name": {
          "and value is a keyword": {
            property: 'float',
            input: 'left',
            output: 'left'
          },
          "and value is an unknown keyword": {
            property: 'float',
            input: 'zip-zap',
            output: null
          }
        },
        "that is emulated in IE": {
          "and value is a string": {
            property: 'opacity',
            input: '0.5',
            output: 0.5
          },
          "and value is a number": {
            property: 'opacity',
            input: 0.5,
            output: 0.5
          }
        }
      },
      "when given a shortcut property": {
        "and values are padded": {
          "and there's a single value given": {
            property: 'margin',
            input: 3,
            output: '3px 3px 3px 3px',
            properties: {
              marginTop: '3px',
              marginRight: '3px',
              marginBottom: '3px',
              marginLeft: '3px'
            }
          },
          "and there're two values given": {
            property: 'margin',
            input: [3, 5],
            output: '3px 5px 3px 5px',
            properties: {
              marginTop: '3px',
              marginRight: '5px',
              marginBottom: '3px',
              marginLeft: '5px'
            }
          },
          "and there're two values given that can be collapsed to one": {
            property: 'margin',
            input: [3, 3],
            output: '3px 3px 3px 3px',
            properties: {
              marginTop: '3px',
              marginRight: '3px',
              marginBottom: '3px',
              marginLeft: '3px'
            }
          },
          "and there're two values given, one parsed and one unparsed": {
            property: 'margin',
            input: [5, '3px'],
            output: '5px 3px 5px 3px',
            properties: {
              marginTop: '5px',
              marginRight: '3px',
              marginBottom: '5px',
              marginLeft: '3px'
            }
          },
          "and there're two values given, one parsed and one unparsed with unit different from pixels": {
            property: 'margin',
            input: ['5em', 3],
            output: '5em 3px 5em 3px',
            properties: {
              marginTop: '5em',
              marginRight: '3px',
              marginBottom: '5em',
              marginLeft: '3px'
            }
          },
          "and there're three values given": {
            property: 'margin',
            input: [3, 4, 5],
            output: '3px 4px 5px 4px',
            properties: {
              marginTop: '3px',
              marginRight: '4px',
              marginBottom: '5px',
              marginLeft: '4px'
            }
          },
          "and there're three values given and they can be collapsed to one": {
            property: 'margin',
            input: [3, 3, 3],
            output: '3px 3px 3px 3px',
            properties: {
              marginTop: '3px',
              marginRight: '3px',
              marginBottom: '3px',
              marginLeft: '3px'
            }
          },
          "and there're four values given": {
            property: 'margin',
            input: [3, 4, 5, 6],
            output: '3px 4px 5px 6px',
            properties: {
              marginTop: '3px',
              marginRight: '4px',
              marginBottom: '5px',
              marginLeft: '6px'
            }
          },
          "and there're four values given and they can be collapsed to three": {
            property: 'margin',
            input: [3, 4, 5, 4],
            output: '3px 4px 5px 4px',
            properties: {
              marginTop: '3px',
              marginRight: '4px',
              marginBottom: '5px',
              marginLeft: '4px'
            }
          },
          "and there're four values given and they can be collapsed to two": {
            property: 'margin',
            input: [3, 4, 3, 4],
            output: '3px 4px 3px 4px',
            properties: {
              marginTop: '3px',
              marginRight: '4px',
              marginBottom: '3px',
              marginLeft: '4px'
            }
          },
          "and there're four values given and they can be collapsed to one": {
            property: 'margin',
            input: [3, 3, 3, 3],
            output: '3px 3px 3px 3px',
            properties: {
              marginTop: '3px',
              marginRight: '3px',
              marginBottom: '3px',
              marginLeft: '3px'
            }
          }
        }
      },
      "when given a property that is a shortcut of shortcuts": {
        "and a single value is given": {
          property: 'border',
          input: 3,
          properties: null
        },
        "and two values are given": {
          property: 'border',
          input: [3, 'solid'],
          properties: null
        },
        "and three values are given": {
          property: 'border',
          input: [1, 'solid', '#ccc'],
          properties: {
            borderTopWidth: '1px', 
            borderTopStyle: 'solid', 
            borderTopColor: "#cccccc",
            borderRightWidth: '1px', 
            borderRightStyle: 'solid', 
            borderRightColor: "#cccccc",
            borderBottomWidth: '1px', 
            borderBottomStyle: 'solid', 
            borderBottomColor: "#cccccc",
            borderLeftWidth: '1px',
            borderLeftStyle: 'solid', 
            borderLeftColor: "#cccccc"
          }
        },
        "and four values are given": {
          property: 'border',
          input: [3, 'solid', '#ccc', 'dashed'],
          properties: null
        },
        "and two sets of values are given": {
          property: 'border',
          input: [['2pt', 'dotted', {rgb: [0, 10, 37]}], ['5px', 'dashed', '#c31']],
          output: '2pt dotted rgb(0, 10, 37), 5px dashed #c31, 2pt dotted rgb(0, 10, 37), 5px dashed #c31',
          properties: {
            borderTopWidth: '2pt', 
            borderTopStyle: 'dotted', 
            borderTopColor: {rgb: [0, 10, 37]},
            borderRightWidth: '5px', 
            borderRightStyle: 'dashed', 
            borderRightColor: "#cc3311",
            borderBottomWidth: '2pt', 
            borderBottomStyle: 'dotted', 
            borderBottomColor: {rgb: [0, 10, 37]},
            borderLeftWidth: '5px',
            borderLeftStyle: 'dashed', 
            borderLeftColor: "#cc3311"
          }
        },
        "and three sets of values are given": {
          property: 'border',
          input: '1px solid #cccccc, 2px solid #cccccc, 3px solid #cccccc',
          output: '1px solid #cccccc, 2px solid #cccccc, 3px solid #cccccc, 2px solid #cccccc',
          properties: {
            borderTopWidth: '1px',
            borderTopStyle: 'solid', 
            borderTopColor: "#cccccc",
            borderRightWidth: '2px',
            borderRightStyle: 'solid', 
            borderRightColor: "#cccccc",
            borderBottomWidth: '3px',
            borderBottomStyle: 'solid', 
            borderBottomColor: "#cccccc",
            borderLeftWidth: '2px',
            borderLeftStyle: 'solid', 
            borderLeftColor: "#cccccc"
          },
        },
        "and four sets of values are given": {
          property: 'border',
          input: '1px solid #cccccc, 2px solid #cccccc, 3px solid #cccccc, 4em dashed #000000',
          output: '1px solid #cccccc, 2px solid #cccccc, 3px solid #cccccc, 4em dashed #000000',
          properties: {
            borderTopWidth: '1px',
            borderTopStyle: 'solid', 
            borderTopColor: "#cccccc",
            borderRightWidth: '2px',
            borderRightStyle: 'solid', 
            borderRightColor: "#cccccc",
            borderBottomWidth: '3px',
            borderBottomStyle: 'solid', 
            borderBottomColor: "#cccccc",
            borderLeftWidth: '4em', 
            borderLeftStyle: 'dashed', 
            borderLeftColor: "#000000"
          },
        }
      },
      "when given property is a shortcut of non-ambiguous properties": {
        "and value is given as simple string": {
          property: 'background',
          input: '#ccc',
          output: '#cccccc',
          properties: {
            background: '#cccccc'
          }
        },
        "and value is given as complex string": {
          property: 'background',
          input: '#123456 url("http://google.com/1.png") center',
          output: '#123456 url(http://google.com/1.png) 50%',
          properties: { 
            backgroundColor: '#123456', 
            backgroundImage: 'url(http://google.com/1.png)', 
            backgroundPositionX: '50%'
          }
        }
      }
    }
    var assert = function(a, b) {
      if (b == null) b = '';
      else b = String(b)
      return expect(a).toEqual(b);
    }
    var walk = function(object) {
      Object.each(object, function(value, name) {
        describe(name, function() {
          if (!value.property) {
            walk(value);
          } else {
            it("should set styles", function() {
              var element = new Element('div');
              element.setStyle(value.property, value.input);
              if (value.properties)
                for (var i in value.properties) {
                  assert(element.getStyle(i), value.properties[i])
                }
              if (typeof value.output != 'undefined')
                assert(element.getStyle(value.property), value.output)
            })
          }
        })
      })
    };
    walk(tests);
  })
})



// Specs from mootools 1.2
describe('Element.getStyle', {

	'should get a six digit hex code from a three digit hex code': function() {
		var el = new Element('div').set('html', '<div style="color:#00ff00"></div>');
		expect(el.getElement('div').getStyle('color')).toEqual('#00ff00');
	},

	'should getStyle a six digit hex code from an RGB value': function() {
		var el = new Element('div').set('html', '<div style="color:rgb(0, 255, 0)"></div>');
		expect(el.getElement('div').getStyle('color')).toEqual('#00ff00');
	},

	'should `getStyle` with a dash in it': function() {
		var el = new Element('div').set('html', '<div style="list-style-type:square"></div>');
		expect(el.getElement('div').getStyle('list-style-type')).toEqual('square');
	},

	'should `getStyle` padding': function() {
		var el = new Element('div').set('html', '<div style="padding:20px"></div>');
		expect(el.getElement('div').getStyle('padding-left')).toEqual('20px');
	}

});

describe('Element.setStyle', {

	'should set the `styles` property on an Element using the Element constructor': function() {
		expect(new Element('div', {styles:{'color':'#00ff00'}}).getStyle('color')).toEqual('#00ff00');
	},

	'should `setStyle` on an Element': function() {
		expect(new Element('div').setStyle('color','#00ff00').getStyle('color')).toEqual('#00ff00');
	},

	'should properly `setStyle` for a property with a dash in it': function() {
		expect(new Element('div').setStyle('list-style-type', 'square').getStyle('list-style-type')).toEqual('square');
	}

});

describe('Element.getStyles', {

	'should return multiple styles': function() {
		var el = new Element('div').set('html', '<div style="color:#00ff00;list-style-type:square"></div>');
		expect(el.getElement('div').getStyles('color', 'list-style-type')).toEqual({color:'#00ff00', 'list-style-type':'square'});
	}

});

describe('Element.setStyles', {

	'should set multiple styles': function() {
		expect(new Element('div').setStyles({'list-style-type':'square', 'color':'#00ff00'}).getStyles('list-style-type', 'color')).toEqual({'list-style-type':'square', color:'#00ff00'});
	}

});