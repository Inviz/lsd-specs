LSD.Factory = function(type) {
  type = LSD.toClassName(type);
  var factory = LSD.Factory[type] || LSD.Factory.Widget[type];
  if (!factory) throw "Unknown factory: " + type;
  return factory.apply(this, Array.prototype.slice.call(arguments, 1))
};

LSD.Factory.Options = {};
LSD.Factory.Class = function(options) {
  return new Class({options: options})
};
LSD.Factory.Widget = function(options, element) {
  return new LSD.Widget(options, element)
};

LSD.Factory.Document = function(fresh) {
  if (LSD.Factory.document && !fresh) return LSD.Factory.document
  if (LSD.Factory.document && fresh) return new LSD.Document(false);
  return (LSD.Factory.document = new LSD.Document(false));
};

LSD.Factory.Type = function() {
  var type = new LSD.Type;
  for (var i = 0, j = arguments.length; i < j; i++)
    type[LSD.toClassName(arguments[i])] = LSD.Factory.Class[LSD.toClassName(arguments[i])]();
  return type;
};

LSD.Factory.Options = {
  root: function() {
    return {
      pseudos: ['root'],
      document: Factory('document'),
      context: Factory('type')
    }
  },
  
  input: function() {
    return {
      pseudos: ['value', 'form-associated', 'command']
    }
  },
  
  form: function() {
    return {
      pseudos: ['form', 'fieldset']
    }
  },
  
  button: function() {
    return {
      pseudos: ['clickable', 'command']
    }
  },

  checkbox: function() {
    return {
      pseudos: ['value', 'form-associated', 'checkbox']
    }
  },

  radio: function() {
    return {
      pseudos: ['value', 'form-associated', 'radio']
    }
  },
  
  list: function() {
    return {
      pseudos: ['list']
    }
  },
  
  item: function() {
    return {
      pseudos: ['item']
    }
  }
}

Object.each(LSD.Factory.Options, function(value, key) {
  key = LSD.toClassName(key);
  LSD.Factory.Widget[key] = function(options, element) {
    if (options && options.nodeType) options = [element, element = options][0];
    return LSD.Factory.Widget(Object.merge(value.call ? value() : value, options), element);
  }
  LSD.Factory.Class[key] = function(options) {
    return LSD.Factory.Class(Object.merge(value.call ? value() : value, options));
  }
});

if (typeof jasmine != "undefined")
  Factory = LSD.Factory;