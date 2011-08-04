describe("LSD.Relation", function() {
  var doc = LSD.document || new LSD.Document
  
  it ("should initialize with origin", function() {
    var list = new LSD.Widget({tag: 'list', document: doc});
    //var item = new LSD.Widget({tag: 'item'});
    var relation = new LSD.Relation('items', list);
    expect(relation.origin).toEqual(list)
  })
  
  it ("should watch the origin when selector is given", function() {
    var list = new LSD.Widget({tag: 'list', document: doc});
    var item = new LSD.Widget({tag: 'item'}).inject(list);
    var relation = new LSD.Relation('items', list);
    relation.setOptions({selector: 'item', multiple: true});
    expect(list.expectations[' ']['item']).toBeTruthy();
    expect(list.items).toEqual([item]);
    expect(item.expectations['!::']['items'].indexOf(list)).toEqual(0)
  });

  it ("should write relation origin when as option is given", function() {
    var list = new LSD.Widget({tag: 'list', document: doc});
    var item = new LSD.Widget({tag: 'item'}).inject(list);
    var relation = new LSD.Relation('items', list, {as: 'ownzor', selector: 'item'});
    expect(item.ownzor).toEqual(list);
  });
  
  it ("should write relation origin into array on matched widget when collection option is set", function() {
    var list = new LSD.Widget({tag: 'list', document: doc});
    var menu = new LSD.Widget({tag: 'menu', document: doc}).inject(list);
    var item = new LSD.Widget({tag: 'item'}).inject(menu);
    var relation = new LSD.Relation('items', list, {collection: 'supper', selector: 'item'});
    var relation = new LSD.Relation('items', menu, {collection: 'supper', selector: 'item'});
    expect(item.supper).toEqual([list, menu]);
  });

  it ("should watch the same element in two different relations", function() {
    var list = new LSD.Widget({tag: 'list', document: doc});
    var item = new LSD.Widget({tag: 'item'}).inject(list);
    var item1 = new LSD.Relation('items', list, {selector: 'item', multiple: true});
    var item2 = new LSD.Relation('itemz', list, {selector: 'item', multiple: true});
    expect(list.expectations[' ']['item']).toBeTruthy();
    expect(list.items).toEqual([item]);
    expect(list.items).toEqual(list.itemz);
    expect(item.expectations['!::']['items'].indexOf(list)).toEqual(0)
  });
  
  it ("should watch and find widgets with complex selector", function() {
    var list = new LSD.Widget({tag: 'list', document: doc});
    var icon = new LSD.Widget({tag: 'icon'}).inject(new LSD.Widget({tag: 'grid'}).inject(list));
    var relation = new LSD.Relation('items', list);
    relation.setOptions({selector: 'grid icon item', multiple: true});
    expect(list.expectations[' ']['grid']).toBeTruthy();
    expect(list.childNodes[0].expectations[' ']['icon']).toBeTruthy();
    expect(list.childNodes[0].childNodes[0].expectations[' ']['item']).toBeTruthy();
    var item = new LSD.Widget({tag: 'item'}).inject(icon);
    expect(list.items).toEqual([item]);
  });
  
  it ("should watch and find widgets using selector with pseudo element in it", function() {
    var list = new LSD.Widget({tag: 'list', document: doc});
    var item = new LSD.Widget({tag: 'item'}).inject(list);
    var relation = new LSD.Relation('items', list);
    relation.setOptions({selector: 'item', multiple: true});
    expect(list.expectations[' ']['item']).toBeTruthy();
    expect(list.items).toEqual([item]);
    expect(item.expectations['!::']['items'].indexOf(list)).toEqual(0)
  });
  
  it ("should apply expectation on origin when expectation is given", function() {
    var list = new LSD.Widget({tag: 'list', document: doc});  
    var item = new LSD.Widget({tag: 'item', attributes: {id: 'something'}}).inject(list);
    var relation = new LSD.Relation('items', list);
    relation.setOptions({
      expectation: {id: 'something', combinator: ' ', tag: '*'},
      multiple: true
    });
    expect(list.items).toEqual([item]);
  });
  
  it ("should mutate elements and use them as related", function() {
    LSD.Widget.Item = new Class({
      options: {
        tag: 'item'
      }
    })
    var list = new LSD.Widget({tag: 'list', context: 'widget', document: doc});
    var item = new Element('div').inject(list);
    var relation = new LSD.Relation('items', list);
    relation.setOptions({
      mutation: 'div',
      source: 'item',
      selector: 'item',
      multiple: true
    });
    var mutated = item.retrieve('widget');
    expect(mutated).toBeTruthy();
    expect(mutated.role).toEqual(LSD.Widget.Item);
    expect(mutated.source).toEqual('item');
    expect(list.items).toEqual([mutated]);
  });
  
  it ("should respect target option", function() {
    var list = new LSD.Widget({tag: 'list', document: doc});
    var menu = new LSD.Widget({tag: 'menu', document: doc});
    var item = new LSD.Widget({tag: 'item'}).inject(menu);
    list.menu = menu;
    var relation = new LSD.Relation('items', list, {
      selector: 'item',
      multiple: true,
      target: 'menu'
    });
    expect(list.items).toEqual([item])
    var other = new LSD.Widget({tag: 'item'}).inject(menu);
    expect(list.items).toEqual([item, other]);
  });
  
  it ("should set up lazy expectation for known target that is yet not preset", function() {
    var doc = LSD.document || new LSD.Document;
    var body = new LSD.Widget({tag: 'body', pseudos: ['root'], document: doc})
    var list = new LSD.Widget({tag: 'list'});
    var item = new LSD.Widget({tag: 'item'});
    item.inject(body)
    var relation = new LSD.Relation('items', list, {
      selector: 'item',
      multiple: true,
      target: 'root'
    });
    expect(list.items).toEqual([]);
    list.inject(body);
    expect(list.root).toEqual(body)
    expect(list.items).toEqual([item]);
  });
  
  it ("should notify a pseudo element expectations when related widget gets related or unrelated", function() {
    var list = new LSD.Widget({tag: 'list', document: doc});
    var i = 0;
    var item = new LSD.Widget({tag: 'item'}).inject(list);
    expect(list.expectations['::']).toBeUndefined();
    var a = function(item, state) {
      i += (state ? 1 : -1)
    };
    list.watch('::lostson', a);
    expect(i).toEqual(0);
    expect(list.expectations['::'].lostson.length).toEqual(1);
    var relation = new LSD.Relation('lostson', list, {
      selector: 'item'
    });
    expect(i).toEqual(1);
    list.watch('::lostson', function(item, state) {
      i += (state ? 1 : -1)
    });
    expect(list.expectations['::'].lostson.length).toEqual(2);
    expect(i).toEqual(2);
    item.dispose()
    expect(i).toEqual(0);
    list.unwatch('::lostson', a);
    expect(list.expectations['::'].lostson.length).toEqual(1);
  });
  
  it ("should convert callbacks into relation events and fire them", function() {
    var list = new LSD.Widget({tag: 'list', document: doc});
    var item = new LSD.Widget({tag: 'item'})
    list.onFill = function() {
      onFill = true;
      expect(this).toEqual(list);
    };
    var onAdd, onRemove, onFill, onEmpty;
    var relation = new LSD.Relation('items', list, {
      selector: 'item',
      multiple: true,
      callbacks: {
        add: function() {
          onAdd = true;
        },
        remove: function() {
          onRemove = true;
        },
        fill: 'onFill',
        empty: function() {
          onEmpty = true;
        }
      }
    });
    expect(onFill).toBeUndefined();
    expect(onEmpty).toBeUndefined();
    expect(onAdd).toBeUndefined();
    expect(onRemove).toBeUndefined();
    item.inject(list);
    expect(onFill).toBeTruthy();
    expect(onEmpty).toBeUndefined();
    expect(onAdd).toBeTruthy();
    expect(onRemove).toBeUndefined();
    item.dispose();
    expect(onEmpty).toBeTruthy();
    expect(onRemove).toBeTruthy();
  });
  
  it ("should be able to aggregate associations using through option", function() {
    var grid = new LSD.Widget({tag: 'grid', document: doc});
    var list = new LSD.Widget({tag: 'list', document: doc}).inject(grid);
    var item1 = new LSD.Widget({tag: 'item'}).inject(list);
    var menu = new LSD.Widget({tag: 'menu', document: doc}).inject(grid);
    var item2 = new LSD.Widget({tag: 'item'}).inject(menu);
    var lister = new LSD.Relation('items', list, {
      selector: 'item',
      multiple: true
    });
    var menuer = new LSD.Relation('items', menu, {
      selector: 'item',
      multiple: true
    });
    var gridlists = new LSD.Relation('lists', grid, {
      selector: 'list, menu',
      multiple: true
    })
    var grider = new LSD.Relation('itemz', grid, {
      through: 'lists',
      as: 'items',
      multiple: true
    })
    expect(grid.getElements('::lists::items').length).toEqual(2)
    expect(list.items).toEqual([item1]);
    expect(menu.items).toEqual([item2]);
    expect(grid.lists).toEqual([list, menu]);
    expect(grid.itemz).toEqual([item1, item2]);
    menu.dispose();
    expect(grid.itemz).toEqual([item1]);
    list.dispose();
    expect(grid.itemz).toEqual([]);
    menu.inject(grid);
    expect(grid.itemz).toEqual([item2]);
  })
  
  it ("should define nested ad-hoc relations", function() {
    var grid = new LSD.Widget({
      tag: 'grid', 
      document: doc, 
      relations: {
        list: {
          selector: 'list',
          relations: {
            items: {
              selector: 'item'
            }
          }
        }
      }
    });
    var list = new LSD.Widget({tag: 'list', document: doc}).inject(grid);
    var item1 = new LSD.Widget({tag: 'item'}).inject(list);
    expect(grid.list.items).toEqual(item1);
    list.dispose();
    expect(grid.list).toBeUndefined();
    expect(list.items).toBeUndefined();
    expect(list.relations['items']).toBeUndefined()
  });
  
  it ("should define nested ad-hoc relations using has option", function() {
    var grid = new LSD.Widget({
      tag: 'grid', 
      document: doc, 
      has: {
        many: {
          items: {
            through: 'list'
          }
        },
        one: {
          list: {
            selector: 'list',
            has: {
              many: {
                items: {
                  selector: 'item'
                }
              }
            }
          }
        }
      }
    });
    var list = new LSD.Widget({tag: 'list', document: doc}).inject(grid);
    var item1 = new LSD.Widget({tag: 'item'}).inject(list);
    var item2 = new LSD.Widget({tag: 'item'}).inject(list);
    expect(grid.list.items).toEqual([item1, item2]);
    expect(grid.items).toEqual(grid.list.items);
    list.dispose();
    expect(grid.items).toEqual([])
    expect(grid.list).toBeUndefined()
  }); 
  
  it ("should re-watch the widget when relation is updated with the new selector", function() {
    var grid = new LSD.Widget({
      tag: 'grid', 
      document: doc, 
      has: {
        many: {
          items: {
            through: 'list'
          }
        },
        one: {
          list: {
            selector: 'list',
            has: {
              many: {
                items: {
                  selector: 'item'
                }
              }
            }
          }
        }
      }
    });
    var list = new LSD.Widget({tag: 'list', document: doc}).inject(grid);
    var item = new LSD.Widget({tag: 'item'}).inject(list);
    var option = new LSD.Widget({tag: 'option'}).inject(list);
    expect(list.items).toEqual([item]);
    expect(grid.items).toEqual([item]);
    list.addRelation('items', {selector: 'option'})
    expect(list.items).toEqual([option]);
    expect(grid.items).toEqual([option]);
  });
  
  it ("should define a dependent relation when scope option is passed", function() {
    var added = 0, removed = 0;
    var list = new LSD.Widget({
      tag: 'list', 
      document: doc,
      has: {
        many: {
          items: {
            selector: 'item',
            scopes: {
              checked: {
                filter: ':checked'
              },
              disabled: {
                filter: ':disabled',
                callbacks: {
                  add: function(widget) {
                    expect(this.tagName).toEqual('list');
                    expect(widget.tagName).toEqual('item');
                    added++;
                  },
                  remove: function(widget) {
                    expect(this.tagName).toEqual('list');
                    expect(widget.tagName).toEqual('item');
                    removed++
                  }
                }
              }
            }
          }
        }
      }
    });
    var a = new LSD.Widget({tag: 'item'}).inject(list);
    var b = new LSD.Widget({tag: 'item'}).inject(list).addPseudo('checked');
    var c = new LSD.Widget({tag: 'item'}).inject(list);
    expect(added).toEqual(0);
    expect(list.items).toEqual([a, b, c]);
    expect(list.disabledItems).toEqual([]);
    expect(list.checkedItems).toEqual([b]);
    b.disable();
    expect(added).toEqual(1);
    expect(list.disabledItems).toEqual([b]);
    c.disable()
    expect(added).toEqual(2);
    expect(list.disabledItems).toEqual([b, c]);
    b.enable();
    expect(removed).toEqual(1);
    expect(list.disabledItems).toEqual([c]);
    b.enable();
    expect(removed).toEqual(1);
    c.disable();
    expect(list.disabledItems).toEqual([c]);
    a.disable();
    b.dispose();
    expect(list.items).toEqual([a, c])
    expect(list.checkedItems).toEqual([]);
    expect(list.disabledItems).toEqual([c, a]);
  });
  
  
  it ("should define a dependent relation when scope on already initialized relation just fine", function() {
    var list = new LSD.Widget({
      tag: 'list', 
      document: doc
    });
    var a = new LSD.Widget({tag: 'item'}).inject(list);
    var b = new LSD.Widget({tag: 'item'}).inject(list).addPseudo('checked');
    var c = new LSD.Widget({tag: 'item'}).inject(list);
    
    new LSD.Relation('items', list, {
      selector: 'item',
      scopes: {
        checked: {
          filter: ':checked'
        },
        disabled: {
          filter: ':disabled'
        }
      },
      multiple: true
    });
    
    
    expect(list.items).toEqual([a, b, c]);
    expect(list.disabledItems).toEqual([]);
    expect(list.checkedItems).toEqual([b]);
    b.disable();
    expect(list.disabledItems).toEqual([b]);
    c.disable()
    expect(list.disabledItems).toEqual([b, c]);
    b.enable();
    expect(list.disabledItems).toEqual([c]);
    b.enable();
    c.disable();
    expect(list.disabledItems).toEqual([c]);
    a.disable();
    b.dispose();
    expect(list.items).toEqual([a, c])
    expect(list.checkedItems).toEqual([]);
    expect(list.disabledItems).toEqual([c, a]);
  });
})