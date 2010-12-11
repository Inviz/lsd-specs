describe("Widget.Trait.Layer", function() {
  
  var Layered = new Class({
    Extends: LSD.Widget.Paint,
    
    options: {
      layers: {
        shadow:  ['shadow'],
        stroke: ['stroke'],
        background:  [LSD.Layer.Fill.Background.Offset],
        reflection:  [LSD.Layer.Fill.Reflection.Offset],
        glyph: ['glyph']
      }
    }
  });
  var color = hsb(10, 10, 10);
  var instance;
  beforeEach(function() {
    if (instance) instance.destroy();
    instance = new Layered;
  })
  
  it("should render layers and inject them when needed", function() {
    instance.render({backgroundColor: color});
    expect(instance.layers.background.injected).toBeTruthy()
    expect(instance.layers.shadow.injected).toBeFalsy();
  });
  
  it("should render layers in the right order", function() {
    instance.render({
      height: 10,
      width: 10,
      backgroundColor: color,
      fillColor: color,
      glyphColor: color,
      glyph: "M0,8L4,0L8,8L0,8"
    });
    expect(instance.layers.background.injected).toBeTruthy()
    expect(instance.layers.stroke.injected).toBeTruthy()
    expect(instance.layers.glyph.injected).toBeTruthy()
    expect(instance.layers.shadow.injected).toBeFalsy();
    var find = function(path) {
      for (var i in instance.layers) if (instance.layers[i].injected && instance.layers[i].shape.element == path) return i;
    }
    var order = ['stroke', 'background', 'glyph']
    var children = $(instance.getShape().element).getChildren();
    children.shift();
    children.each(function(path) {
      if (find(path)) expect(find(path)).toEqual(order.shift())
    });
  });
  
  it("should collect offsets from layers", function() {
    instance.render({
      height: 10,
      width: 10,
      strokeWidth: 1,
      strokeColor: color,
      fillColor: color
    });
    expect(instance.offset.inside.left).toEqual(1);
    expect(instance.offset.inside.right).toEqual(1);
    expect(instance.offset.inside.left).toEqual(1);
    expect(instance.offset.inside.bottom).toEqual(1);
  });
});