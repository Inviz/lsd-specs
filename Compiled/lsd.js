/*
---

name: Core

description: The heart of MooTools.

license: MIT-style license.

copyright: Copyright (c) 2006-2010 [Valerio Proietti](http://mad4milk.net/).

authors: The MooTools production team (http://mootools.net/developers/)

inspiration:
  - Class implementation inspired by [Base.js](http://dean.edwards.name/weblog/2006/03/base/) Copyright (c) 2006 Dean Edwards, [GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)
  - Some functionality inspired by [Prototype.js](http://prototypejs.org) Copyright (c) 2005-2007 Sam Stephenson, [MIT License](http://opensource.org/licenses/mit-license.php)

provides: [Core, MooTools, Type, typeOf, instanceOf, Native]

...
*/

(function(){

this.MooTools = {
	version: '1.3.3dev',
	build: '%build%'
};

// typeOf, instanceOf

var typeOf = this.typeOf = function(item){
	if (item == null) return 'null';
	if (item.$family) return item.$family();

	if (item.nodeName){
		if (item.nodeType == 1) return 'element';
		if (item.nodeType == 3) return (/\S/).test(item.nodeValue) ? 'textnode' : 'whitespace';
	} else if (typeof item.length == 'number'){
		if (item.callee) return 'arguments';
		if ('item' in item) return 'collection';
	}

	return typeof item;
};

var instanceOf = this.instanceOf = function(item, object){
	if (item == null) return false;
	var constructor = item.$constructor || item.constructor;
	while (constructor){
		if (constructor === object) return true;
		constructor = constructor.parent;
	}
	return item instanceof object;
};

// Function overloading

var Function = this.Function;

var enumerables = true;
for (var i in {toString: 1}) enumerables = null;
if (enumerables) enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'constructor'];

Function.prototype.overloadSetter = function(usePlural){
	var self = this;
	return function(a, b){
		if (a == null) return this;
		if (usePlural || typeof a != 'string'){
			for (var k in a) self.call(this, k, a[k]);
			if (enumerables) for (var i = enumerables.length; i--;){
				k = enumerables[i];
				if (a.hasOwnProperty(k)) self.call(this, k, a[k]);
			}
		} else {
			self.call(this, a, b);
		}
		return this;
	};
};

Function.prototype.overloadGetter = function(usePlural){
	var self = this;
	return function(a){
		var args, result;
		if (usePlural || typeof a != 'string') args = a;
		else if (arguments.length > 1) args = arguments;
		if (args){
			result = {};
			for (var i = 0; i < args.length; i++) result[args[i]] = self.call(this, args[i]);
		} else {
			result = self.call(this, a);
		}
		return result;
	};
};

Function.prototype.extend = function(key, value){
	this[key] = value;
}.overloadSetter();

Function.prototype.implement = function(key, value){
	this.prototype[key] = value;
}.overloadSetter();

// From

var slice = Array.prototype.slice;

Function.from = function(item){
	return (typeOf(item) == 'function') ? item : function(){
		return item;
	};
};

Array.from = function(item){
	if (item == null) return [];
	return (Type.isEnumerable(item) && typeof item != 'string') ? (typeOf(item) == 'array') ? item : slice.call(item) : [item];
};

Number.from = function(item){
	var number = parseFloat(item);
	return isFinite(number) ? number : null;
};

String.from = function(item){
	return item + '';
};

// hide, protect

Function.implement({

	hide: function(){
		this.$hidden = true;
		return this;
	},

	protect: function(){
		this.$protected = true;
		return this;
	}

});

// Type

var Type = this.Type = function(name, object){
	if (name){
		var lower = name.toLowerCase();
		var typeCheck = function(item){
			return (typeOf(item) == lower);
		};

		Type['is' + name] = typeCheck;
		if (object != null){
			object.prototype.$family = (function(){
				return lower;
			}).hide();
			//<1.2compat>
			object.type = typeCheck;
			//</1.2compat>
		}
	}

	if (object == null) return null;

	object.extend(this);
	object.$constructor = Type;
	object.prototype.$constructor = object;

	return object;
};

var toString = Object.prototype.toString;

Type.isEnumerable = function(item){
	return (item != null && typeof item.length == 'number' && toString.call(item) != '[object Function]' );
};

var hooks = {};

var hooksOf = function(object){
	var type = typeOf(object.prototype);
	return hooks[type] || (hooks[type] = []);
};

var implement = function(name, method){
	if (method && method.$hidden) return;

	var hooks = hooksOf(this);

	for (var i = 0; i < hooks.length; i++){
		var hook = hooks[i];
		if (typeOf(hook) == 'type') implement.call(hook, name, method);
		else hook.call(this, name, method);
	}
	
	var previous = this.prototype[name];
	if (previous == null || !previous.$protected) this.prototype[name] = method;

	if (this[name] == null && typeOf(method) == 'function') extend.call(this, name, function(item){
		return method.apply(item, slice.call(arguments, 1));
	});
};

var extend = function(name, method){
	if (method && method.$hidden) return;
	var previous = this[name];
	if (previous == null || !previous.$protected) this[name] = method;
};

Type.implement({

	implement: implement.overloadSetter(),

	extend: extend.overloadSetter(),

	alias: function(name, existing){
		implement.call(this, name, this.prototype[existing]);
	}.overloadSetter(),

	mirror: function(hook){
		hooksOf(this).push(hook);
		return this;
	}

});

new Type('Type', Type);

// Default Types

var force = function(name, object, methods){
	var isType = (object != Object),
		prototype = object.prototype;

	if (isType) object = new Type(name, object);

	for (var i = 0, l = methods.length; i < l; i++){
		var key = methods[i],
			generic = object[key],
			proto = prototype[key];

		if (generic) generic.protect();

		if (isType && proto){
			delete prototype[key];
			prototype[key] = proto.protect();
		}
	}

	if (isType) object.implement(prototype);

	return force;
};

force('String', String, [
	'charAt', 'charCodeAt', 'concat', 'indexOf', 'lastIndexOf', 'match', 'quote', 'replace', 'search',
	'slice', 'split', 'substr', 'substring', 'toLowerCase', 'toUpperCase'
])('Array', Array, [
	'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift', 'concat', 'join', 'slice',
	'indexOf', 'lastIndexOf', 'filter', 'forEach', 'every', 'map', 'some', 'reduce', 'reduceRight'
])('Number', Number, [
	'toExponential', 'toFixed', 'toLocaleString', 'toPrecision'
])('Function', Function, [
	'apply', 'call', 'bind'
])('RegExp', RegExp, [
	'exec', 'test'
])('Object', Object, [
	'create', 'defineProperty', 'defineProperties', 'keys',
	'getPrototypeOf', 'getOwnPropertyDescriptor', 'getOwnPropertyNames',
	'preventExtensions', 'isExtensible', 'seal', 'isSealed', 'freeze', 'isFrozen'
])('Date', Date, ['now']);

Object.extend = extend.overloadSetter();

Date.extend('now', function(){
	return +(new Date);
});

new Type('Boolean', Boolean);

// fixes NaN returning as Number

Number.prototype.$family = function(){
	return isFinite(this) ? 'number' : 'null';
}.hide();

// Number.random

Number.extend('random', function(min, max){
	return Math.floor(Math.random() * (max - min + 1) + min);
});

// forEach, each

var hasOwnProperty = Object.prototype.hasOwnProperty;
Object.extend('forEach', function(object, fn, bind){
	for (var key in object){
		if (hasOwnProperty.call(object, key)) fn.call(bind, object[key], key, object);
	}
});

Object.each = Object.forEach;

Array.implement({

	forEach: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if (i in this) fn.call(bind, this[i], i, this);
		}
	},

	each: function(fn, bind){
		Array.forEach(this, fn, bind);
		return this;
	}

});

// Array & Object cloning, Object merging and appending

var cloneOf = function(item){
	switch (typeOf(item)){
		case 'array': return item.clone();
		case 'object': return Object.clone(item);
		default: return item;
	}
};

Array.implement('clone', function(){
	var i = this.length, clone = new Array(i);
	while (i--) clone[i] = cloneOf(this[i]);
	return clone;
});

var mergeOne = function(source, key, current){
	switch (typeOf(current)){
		case 'object':
			if (typeOf(source[key]) == 'object') Object.merge(source[key], current);
			else source[key] = Object.clone(current);
		break;
		case 'array': source[key] = current.clone(); break;
		default: source[key] = current;
	}
	return source;
};

Object.extend({

	merge: function(source, k, v){
		if (typeOf(k) == 'string') return mergeOne(source, k, v);
		for (var i = 1, l = arguments.length; i < l; i++){
			var object = arguments[i];
			for (var key in object) mergeOne(source, key, object[key]);
		}
		return source;
	},

	clone: function(object){
		var clone = {};
		for (var key in object) clone[key] = cloneOf(object[key]);
		return clone;
	},

	append: function(original){
		for (var i = 1, l = arguments.length; i < l; i++){
			var extended = arguments[i] || {};
			for (var key in extended) original[key] = extended[key];
		}
		return original;
	}

});

// Object-less types

['Object', 'WhiteSpace', 'TextNode', 'Collection', 'Arguments'].each(function(name){
	new Type(name);
});

// Unique ID

var UID = Date.now();

String.extend('uniqueID', function(){
	return (UID++).toString(36);
});

//<1.2compat>

var Hash = this.Hash = new Type('Hash', function(object){
	if (typeOf(object) == 'hash') object = Object.clone(object.getClean());
	for (var key in object) this[key] = object[key];
	return this;
});

Hash.implement({

	forEach: function(fn, bind){
		Object.forEach(this, fn, bind);
	},

	getClean: function(){
		var clean = {};
		for (var key in this){
			if (this.hasOwnProperty(key)) clean[key] = this[key];
		}
		return clean;
	},

	getLength: function(){
		var length = 0;
		for (var key in this){
			if (this.hasOwnProperty(key)) length++;
		}
		return length;
	}

});

Hash.alias('each', 'forEach');

Object.type = Type.isObject;

var Native = this.Native = function(properties){
	return new Type(properties.name, properties.initialize);
};

Native.type = Type.type;

Native.implement = function(objects, methods){
	for (var i = 0; i < objects.length; i++) objects[i].implement(methods);
	return Native;
};

var arrayType = Array.type;
Array.type = function(item){
	return instanceOf(item, Array) || arrayType(item);
};

this.$A = function(item){
	return Array.from(item).slice();
};

this.$arguments = function(i){
	return function(){
		return arguments[i];
	};
};

this.$chk = function(obj){
	return !!(obj || obj === 0);
};

this.$clear = function(timer){
	clearTimeout(timer);
	clearInterval(timer);
	return null;
};

this.$defined = function(obj){
	return (obj != null);
};

this.$each = function(iterable, fn, bind){
	var type = typeOf(iterable);
	((type == 'arguments' || type == 'collection' || type == 'array' || type == 'elements') ? Array : Object).each(iterable, fn, bind);
};

this.$empty = function(){};

this.$extend = function(original, extended){
	return Object.append(original, extended);
};

this.$H = function(object){
	return new Hash(object);
};

this.$merge = function(){
	var args = Array.slice(arguments);
	args.unshift({});
	return Object.merge.apply(null, args);
};

this.$lambda = Function.from;
this.$mixin = Object.merge;
this.$random = Number.random;
this.$splat = Array.from;
this.$time = Date.now;

this.$type = function(object){
	var type = typeOf(object);
	if (type == 'elements') return 'array';
	return (type == 'null') ? false : type;
};

this.$unlink = function(object){
	switch (typeOf(object)){
		case 'object': return Object.clone(object);
		case 'array': return Array.clone(object);
		case 'hash': return new Hash(object);
		default: return object;
	}
};

//</1.2compat>

})();

/*
---

name: Core

description: The heart of MooTools.

license: MIT-style license.

copyright: Copyright (c) 2006-2010 [Valerio Proietti](http://mad4milk.net/).

authors: The MooTools production team (http://mootools.net/developers/)

inspiration:
  - Class implementation inspired by [Base.js](http://dean.edwards.name/weblog/2006/03/base/) Copyright (c) 2006 Dean Edwards, [GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)
  - Some functionality inspired by [Prototype.js](http://prototypejs.org) Copyright (c) 2005-2007 Sam Stephenson, [MIT License](http://opensource.org/licenses/mit-license.php)

extends: Core/Core

...
*/

(function(){

var arrayish = Array.prototype.slice;
var stringish = String.prototype.indexOf
var regexpish = RegExp.prototype.exec;
//Speedup 1: Avoid typeOf
var object = {object: 1};
var cloneOf = function(item){
  if (item && typeof(item) == 'object') {
    var family = item.$family && item.$family();
    if (family == 'array' || item.slice == arrayish) return item.clone();
    if (family ? family == 'object' : (!item.indexOf || item.indexOf != stringish) 
      && (!item.exec || item.exec != regexpish)
      && !(item.nodeName && item.nodeType))
      return Object.clone(item);
  }
  return item;
};
Array.implement('clone', function(){
	var i = this.length, clone = this.slice(0), item;
	for (var item; i--;) {
	  item = this[i];
	  if (item && typeof(item) == 'object') {
      var family = item.$family && item.$family();
      if (family == 'array' || item.slice == arrayish) clone[i] = item.clone();
      else if (family ? family == 'object' : (!item.indexOf || item.indexOf != stringish) 
        && (!item.exec || item.exec != regexpish)
        && !(item.nodeName && item.nodeType))
        clone[i] = Object.clone(item);
    }
	}
	return clone;
});

//Speedup 2: Avoid typeOf
var mergeOne = function(source, key, current){
  if (current && typeof(current) == 'object' && current.indexOf != stringish && current.exec != regexpish && !(current.nodeName && current.nodeType) && (!current.$family || current.$family() == 'object')) {
    if (current.slice != arrayish) {
      var target = source[key];
			if (target && typeof(target) == 'object' && current.indexOf != stringish && target.exec != regexpish && target.slice != arrayish) Object.merge(source[key], current);
			else source[key] = Object.clone(current);
    } else source[key] = current.clone();
  } else source[key] = current;
	return source;
};


Object.extend({

  //Speedup 3: Avoid typeOf
	merge: function(source, k, v){
		if (typeof(k) == 'string' || (k && k.indexOf == stringish)) return mergeOne(source, k, v);
		for (var i = 1, l = arguments.length; i < l; i++){
			var object = arguments[i];
			for (var key in object) mergeOne(source, key, object[key]);
		}
		return source;
	},

	clone: function(object){
		var clone = {};
		for (var key in object) clone[key] = cloneOf(object[key]);
		return clone;
	}
});

})();

/*
---

name: Number

description: Contains Number Prototypes like limit, round, times, and ceil.

license: MIT-style license.

requires: Type

provides: Number

...
*/

Number.implement({

	limit: function(min, max){
		return Math.min(max, Math.max(min, this));
	},

	round: function(precision){
		precision = Math.pow(10, precision || 0).toFixed(precision < 0 ? -precision : 0);
		return Math.round(this * precision) / precision;
	},

	times: function(fn, bind){
		for (var i = 0; i < this; i++) fn.call(bind, i, this);
	},

	toFloat: function(){
		return parseFloat(this);
	},

	toInt: function(base){
		return parseInt(this, base || 10);
	}

});

Number.alias('each', 'times');

(function(math){
	var methods = {};
	math.each(function(name){
		if (!Number[name]) methods[name] = function(){
			return Math[name].apply(null, [this].concat(Array.from(arguments)));
		};
	});
	Number.implement(methods);
})(['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor', 'log', 'max', 'min', 'pow', 'sin', 'sqrt', 'tan']);

/*
---

name: Function

description: Contains Function Prototypes like create, bind, pass, and delay.

license: MIT-style license.

requires: Type

provides: Function

...
*/

Function.extend({

	attempt: function(){
		for (var i = 0, l = arguments.length; i < l; i++){
			try {
				return arguments[i]();
			} catch (e){}
		}
		return null;
	}

});

Function.implement({

	attempt: function(args, bind){
		try {
			return this.apply(bind, Array.from(args));
		} catch (e){}
		
		return null;
	},

	/*<!ES5>*/
	bind: function(bind){
		var self = this,
			args = (arguments.length > 1) ? Array.slice(arguments, 1) : null;
		
		return function(){
			if (!args && !arguments.length) return self.call(bind);
			if (args && arguments.length) return self.apply(bind, args.concat(Array.from(arguments)));
			return self.apply(bind, args || arguments);
		};
	},
	/*</!ES5>*/

	pass: function(args, bind){
		var self = this;
		if (args != null) args = Array.from(args);
		return function(){
			return self.apply(bind, args || arguments);
		};
	},

	delay: function(delay, bind, args){
		return setTimeout(this.pass((args == null ? [] : args), bind), delay);
	},

	periodical: function(periodical, bind, args){
		return setInterval(this.pass((args == null ? [] : args), bind), periodical);
	}

});

//<1.2compat>

delete Function.prototype.bind;

Function.implement({

	create: function(options){
		var self = this;
		options = options || {};
		return function(event){
			var args = options.arguments;
			args = (args != null) ? Array.from(args) : Array.slice(arguments, (options.event) ? 1 : 0);
			if (options.event) args = [event || window.event].extend(args);
			var returns = function(){
				return self.apply(options.bind || null, args);
			};
			if (options.delay) return setTimeout(returns, options.delay);
			if (options.periodical) return setInterval(returns, options.periodical);
			if (options.attempt) return Function.attempt(returns);
			return returns();
		};
	},

	bind: function(bind, args){
		var self = this;
		if (args != null) args = Array.from(args);
		return function(){
			return self.apply(bind, args || arguments);
		};
	},

	bindWithEvent: function(bind, args){
		var self = this;
		if (args != null) args = Array.from(args);
		return function(event){
			return self.apply(bind, (args == null) ? arguments : [event].concat(args));
		};
	},

	run: function(args, bind){
		return this.apply(bind, Array.from(args));
	}

});

var $try = Function.attempt;

//</1.2compat>

/*
---

name: String

description: Contains String Prototypes like camelCase, capitalize, test, and toInt.

license: MIT-style license.

requires: Type

provides: String

...
*/

String.implement({

	test: function(regex, params){
		return ((typeOf(regex) == 'regexp') ? regex : new RegExp('' + regex, params)).test(this);
	},

	contains: function(string, separator){
		return (separator) ? (separator + this + separator).indexOf(separator + string + separator) > -1 : this.indexOf(string) > -1;
	},

	trim: function(){
		return this.replace(/^\s+|\s+$/g, '');
	},

	clean: function(){
		return this.replace(/\s+/g, ' ').trim();
	},

	camelCase: function(){
		return this.replace(/-\D/g, function(match){
			return match.charAt(1).toUpperCase();
		});
	},

	hyphenate: function(){
		return this.replace(/[A-Z]/g, function(match){
			return ('-' + match.charAt(0).toLowerCase());
		});
	},

	capitalize: function(){
		return this.replace(/\b[a-z]/g, function(match){
			return match.toUpperCase();
		});
	},

	escapeRegExp: function(){
		return this.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
	},

	toInt: function(base){
		return parseInt(this, base || 10);
	},

	toFloat: function(){
		return parseFloat(this);
	},

	hexToRgb: function(array){
		var hex = this.match(/^#?(\w{1,2})(\w{1,2})(\w{1,2})$/);
		return (hex) ? hex.slice(1).hexToRgb(array) : null;
	},

	rgbToHex: function(array){
		var rgb = this.match(/\d{1,3}/g);
		return (rgb) ? rgb.rgbToHex(array) : null;
	},

	substitute: function(object, regexp){
		return this.replace(regexp || (/\\?\{([^{}]+)\}/g), function(match, name){
			if (match.charAt(0) == '\\') return match.slice(1);
			return (object[name] != null) ? object[name] : '';
		});
	}

});

/*
---

script: String.Inflections.js

name: String Inflections

description: Several methods to convert strings back and forth between "railsish" names.  Helpful when creating JavaScript heavy rails (or similar MVC) apps.

license: MIT-style license.

authors:
  - Ryan Florence

thanks:
  - Rails Inflector (http://api.rubyonrails.org/classes/ActiveSupport/Inflector.html)
  - sporkyy (http://snippets.dzone.com/posts/show/3205)

requires: 
  - Core/String
  - Core/Number

provides: 
  - String.camelize
  - String.classify
  - String.dasherize
  - String.foreign_key
  - String.humanize
  - String.ordinalize
  - String.parameterize
  - String.pluralize
  - String.singularize
  - String.tableize
  - String.titleize
  - String.transliterate
  - String.underscore
  - String.capitalizeFirst
  - String.lowercaseFirst
  - Number.ordinalize

...
*/


;(function(){

var plurals = [
	[/(quiz)$/i,               '$1zes'  ],
	[/^(ox)$/i,                '$1en'   ],
	[/([m|l])ouse$/i,          '$1ice'  ],
	[/(matr|vert|ind)ix|ex$/i, '$1ices' ],
	[/(x|ch|ss|sh)$/i,         '$1es'   ],
	[/([^aeiouy]|qu)y$/i,      '$1ies'  ],
	[/(hive)$/i,               '$1s'    ],
	[/(?:([^f])fe|([lr])f)$/i, '$1$2ves'],
	[/sis$/i,                  'ses'    ],
	[/([ti])um$/i,             '$1a'    ],
	[/(buffal|tomat)o$/i,      '$1oes'  ],
	[/(bu)s$/i,                '$1ses'  ],
	[/(alias|status)$/i,       '$1es'   ],
	[/(octop|vir)us$/i,        '$1i'    ],
	[/(ax|test)is$/i,          '$1es'   ],
	[/s$/i,                    's'      ],
	[/$/,                      's'      ]
]
,singulars = [
	[/(database)s$/i,                                                  '$1'     ],
	[/(quiz)zes$/i,                                                    '$1'     ],
	[/(matr)ices$/i,                                                   '$1ix'   ],
	[/(vert|ind)ices$/i,                                               '$1ex'   ],
	[/^(ox)en/i,                                                       '$1'     ],
	[/(alias|status)es$/i,                                             '$1'     ],
	[/(octop|vir)i$/i,                                                 '$1us'   ],
	[/(cris|ax|test)es$/i,                                             '$1is'   ],
	[/(shoe)s$/i,                                                      '$1'     ],
	[/(o)es$/i,                                                        '$1'     ],
	[/(bus)es$/i,                                                      '$1'     ],
	[/([m|l])ice$/i,                                                   '$1ouse' ],
	[/(x|ch|ss|sh)es$/i,                                               '$1'     ],
	[/(m)ovies$/i,                                                     '$1ovie' ],
	[/(s)eries$/i,                                                     '$1eries'],
	[/([^aeiouy]|qu)ies$/i,                                            '$1y'    ],
	[/([lr])ves$/i,                                                    '$1f'    ],
	[/(tive)s$/i,                                                      '$1'     ],
	[/(hive)s$/i,                                                      '$1'     ],
	[/([^f])ves$/i,                                                    '$1fe'   ],
	[/(^analy)ses$/i,                                                  '$1sis'  ],
	[/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i, '$1$2sis'],
	[/([ti])a$/i,                                                      '$1um'   ],
	[/(n)ews$/i,                                                       '$1ews'  ],
	[/s$/i,                                                            ''       ]
]
,irregulars = [
	['cow',    'kine'    ],
	['move',   'moves'   ],
	['sex',    'sexes'   ],
	['child',  'children'],
	['man',    'men'     ],
	['person', 'people'  ]
]
,uncountables = [
	'sheep',
	'fish',
	'series',
	'species',
	'money',
	'rice',
	'information',
	'equipment',
	'jeans'
];	
	
String.implement({
	
	camelize: function(lower){
		var str = this.replace(/_\D/g, function(match){
			return match.charAt(1).toUpperCase();
		});
		return (lower) ? str : str.capitalize();
	},
	
	classify: function(){
		return this.singularize().camelize();
	},
	
	dasherize: function(){
		return this.replace('_', '-').replace(/ +/, '-');
	},
	
	foreign_key: function(dontUnderScoreId){
		return this.underscore() + (dontUnderScoreId ? 'id' : '_id');
	},
	

	humanize: function(){
		return this.replace(/_id$/, '').replace(/_/gi,' ').capitalizeFirst();
	},
	
	ordinalize: function() {
		var parsed = parseInt(this);
		if (11 <= parsed % 100 && parsed % 100 <= 13) {
			return this + "th";
		} else {
			switch (parsed % 10) {
				case  1: return this + "st";
				case  2: return this + "nd";
				case  3: return this + "rd";
				default: return this + "th";
			}
		}
	},
	
	pluralize: function(count) {
		if (count && parseInt(count) == 1) return this;
		for (var i = 0; i < uncountables.length; i++) {
			var uncountable = uncountables[i];
			if (this.toLowerCase() == uncountable) {
				return uncountable;
			}
		}
		for (var i = 0; i < irregulars.length; i++) {
			var singular = irregulars[i][0];
			var plural   = irregulars[i][1];
			if ((this.toLowerCase() == singular) || (this == plural)) {
				return plural;
			}
		}
		for (var i = 0; i < plurals.length; i++) {
			var regex          = plurals[i][0];
			var replace_string = plurals[i][1];
			if (regex.test(this)) {
				return this.replace(regex, replace_string);
			}
		}
	},
	
	singularize: function() {
		for (var i = 0; i < uncountables.length; i++) {
			var uncountable = uncountables[i];
			if (this.toLowerCase() == uncountable) {
				return uncountable;
			}
		}
		for (var i = 0; i < irregulars.length; i++) {
			var singular = irregulars[i][0];
			var plural   = irregulars[i][1];
			if ((this.toLowerCase() == singular) || (this == plural)) {
				return singular;
			}
		}
		for (var i = 0; i < singulars.length; i++) {
			var regex          = singulars[i][0];
			var replace_string = singulars[i][1];
			if (regex.test(this)) {
				return this.replace(regex, replace_string);
			}
		}
	},
	
	tableize: function(){
		return this.underscore().pluralize();
	},
	
	titleize: function(){
		return this.underscore().humanize().capitalize();
	},
	
	underscore: function(){
		return this.lowercaseFirst().replace('-', '_').replace(/[A-Z]/g, function(match){
			return ('_' + match.charAt(0).toLowerCase());
		});
	},
	
	capitalizeFirst: function(){
		return this.charAt(0).toUpperCase() + this.slice(1);
	},
	
	lowercaseFirst: function(){
		return this.charAt(0).toLowerCase() + this.slice(1);
	}

});

Number.implement({
	ordinalize: function(){
		return this + ''.ordinalize();
	}
});

})();

/*
---

name: Array

description: Contains Array Prototypes like each, contains, and erase.

license: MIT-style license.

requires: Type

provides: Array

...
*/

Array.implement({

	/*<!ES5>*/
	every: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if ((i in this) && !fn.call(bind, this[i], i, this)) return false;
		}
		return true;
	},

	filter: function(fn, bind){
		var results = [];
		for (var i = 0, l = this.length; i < l; i++){
			if ((i in this) && fn.call(bind, this[i], i, this)) results.push(this[i]);
		}
		return results;
	},

	indexOf: function(item, from){
		var len = this.length;
		for (var i = (from < 0) ? Math.max(0, len + from) : from || 0; i < len; i++){
			if (this[i] === item) return i;
		}
		return -1;
	},

	map: function(fn, bind){
		var results = [];
		for (var i = 0, l = this.length; i < l; i++){
			if (i in this) results[i] = fn.call(bind, this[i], i, this);
		}
		return results;
	},

	some: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if ((i in this) && fn.call(bind, this[i], i, this)) return true;
		}
		return false;
	},
	/*</!ES5>*/

	clean: function(){
		return this.filter(function(item){
			return item != null;
		});
	},

	invoke: function(methodName){
		var args = Array.slice(arguments, 1);
		return this.map(function(item){
			return item[methodName].apply(item, args);
		});
	},

	associate: function(keys){
		var obj = {}, length = Math.min(this.length, keys.length);
		for (var i = 0; i < length; i++) obj[keys[i]] = this[i];
		return obj;
	},

	link: function(object){
		var result = {};
		for (var i = 0, l = this.length; i < l; i++){
			for (var key in object){
				if (object[key](this[i])){
					result[key] = this[i];
					delete object[key];
					break;
				}
			}
		}
		return result;
	},

	contains: function(item, from){
		return this.indexOf(item, from) != -1;
	},

	append: function(array){
		this.push.apply(this, array);
		return this;
	},

	getLast: function(){
		return (this.length) ? this[this.length - 1] : null;
	},

	getRandom: function(){
		return (this.length) ? this[Number.random(0, this.length - 1)] : null;
	},

	include: function(item){
		if (!this.contains(item)) this.push(item);
		return this;
	},

	combine: function(array){
		for (var i = 0, l = array.length; i < l; i++) this.include(array[i]);
		return this;
	},

	erase: function(item){
		for (var i = this.length; i--;){
			if (this[i] === item) this.splice(i, 1);
		}
		return this;
	},

	empty: function(){
		this.length = 0;
		return this;
	},

	flatten: function(){
		var array = [];
		for (var i = 0, l = this.length; i < l; i++){
			var type = typeOf(this[i]);
			if (type == 'null') continue;
			array = array.concat((type == 'array' || type == 'collection' || type == 'arguments' || instanceOf(this[i], Array)) ? Array.flatten(this[i]) : this[i]);
		}
		return array;
	},

	pick: function(){
		for (var i = 0, l = this.length; i < l; i++){
			if (this[i] != null) return this[i];
		}
		return null;
	},

	hexToRgb: function(array){
		if (this.length != 3) return null;
		var rgb = this.map(function(value){
			if (value.length == 1) value += value;
			return value.toInt(16);
		});
		return (array) ? rgb : 'rgb(' + rgb + ')';
	},

	rgbToHex: function(array){
		if (this.length < 3) return null;
		if (this.length == 4 && this[3] == 0 && !array) return 'transparent';
		var hex = [];
		for (var i = 0; i < 3; i++){
			var bit = (this[i] - 0).toString(16);
			hex.push((bit.length == 1) ? '0' + bit : bit);
		}
		return (array) ? hex : '#' + hex.join('');
	}

});

//<1.2compat>

Array.alias('extend', 'append');

var $pick = function(){
	return Array.from(arguments).pick();
};

//</1.2compat>

/*
---

name: Browser

description: The Browser Object. Contains Browser initialization, Window and Document, and the Browser Hash.

license: MIT-style license.

requires: [Array, Function, Number, String]

provides: [Browser, Window, Document]

...
*/

(function(){

var document = this.document;
var window = document.window = this;

var UID = 1;

this.$uid = (window.ActiveXObject) ? function(item){
	return (item.uid || (item.uid = [UID++]))[0];
} : function(item){
	return item.uid || (item.uid = UID++);
};

$uid(window);
$uid(document);

var ua = navigator.userAgent.toLowerCase(),
	platform = navigator.platform.toLowerCase(),
	UA = ua.match(/(opera|ie|firefox|chrome|version)[\s\/:]([\w\d\.]+)?.*?(safari|version[\s\/:]([\w\d\.]+)|$)/) || [null, 'unknown', 0],
	mode = UA[1] == 'ie' && document.documentMode;

var Browser = this.Browser = {

	extend: Function.prototype.extend,

	name: (UA[1] == 'version') ? UA[3] : UA[1],

	version: mode || parseFloat((UA[1] == 'opera' && UA[4]) ? UA[4] : UA[2]),

	Platform: {
		name: ua.match(/ip(?:ad|od|hone)/) ? 'ios' : (ua.match(/(?:webos|android)/) || platform.match(/mac|win|linux/) || ['other'])[0]
	},

	Features: {
		xpath: !!(document.evaluate),
		air: !!(window.runtime),
		query: !!(document.querySelector),
		json: !!(window.JSON)
	},

	Plugins: {}

};

Browser[Browser.name] = true;
Browser[Browser.name + parseInt(Browser.version, 10)] = true;
Browser.Platform[Browser.Platform.name] = true;

// Request

Browser.Request = (function(){

	var XMLHTTP = function(){
		return new XMLHttpRequest();
	};

	var MSXML2 = function(){
		return new ActiveXObject('MSXML2.XMLHTTP');
	};

	var MSXML = function(){
		return new ActiveXObject('Microsoft.XMLHTTP');
	};

	return Function.attempt(function(){
		XMLHTTP();
		return XMLHTTP;
	}, function(){
		MSXML2();
		return MSXML2;
	}, function(){
		MSXML();
		return MSXML;
	});

})();

Browser.Features.xhr = !!(Browser.Request);

// Flash detection

var version = (Function.attempt(function(){
	return navigator.plugins['Shockwave Flash'].description;
}, function(){
	return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version');
}) || '0 r0').match(/\d+/g);

Browser.Plugins.Flash = {
	version: Number(version[0] || '0.' + version[1]) || 0,
	build: Number(version[2]) || 0
};

// String scripts

Browser.exec = function(text){
	if (!text) return text;
	if (window.execScript){
		window.execScript(text);
	} else {
		var script = document.createElement('script');
		script.setAttribute('type', 'text/javascript');
		script.text = text;
		document.head.appendChild(script);
		document.head.removeChild(script);
	}
	return text;
};

String.implement('stripScripts', function(exec){
	var scripts = '';
	var text = this.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, function(all, code){
		scripts += code + '\n';
		return '';
	});
	if (exec === true) Browser.exec(scripts);
	else if (typeOf(exec) == 'function') exec(scripts, text);
	return text;
});

// Window, Document

Browser.extend({
	Document: this.Document,
	Window: this.Window,
	Element: this.Element,
	Event: this.Event
});

this.Window = this.$constructor = new Type('Window', function(){});

this.$family = Function.from('window').hide();

Window.mirror(function(name, method){
	window[name] = method;
});

this.Document = document.$constructor = new Type('Document', function(){});

document.$family = Function.from('document').hide();

Document.mirror(function(name, method){
	document[name] = method;
});

document.html = document.documentElement;
if (!document.head) document.head = document.getElementsByTagName('head')[0];

if (document.execCommand) try {
	document.execCommand("BackgroundImageCache", false, true);
} catch (e){}

/*<ltIE9>*/
if (this.attachEvent && !this.addEventListener){
	var unloadEvent = function(){
		this.detachEvent('onunload', unloadEvent);
		document.head = document.html = document.window = null;
	};
	this.attachEvent('onunload', unloadEvent);
}

// IE fails on collections and <select>.options (refers to <select>)
var arrayFrom = Array.from;
try {
	arrayFrom(document.html.childNodes);
} catch(e){
	Array.from = function(item){
		if (typeof item != 'string' && Type.isEnumerable(item) && typeOf(item) != 'array'){
			var i = item.length, array = new Array(i);
			while (i--) array[i] = item[i];
			return array;
		}
		return arrayFrom(item);
	};

	var prototype = Array.prototype,
		slice = prototype.slice;
	['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift', 'concat', 'join', 'slice'].each(function(name){
		var method = prototype[name];
		Array[name] = function(item){
			return method.apply(Array.from(item), slice.call(arguments, 1));
		};
	});
}
/*</ltIE9>*/

//<1.2compat>

if (Browser.Platform.ios) Browser.Platform.ipod = true;

Browser.Engine = {};

var setEngine = function(name, version){
	Browser.Engine.name = name;
	Browser.Engine[name + version] = true;
	Browser.Engine.version = version;
};

if (Browser.ie){
	Browser.Engine.trident = true;

	switch (Browser.version){
		case 6: setEngine('trident', 4); break;
		case 7: setEngine('trident', 5); break;
		case 8: setEngine('trident', 6);
	}
}

if (Browser.firefox){
	Browser.Engine.gecko = true;

	if (Browser.version >= 3) setEngine('gecko', 19);
	else setEngine('gecko', 18);
}

if (Browser.safari || Browser.chrome){
	Browser.Engine.webkit = true;

	switch (Browser.version){
		case 2: setEngine('webkit', 419); break;
		case 3: setEngine('webkit', 420); break;
		case 4: setEngine('webkit', 525);
	}
}

if (Browser.opera){
	Browser.Engine.presto = true;

	if (Browser.version >= 9.6) setEngine('presto', 960);
	else if (Browser.version >= 9.5) setEngine('presto', 950);
	else setEngine('presto', 925);
}

if (Browser.name == 'unknown'){
	switch ((ua.match(/(?:webkit|khtml|gecko)/) || [])[0]){
		case 'webkit':
		case 'khtml':
			Browser.Engine.webkit = true;
		break;
		case 'gecko':
			Browser.Engine.gecko = true;
	}
}

this.$exec = Browser.exec;

//</1.2compat>

})();

/*
---

name: Browser.Features.Touch

description: Checks whether the used Browser has touch events

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Browser]

provides: Browser.Features.Touch

...
*/

if(!Browser.ie){
  Browser.Features.Touch = (function(){
  	try {
  		document.createEvent('TouchEvent').initTouchEvent('touchstart');
  		return true;
  	} catch (exception){}

  	return false;
  })();

  // Chrome 5 thinks it is touchy!
  // Android doesn't have a touch delay and dispatchEvent does not fire the handler
  Browser.Features.iOSTouch = (function(){
  	var name = 'cantouch', // Name does not matter
  		html = document.html,
  		hasTouch = false;

  	var handler = function(){
  		html.removeEventListener(name, handler, true);
  		hasTouch = true;
  	};

  	try {
  		html.addEventListener(name, handler, true);
  		var event = document.createEvent('TouchEvent');
  		event.initTouchEvent(name);
  		html.dispatchEvent(event);
  		return hasTouch;
  	} catch (exception){}

  	handler(); // Remove listener
  	return false;
  })();
};
/*
---

name: Class

description: Contains the Class Function for easily creating, extending, and implementing reusable Classes.

license: MIT-style license.

requires: [Array, String, Function, Number]

provides: Class

...
*/

(function(){

var Class = this.Class = new Type('Class', function(params){
	if (instanceOf(params, Function)) params = {initialize: params};

	var newClass = function(){
		reset(this);
		if (newClass.$prototyping) return this;
		this.$caller = null;
		var value = (this.initialize) ? this.initialize.apply(this, arguments) : this;
		this.$caller = this.caller = null;
		return value;
	}.extend(this).implement(params);

	newClass.$constructor = Class;
	newClass.prototype.$constructor = newClass;
	newClass.prototype.parent = parent;

	return newClass;
});

var parent = function(){
	if (!this.$caller) throw new Error('The method "parent" cannot be called.');
	var name = this.$caller.$name,
		parent = this.$caller.$owner.parent,
		previous = (parent) ? parent.prototype[name] : null;
	if (!previous) throw new Error('The method "' + name + '" has no parent.');
	return previous.apply(this, arguments);
};

var reset = function(object){
	for (var key in object){
		var value = object[key];
		switch (typeOf(value)){
			case 'object':
				var F = function(){};
				F.prototype = value;
				object[key] = reset(new F);
			break;
			case 'array': object[key] = value.clone(); break;
		}
	}
	return object;
};

var wrap = function(self, key, method){
	if (method.$origin) method = method.$origin;
	var wrapper = function(){
		if (method.$protected && this.$caller == null) throw new Error('The method "' + key + '" cannot be called.');
		var caller = this.caller, current = this.$caller;
		this.caller = current; this.$caller = wrapper;
		var result = method.apply(this, arguments);
		this.$caller = current; this.caller = caller;
		return result;
	}.extend({$owner: self, $origin: method, $name: key});
	return wrapper;
};

var implement = function(key, value, retain){
	if (Class.Mutators.hasOwnProperty(key)){
		value = Class.Mutators[key].call(this, value);
		if (value == null) return this;
	}

	if (typeOf(value) == 'function'){
		if (value.$hidden) return this;
		this.prototype[key] = (retain) ? value : wrap(this, key, value);
	} else {
		Object.merge(this.prototype, key, value);
	}

	return this;
};

var getInstance = function(klass){
	klass.$prototyping = true;
	var proto = new klass;
	delete klass.$prototyping;
	return proto;
};

Class.implement('implement', implement.overloadSetter());

Class.Mutators = {

	Extends: function(parent){
		this.parent = parent;
		this.prototype = getInstance(parent);
	},

	Implements: function(items){
		Array.from(items).each(function(item){
			var instance = new item;
			for (var key in instance) implement.call(this, key, instance[key], true);
		}, this);
	}
};

})();

/*
---

name: Class

description: Contains the Class Function for easily creating, extending, and implementing reusable Classes.

license: MIT-style license.

extends: Core/Class


...
*/

(function(){

var Class = this.Class = new Type('Class', function(params){
  if (instanceOf(params, Function)) params = {initialize: params};

  var newClass = function(){
    reset(this);
    if (newClass.$prototyping) return this;
    this.$caller = null;
    var value = (this.initialize) ? this.initialize.apply(this, arguments) : this;
    this.$caller = this.caller = null;
    return value;
  }.extend(this).implement(params);

  newClass.$constructor = Class;
  newClass.prototype.$constructor = newClass;
  newClass.prototype.parent = parent;

  return newClass;
});

var parent = function(){
  if (!this.$caller) throw new Error('The method "parent" cannot be called.');
  var name = this.$caller.$name,
    parent = this.$caller.$owner.parent,
    previous = (parent) ? parent.prototype[name] : null;
  if (!previous) throw new Error('The method "' + name + '" has no parent.');
  return previous.apply(this, arguments);
};


var arrayish = Array.prototype.slice;
var regexpish = RegExp.prototype.exec;
//Speedup1: Avoid typeOf in reset

// before: 
// switch (typeOf(value)){
//  case 'object':
//  case 'array':

// after:
var F = function(){};
var reset = function(object){
  for (var key in object){
    var value = object[key];
    if (value && typeof(value) == 'object' && value.exec != regexpish) {
      var family = value.$family && value.$family();
      if (family === 'array' || value.slice == arrayish) {
        object[key] = value.clone();
      } else if (!family || family == 'object'){
        F.prototype = value; 
        object[key] = reset(new F);
      }
    }
  }
  return object;
};

var wrap = function(self, key, method){
  if (method.$origin) method = method.$origin;
  var wrapper = function(){
    if (method.$protected && this.$caller == null) throw new Error('The method "' + key + '" cannot be called.');
    var caller = this.caller, current = this.$caller;
    this.caller = current; this.$caller = wrapper;
    var result = method.apply(this, arguments);
    this.$caller = current; this.caller = caller;
    return result;
  }.extend({$owner: self, $origin: method, $name: key});
  return wrapper;
};

//Speedup 2: Avoid typeOf in implement
var apply = Function.prototype.apply
var implement = function(key, value, retain){
  if (Class.Mutators.hasOwnProperty(key)){
    value = Class.Mutators[key].call(this, value);
    if (value == null) return this;
  }

  if (value && value.call && (value.apply == apply)){
    if (value.$hidden) return this;
    this.prototype[key] = (retain) ? value : wrap(this, key, value);
  } else {
    Object.merge(this.prototype, key, value);
  }

  return this;
};

var getInstance = function(klass){
  klass.$prototyping = true;
  var proto = new klass;
  delete klass.$prototyping;
  return proto;
};

Class.implement('implement', implement.overloadSetter());

Class.Mutators = {

  Extends: function(parent){
    this.parent = parent;
    this.prototype = getInstance(parent);
  },

  Implements: function(items){
    Array.from(items).each(function(item){
      var instance = new item;
      for (var key in instance) implement.call(this, key, instance[key], true);
    }, this);
  }
};

})();

/*
---
 
script: Object.Array.js
 
description: Array with fast lookup (based on object)
 
license: MIT-style license.
 
requires:
- Core/Class
 
provides: [Object.Array]
 
...
*/

Object.Array = function() {
  this.push.apply(this, arguments);
}

Array.fast = Array.object = function() {
  var object = {};
  for (var i = 0, arg; arg = arguments[i++];) object[arg] = true;
  return object;
};
Object.Array.prototype = {
  push: function() {
    for (var i = 0, j = arguments.length; i < j; i++)
      this[arguments[i]] = true;
  },

  contains: function(argument) {
    return this[argument];
  },
  
  concat: function(array) {
    if ('length' in array) this.push.apply(this, array);
    else for (var key in array) if (array.hasOwnProperty(key)) this[key] = true;
    return this;
  },
  
  each: function(callback, bound) {
    for (var key in this) {
      if (this.hasOwnProperty(key)) callback.call(bound || this, key, this[key]);
    }
  },

  include: function(value, value) {
    this[value] = true;
  },

  erase: function(value) {
    delete this[value];
  },
  
  join: function(delimeter) {
    var bits = [];
    for (var key in this) if (this.hasOwnProperty(key)) bits.push(key);
    return bits.join(delimeter)
  },
  
  toObject: function() {
    var object = {};
    for (var key in this) if (this.hasOwnProperty(key)) object[key] = this[key];
    return object;
  }
};
/*
---
 
script: Class.Mixin.js
 
description: Classes that can be mixed in and out in runtime.
 
license: MIT-style license.
 
requires:
  - Core/Class

provides: 
  - Class.Mutators.Mixins
  - Class.mixin
  - Class.unmix
 
...
*/

Class.mixin = function(instance, klass, light) {
  var proto = klass.prototype;
  for (var name in proto) !function(value) {
    if (typeof value !== 'function') return;
    switch (name) {
      case "parent": case "initialize": case "uninitialize": case "$constructor":
        return;
    }
    value = value.$origin;
    var origin = instance[name], parent, wrap;
    if (origin) {
      if (light) return;
      if (origin.$mixes) return origin.$mixes.push(value);
      parent = origin.$owner;
      wrap = origin;
      origin = origin.$origin;
    };
    var wrapper = instance[name] = function() {
      var stack = wrapper.$stack;
      if (!stack) stack = wrapper.$stack = Array.prototype.slice.call(wrapper.$mixes, 0);
      var mix = stack.pop();
      wrapper.$owner = {parent: mix ? instance.$constructor : parent}
      if (!mix && !(mix = origin)) return;
      var caller = this.caller, current = this.$caller;
      this.caller = current; this.$caller = wrapper;
      var result = (mix || origin).apply(this, arguments);
      this.$caller = current; this.caller = caller;
      delete wrapper.$stack;
      return result;
    }
    wrapper.$mixes = [value];
    wrapper.$origin = origin;
    wrapper.$name = name;
  }(proto[name]);
  if (proto.initialize) {
    var parent = instance.parent; instance.parent = function(){};
    proto.initialize.call(instance, instance);
    instance.parent = parent;
  }
};

Class.unmix = function(instance, klass, light) {
  var proto = klass.prototype;
  for (var name in proto) !function(value) {
    if (typeof value !== 'function') return;
    var remixed = instance[name]
    if (remixed && remixed.$mixes) {
      if (light) return;
      remixed.$mixes.erase(value.$origin);
      if (!remixed.$mixes.length) {
        if (remixed.$origin) instance[name] = remixed.$origin;
        else delete instance[name];
      }
    }
  }(proto[name]);
  if (proto.uninitialize) {
    var parent = instance.parent; instance.parent = function(){};
    proto.uninitialize.call(instance, instance);
    instance.parent = parent;
  }
};

Class.implement('mixin', function(klass) {
  Class.mixin(this, klass)
});

Class.implement('unmix', function(klass) {
  Class.unmix(this, klass)
});
/*
---

name: Class.Extras

description: Contains Utility Classes that can be implemented into your own Classes to ease the execution of many common tasks.

license: MIT-style license.

requires: Class

provides: [Class.Extras, Chain, Events, Options]

...
*/

(function(){

this.Chain = new Class({

	$chain: [],

	chain: function(){
		this.$chain.append(Array.flatten(arguments));
		return this;
	},

	callChain: function(){
		return (this.$chain.length) ? this.$chain.shift().apply(this, arguments) : false;
	},

	clearChain: function(){
		this.$chain.empty();
		return this;
	}

});

var removeOn = function(string){
	return string.replace(/^on([A-Z])/, function(full, first){
		return first.toLowerCase();
	});
};

this.Events = new Class({

	$events: {},

	addEvent: function(type, fn, internal){
		type = removeOn(type);

		/*<1.2compat>*/
		if (fn == $empty) return this;
		/*</1.2compat>*/

		this.$events[type] = (this.$events[type] || []).include(fn);
		if (internal) fn.internal = true;
		return this;
	},

	addEvents: function(events){
		for (var type in events) this.addEvent(type, events[type]);
		return this;
	},

	fireEvent: function(type, args, delay){
		type = removeOn(type);
		var events = this.$events[type];
		if (!events) return this;
		args = Array.from(args);
		events.each(function(fn){
			if (delay) fn.delay(delay, this, args);
			else fn.apply(this, args);
		}, this);
		return this;
	},
	
	removeEvent: function(type, fn){
		type = removeOn(type);
		var events = this.$events[type];
		if (events && !fn.internal){
			var index =  events.indexOf(fn);
			if (index != -1) delete events[index];
		}
		return this;
	},

	removeEvents: function(events){
		var type;
		if (typeOf(events) == 'object'){
			for (type in events) this.removeEvent(type, events[type]);
			return this;
		}
		if (events) events = removeOn(events);
		for (type in this.$events){
			if (events && events != type) continue;
			var fns = this.$events[type];
			for (var i = fns.length; i--;) if (i in fns){
				this.removeEvent(type, fns[i]);
			}
		}
		return this;
	}

});

this.Options = new Class({

	setOptions: function(){
		var options = this.options = Object.merge.apply(null, [{}, this.options].append(arguments));
		if (this.addEvent) for (var option in options){
			if (typeOf(options[option]) != 'function' || !(/^on[A-Z]/).test(option)) continue;
			this.addEvent(option, options[option]);
			delete options[option];
		}
		return this;
	}

});

})();

/*
---

name: Class.Extras

description: Contains Utility Classes that can be implemented into your own Classes to ease the execution of many common tasks.

license: MIT-style license.

requires: Class

extends: Core/Class.Extras
...
*/

/*
---
 
script: Class.Shortcuts.js
 
description: A mixin that adds and fiews keyboard shortcuts as events on object.
 
license: MIT-style license.
 
requires:
  - Core/Options
  - Core/Events
  - Core/Class
  - Core/Class.Extras
  - Core/Browser

provides: 
  - Shortcuts
 
...
*/


!function() {
  var parsed = {};
  var modifiers = ['shift', 'control', 'alt', 'meta'];
  var aliases = {
    'ctrl': 'control',
    'command': Browser.Platform.mac ? 'meta': 'control',
    'cmd': Browser.Platform.mac ? 'meta': 'control'
  };
  var presets = {
    'next': ['right', 'down'],
    'previous': ['left', 'up'],
    'ok': ['enter', 'space'],
    'cancel': ['esc']
  };

  var parse = function(expression){
    if (presets[expression]) expression = presets[expression];
    return (expression.push ? expression : [expression]).map(function(type) {
      if (!parsed[type]){
        var bits = [], mods = {}, string, event;
        if (type.contains(':')) {
          string = type.split(':');
          event = string[0];
          string = string[1];
        } else {  
          string = type;
          event = 'keypress';
        }
        string.split('+').each(function(part){
          if (aliases[part]) part = aliases[part];
          if (modifiers.contains(part)) mods[part] = true;
          else bits.push(part);
        });

        modifiers.each(function(mod){
          if (mods[mod]) bits.unshift(mod);
        });

        parsed[type] = event + ':' + bits.join('+');
      }
      return parsed[type];
    });
  };
  
  Shortcuts = new Class({
    
    addShortcut: function(shortcut, fn) {
      var shortcuts = this.shortcuts;
      if (!shortcuts) this.shortcuts = shortcuts = {}
      var group = shortcuts[shortcut];
      if (!group) shortcuts[shortcut] = group = []
      group.push(fn);
      if (this.shortcutting) 
        for (var i = 0, parsed = parse(shortcut), event; event = parsed[i++];)
          this.addEvent(event, fn)
    },
    
    removeShortcut: function(shortcut, fn) {
      var shortcuts = this.shortcuts;
      if (!shortcuts) return;
      var group = shortcuts[shortcut];
      if (!group) return;
      group.push(fn);
      if (this.shortcutting) 
        for (var i = 0, parsed = parse(shortcut), event; event = parsed[i++];)
          this.removeEvent(event, fn)
    },
    
    getKeyListener: function() {
      return this.element;
    },

    enableShortcuts: function() {
      if (!this.shortcutter) {
        this.shortcutter = function(event) {
          var bits = [event.key];
          modifiers.each(function(mod){
            if (event[mod]) bits.unshift(mod);
          });
          this.fireEvent(event.type + ':' + bits.join('+'), arguments)
        }.bind(this)
      }
      if (this.shortcutting) return;
      this.shortcutting = true;
      this.getKeyListener().addEvent('keypress', this.shortcutter);
      for (var name in this.shortcuts)
        for (var i = 0, parsed = parse(name), group = this.shortcuts[name], event; event = parsed[i++];)
          for (var j = 0, fn; fn = group[j++];) this.addEvent(event, fn);
    },

    disableShortcuts: function() {
      if (!this.shortcutting) return;
      this.shortcutting = false;
      this.getKeyListener().removeEvent('keypress', this.shortcutter);
      for (var name in this.shortcuts)
        for (var i = 0, parsed = parse(name), group = this.shortcuts[name], event; event = parsed[i++];)
          for (var j = 0, fn; fn = group[j++];) this.removeEvent(event, fn);
    }
  });
  
}();

/*
---
 
script: Class.States.js
 
description: A mutator that adds some basic state definition capabilities.
 
license: MIT-style license.
 
requires:
  - Core/Options
  - Core/Events
  - Core/Class
  - Core/Class.Extras

provides: 
  - States
 
...
*/


var States = new Class({
  addStates: function(states) {
    for (var i = 0, j = arguments.length, arg; i < j; i++) {
      arg = arguments[i];
      if (arg.indexOf) this.addState(arg);
      else for (var name in arg) this.addState(name, arg[name]);
    }
  },
  
  removeStates: function(states) {
    for (var i = 0, j = arguments.length, arg; i < j; i++) {
      arg = arguments[i];
      if (arg.indexOf) this.removeState(arg);
      else for (var name in arg) this.removeState(name, arg[name]);
    }
  },
  
  addState: function(name, state) {
    if (!state || state === true) state = States.get(name);
    if (!this.$states) this.$states = {};
    if (this.$states[name]) return;
    this.$states[name] = state;
    var enabler = this[state.enabler], disabler = this[state.disabler], toggler = this[state.toggler];
    this[state.enabler] = function() {
      return this.setStateTo(name, true, state, arguments, enabler)
    }
    this[state.disabler] = function() {
      return this.setStateTo(name, false, state, arguments, disabler)
    }
    this[state.toggler] = function() { 
      return this.setStateTo(name, !this[state && state.property || name], state, arguments, toggler)
    }
    if (state.initial || this[state && state.property || name]) this[state.enabler]();
  },

  removeState: function(name, state) {
    if (!state) state = States.get(name);
    delete this.$states[name];
  },
  
  linkState: function(object, from, to, state) {
    var first = this.$states[from] || States.get(from);
    var second = object.$states[to] || States.get(to);
    var events = (first.events || first), method = (state === false ? 'removeEvent' : 'addEvent');
    var enabler = second.enabler, disabler = second.disabler;
    if (enabler.indexOf) enabler = (object.bindEvent ? object.bindEvent(enabler) : object[enabler].bind(object));
    if (disabler.indexOf) disabler = (object.bindEvent ? object.bindEvent(disabler) : object[disabler].bind(object));
    this[method](events.enabler, enabler);
    this[method](events.disabler, disabler);
    if (object[second.enabler] && this[first.property || from]) object[second.enabler]();
  },
  
  unlinkState: function(object, from, to) {
    return this.linkState(object, from, to, false)
  },
  
  setStateTo: function(name, value, state, args, callback) {
    if (!state || state === true) state = States.get(name);
    if (this[state && state.property || name] == value) return false;
    this[state && state.property || name] = !!value;
    if (callback) {
      var result = callback.apply(this, args);
      if (result === false) return false;
    }
    this.fireEvent((state.events || state)[value ? 'enabler' : 'disabler'], result || args);
    if (this.onStateChange && (state.reflect !== false)) this.onStateChange(name, value, result || args);
    return true;
  }
});

States.get = function() {
  return;
};
/*
---
 
script: Class.Macros.js
 
description: A few functions that simplify definition of everyday methods with common logic
 
license: MIT-style license.
 
requires:
- Core/Options
- Core/Events
- Core/Class.Extras

provides: [Macro, Class.hasParent]
 
...
*/

Class.hasParent = function(klass) {
  var caller = klass.$caller;
  return !!(caller && caller.$owner.parent && caller.$owner.parent.prototype[caller.$name]);
};

Macro = {};

/*
Make stackable function what executes it's parent before itself
*/
Macro.onion = function(callback) {
  return function() {
    if (!this.parent.apply(this, arguments)) return;
    return callback.apply(this, arguments) !== false;
  };
};

/*
Make getter-function with cache. Returned function alculates values on first call, after return this[name].
To reset cache use:

  delete this[name];

*/
Macro.getter = function(name, callback) {
  return function() {
    if (!this[name]) this[name] = callback.apply(this, arguments);
    return this[name];
  };
};


/*
Make function that runs it's parent if it exists, and runs itself if does not
*/
Macro.defaults = function(callback) {
  return function() {
    if (Class.hasParent(this)) {
      return this.parent.apply(this, arguments);
    } else {
      return callback.apply(this, arguments);
    }
  };
};

/*
Make function what returns property 'name' of passed argument
*/
Macro.map = function(name) {
  return function(item) {
    return item[name];
  };
};

/*
Make function Macro.map but diference that Macro.proc calls 'name' method
*/
Macro.proc = function(name, args) {
  return function(item) {
    return item[name].apply(item, args || arguments);
  };
};

/*
Make function what call method 'method' of property this[name] with passed arguments
*/
Macro.delegate = function(name, method) {
  return function() {
    if (this[name]) return this[name][method].apply(this[name], arguments);
  };
};
/*
---

name: Fx

description: Contains the basic animation logic to be extended by all other Fx Classes.

license: MIT-style license.

requires: [Chain, Events, Options]

provides: Fx

...
*/

(function(){

var Fx = this.Fx = new Class({

	Implements: [Chain, Events, Options],

	options: {
		/*
		onStart: nil,
		onCancel: nil,
		onComplete: nil,
		*/
		fps: 60,
		unit: false,
		duration: 500,
		frames: null,
		frameSkip: true,
		link: 'ignore'
	},

	initialize: function(options){
		this.subject = this.subject || this;
		this.setOptions(options);
	},

	getTransition: function(){
		return function(p){
			return -(Math.cos(Math.PI * p) - 1) / 2;
		};
	},

	step: function(now){
		if (this.options.frameSkip){
			var diff = (this.time != null) ? (now - this.time) : 0, frames = diff / this.frameInterval;
			this.time = now;
			this.frame += frames;
		} else {
			this.frame++;
		}
		
		if (this.frame < this.frames){
			var delta = this.transition(this.frame / this.frames);
			this.set(this.compute(this.from, this.to, delta));
		} else {
			this.frame = this.frames;
			this.set(this.compute(this.from, this.to, 1));
			this.stop();
		}
	},

	set: function(now){
		return now;
	},

	compute: function(from, to, delta){
		return Fx.compute(from, to, delta);
	},

	check: function(){
		if (!this.isRunning()) return true;
		switch (this.options.link){
			case 'cancel': this.cancel(); return true;
			case 'chain': this.chain(this.caller.pass(arguments, this)); return false;
		}
		return false;
	},

	start: function(from, to){
		if (!this.check(from, to)) return this;
		this.from = from;
		this.to = to;
		this.frame = (this.options.frameSkip) ? 0 : -1;
		this.time = null;
		this.transition = this.getTransition();
		var frames = this.options.frames, fps = this.options.fps, duration = this.options.duration;
		this.duration = Fx.Durations[duration] || duration.toInt();
		this.frameInterval = 1000 / fps;
		this.frames = frames || Math.round(this.duration / this.frameInterval);
		this.fireEvent('start', this.subject);
		pushInstance.call(this, fps);
		return this;
	},
	
	stop: function(){
		if (this.isRunning()){
			this.time = null;
			pullInstance.call(this, this.options.fps);
			if (this.frames == this.frame){
				this.fireEvent('complete', this.subject);
				if (!this.callChain()) this.fireEvent('chainComplete', this.subject);
			} else {
				this.fireEvent('stop', this.subject);
			}
		}
		return this;
	},
	
	cancel: function(){
		if (this.isRunning()){
			this.time = null;
			pullInstance.call(this, this.options.fps);
			this.frame = this.frames;
			this.fireEvent('cancel', this.subject).clearChain();
		}
		return this;
	},
	
	pause: function(){
		if (this.isRunning()){
			this.time = null;
			pullInstance.call(this, this.options.fps);
		}
		return this;
	},
	
	resume: function(){
		if ((this.frame < this.frames) && !this.isRunning()) pushInstance.call(this, this.options.fps);
		return this;
	},
	
	isRunning: function(){
		var list = instances[this.options.fps];
		return list && list.contains(this);
	}

});

Fx.compute = function(from, to, delta){
	return (to - from) * delta + from;
};

Fx.Durations = {'short': 250, 'normal': 500, 'long': 1000};

// global timers

var instances = {}, timers = {};

var loop = function(){
	var now = Date.now();
	for (var i = this.length; i--;){
		var instance = this[i];
		if (instance) instance.step(now);
	}
};

var pushInstance = function(fps){
	var list = instances[fps] || (instances[fps] = []);
	list.push(this);
	if (!timers[fps]) timers[fps] = loop.periodical(Math.round(1000 / fps), list);
};

var pullInstance = function(fps){
	var list = instances[fps];
	if (list){
		list.erase(this);
		if (!list.length && timers[fps]){
			delete instances[fps];
			timers[fps] = clearInterval(timers[fps]);
		}
	}
};

})();

/*
---

name: JSON

description: JSON encoder and decoder.

license: MIT-style license.

SeeAlso: <http://www.json.org/>

requires: [Array, String, Number, Function]

provides: JSON

...
*/

if (typeof JSON == 'undefined') this.JSON = {};

//<1.2compat>

JSON = new Hash({
	stringify: JSON.stringify,
	parse: JSON.parse
});

//</1.2compat>

(function(){

var special = {'\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"' : '\\"', '\\': '\\\\'};

var escape = function(chr){
	return special[chr] || '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).slice(-4);
};

JSON.validate = function(string){
	string = string.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
					replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
					replace(/(?:^|:|,)(?:\s*\[)+/g, '');

	return (/^[\],:{}\s]*$/).test(string);
};

JSON.encode = JSON.stringify ? function(obj){
	return JSON.stringify(obj);
} : function(obj){
	if (obj && obj.toJSON) obj = obj.toJSON();

	switch (typeOf(obj)){
		case 'string':
			return '"' + obj.replace(/[\x00-\x1f\\"]/g, escape) + '"';
		case 'array':
			return '[' + obj.map(JSON.encode).clean() + ']';
		case 'object': case 'hash':
			var string = [];
			Object.each(obj, function(value, key){
				var json = JSON.encode(value);
				if (json) string.push(JSON.encode(key) + ':' + json);
			});
			return '{' + string + '}';
		case 'number': case 'boolean': return '' + obj;
		case 'null': return 'null';
	}

	return null;
};

JSON.decode = function(string, secure){
	if (!string || typeOf(string) != 'string') return null;

	if (secure || JSON.secure){
		if (JSON.parse) return JSON.parse(string);
		if (!JSON.validate(string)) throw new Error('JSON could not decode the input; security is enabled and the value is not secure.');
	}

	return eval('(' + string + ')');
};

})();

/*
---
name: Color
description: Class to create and manipulate colors. Includes HSB «-» RGB «-» HEX conversions. Supports alpha for each type.
requires: [Core/Type, Core/Array]
provides: Color
...
*/

(function(){

var colors = {
	maroon: '#800000', red: '#ff0000', orange: '#ffA500', yellow: '#ffff00', olive: '#808000',
	purple: '#800080', fuchsia: "#ff00ff", white: '#ffffff', lime: '#00ff00', green: '#008000',
	navy: '#000080', blue: '#0000ff', aqua: '#00ffff', teal: '#008080',
	black: '#000000', silver: '#c0c0c0', gray: '#808080'
};

var Color = this.Color = function(color, type){
	
	if (color.isColor){
		
		this.red = color.red;
		this.green = color.green;
		this.blue = color.blue;
		this.alpha = color.alpha;

	} else {
		
		var namedColor = colors[color];
		if (namedColor){
			color = namedColor;
			type = 'hex';
		}

		switch (typeof color){
			case 'string': if (!type) type = (type = color.match(/^rgb|^hsb/)) ? type[0] : 'hex'; break;
			case 'object': type = type || 'rgb'; color = color.toString(); break;
			case 'number': type = 'hex'; color = color.toString(16); break;
		}

		color = Color['parse' + type.toUpperCase()](color);
		this.red = color[0];
		this.green = color[1];
		this.blue = color[2];
		this.alpha = color[3];
	}
	
	this.isColor = true;

};

var limit = function(number, min, max){
	return Math.min(max, Math.max(min, number));
};

var listMatch = /([-.\d]+)\s*,\s*([-.\d]+)\s*,\s*([-.\d]+)\s*,?\s*([-.\d]*)/;
var hexMatch = /^#?([a-f0-9]{1,2})([a-f0-9]{1,2})([a-f0-9]{1,2})([a-f0-9]{0,2})$/i;

Color.parseRGB = function(color){
	return color.match(listMatch).slice(1).map(function(bit, i){
		return (i < 3) ? Math.round(((bit %= 256) < 0) ? bit + 256 : bit) : limit(((bit === '') ? 1 : Number(bit)), 0, 1);
	});
};
	
Color.parseHEX = function(color){
	if (color.length == 1) color = color + color + color;
	return color.match(hexMatch).slice(1).map(function(bit, i){
		if (i == 3) return (bit) ? parseInt(bit, 16) / 255 : 1;
		return parseInt((bit.length == 1) ? bit + bit : bit, 16);
	});
};
	
Color.parseHSB = function(color){
	var hsb = color.match(listMatch).slice(1).map(function(bit, i){
		if (i === 0) return Math.round(((bit %= 360) < 0) ? (bit + 360) : bit);
		else if (i < 3) return limit(Math.round(bit), 0, 100);
		else return limit(((bit === '') ? 1 : Number(bit)), 0, 1);
	});
	
	var a = hsb[3];
	var br = Math.round(hsb[2] / 100 * 255);
	if (hsb[1] == 0) return [br, br, br, a];
		
	var hue = hsb[0];
	var f = hue % 60;
	var p = Math.round((hsb[2] * (100 - hsb[1])) / 10000 * 255);
	var q = Math.round((hsb[2] * (6000 - hsb[1] * f)) / 600000 * 255);
	var t = Math.round((hsb[2] * (6000 - hsb[1] * (60 - f))) / 600000 * 255);

	switch (Math.floor(hue / 60)){
		case 0: return [br, t, p, a];
		case 1: return [q, br, p, a];
		case 2: return [p, br, t, a];
		case 3: return [p, q, br, a];
		case 4: return [t, p, br, a];
		default: return [br, p, q, a];
	}
};

var toString = function(type, array){
	if (array[3] != 1) type += 'a';
	else array.pop();
	return type + '(' + array.join(', ') + ')';
};

Color.prototype = {

	toHSB: function(array){
		var red = this.red, green = this.green, blue = this.blue, alpha = this.alpha;

		var max = Math.max(red, green, blue), min = Math.min(red, green, blue), delta = max - min;
		var hue = 0, saturation = (max != 0) ? delta / max : 0, brightness = max / 255;
		if (saturation){
			var rr = (max - red) / delta, gr = (max - green) / delta, br = (max - blue) / delta;
			hue = (red == max) ? br - gr : (green == max) ? 2 + rr - br : 4 + gr - rr;
			if ((hue /= 6) < 0) hue++;
		}

		var hsb = [Math.round(hue * 360), Math.round(saturation * 100), Math.round(brightness * 100), alpha];

		return (array) ? hsb : toString('hsb', hsb);
	},

	toHEX: function(array){

		var a = this.alpha;
		var alpha = ((a = Math.round((a * 255)).toString(16)).length == 1) ? a + a : a;
		
		var hex = [this.red, this.green, this.blue].map(function(bit){
			bit = bit.toString(16);
			return (bit.length == 1) ? '0' + bit : bit;
		});
		
		return (array) ? hex.concat(alpha) : '#' + hex.join('') + ((alpha == 'ff') ? '' : alpha);
	},
	
	toRGB: function(array){
		var rgb = [this.red, this.green, this.blue, this.alpha];
		return (array) ? rgb : toString('rgb', rgb);
	}

};

Color.prototype.toString = Color.prototype.toRGB;

Color.hex = function(hex){
	return new Color(hex, 'hex');
};

if (this.hex == null) this.hex = Color.hex;

Color.hsb = function(h, s, b, a){
	return new Color([h || 0, s || 0, b || 0, (a == null) ? 1 : a], 'hsb');
};

if (this.hsb == null) this.hsb = Color.hsb;

Color.rgb = function(r, g, b, a){
	return new Color([r || 0, g || 0, b || 0, (a == null) ? 1 : a], 'rgb');
};

if (this.rgb == null) this.rgb = Color.rgb;

if (this.Type) new Type('Color', Color);

})();

/*
---
name: ART
description: "The heart of ART."
requires: [Core/Class, Color/Color]
provides: [ART, ART.Element, ART.Container, ART.Transform]
...
*/

(function(){

this.ART = new Class;

ART.version = '09.dev';
ART.build = 'DEV';

ART.Element = new Class({

	/* dom */

	inject: function(element){
		if (element.element) element = element.element;
		element.appendChild(this.element);
		return this;
	},

	eject: function(){
		var element = this.element, parent = element.parentNode;
		if (parent) parent.removeChild(element);
		return this;
	},

	/* events */

	subscribe: function(type, fn, bind){
		if (typeof type != 'string'){ // listen type / fn with object
			var subscriptions = [];
			for (var t in type) subscriptions.push(this.subscribe(t, type[t]));
			return function(){ // unsubscribe
				for (var i = 0, l = subscriptions.length; i < l; i++)
					subscriptions[i]();
				return this;
			};
		} else { // listen to one
			var bound = fn.bind(bind || this);
			var element = this.element;
			if (element.addEventListener){
				element.addEventListener(type, bound, false);
				return function(){ // unsubscribe
					element.removeEventListener(type, bound, false);
					return this;
				};
			} else {
				element.attachEvent('on' + type, bound);
				return function(){ // unsubscribe
					element.detachEvent('on' + type, bound);
					return this;
				};
			}
		}
	}

});

ART.Container = new Class({

	grab: function(){
		for (var i = 0; i < arguments.length; i++) arguments[i].inject(this);
		return this;
	}

});

var transformTo = function(xx, yx, xy, yy, x, y){
	if (xx && typeof xx == 'object'){
		yx = xx.yx; yy = xx.yy; y = xx.y;
		xy = xx.xy; x = xx.x; xx = xx.xx;
	}
	this.xx = xx == null ? 1 : xx;
	this.yx = yx || 0;
	this.xy = xy || 0;
	this.yy = yy == null ? 1 : yy;
	this.x = (x == null ? this.x : x) || 0;
	this.y = (y == null ? this.y : y) || 0;
	this._transform();
	return this;
};

ART.Transform = new Class({

	initialize: transformTo,

	_transform: function(){},

	xx: 1, yx: 0, x: 0,
	xy: 0, yy: 1, y: 0,

	transform: function(xx, yx, xy, yy, x, y){
		var m = this;
		if (xx && typeof xx == 'object'){
			yx = xx.yx; yy = xx.yy; y = xx.y;
			xy = xx.xy; x = xx.x; xx = xx.xx;
		}
		if (!x) x = 0;
		if (!y) y = 0;
		return this.transformTo(
			m.xx * xx + m.xy * yx,
			m.yx * xx + m.yy * yx,
			m.xx * xy + m.xy * yy,
			m.yx * xy + m.yy * yy,
			m.xx * x + m.xy * y + m.x,
			m.yx * x + m.yy * y + m.y
		);
	},

	transformTo: transformTo,

	translate: function(x, y){
		return this.transform(1, 0, 0, 1, x, y);
	},

	move: function(x, y){
		this.x += x || 0;
		this.y += y || 0;
		this._transform();
		return this;
	},

	scale: function(x, y){
		if (y == null) y = x;
		return this.transform(x, 0, 0, y, 0, 0);
	},

	rotate: function(deg, x, y){
		if (x == null || y == null){
			x = (this.left || 0) + (this.width || 0) / 2;
			y = (this.top || 0) + (this.height || 0) / 2;
		}

		var rad = deg * Math.PI / 180, sin = Math.sin(rad), cos = Math.cos(rad);

		this.transform(1, 0, 0, 1, x, y);
		var m = this;

		return this.transformTo(
			cos * m.xx - sin * m.yx,
			sin * m.xx + cos * m.yx,
			cos * m.xy - sin * m.yy,
			sin * m.xy + cos * m.yy,
			m.x,
			m.y
		).transform(1, 0, 0, 1, -x, -y);
	},

	moveTo: function(x, y){
		var m = this;
		return this.transformTo(m.xx, m.yx, m.xy, m.yy, x, y);
	},

	rotateTo: function(deg, x, y){
		var m = this;
		var flip = m.yx / m.xx > m.yy / m.xy ? -1 : 1;
		if (m.xx < 0 ? m.xy >= 0 : m.xy < 0) flip = -flip;
		return this.rotate(deg - Math.atan2(flip * m.yx, flip * m.xx) * 180 / Math.PI, x, y);
	},

	scaleTo: function(x, y){
		// Normalize
		var m = this;

		var h = Math.sqrt(m.xx * m.xx + m.yx * m.yx);
		m.xx /= h; m.yx /= h;

		h = Math.sqrt(m.yy * m.yy + m.xy * m.xy);
		m.yy /= h; m.xy /= h;

		return this.scale(x, y);
	},

	resizeTo: function(width, height){
		var w = this.width, h = this.height;
		if (!w || !h) return this;
		return this.scaleTo(width / w, height / h);
	},

	point: function(x, y){
		var m = this;
		return {
			x: m.xx * x + m.xy * y + m.x,
			y: m.yx * x + m.yy * y + m.y
		};
	}

});

Color.detach = function(color){
	color = new Color(color);
	return [Color.rgb(color.red, color.green, color.blue).toString(), color.alpha];
};

})();


/*
---
 
script: ART.Element.js
 
description: Smarter injection methods
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin

extends: ART/ART.Element

provides: ART.Element.inserters
 
...
*/

!function() {
  
var inserters = {

  before: function(context, element){
    var parent = element.parentNode;
    if (parent) parent.insertBefore(context, element);
  },

  after: function(context, element){
    var parent = element.parentNode;
    if (parent) parent.insertBefore(context, element.nextSibling);
  },

  bottom: function(context, element){
    element.appendChild(context);
  },

  top: function(context, element){
    element.insertBefore(context, element.firstChild);
  }

};

ART.Element.implement({
  inject: function(element, where){
    if (element.element) element = element.element;
    inserters[where || 'bottom'](this.element, element, true);
    return this;
  }
});

}();
/*
---
name: ART.Path
description: "Class to generate a valid SVG path using method calls."
authors: ["[Valerio Proietti](http://mad4milk.net)", "[Sebastian Markbåge](http://calyptus.eu/)"]
provides: [ART.Path]
requires: [ART, ART.Transform]
...
*/

(function(){

/* private functions */

var parameterCount = {
	l: 2, z: 0,
	h: 1, v: 1,
	c: 6, s: 4,
	q: 4, t: 2,
	a: 7
};

function parse(path){

	if (!path) return [];

	var parts = [], index = -1,
	    bits = path.match(/[a-df-z]|[\-+]?(?:[\d\.]e[\-+]?|[^\s\-+,a-z])+/ig),
	    command, part, paramCount = 0;

	for (var i = 0, l = bits.length; i < l; i++){
		var bit = bits[i];
		if (bit.match(/^[a-z]/i)){
			command = bit;
			parts[++index] = part = [command];
			if (command == 'm') command = 'l';
			else if (command == 'M') command = 'L';
			paramCount = parameterCount[command.toLowerCase()];
		} else {
			if (part.length > paramCount) parts[++index] = part = [command];
			part.push(Number(bit));
		}
	}
	
	return parts;

};

function visitCurve(sx, sy, c1x, c1y, c2x, c2y, ex, ey, lineTo){
	var gx = ex - sx, gy = ey - sy,
		g = gx * gx + gy * gy,
		v1, v2, cx, cy, u;

	cx = c1x - sx; cy = c1y - sy;
	u = cx * gx + cy * gy;

	if (u > g){
		cx -= gx;
		cy -= gy;
	} else if (u > 0 && g != 0){
		cx -= u/g * gx;
		cy -= u/g * gy;
	}

	v1 = cx * cx + cy * cy;

	cx = c2x - sx; cy = c2y - sy;
	u = cx * gx + cy * gy;

	if (u > g){
		cx -= gx;
		cy -= gy;
	} else if (u > 0 && g != 0){
		cx -= u/g * gx;
		cy -= u/g * gy;
	}

	v2 = cx * cx + cy * cy;

	if (v1 < 0.01 && v2 < 0.01){
		lineTo(sx, sy, ex, ey);
		return;
	}

	// Split curve
	var s1x =   (c1x + c2x) * 0.5,   s1y =   (c1y + c2y) * 0.5,
	    l1x =   (c1x + sx)  * 0.5,   l1y =   (c1y + sy)  * 0.5,
	    l2x =   (l1x + s1x) * 0.5,   l2y =   (l1y + s1y) * 0.5,
	    r2x =   (ex + c2x)  * 0.5,   r2y =   (ey + c2y)  * 0.5,
	    r1x =   (r2x + s1x) * 0.5,   r1y =   (r2y + s1y) * 0.5,
	    l2r1x = (l2x + r1x) * 0.5,   l2r1y = (l2y + r1y) * 0.5;

	// TODO: Manual stack if necessary. Currently recursive without tail optimization.
	visitCurve(sx, sy, l1x, l1y, l2x, l2y, l2r1x, l2r1y, lineTo);
	visitCurve(l2r1x, l2r1y, r1x, r1y, r2x, r2y, ex, ey, lineTo);
};

var circle = Math.PI * 2;

function visitArc(rx, ry, rotation, large, clockwise, x, y, tX, tY, curveTo, arcTo){
	var rad = rotation * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad);
	x -= tX; y -= tY;
	
	// Ellipse Center
	var cx = cos * x / 2 + sin * y / 2,
		cy = -sin * x / 2 + cos * y / 2,
		rxry = rx * rx * ry * ry,
		rycx = ry * ry * cx * cx,
		rxcy = rx * rx * cy * cy,
		a = rxry - rxcy - rycx;

	if (a < 0){
		a = Math.sqrt(1 - a / rxry);
		rx *= a; ry *= a;
		cx = x / 2; cy = y / 2;
	} else {
		a = Math.sqrt(a / (rxcy + rycx));
		if (large == clockwise) a = -a;
		var cxd = -a * cy * rx / ry,
		    cyd =  a * cx * ry / rx;
		cx = cos * cxd - sin * cyd + x / 2;
		cy = sin * cxd + cos * cyd + y / 2;
	}

	// Rotation + Scale Transform
	var xx =  cos / rx, yx = sin / rx,
	    xy = -sin / ry, yy = cos / ry;

	// Start and End Angle
	var sa = Math.atan2(xy * -cx + yy * -cy, xx * -cx + yx * -cy),
	    ea = Math.atan2(xy * (x - cx) + yy * (y - cy), xx * (x - cx) + yx * (y - cy));

	cx += tX; cy += tY;
	x += tX; y += tY;

	// Circular Arc
	if (rx == ry && arcTo){
		arcTo(
			tX, tY, x, y,
			cx, cy, rx, sa, ea, !clockwise
		);
		return;
	}

	// Inverse Rotation + Scale Transform
	xx = cos * rx; yx = -sin * ry;
	xy = sin * rx; yy =  cos * ry;

	// Bezier Curve Approximation
	var arc = ea - sa;
	if (arc < 0 && clockwise) arc += circle;
	else if (arc > 0 && !clockwise) arc -= circle;

	var n = Math.ceil(Math.abs(arc / (circle / 4))),
	    step = arc / n,
	    k = (4 / 3) * Math.tan(step / 4),
	    a = sa;

	x = Math.cos(a); y = Math.sin(a);

	for (var i = 0; i < n; i++){
		var cp1x = x - k * y, cp1y = y + k * x;

		a += step;
		x = Math.cos(a); y = Math.sin(a);

		var cp2x = x + k * y, cp2y = y - k * x;

		curveTo(
			tX, tY,
			cx + xx * cp1x + yx * cp1y, cy + xy * cp1x + yy * cp1y,
			cx + xx * cp2x + yx * cp2y, cy + xy * cp2x + yy * cp2y,
			(tX = (cx + xx * x + yx * y)), (tY = (cy + xy * x + yy * y))
		);
	}
};

/* Measure bounds */

var left, right, top, bottom;

function lineBounds(sx, sy, x, y){
	left   = Math.min(left,   sx, x);
	right  = Math.max(right,  sx, x);
	top    = Math.min(top,    sy, y);
	bottom = Math.max(bottom, sy, y);
};

function curveBounds(sx, sy, p1x, p1y, p2x, p2y, x, y){
	left   = Math.min(left,   sx, p1x, p2x, x);
	right  = Math.max(right,  sx, p1x, p2x, x);
	top    = Math.min(top,    sy, p1y, p2y, y);
	bottom = Math.max(bottom, sy, p1y, p2y, y);
};

var west = circle / 2, south = west / 2, north = -south, east = 0;

function arcBounds(sx, sy, ex, ey, cx, cy, r, sa, ea, ccw){
	var bbsa = ccw ? ea : sa, bbea = ccw ? sa : ea;
	if (bbea < bbsa) bbea += circle;

	// Bounds
	var bbl = (bbea > west) ? (cx - r) : (ex),
	    bbr = (bbea > circle + east || (bbsa < east && bbea > east)) ? (cx + r) : (ex),
	    bbt = (bbea > circle + north || (bbsa < north && bbea > north)) ? (cy - r) : (ey),
	    bbb = (bbea > circle + south || (bbsa < south && bbea > south)) ? (cy + r) : (ey);

	left   = Math.min(left,   sx, bbl, bbr);
	right  = Math.max(right,  sx, bbl, bbr);
	top    = Math.min(top,    sy, bbt, bbb);
	bottom = Math.max(bottom, sy, bbt, bbb);
};

/* Measure length */

var length, desiredLength, desiredPoint;

function traverseLine(sx, sy, ex, ey){
	var x = ex - sx,
		y = ey - sy,
		l = Math.sqrt(x * x + y * y);
	length += l;
	if (length >= desiredLength){
		var offset = (length - desiredLength) / l,
		    cos = x / l,
		    sin = y / l;
		ex -= x * offset; ey -= y * offset;
		desiredPoint = new ART.Transform(cos, sin, -sin, cos, ex, ey);
		desiredLength = Infinity;
	}
};

function measureLine(sx, sy, ex, ey){
	var x = ex - sx, y = ey - sy;
	length += Math.sqrt(x * x + y * y);
};

/* Utility command factories */

var point = function(c){
	return function(x, y){
		return this.push(c, x, y);
	};
};

var arc = function(c, cc){
	return function(x, y, rx, ry, outer){
		return this.push(c, Math.abs(rx || x), Math.abs(ry || rx || y), 0, outer ? 1 : 0, cc, x, y);
	};
};

var curve = function(t, q, c){
	return function(c1x, c1y, c2x, c2y, ex, ey){
		var args = Array.slice(arguments), l = args.length;
		args.unshift(l < 4 ? t : l < 6 ? q : c);
		return this.push.apply(this, args);
	};
};

/* Path Class */

ART.Path = new Class({
	
	initialize: function(path){
		if (path instanceof ART.Path){ //already a path, copying
			this.path = Array.slice(path.path);
			this.cache = path.cache;
		} else {
			this.path = (path == null) ? [] : parse(path);
			this.cache = { svg: String(path) };
		}
	},
	
	push: function(){ //modifying the current path resets the memoized values.
		this.cache = {};
		this.path.push(Array.slice(arguments));
		return this;
	},
	
	reset: function(){
		this.cache = {};
		this.path = [];
		return this;
	},
	
	/*utility*/
	
	move: point('m'),
	moveTo: point('M'),
	
	line: point('l'),
	lineTo: point('L'),
	
	curve: curve('t', 'q', 'c'),
	curveTo: curve('T', 'Q', 'C'),
	
	arc: arc('a', 1),
	arcTo: arc('A', 1),
	
	counterArc: arc('a', 0),
	counterArcTo: arc('A', 0),
	
	close: function(){
		return this.push('z');
	},
	
	/* visitor */

	visit: function(lineTo, curveTo, arcTo, moveTo, close){
		var reflect = function(sx, sy, ex, ey){
			return [ex * 2 - sx, ey * 2 - sy];
		};
		
		if (!curveTo) curveTo = function(sx, sy, c1x, c1y, c2x, c2y, ex, ey){
			visitCurve(sx, sy, c1x, c1y, c2x, c2y, ex, ey, lineTo);
		};
		
		var X = 0, Y = 0, px = 0, py = 0, r, inX, inY;
		
		var parts = this.path;
		
		for (var i = 0; i < parts.length; i++){
			var v = Array.slice(parts[i]), f = v.shift(), l = f.toLowerCase();
			var refX = l == f ? X : 0, refY = l == f ? Y : 0;
			
			if (l != 'm' && l != 'z' && inX == null){
				inX = X; inY = Y;
			}

			switch (l){
				
				case 'm':
					if (moveTo) moveTo(X, Y, X = refX + v[0], Y = refY + v[1]);
					else { X = refX + v[0]; Y = refY + v[1]; }
				break;
				
				case 'l':
					lineTo(X, Y, X = refX + v[0], Y = refY + v[1]);
				break;
				
				case 'c':
					px = refX + v[2]; py = refY + v[3];
					curveTo(X, Y, refX + v[0], refY + v[1], px, py, X = refX + v[4], Y = refY + v[5]);
				break;

				case 's':
					r = reflect(px, py, X, Y);
					px = refX + v[0]; py = refY + v[1];
					curveTo(X, Y, r[0], r[1], px, py, X = refX + v[2], Y = refY + v[3]);
				break;
				
				case 'q':
					px = (refX + v[0]); py = (refY + v[1]);
					curveTo(X, Y, (X + px * 2) / 3, (Y + py * 2) / 3, ((X = refX + v[2]) + px * 2) / 3, ((Y = refY + v[3]) + py * 2) / 3, X, Y);
				break;
				
				case 't':
					r = reflect(px, py, X, Y);
					px = r[0]; py = r[1];
					curveTo(X, Y, (X + px * 2) / 3, (Y + py * 2) / 3, ((X = refX + v[0]) + px * 2) / 3, ((Y = refY + v[1]) + py * 2) / 3, X, Y);
				break;

				case 'a':
					px = refX + v[5]; py = refY + v[6];
					if (!v[0] || !v[1] || (px == X && py == Y)) lineTo(X, Y, px, py);
					else visitArc(v[0], v[1], v[2], v[3], v[4], px, py, X, Y, curveTo, arcTo);
					X = px; Y = py;
				break;

				case 'h':
					lineTo(X, Y, X = refX + v[0], Y);
				break;
				
				case 'v':
					lineTo(X, Y, X, Y = refY + v[0]);
				break;
				
				case 'z':
					if (inX != null){
						if (close){
							close();
							if (moveTo) moveTo(X, Y, X = inX, Y = inY);
							else { X = inX; Y = inY; }
						} else {
							lineTo(X, Y, X = inX, Y = inY);
						}
						inX = null;
					}
				break;
				
			}
			if (l != 's' && l != 'c' && l != 't' && l != 'q'){
				px = X; py = Y;
			}
		}
	},
	
	/* transformation, measurement */
	
	toSVG: function(){
		if (this.cache.svg == null){
			var path = '';
			for (var i = 0, l = this.path.length; i < l; i++) path += this.path[i].join(' ');
			this.cache.svg = path;
		}
		return this.cache.svg;
	},
	
	measure: function(){
		if (this.cache.box == null){
			left = top = Infinity;
			right = bottom = -Infinity;
			this.visit(lineBounds, curveBounds, arcBounds);
			if (left == Infinity)
				this.cache.box = {left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0};
			else
				this.cache.box = {left: left, top: top, right: right, bottom: bottom, width: right - left, height: bottom - top };
		}
		return this.cache.box;
	},

	point: function(lengthToPoint){
		length = 0;
		desiredLength = lengthToPoint;
		desiredPoint = null;
		this.visit(traverseLine);
		return desiredPoint;
	},

	measureLength: function(){
		length = 0;
		this.visit(measureLine);
		return length;
	}

});

ART.Path.prototype.toString = ART.Path.prototype.toSVG;

})();
/*
---
name: ART.SVG
description: "SVG implementation for ART"
provides: [ART.SVG, ART.SVG.Group, ART.SVG.Shape, ART.SVG.Image, ART.SVG.Text]
requires: [ART, ART.Element, ART.Container, ART.Transform, ART.Path]
...
*/

(function(){
	
var NS = 'http://www.w3.org/2000/svg', XLINK = 'http://www.w3.org/1999/xlink', XML = 'http://www.w3.org/XML/1998/namespace',
    UID = 0,
    createElement = function(tag){
        return document.createElementNS(NS, tag);
    };

var ua = navigator && navigator.userAgent,
    hasBaseline = !(/opera|safari|ie/i).test(ua) || (/chrome/i).test(ua);

// SVG Base Class

ART.SVG = new Class({

	Extends: ART.Element,
	Implements: ART.Container,

	initialize: function(width, height){
		var element = this.element = createElement('svg');
		element.setAttribute('xmlns', NS);
		element.setAttribute('version', 1.1);
		var defs = this.defs = createElement('defs');
		element.appendChild(defs);
		if (width != null && height != null) this.resize(width, height);
	},

	resize: function(width, height){
		var element = this.element;
		element.setAttribute('width', width);
		element.setAttribute('height', height);
		this.width = width;
		this.height = height;
		return this;
	},
	
	toElement: function(){
		return this.element;
	}

});

// SVG Element Class

ART.SVG.Element = new Class({
	
	Extends: ART.Element,
	
	Implements: ART.Transform,

	initialize: function(tag){
		this.uid = String.uniqueID();
		var element = this.element = createElement(tag);
		element.setAttribute('id', 'e' + this.uid);
	},
	
	/* transforms */
	
	_transform: function(){
		var m = this;
		this.element.setAttribute('transform', 'matrix(' + [m.xx, m.yx, m.xy, m.yy, m.x, m.y] + ')');
	},
	
	blend: function(opacity){
		this.element.setAttribute('opacity', opacity);
		return this;
	},
	
	// visibility
	
	hide: function(){
		this.element.setAttribute('display', 'none');
		return this;
	},
	
	show: function(){
		this.element.setAttribute('display', '');
		return this;
	},
	
	// interaction
	
	indicate: function(cursor, tooltip){
		var element = this.element;
		if (cursor) this.element.style.cursor = cursor;
		if (tooltip){
			var title = this.titleElement; 
			if (title){
				title.firstChild.nodeValue = tooltip;
			} else {
				this.titleElement = title = createElement('title');
				title.appendChild(document.createTextNode(tooltip));
				element.insertBefore(title, element.firstChild);
			}
		}
		return this;
	}

});

// SVG Group Class

ART.SVG.Group = new Class({
	
	Extends: ART.SVG.Element,
	Implements: ART.Container,
	
	initialize: function(width, height){
		this.parent('g');
		this.width = width;
		this.height = height;
		this.defs = createElement('defs');
		this.element.appendChild(this.defs);
	}
	
});

// SVG Base Shape Class

ART.SVG.Base = new Class({
	
	Extends: ART.SVG.Element,

	initialize: function(tag){
		this.parent(tag);
		this.fill();
		this.stroke();
	},
	
	/* insertions */
	
	inject: function(container){
		this.eject();
		this.container = container;
		this._injectBrush('fill');
		this._injectBrush('stroke');
		this.parent(container);
		return this;
	},
	
	eject: function(){
		if (this.container){
			this.parent();
			this._ejectBrush('fill');
			this._ejectBrush('stroke');
			this.container = null;
		}
		return this;
	},
	
	_injectBrush: function(type){
		if (!this.container) return;
		var brush = this[type + 'Brush'];
		if (brush) this.container.defs.appendChild(brush);
	},
	
	_ejectBrush: function(type){
		if (!this.container) return;
		var brush = this[type + 'Brush'];
		if (brush) this.container.defs.removeChild(brush);
	},
	
	/* styles */
	
	_createBrush: function(type, tag){
		this._ejectBrush(type);

		var brush = createElement(tag);
		this[type + 'Brush'] = brush;

		var id = type + '-brush-e' + this.uid;
		brush.setAttribute('id', id);

		this._injectBrush(type);

		this.element.setAttribute(type, 'url(#' + id + ')');

		return brush;
	},

	_createGradient: function(type, style, stops){
		var gradient = this._createBrush(type, style);

		var addColor = function(offset, color){
			color = Color.detach(color);
			var stop = createElement('stop');
			stop.setAttribute('offset', offset);
			stop.setAttribute('stop-color', color[0]);
			stop.setAttribute('stop-opacity', color[1]);
			gradient.appendChild(stop);
		};

		// Enumerate stops, assumes offsets are enumerated in order
		// TODO: Sort. Chrome doesn't always enumerate in expected order but requires stops to be specified in order.
		if ('length' in stops) for (var i = 0, l = stops.length - 1; i <= l; i++) addColor(i / l, stops[i]);
		else for (var offset in stops) addColor(offset, stops[offset]);

		gradient.setAttribute('spreadMethod', 'reflect'); // Closer to the VML gradient


		this.element.removeAttribute('fill-opacity');
		return gradient;
	},
	
	_setColor: function(type, color){
		this._ejectBrush(type);
		this[type + 'Brush'] = null;
		var element = this.element;
		if (color == null){
			element.setAttribute(type, 'none');
			element.removeAttribute(type + '-opacity');
		} else {
			color = Color.detach(color);
			element.setAttribute(type, color[0]);
			element.setAttribute(type + '-opacity', color[1]);
		}
	},

	fill: function(color){
		if (arguments.length > 1) this.fillLinear(arguments);
		else this._setColor('fill', color);
		return this;
	},

	fillRadial: function(stops, focusX, focusY, radiusX, radiusY, centerX, centerY){
		var gradient = this._createGradient('fill', 'radialGradient', stops);

		gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
		

		if (focusX == null) focusX = (this.left || 0) + (this.width || 0) * 0.5;
		if (focusY == null) focusY = (this.top || 0) + (this.height || 0) * 0.5;
		if (radiusY == null) radiusY = radiusX || (this.height * 0.5) || 0;
		if (radiusX == null) radiusX = (this.width || 0) * 0.5;
		if (centerX == null) centerX = focusX;
		if (centerY == null) centerY = focusY;
		
		var ys = radiusY / radiusX;

		gradient.setAttribute('fx', focusX);
		gradient.setAttribute('fy', focusY / ys);

		gradient.setAttribute('r', radiusX);
		if (ys != 1) gradient.setAttribute('gradientTransform', 'scale(1,' + ys + ')');

		gradient.setAttribute('cx', centerX);
		gradient.setAttribute('cy', centerY / ys);
		
		return this;
	},

	fillLinear: function(stops, x1, y1, x2, y2){
		var gradient = this._createGradient('fill', 'linearGradient', stops);
		
		if (arguments.length == 5){
			gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
		} else {
			var angle = ((x1 == null) ? 270 : x1) * Math.PI / 180;

			var x = Math.cos(angle), y = -Math.sin(angle),
				l = (Math.abs(x) + Math.abs(y)) / 2;

			x *= l; y *= l;

			x1 = 0.5 - x;
			x2 = 0.5 + x;
			y1 = 0.5 - y;
			y2 = 0.5 + y;
		}

		gradient.setAttribute('x1', x1);
		gradient.setAttribute('y1', y1);
		gradient.setAttribute('x2', x2);
		gradient.setAttribute('y2', y2);

		return this;
	},

	fillImage: function(url, width, height, left, top, color1, color2){
		var pattern = this._createBrush('fill', 'pattern');

		var image = createElement('image');
		image.setAttributeNS(XLINK, 'href', url);
		image.setAttribute('width', width);
		image.setAttribute('height', height);
		image.setAttribute('preserveAspectRatio', 'none'); // none, xMidYMid slice, xMidYMid meet

		if (color1 != null){
			color1 = new Color(color1);
			if (color2 == null){
				color2 = new Color(color1);
				color2.alpha = 0;
			} else {
				color2 = new Color(color2);
			}

			var r = (color1.red - color2.red) / (255 * 3),
				g = (color1.green - color2.green) / (255 * 3),
				b = (color1.blue - color2.blue) / (255 * 3),
				a = (color1.alpha - color2.alpha) / 3;
			
			var matrix = [
				r, r, r, 0, color2.red / 255,
				g, g, g, 0, color2.green / 255,
				b, b, b, 0, color2.blue / 255,
				a, a, a, 0, color2.alpha
			];

			var filter = createElement('filter');
			filter.setAttribute('id', 'testfilter' + this.uid);

			var cm = createElement('feColorMatrix');
			cm.setAttribute('type', 'matrix');
			cm.setAttribute('values', matrix.join(' '));

			image.setAttribute('fill', '#000');
			image.setAttribute('filter', 'url(#testfilter' + this.uid + ')');

			filter.appendChild(cm);
			pattern.appendChild(filter);
		}

		pattern.appendChild(image);
		
		pattern.setAttribute('patternUnits', 'userSpaceOnUse');
		pattern.setAttribute('patternContentsUnits', 'userSpaceOnUse');
		
		pattern.setAttribute('x', left || 0);
		pattern.setAttribute('y', top || 0);
		
		pattern.setAttribute('width', width);
		pattern.setAttribute('height', height);

		//pattern.setAttribute('viewBox', '0 0 75 50');
		//pattern.setAttribute('preserveAspectRatio', 'xMidYMid slice');

		return this;
	},

	stroke: function(color, width, cap, join){
		var element = this.element;
		element.setAttribute('stroke-width', (width != null) ? width : 1);
		element.setAttribute('stroke-linecap', (cap != null) ? cap : 'round');
		element.setAttribute('stroke-linejoin', (join != null) ? join : 'round');

		this._setColor('stroke', color);
		return this;
	}
	
});

// SVG Shape Class

ART.SVG.Shape = new Class({
	
	Extends: ART.SVG.Base,
	
	initialize: function(path, width, height){
		this.parent('path');
		this.element.setAttribute('fill-rule', 'evenodd');
		this.width = width;
		this.height = height;
		if (path != null) this.draw(path);
	},
	
	draw: function(path, width, height){
		if (!(path instanceof ART.Path)) path = new ART.Path(path);
		this.element.setAttribute('d', path.toSVG());
		if (width != null) this.width = width;
		if (height != null) this.height = height;
		return this;
	}

});

ART.SVG.Image = new Class({
	
	Extends: ART.SVG.Base,
	
	initialize: function(src, width, height){
		this.parent('image');
		if (arguments.length == 3) this.draw.apply(this, arguments);
	},
	
	draw: function(src, width, height){
		var element = this.element;
		element.setAttributeNS(XLINK, 'href', src);
		element.setAttribute('width', width);
		element.setAttribute('height', height);
		this.width = width;
		this.height = height;
		return this;
	}
	
});

var fontAnchors = { left: 'start', center: 'middle', right: 'end' },
    fontAnchorOffsets = { middle: '50%', end: '100%' };

/* split each continuous line into individual paths */

var splitPaths, splitPath;

function splitMove(sx, sy, x, y){
	if (splitPath.length > 3) splitPaths.push(splitPath);
	splitPath = ['M', x, y];
};

function splitLine(sx, sy, x, y){
	splitPath.push('L', x, y);
};

function splitCurve(sx, sy, p1x, p1y, p2x, p2y, x, y){
	splitPath.push('C', p1x, p1y, p2x, p2y, x, y);
};

ART.SVG.Text = new Class({

	Extends: ART.SVG.Base,

	initialize: function(text, font, alignment, path){
		this.parent('text');
		this.draw.apply(this, arguments);
	},
	
	draw: function(text, font, alignment, path){
		var element = this.element;
	
		if (font){
			if (typeof font == 'string'){
				element.style.font = font;
			} else {
				for (var key in font){
					var ckey = key.camelCase ? key.camelCase() : key;
					// NOT UNIVERSALLY SUPPORTED OPTIONS
					// if (ckey == 'kerning') element.setAttribute('kerning', font[key] ? 'auto' : '0');
					// else if (ckey == 'letterSpacing') element.setAttribute('letter-spacing', Number(font[key]) + 'ex');
					// else if (ckey == 'rotateGlyphs') element.setAttribute('glyph-orientation-horizontal', font[key] ? '270deg' : '');
					// else
					element.style[ckey] = font[key];
				}
				element.style.lineHeight = '0.5em';
			}
		}
		
		if (alignment) element.setAttribute('text-anchor', this.textAnchor = (fontAnchors[alignment] || alignment));

		if (path && typeof path != 'number'){
			this._createPaths(new ART.Path(path));
		} else if (path === false){
			this._ejectPaths();
			this.pathElements = null;
		}
		
		var paths = this.pathElements, child;
		
		while ((child = element.firstChild)){
			element.removeChild(child);
		}
		
		// Note: Gecko will (incorrectly) align gradients for each row, while others applies one for the entire element
		
		var lines = String(text).split(/\r?\n/), l = lines.length,
		    baseline = 'central';
		
		if (paths && l > paths.length) l = paths.length;
		
		if (hasBaseline) element.setAttribute('dominant-baseline', baseline);

		element.setAttributeNS(XML, 'space', 'preserve');
		
		for (var i = 0; i < l; i++){
			var line = lines[i], row, content;
			if (paths){
				row = createElement('textPath');
				row.setAttributeNS(XLINK, 'href', '#' + paths[i].getAttribute('id'));
				row.setAttribute('startOffset', fontAnchorOffsets[this.textAnchor] || 0);
			} else {
				row = createElement('tspan');
				row.setAttribute('x', 0);
				row.setAttribute('y', (i * 1.1 + 0.5) + 'em');
			}
			if (hasBaseline){
				row.setAttribute('dominant-baseline', baseline);
				content = row;
			} else if (paths){
				content = createElement('tspan');
				content.setAttribute('dy', '0.35em');
				row.appendChild(content);
			} else {
				content = row;
				row.setAttribute('y', (i * 1.1 + 0.85) + 'em');
			}
			content.setAttributeNS(XML, 'space', 'preserve');
			content.appendChild(document.createTextNode(line));
			element.appendChild(row);
		}
		
		// Measure
		// TODO: Move to lazy ES5 left/top/width/height/bottom/right property getters
		var bb;
		try { bb = element.getBBox(); } catch (x){ }
		if (!bb || !bb.width) bb = this._whileInDocument(element.getBBox, element);
		
		this.left = bb.x;
		this.top = bb.y;
		this.width = bb.width;
		this.height = bb.height;
		this.right = bb.x + bb.width;
		this.bottom = bb.y + bb.height;
		return this;
	},
	
	// TODO: Unify path injection with gradients and imagefills

	inject: function(container){
		this.parent(container);
		this._injectPaths();
		return this;
	},
	
	eject: function(){
		if (this.container){
			this._ejectPaths();
			this.parent();
			this.container = null;
		}
		return this;
	},
	
	_injectPaths: function(){
		var paths = this.pathElements;
		if (!this.container || !paths) return;
		var defs = this.container.defs;
		for (var i = 0, l = paths.length; i < l; i++)
			defs.appendChild(paths[i]);
	},
	
	_ejectPaths: function(){
		var paths = this.pathElements;
		if (!this.container || !paths) return;
		var defs = this.container.defs;
		for (var i = 0, l = paths; i < l; i++)
			defs.removeChild(paths[i]);
	},
	
	_createPaths: function(path){
		this._ejectPaths();
		var id = 'p' + String.uniqueID() + '-';
		
		splitPaths = []; splitPath = ['M', 0, 0];
		path.visit(splitLine, splitCurve, null, splitMove);
		splitPaths.push(splitPath);
		
		var result = [];
		for (var i = 0, l = splitPaths.length; i < l; i++){
			var p = createElement('path');
			p.setAttribute('d', splitPaths[i].join(' '));
			p.setAttribute('id', id + i);
			result.push(p);
		}
		this.pathElements = result;
		this._injectPaths();
	},
	
	_whileInDocument: function(fn, bind){
		// Temporarily inject into the document
		var element = this.element,
		    container = this.container,
			parent = element.parentNode,
			sibling = element.nextSibling,
			body = element.ownerDocument.body,
			canvas = new ART.SVG(1, 1).inject(body);
		this.inject(canvas);
		var result = fn.call(bind);
		canvas.eject();
		if (container) this.inject(container);
		if (parent) parent.insertBefore(element, sibling);
		return result;
	}

});

})();
/*
---
 
script: ART.SVG.js
 
description: Some extensions (filters, dash, shadow blur)
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin

extends: ART/ART.SVG

provides: [ART.SVG.prototype.dash, ART.SVG.prototype.strokeLinear, ART.SVG.prototype.fillRadial]
 
...
*/

!function() {
var NS = 'http://www.w3.org/2000/svg', XLINK = 'http://www.w3.org/1999/xlink', UID = 0, createElement = function(tag){
  return document.createElementNS(NS, tag);
};
  
ART.SVG.Base.implement({
  dash: function(dash) {
    if (dash) {
      this.dashed = true;
      this.element.setAttribute('stroke-dasharray', dash);
    } else if (this.dashed) {
      this.dashed = false;
      this.element.removeAttribute('stroke-dasharray')
    }
  },
  
  
  inject: function(container){
    this.eject();
    if (container instanceof ART.SVG.Group) container.children.push(this);
    this.parent.apply(this, arguments);
    this.container = container.defs ? container : container.container;
		this._injectBrush('fill');
		this._injectBrush('stroke');
    this._injectFilter('blur');
    return this;
  },
  
  strokeLinear: function(stops, angle){
    var gradient = this._createGradient('stroke', 'linear', stops);

    angle = ((angle == null) ? 270 : angle) * Math.PI / 180;

    var x = Math.cos(angle), y = -Math.sin(angle),
      l = (Math.abs(x) + Math.abs(y)) / 2;

    x *= l; y *= l;

    gradient.setAttribute('x1', 0.5 - x);
    gradient.setAttribute('x2', 0.5 + x);
    gradient.setAttribute('y1', 0.5 - y);
    gradient.setAttribute('y2', 0.5 + y);

    return this;
  },
  
  _writeTransform: function(){
    if (Object.equals(this.transformed, this.transform)) return;
    this.transformed = $unlink(this.transform);
    var transforms = [];
    for (var transform in this.transform) transforms.push(transform + '(' + this.transform[transform].join(',') + ')');
    this.element.setAttribute('transform', transforms.join(' '));
  },

  blur: function(radius){
    if (radius == null) radius = 4;
    if (radius == this.blurred) return;
    this.blurred = radius;
    
    var filter = this._createFilter();
    var blur = createElement('feGaussianBlur');
    blur.setAttribute('stdDeviation', radius * 0.25);
    blur.setAttribute('result', 'blur');
    filter.appendChild(blur);
    //in=SourceGraphic
    //stdDeviation="4" result="blur"
    return this;
  },

  unblur: function() {
    delete this.blurred;
    this._ejectFilter();
  },
  
  _injectFilter: function(type){
    if (!this.container) return;
    var filter = this.filter;
    if (filter) this.container.defs.appendChild(filter);
  },
  
  _ejectFilter: function(type){
    if (!this.container) return;
    var filter = this.filter;
    delete this.filter;
    if (filter) this.container.defs.removeChild(filter);
  },
  
  _createFilter: function(){
    this._ejectFilter();
  
    var filter = this.filter = createElement('filter');
  
    var id = 'filter-e' + this.uid;
    filter.setAttribute('id', id);
  
    this._injectFilter();
  
    this.element.setAttribute('filter', 'url(#' + id + ')');
  
    return filter;
  }
});

}();
/*
---
name: ART.VML
description: "VML implementation for ART"
authors: ["[Simo Kinnunen](http://twitter.com/sorccu)", "[Valerio Proietti](http://mad4milk.net)", "[Sebastian Markbåge](http://calyptus.eu/)"]
provides: [ART.VML, ART.VML.Group, ART.VML.Shape, ART.VML.Text]
requires: [ART, ART.Element, ART.Container, ART.Transform, ART.Path]
...
*/

(function(){

var precision = 100, UID = 0;

var defaultBox = { left: 0, top: 0, width: 500, height: 500 };

// VML Base Class

ART.VML = new Class({

	Extends: ART.Element,
	Implements: ART.Container,
	
	initialize: function(width, height){
		this.vml = document.createElement('vml');
		this.element = document.createElement('av:group');
		this.vml.appendChild(this.element);
		this.children = [];
		if (width != null && height != null) this.resize(width, height);
	},
	
	inject: function(element){
		if (element.element) element = element.element;
		element.appendChild(this.vml);
		return this;
	},
	
	resize: function(width, height){
		this.width = width;
		this.height = height;
		
		var style = this.vml.style;
		style.pixelWidth = width;
		style.pixelHeight = height;
		
		style = this.element.style;
		style.width = width;
		style.height = height;
		
		var halfPixel = (0.5 * precision);
		
		this.element.coordorigin = halfPixel + ',' + halfPixel;
		this.element.coordsize = (width * precision) + ',' + (height * precision);

		return this;
	},
	
	toElement: function(){
		return this.vml;
	}
	
});

// VML Initialization

var VMLCSS = 'behavior:url(#default#VML);display:inline-block;position:absolute;left:0px;top:0px;';

var styleSheet, styledTags = {}, styleTag = function(tag){
	if (styleSheet) styledTags[tag] = styleSheet.addRule('av\\:' + tag, VMLCSS);
};

ART.VML.init = function(document){

	var namespaces = document.namespaces;
	if (!namespaces) return false;

	namespaces.add('av', 'urn:schemas-microsoft-com:vml');
	namespaces.add('ao', 'urn:schemas-microsoft-com:office:office');

	styleSheet = document.createStyleSheet();
	styleSheet.addRule('vml', 'display:inline-block;position:relative;overflow:hidden;');
	styleTag('skew');
	styleTag('fill');
	styleTag('stroke');
	styleTag('path');
	styleTag('textpath');
	styleTag('group');

	return true;

};

// VML Element Class

ART.VML.Element = new Class({
	
	Extends: ART.Element,
	
	Implements: ART.Transform,
	
	initialize: function(tag){
		this.uid = String.uniqueID();
		if (!(tag in styledTags)) styleTag(tag);

		var element = this.element = document.createElement('av:' + tag);
		element.setAttribute('id', 'e' + this.uid);
	},
	
	/* dom */
	
	inject: function(container){
		this.eject();
		this.container = container;
		container.children.include(this);
		this._transform();
		this.parent(container);
		
		return this;
	},

	eject: function(){
		if (this.container){
			this.container.children.erase(this);
			this.container = null;
			this.parent();
		}
		return this;
	},

	// visibility
	
	hide: function(){
		this.element.style.display = 'none';
		return this;
	},
	
	show: function(){
		this.element.style.display = '';
		return this;
	},
	
	// interaction
	
	indicate: function(cursor, tooltip){
		if (cursor) this.element.style.cursor = cursor;
		if (tooltip) this.element.title = tooltip;
		return this;
	}

});

// VML Group Class

ART.VML.Group = new Class({
	
	Extends: ART.VML.Element,
	Implements: ART.Container,
	
	initialize: function(width, height){
		this.parent('group');
		this.width = width;
		this.height = height;
		this.children = [];
	},
	
	/* dom */
	
	inject: function(container){
		this.parent(container);
		this._transform();
		return this;
	},
	
	eject: function(){
		this.parent();
		return this;
	},
	
	_transform: function(){
		var element = this.element;
		element.coordorigin = '0,0';
		element.coordsize = '1000,1000';
		element.style.left = 0;
		element.style.top = 0;
		element.style.width = 1000;
		element.style.height = 1000;
		element.style.rotation = 0;
		
		var container = this.container;
		this._activeTransform = container ? new ART.Transform(container._activeTransform).transform(this) : this;
		var children = this.children;
		for (var i = 0, l = children.length; i < l; i++)
			children[i]._transform();
	}

});

// VML Base Shape Class

ART.VML.Base = new Class({

	Extends: ART.VML.Element,
	
	initialize: function(tag){
		this.parent(tag);
		var element = this.element;
		
		var skew = this.skewElement = document.createElement('av:skew');
		skew.on = true;
		element.appendChild(skew);

		var fill = this.fillElement = document.createElement('av:fill');
		fill.on = false;
		element.appendChild(fill);
		
		var stroke = this.strokeElement = document.createElement('av:stroke');
		stroke.on = false;
		element.appendChild(stroke);
	},
	
	/* transform */
	
	_transform: function(){
		var container = this.container;
		
		// Active Transformation Matrix
		var m = container ? new ART.Transform(container._activeTransform).transform(this) : this;
		
		// Box in shape user space
		
		var box = this._boxCoords || this._size || defaultBox;
		
		var originX = box.left || 0,
			originY = box.top || 0,
			width = box.width || 1,
			height = box.height || 1;
				
		// Flipped
	    var flip = m.yx / m.xx > m.yy / m.xy;
		if (m.xx < 0 ? m.xy >= 0 : m.xy < 0) flip = !flip;
		flip = flip ? -1 : 1;
		
		m = new ART.Transform().scale(flip, 1).transform(m);
		
		// Rotation is approximated based on the transform
		var rotation = Math.atan2(-m.xy, m.yy) * 180 / Math.PI;
		
		// Reverse the rotation, leaving the final transform in box space
		var rad = rotation * Math.PI / 180, sin = Math.sin(rad), cos = Math.cos(rad);
		
		var transform = new ART.Transform(
			(m.xx * cos - m.xy * sin),
			(m.yx * cos - m.yy * sin) * flip,
			(m.xy * cos + m.xx * sin) * flip,
			(m.yy * cos + m.yx * sin)
		);

		var rotationTransform = new ART.Transform().rotate(rotation, 0, 0);

		var shapeToBox = new ART.Transform().rotate(-rotation, 0, 0).transform(m).moveTo(0,0);

		// Scale box after reversing rotation
		width *= Math.abs(shapeToBox.xx);
		height *= Math.abs(shapeToBox.yy);
		
		// Place box
		var left = m.x, top = m.y;
		
		// Compensate for offset by center origin rotation
		var vx = -width / 2, vy = -height / 2;
		var point = rotationTransform.point(vx, vy);
		left -= point.x - vx;
		top -= point.y - vy;
		
		// Adjust box position based on offset
		var rsm = new ART.Transform(m).moveTo(0,0);
		point = rsm.point(originX, originY);
		left += point.x;
		top += point.y;
		
		if (flip < 0) left = -left - width;
		
		// Place transformation origin
		var point0 = rsm.point(-originX, -originY);
		var point1 = rotationTransform.point(width, height);
		var point2 = rotationTransform.point(width, 0);
		var point3 = rotationTransform.point(0, height);
		
		var minX = Math.min(0, point1.x, point2.x, point3.x),
		    maxX = Math.max(0, point1.x, point2.x, point3.x),
		    minY = Math.min(0, point1.y, point2.y, point3.y),
		    maxY = Math.max(0, point1.y, point2.y, point3.y);
		
		var transformOriginX = (point0.x - point1.x / 2) / (maxX - minX) * flip,
		    transformOriginY = (point0.y - point1.y / 2) / (maxY - minY);
		
		// Adjust the origin
		point = shapeToBox.point(originX, originY);
		originX = point.x;
		originY = point.y;
		
		// Scale stroke
		var strokeWidth = this._strokeWidth;
		if (strokeWidth){
			// Scale is the hypothenus between the two vectors
			// TODO: Use area calculation instead
			var vx = m.xx + m.xy, vy = m.yy + m.yx;
			strokeWidth *= Math.sqrt(vx * vx + vy * vy) / Math.sqrt(2);
		}
		
		// convert to multiplied precision space
		originX *= precision;
		originY *= precision;
		left *= precision;
		top *= precision;
		width *= precision;
		height *= precision;
		
		// Set box
		var element = this.element;
		element.coordorigin = originX + ',' + originY;
		element.coordsize = width + ',' + height;
		element.style.left = left + 'px';
		element.style.top = top + 'px';
		element.style.width = width;
		element.style.height = height;
		element.style.rotation = rotation.toFixed(8);
		element.style.flip = flip < 0 ? 'x' : '';
		
		// Set transform
		var skew = this.skewElement;
		skew.matrix = [transform.xx.toFixed(4), transform.xy.toFixed(4), transform.yx.toFixed(4), transform.yy.toFixed(4), 0, 0];
		skew.origin = transformOriginX + ',' + transformOriginY;

		// Set stroke
		this.strokeElement.weight = strokeWidth + 'px';
	},
	
	/* styles */

	_createGradient: function(style, stops){
		var fill = this.fillElement;

		// Temporarily eject the fill from the DOM
		this.element.removeChild(fill);

		fill.type = style;
		fill.method = 'none';
		fill.rotate = true;

		var colors = [], color1, color2;

		var addColor = function(offset, color){
			color = Color.detach(color);
			if (color1 == null) color1 = color2 = color;
			else color2 = color;
			colors.push(offset + ' ' + color[0]);
		};

		// Enumerate stops, assumes offsets are enumerated in order
		if ('length' in stops) for (var i = 0, l = stops.length - 1; i <= l; i++) addColor(i / l, stops[i]);
		else for (var offset in stops) addColor(offset, stops[offset]);
		
		fill.color = color1[0];
		fill.color2 = color2[0];
		
		//if (fill.colors) fill.colors.value = colors; else
		fill.colors = colors;

		// Opacity order gets flipped when color stops are specified
		fill.opacity = color2[1];
		fill['ao:opacity2'] = color1[1];

		fill.on = true;
		this.element.appendChild(fill);
		return fill;
	},
	
	_setColor: function(type, color){
		var element = this[type + 'Element'];
		if (color == null){
			element.on = false;
		} else {
			color = Color.detach(color);
			element.color = color[0];
			element.opacity = color[1];
			element.on = true;
		}
	},
	
	fill: function(color){
		if (arguments.length > 1){
			this.fillLinear(arguments);
		} else {
			this._boxCoords = defaultBox;
			var fill = this.fillElement;
			fill.type = 'solid';
			fill.color2 = '';
			fill['ao:opacity2'] = '';
			if (fill.colors) fill.colors.value = '';
			this._setColor('fill', color);
		}
		return this;
	},

	fillRadial: function(stops, focusX, focusY, radiusX, radiusY, centerX, centerY){
		var fill = this._createGradient('gradientradial', stops);
		if (focusX == null) focusX = this.left + this.width * 0.5;
		if (focusY == null) focusY = this.top + this.height * 0.5;
		if (radiusY == null) radiusY = radiusX || (this.height * 0.5);
		if (radiusX == null) radiusX = this.width * 0.5;
		if (centerX == null) centerX = focusX;
		if (centerY == null) centerY = focusY;
		
		centerX += centerX - focusX;
		centerY += centerY - focusY;
		
		var box = this._boxCoords = {
			left: centerX - radiusX * 2,
			top: centerY - radiusY * 2,
			width: radiusX * 4,
			height: radiusY * 4
		};
		focusX -= box.left;
		focusY -= box.top;
		focusX /= box.width;
		focusY /= box.height;

		fill.focussize = '0 0';
		fill.focusposition = focusX + ',' + focusY;
		fill.focus = '50%';
		
		this._transform();
		
		return this;
	},

	fillLinear: function(stops, x1, y1, x2, y2){
		var fill = this._createGradient('gradient', stops);
		fill.focus = '100%';
		if (arguments.length == 5){
			var w = Math.abs(x2 - x1), h = Math.abs(y2 - y1);
			this._boxCoords = {
				left: Math.min(x1, x2),
				top: Math.min(y1, y2),
				width: w < 1 ? h : w,
				height: h < 1 ? w : h
			};
			fill.angle = (360 + Math.atan2((x2 - x1) / h, (y2 - y1) / w) * 180 / Math.PI) % 360;
		} else {
			this._boxCoords = null;
			fill.angle = (x1 == null) ? 0 : (90 + x1) % 360;
		}
		this._transform();
		return this;
	},

	fillImage: function(url, width, height, left, top, color1, color2){
		var fill = this.fillElement;
		if (color1 != null){
			color1 = Color.detach(color1);
			if (color2 != null) color2 = Color.detach(color2);
			fill.type = 'pattern';
			fill.color = color1[0];
			fill.color2 = color2 == null ? color1[0] : color2[0];
			fill.opacity = color2 == null ? 0 : color2[1];
			fill['ao:opacity2'] = color1[1];
		} else {
			fill.type = 'tile';
			fill.color = '';
			fill.color2 = '';
			fill.opacity = 1;
			fill['ao:opacity2'] = 1;
		}
		if (fill.colors) fill.colors.value = '';
		fill.rotate = true;
		fill.src = url;
		
		fill.size = '1,1';
		fill.position = '0,0';
		fill.origin = '0,0';
		fill.aspect = 'ignore'; // ignore, atleast, atmost
		fill.on = true;

		if (!left) left = 0;
		if (!top) top = 0;
		this._boxCoords = width ? { left: left + 0.5, top: top + 0.5, width: width, height: height } : null;
		this._transform();
		return this;
	},

	/* stroke */
	
	stroke: function(color, width, cap, join){
		var stroke = this.strokeElement;
		this._strokeWidth = (width != null) ? width : 1;
		stroke.weight = (width != null) ? width + 'px' : 1;
		stroke.endcap = (cap != null) ? ((cap == 'butt') ? 'flat' : cap) : 'round';
		stroke.joinstyle = (join != null) ? join : 'round';

		this._setColor('stroke', color);
		return this;
	}

});

// VML Shape Class

ART.VML.Shape = new Class({

	Extends: ART.VML.Base,
	
	initialize: function(path, width, height){
		this.parent('shape');

		var p = this.pathElement = document.createElement('av:path');
		p.gradientshapeok = true;
		this.element.appendChild(p);
		
		this.width = width;
		this.height = height;
		
		if (path != null) this.draw(path);
	},
	
	// SVG to VML
	
	draw: function(path, width, height){
		
		if (!(path instanceof ART.Path)) path = new ART.Path(path);
		this._vml = path.toVML(precision);
		this._size = path.measure();
		
		if (width != null) this.width = width;
		if (height != null) this.height = height;
		
		if (!this._boxCoords) this._transform();
		this._redraw(this._prefix, this._suffix);
		
		return this;
	},
	
	// radial gradient workaround

	_redraw: function(prefix, suffix){
		var vml = this._vml || '';

		this._prefix = prefix;
		this._suffix = suffix
		if (prefix){
			vml = [
				prefix, vml, suffix,
				// Don't stroke the path with the extra ellipse, redraw the stroked path separately
				'ns e', vml, 'nf'
			].join(' ');
		}

		this.element.path = vml + 'e';
	},

	fill: function(){
		this._redraw();
		return this.parent.apply(this, arguments);
	},

	fillLinear: function(){
		this._redraw();
		return this.parent.apply(this, arguments);
	},

	fillImage: function(){
		this._redraw();
		return this.parent.apply(this, arguments);
	},

	fillRadial: function(stops, focusX, focusY, radiusX, radiusY, centerX, centerY){
		var fill = this._createGradient('gradientradial', stops);
		if (focusX == null) focusX = (this.left || 0) + (this.width || 0) * 0.5;
		if (focusY == null) focusY = (this.top || 0) + (this.height || 0) * 0.5;
		if (radiusY == null) radiusY = radiusX || (this.height * 0.5) || 0;
		if (radiusX == null) radiusX = (this.width || 0) * 0.5;
		if (centerX == null) centerX = focusX;
		if (centerY == null) centerY = focusY;

		centerX += centerX - focusX;
		centerY += centerY - focusY;
		
		var cx = Math.round(centerX * precision),
			cy = Math.round(centerY * precision),

			rx = Math.round(radiusX * 2 * precision),
			ry = Math.round(radiusY * 2 * precision),

			arc = ['wa', cx - rx, cy - ry, cx + rx, cy + ry].join(' ');

		this._redraw(
			// Resolve rendering bug
			['m', cx, cy - ry, 'l', cx, cy - ry].join(' '),
			// Draw an ellipse around the path to force an elliptical gradient on any shape
			[
				'm', cx, cy - ry,
				arc, cx, cy - ry, cx, cy + ry, arc, cx, cy + ry, cx, cy - ry,
				arc, cx, cy - ry, cx, cy + ry, arc, cx, cy + ry, cx, cy - ry
			].join(' ')
		);

		this._boxCoords = { left: focusX - 2, top: focusY - 2, width: 4, height: 4 };
		
		fill.focusposition = '0.5,0.5';
		fill.focussize = '0 0';
		fill.focus = '50%';
		
		this._transform();
		
		return this;
	}

});

var fontAnchors = { start: 'left', middle: 'center', end: 'right' };

ART.VML.Text = new Class({

	Extends: ART.VML.Base,

	initialize: function(text, font, alignment, path){
		this.parent('shape');
		
		var p = this.pathElement = document.createElement('av:path');
		p.textpathok = true;
		this.element.appendChild(p);
		
		p = this.textPathElement = document.createElement("av:textpath");
		p.on = true;
		p.style['v-text-align'] = 'left';
		this.element.appendChild(p);
		
		this.draw.apply(this, arguments);
	},
	
	draw: function(text, font, alignment, path){
		var element = this.element,
		    textPath = this.textPathElement,
		    style = textPath.style;
		
		textPath.string = text;
		
		if (font){
			if (typeof font == 'string'){
				style.font = font;
			} else {
				for (var key in font){
					var ckey = key.camelCase ? key.camelCase() : key;
					if (ckey == 'fontFamily') style[ckey] = "'" + font[key] + "'";
					// NOT UNIVERSALLY SUPPORTED OPTIONS
					// else if (ckey == 'kerning') style['v-text-kern'] = !!font[key];
					// else if (ckey == 'rotateGlyphs') style['v-rotate-letters'] = !!font[key];
					// else if (ckey == 'letterSpacing') style['v-text-spacing'] = Number(font[key]) + '';
					else style[ckey] = font[key];
				}
			}
		}
		
		if (alignment) style['v-text-align'] = fontAnchors[alignment] || alignment;
		
		if (path){
			this.currentPath = path = new ART.Path(path);
			this.element.path = path.toVML(precision);
		} else if (!this.currentPath){
			var i = -1, offsetRows = '\n';
			while ((i = text.indexOf('\n', i + 1)) > -1) offsetRows += '\n';
			textPath.string = offsetRows + textPath.string;
			this.element.path = 'm0,0l1,0';
		}
		
		// Measuring the bounding box is currently necessary for gradients etc.
		
		// Clone element because the element is dead once it has been in the DOM
		element = element.cloneNode(true);
		style = element.style;
		
		// Reset coordinates while measuring
		element.coordorigin = '0,0';
		element.coordsize = '10000,10000';
		style.left = '0px';
		style.top = '0px';
		style.width = '10000px';
		style.height = '10000px';
		style.rotation = 0;
		element.removeChild(element.firstChild); // Remove skew
		
		// Inject the clone into the document
		
		var canvas = new ART.VML(1, 1),
		    group = new ART.VML.Group(), // Wrapping it in a group seems to alleviate some client rect weirdness
		    body = element.ownerDocument.body;
		
		canvas.inject(body);
		group.element.appendChild(element);
		group.inject(canvas);
		
		var ebb = element.getBoundingClientRect(),
		    cbb = canvas.toElement().getBoundingClientRect();
		
		canvas.eject();
		
		this.left = ebb.left - cbb.left;
		this.top = ebb.top - cbb.top;
		this.width = ebb.right - ebb.left;
		this.height = ebb.bottom - ebb.top;
		this.right = ebb.right - cbb.left;
		this.bottom = ebb.bottom - cbb.top;
		
		this._transform();

		this._size = { left: this.left, top: this.top, width: this.width, height: this.height};
		return this;
	}

});

// VML Path Extensions

var path, p, round = Math.round;

function moveTo(sx, sy, x, y){
	path.push('m', round(x * p), round(y * p));
};

function lineTo(sx, sy, x, y){
	path.push('l', round(x * p), round(y * p));
};

function curveTo(sx, sy, p1x, p1y, p2x, p2y, x, y){
	path.push('c',
		round(p1x * p), round(p1y * p),
		round(p2x * p), round(p2y * p),
		round(x * p), round(y * p)
	);
};

function arcTo(sx, sy, ex, ey, cx, cy, r, sa, ea, ccw){
	cx *= p;
	cy *= p;
	r *= p;
	path.push(ccw ? 'at' : 'wa',
		round(cx - r), round(cy - r),
		round(cx + r), round(cy + r),
		round(sx * p), round(sy * p),
		round(ex * p), round(ey * p)
	);
};

function close(){
	path.push('x');
};

ART.Path.implement({

	toVML: function(precision){
		if (this.cache.vml == null){
			path = [];
			p = precision;
			this.visit(lineTo, curveTo, arcTo, moveTo, close);
			this.cache.vml = path.join(' ');
		}
		return this.cache.vml;
	}

});

})();
/*
---
name: ART.Base
description: "Implements ART, ART.Shape and ART.Group based on the current browser."
provides: [ART.Base, ART.Group, ART.Shape, ART.Text]
requires: [ART.VML, ART.SVG]
...
*/

(function(){
	
var SVG = function(){

	var implementation = document.implementation;
	return (implementation && implementation.hasFeature && implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1"));

};

var VML = function(){

	return ART.VML.init(document);

};

var MODE = SVG() ? 'SVG' : VML() ? 'VML' : null;
if (!MODE) return;

ART.Shape = new Class({Extends: ART[MODE].Shape});
ART.Group = new Class({Extends: ART[MODE].Group});
ART.Text = new Class({Extends: ART[MODE].Text});
ART.implement({Extends: ART[MODE]});

})();

/*
---
 
script: ART.js
 
description: ART extensions
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
- ART/ART.Path
- ART/ART.SVG
- ART/ART.VML
- ART/ART.Base
- Core/Browser
 
provides: [ART, ART.Features]
 
...
*/

ART.implement({

  setHeight: function(height) {
    this.element.setAttribute('height', height);
    return this;
  },

  setWidth: function(width) {
    this.element.setAttribute('width', width);
    return this;
  }

});



ART.Features = {};
ART.Features.Blur = Browser.firefox; //TODO: Figure it out
/*
---
 
script: Arrow.js
 
description: An arrow shape. Useful for all the chat bubbles and validation errors.
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - ART/ART.Shape
 
provides: 
  - ART.Shape.Arrow
 
...
*/

ART.Shape.Arrow = new Class({

  Extends: ART.Shape,
  
  properties: ['width', 'height', 'radius', 'arrowWidth', 'arrowHeight', 'arrowSide', 'arrowPosition', 'arrowX', 'arrowY'],
  
  draw: function(width, height, radius, aw, ah, as, ap, ax, ay){

    var path = new ART.Path;
    
    if (!radius) radius = 0;

    if (typeof radius == 'number') radius = [radius, radius, radius, radius];

    var tl = radius[0], tr = radius[1], br = radius[2], bl = radius[3];

    if (tl < 0) tl = 0;
    if (tr < 0) tr = 0;
    if (bl < 0) bl = 0;
    if (br < 0) br = 0;
    
    var sides = {
      top: Math.abs(width) - (tr + tl),
      right: Math.abs(height) - (tr + br),
      bottom: Math.abs(width) - (br + bl),
      left: Math.abs(height) - (bl + tl)
    };
    
    switch (as){
      case 'top': path.move(0, ah); break;
      case 'left': path.move(ah, 0); break;
    }

    path.move(0, tl);
    
    if (typeof ap == 'string') ap = ((sides[as] - aw) * (ap.toFloat() / 100));
    if (ap < 0) ap = 0;
    else if (ap > sides[as] - aw) ap = sides[as] - aw;
    var ae = sides[as] - ap - aw, aw2 = aw / 2;

    if (width < 0) path.move(width, 0);
    if (height < 0) path.move(0, height);
    
    // top

    if (tl > 0) path.arc(tl, -tl);
    if (as == 'top') path.line(ap, 0).line(aw2, -ah).line(aw2, ah).line(ae, 0);
    else path.line(sides.top, 0);
    
    // right

    if (tr > 0) path.arc(tr, tr);
    if (as == 'right') path.line(0, ap).line(ah, aw2).line(-ah, aw2).line(0, ae);
    else path.line(0, sides.right);
    
    // bottom

    if (br > 0) path.arc(-br, br);
    if (as == 'bottom') path.line(-ap, 0).line(-aw2, ah).line(-aw2, -ah).line(-ae, 0);
    else path.line(-sides.bottom, 0);
    
    // left

    if (bl > 0) path.arc(-bl, -bl);
    if (as == 'left') path.line(0, -ap).line(-ah, -aw2).line(ah, -aw2).line(0, -ae);
    else path.line(0, -sides.left);

    return this.parent(path);
  },

  getOffset: function(styles) {
    return {
      left: (styles.arrowSide == 'left') ? styles.arrowWidth : 0,
      right: (styles.arrowSide == 'right') ? styles.arrowWidth : 0,
      top: (styles.arrowSide == 'top') ? styles.arrowHeight : 0,
      bottom: (styles.arrowSide == 'bottom') ? styles.arrowHeight : 0
    }
  },
  
  render: function(context) {
    return this.draw(context.size.width, context.size.height, context.radius)
  }

});

/*
---
 
script: Ellipse.js
 
description: Draw ellipses and circles without a hassle
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
- ART/ART.Shape
 
provides: [ART.Shape.Ellipse]
 
...
*/

ART.Shape.Ellipse = new Class({
  
  Extends: ART.Shape,
  
  properties: ['width', 'height'],
  
  initialize: function(width, height){
    this.parent();
    if (width != null && height != null) this.draw(width, height);
  },
  
  draw: function(width, height){
    var path = new ART.Path;
    var rx = width / 2, ry = height / 2;
    path.move(0, ry).arc(width, 0, rx, ry).arc(-width, 0, rx, ry);
    return this.parent(path);
  },
  
  produce: function(delta) {
    return new ART.Shapes.Ellipse(this.style.width + delta * 2, this.style.height + delta * 2)
  }

});
/*
---
 
script: Flower.js
 
description: Ever wanted a flower button? Here you go
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
- ART/ART.Shape
 
provides: [ART.Shape.Flower]
 
...
*/

ART.Shape.Flower = new Class({
  
  Extends: ART.Shape,
  
  properties: ['width', 'height', 'leaves', 'radius'],
  
  draw: function(width, height, leaves, radius){
     var path = new ART.Path,
         outside = width / 2,
         cx = width / 2,
         cy = cx,
         inside = outside * (radius || 0.5);
     
    leaves = Math.max(leaves || 0, 5);
    path.move(0, inside);
    var points = ["M", cx, cy + rin, "Q"],
        R;
    for (var i = 1; i < leaves * 2 + 1; i++) {
        R = i % 2 ? rout : rin;
        points = points.concat([+(cx + R * Math.sin(i * Math.PI / n)).toFixed(3), +(cy + R * Math.cos(i * Math.PI / n)).toFixed(3)]);
    }
    points.push("z");
    return this.path(points);
    
    
    return this.parent(path.close());
  },

  getOffset: function(styles, offset) {
    var stroke = (styles.strokeWidth || 0);
    return {
      left: ((styles.width == 'auto') ? Math.max(stroke - offset.left, 0) : stroke),
      top: 0,
      right: ((styles.width == 'auto') ? Math.max(stroke - offset.right, 0) : stroke),
      bottom: stroke
    }
  }

});  

//Raphael.fn.flower = function (cx, cy, rout, rin, n) {
//    rin = rin || rout * .5;
//    n = +n < 3 || !n ? 5 : n;
//    var points = ["M", cx, cy + rin, "Q"],
//        R;
//    for (var i = 1; i < n * 2 + 1; i++) {
//        R = i % 2 ? rout : rin;
//        points = points.concat([+(cx + R * Math.sin(i * Math.PI / n)).toFixed(3), +(cy + R * Math.cos(i * Math.PI / n)).toFixed(3)]);
//    }
//    points.push("z");
//    return this.path(points);
//};

/*
---
 
script: Rectangle.js
 
description: Rectangles with rounded corners
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
- ART/ART.Shape
 
provides: [ART.Shape.Rectangle]
 
...
*/

ART.Shape.Rectangle = new Class({

  Extends: ART.Shape,
  
  draw: function(width, height, radius) {
    var path = new ART.Path;
    if (!radius){

      path.move(0, 0).line(width, 0).line(0, height).line(-width, 0).line(0, -height);

    } else {

      if (typeof radius == 'number') radius = [radius, radius, radius, radius];

      var tl = radius[0], tr = radius[1], br = radius[2], bl = radius[3];

      if (tl < 0) tl = 0;
      if (tr < 0) tr = 0;
      if (bl < 0) bl = 0;
      if (br < 0) br = 0;

      path.move(0, tl);

      if (width < 0) path.move(width, 0);
      if (height < 0) path.move(0, height);

      if (tl > 0) path.arc(tl, -tl);
      path.line(Math.abs(width) - (tr + tl), 0);

      if (tr > 0) path.arc(tr, tr);
      path.line(0, Math.abs(height) - (tr + br));

      if (br > 0) path.arc(-br, br);
      path.line(- Math.abs(width) + (br + bl), 0);

      if (bl > 0) path.arc(-bl, -bl);
      path.line(0, - Math.abs(height) + (bl + tl));
    }
    
    return this.parent(path);
  },
  
  render: function(context) {
    var radius = context.radius;     
    if (radius && radius.length == 4) radius = [radius[0], radius[2], radius[3], radius[1]]       
    return this.draw(context.size.width, context.size.height, radius)
  }
});
/*
---
 
script: Star.js
 
description: A star with variable number of edges
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - ART/ART.Shape
 
provides: 
  - ART/ART.Shape.Star
 
...
*/

ART.Shape.Star = new Class({
  
  Extends: ART.Shape,
  
  properties: ['width', 'height', 'starRays', 'starRadius', 'starOffset'],
  
  draw: function(width, height, rays, radius, offset){
    if (rays == null) rays = 5;
    var path = new ART.Path;
    var outer = width / 2;
    var angle = Math.PI / rays;
    offset = angle / (offset || 2.1);
    if (radius == null) radius = outer *.582;
    var lx = 0, ly = 0;
    for (var i = 0; i < rays * 2; i++) { 
      var r = i % 2 ? outer : radius; 
      var x = r * Math.cos(i * angle + offset);
      var y = r * Math.sin(i * angle + offset);
      if (i == 0) {
        path.move(x - lx + outer, y - ly + outer)
      } else {
        path.line(x - lx, y - ly);
      }
      lx = x;
      ly = y;
    }
    return this.parent(path.close());
  }

});

!function() {
  var Properties = {
    starRays: ['number'],
    starRadius: ['length', 'percentage']
  }
}();
/*
---
 
script: Glyphs.js
 
description: Glyph library
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
- ART/ART
 
provides: [ART.Glyphs]
 
...
*/

ART.Glyphs = {
  
  wrench: 'M11.414,11.415c-0.781,0.78-2.048,0.78-2.829,0L3.17,5.999C3.112,6.002,3.058,6.016,3,6.016c-1.657,0-3-1.347-3-3.008c0-0.464,0.114-0.899,0.302-1.292l1.987,1.988c0.391,0.39,1.023,0.39,1.414,0c0.391-0.391,0.391-1.023,0-1.414L1.715,0.3C2.105,0.113,2.538,0,3,0c1.657,0,3,1.347,3,3.008c0,0.051-0.012,0.099-0.015,0.149l5.429,5.429C12.195,9.368,12.195,10.634,11.414,11.415z M11,9.501c0-0.276-0.224-0.5-0.5-0.5h-1c-0.277,0-0.501,0.224-0.501,0.5v1c0,0.275,0.224,0.5,0.501,0.5h1c0.276,0,0.5-0.225,0.5-0.5V9.501z',
  
  refresh: 'M0,0M5.142,6.504l-2,1.174c1.07,1.899,3.709,2.232,5.203,0.661l1.603,0.688c-2.096,2.846-6.494,2.559-8.234-0.508L0,9.524c0.199-1.665,0.398-3.329,0.597-4.993C2.112,5.189,3.626,5.847,5.142,6.504M6.858,5.51L6.844,5.505l0.013-0.008L6.858,5.51 M5.142,6.491C5.16,6.494,5.16,6.498,5.143,6.503L5.142,6.491 M11.402,7.466L12,2.477l-1.714,1.007C8.549,0.411,4.147,0.131,2.054,2.971L3.655,3.66C5.156,2.089,7.78,2.425,8.857,4.322l-2,1.175L11.402,7.466M12,12z',
  
  search: 'M0,0M11.707,11.707c-0.391,0.391-1.024,0.391-1.415,0L7.759,9.174c-0.791,0.523-1.736,0.832-2.755,0.832C2.24,10.006,0,7.766,0,5.003S2.24,0,5.003,0s5.003,2.24,5.003,5.003c0,1.02-0.309,1.966-0.833,2.755l2.533,2.533C12.098,10.683,12.098,11.315,11.707,11.707z M5.003,2.002c-1.658,0-3.002,1.344-3.002,3.001c0,1.658,1.344,3.002,3.002,3.002c1.657,0,3.001-1.344,3.001-3.002C8.005,3.346,6.66,2.002,5.003,2.002M12,12z',
  
  smallCross: 'M0,0M8.708,4.706L7.414,6l1.294,1.294c0.391,0.391,0.391,1.023,0,1.414s-1.023,0.391-1.414,0L6,7.414L4.706,8.708c-0.391,0.391-1.023,0.391-1.415,0c-0.39-0.391-0.39-1.023,0-1.414L4.586,6L3.292,4.706c-0.39-0.391-0.39-1.024,0-1.415c0.391-0.391,1.024-0.39,1.415,0L6,4.586l1.294-1.294c0.391-0.391,1.023-0.39,1.414,0C9.099,3.683,9.099,4.315,8.708,4.706M12,12z',
  
  smallPlus: 'M0,0M7,3.17V5h1.83c0.552,0,1,0.448,1,1c0,0.553-0.448,1-1,1H7v1.83c0,0.553-0.448,1-1,1.001c-0.552-0.001-1-0.448-1-1V7L3.17,7c-0.552,0-1-0.448-1-1c0-0.553,0.448-1,1-1H5v-1.83c0-0.552,0.448-1,1-1C6.552,2.17,7,2.617,7,3.17M12,12z',
  
  smallMinus: 'M0,0M8.83,5c0.553,0,1,0.448,1,1l0,0c0,0.552-0.447,1-1,1H3.17c-0.552,0-1-0.448-1-1l0,0c0-0.552,0.448-1,1-1H8.83M12,12z',
  
  resize: 'M0,0M8.299,12L12,8.299v1.414L9.713,12H8.299z M4.244,12L12,4.244v1.414L5.658,12H4.244z M0.231,12L12,0.231v1.414L1.646,12H0.231M12,12z',
  
  checkMark: 'M8.277,0.046L6.301,0L2.754,4.224L0.967,2.611L0,3.633l3.464,3.51L8.277,0.046z',
  radio: 'M2.5,0C3.881,0,5,1.119,5,2.5S3.881,5,2.5,5S0,3.881,0,2.5S1.119,0,2.5,0z',
  
  //triangles
  
  triangleUp: "M0,8L4,0L8,8L0,8",
  triangleDown: "M0,0L8,0L4,8L0,0",
  triangleLeft: "M0,4L8,0L8,8L0,4",
  triangleRight: "M0,0L8,4L0,8L0,0",
  triangles: "M0,6L3,0L6,6L0,6M0,10L6,10L3,16L0,10",
  
  plus: "M3,0L6,0L6,3L9,3L9,6L6,6L6,9L3,9L3,6L0,6L0,3L3,3Z",
  minus: "M9,9M0,1.5L9,1.5L9,4.5L0,4.5Z",
  shutdown: "M21.816,3.999c-0.993-0.481-2.189-0.068-2.673,0.927c-0.482,0.995-0.066,2.191,0.927,2.673c3.115,1.516,5.265,4.705,5.263,8.401c-0.01,5.154-4.18,9.324-9.333,9.333c-5.154-0.01-9.324-4.18-9.334-9.333c-0.002-3.698,2.149-6.89,5.267-8.403c0.995-0.482,1.408-1.678,0.927-2.673c-0.482-0.993-1.676-1.409-2.671-0.927C5.737,6.152,2.667,10.72,2.665,16C2.667,23.364,8.634,29.332,16,29.334c7.365-0.002,13.333-5.97,13.334-13.334C29.332,10.722,26.266,6.157,21.816,3.999z M16,13.833c1.104,0,1.999-0.894,1.999-2V2.499C17.999,1.394,17.104,0.5,16,0.5c-1.106,0-2,0.895-2,1.999v9.333C14,12.938,14.894,13.833,16,13.833z"
  
};
/*
---

name: Object

description: Object generic methods

license: MIT-style license.

requires: Type

provides: [Object, Hash]

...
*/

(function(){

var hasOwnProperty = Object.prototype.hasOwnProperty;

Object.extend({

	subset: function(object, keys){
		var results = {};
		for (var i = 0, l = keys.length; i < l; i++){
			var k = keys[i];
			if (k in object) results[k] = object[k];
		}
		return results;
	},

	map: function(object, fn, bind){
		var results = {};
		for (var key in object){
			if (hasOwnProperty.call(object, key)) results[key] = fn.call(bind, object[key], key, object);
		}
		return results;
	},

	filter: function(object, fn, bind){
		var results = {};
		for (var key in object){
			var value = object[key];
			if (hasOwnProperty.call(object, key) && fn.call(bind, value, key, object)) results[key] = value;
		}
		return results;
	},

	every: function(object, fn, bind){
		for (var key in object){
			if (hasOwnProperty.call(object, key) && !fn.call(bind, object[key], key)) return false;
		}
		return true;
	},

	some: function(object, fn, bind){
		for (var key in object){
			if (hasOwnProperty.call(object, key) && fn.call(bind, object[key], key)) return true;
		}
		return false;
	},

	keys: function(object){
		var keys = [];
		for (var key in object){
			if (hasOwnProperty.call(object, key)) keys.push(key);
		}
		return keys;
	},

	values: function(object){
		var values = [];
		for (var key in object){
			if (hasOwnProperty.call(object, key)) values.push(object[key]);
		}
		return values;
	},

	getLength: function(object){
		return Object.keys(object).length;
	},

	keyOf: function(object, value){
		for (var key in object){
			if (hasOwnProperty.call(object, key) && object[key] === value) return key;
		}
		return null;
	},

	contains: function(object, value){
		return Object.keyOf(object, value) != null;
	},

	toQueryString: function(object, base){
		var queryString = [];

		Object.each(object, function(value, key){
			if (base) key = base + '[' + key + ']';
			var result;
			switch (typeOf(value)){
				case 'object': result = Object.toQueryString(value, key); break;
				case 'array':
					var qs = {};
					value.each(function(val, i){
						qs[i] = val;
					});
					result = Object.toQueryString(qs, key);
				break;
				default: result = key + '=' + encodeURIComponent(value);
			}
			if (value != null) queryString.push(result);
		});

		return queryString.join('&');
	}

});

})();

//<1.2compat>

Hash.implement({

	has: Object.prototype.hasOwnProperty,

	keyOf: function(value){
		return Object.keyOf(this, value);
	},

	hasValue: function(value){
		return Object.contains(this, value);
	},

	extend: function(properties){
		Hash.each(properties || {}, function(value, key){
			Hash.set(this, key, value);
		}, this);
		return this;
	},

	combine: function(properties){
		Hash.each(properties || {}, function(value, key){
			Hash.include(this, key, value);
		}, this);
		return this;
	},

	erase: function(key){
		if (this.hasOwnProperty(key)) delete this[key];
		return this;
	},

	get: function(key){
		return (this.hasOwnProperty(key)) ? this[key] : null;
	},

	set: function(key, value){
		if (!this[key] || this.hasOwnProperty(key)) this[key] = value;
		return this;
	},

	empty: function(){
		Hash.each(this, function(value, key){
			delete this[key];
		}, this);
		return this;
	},

	include: function(key, value){
		if (this[key] == null) this[key] = value;
		return this;
	},

	map: function(fn, bind){
		return new Hash(Object.map(this, fn, bind));
	},

	filter: function(fn, bind){
		return new Hash(Object.filter(this, fn, bind));
	},

	every: function(fn, bind){
		return Object.every(this, fn, bind);
	},

	some: function(fn, bind){
		return Object.some(this, fn, bind);
	},

	getKeys: function(){
		return Object.keys(this);
	},

	getValues: function(){
		return Object.values(this);
	},

	toQueryString: function(base){
		return Object.toQueryString(this, base);
	}

});

Hash.extend = Object.append;

Hash.alias({indexOf: 'keyOf', contains: 'hasValue'});

//</1.2compat>

/*
---

name: Object

description: Object with normalized query string serialization

license: MIT-style license.

extends: Core/Object

...
*/

Object.extend({
	toQueryString: function(object, base){
		var queryString = [];
		var serialize = function(value, key, multiple){
			if (base) key = base + '[' + key + ']';
			if (multiple == true) key += '[]';
			var result;
			switch (typeOf(value)){
				case 'object': result = Object.toQueryString(value, key); break;
				case 'array':
					for (var i = 0, j = value.length; i < j; i++) serialize(value[i], key, true);
				break;
				default: result = key + '=' + encodeURIComponent(value);
			}
			if (value != null && result != null) queryString.push(result);
		};
		Object.each(object, serialize);
		return queryString.join('&');
	}
});
/*
---
 
script: Base.js
 
description: Speedy function that checks equality of objects (doing some nasty type assumption)
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin

extends: Core/Object

*/



Object.equals = function(one, another) {
  if (one == another) return true;
  if ((!one) ^ (!another)) return false;
  if (typeof one == 'undefined') return false;
  
  if ((one instanceof Array) || one.callee) {
    var j = one.length;
    if (j != another.length) return false;
    for (var i = 0; i < j; i++) if (!Object.equals(one[i], another[i])) return false;
    return true;
  } else if (one instanceof Color) {
    return (one.red == another.red) && (one.green == another.green) && (one.blue == another.blue) && (one.alpha == another.alpha)
  } else if (typeof one == 'object') {
    if (one.equals) return one.equals(another)
    for (var i in one) if (!Object.equals(one[i], another[i])) return false;
    return true;
  }
  return false;
};
/*
---

name: Event

description: Contains the Event Class, to make the event object cross-browser.

license: MIT-style license.

requires: [Window, Document, Array, Function, String, Object]

provides: Event

...
*/

var Event = new Type('Event', function(event, win){
	if (!win) win = window;
	var doc = win.document;
	event = event || win.event;
	if (event.$extended) return event;
	this.$extended = true;
	var type = event.type,
		target = event.target || event.srcElement,
		page = {},
		client = {},
		related = null,
		rightClick, wheel, code, key;
	while (target && target.nodeType == 3) target = target.parentNode;

	if (type.indexOf('key') != -1){
		code = event.which || event.keyCode;
		key = Object.keyOf(Event.Keys, code);
		if (type == 'keydown'){
			var fKey = code - 111;
			if (fKey > 0 && fKey < 13) key = 'f' + fKey;
		}
		if (!key) key = String.fromCharCode(code).toLowerCase();
	} else if ((/click|mouse|menu/i).test(type)){
		doc = (!doc.compatMode || doc.compatMode == 'CSS1Compat') ? doc.html : doc.body;
		page = {
			x: (event.pageX != null) ? event.pageX : event.clientX + doc.scrollLeft,
			y: (event.pageY != null) ? event.pageY : event.clientY + doc.scrollTop
		};
		client = {
			x: (event.pageX != null) ? event.pageX - win.pageXOffset : event.clientX,
			y: (event.pageY != null) ? event.pageY - win.pageYOffset : event.clientY
		};
		if ((/DOMMouseScroll|mousewheel/).test(type)){
			wheel = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
		}
		rightClick = (event.which == 3) || (event.button == 2);
		if ((/over|out/).test(type)){
			related = event.relatedTarget || event[(type == 'mouseover' ? 'from' : 'to') + 'Element'];
			var testRelated = function(){
				while (related && related.nodeType == 3) related = related.parentNode;
				return true;
			};
			var hasRelated = (Browser.firefox2) ? testRelated.attempt() : testRelated();
			related = (hasRelated) ? related : null;
		}
	} else if ((/gesture|touch/i).test(type)){
		this.rotation = event.rotation;
		this.scale = event.scale;
		this.targetTouches = event.targetTouches;
		this.changedTouches = event.changedTouches;
		var touches = this.touches = event.touches;
		if (touches && touches[0]){
			var touch = touches[0];
			page = {x: touch.pageX, y: touch.pageY};
			client = {x: touch.clientX, y: touch.clientY};
		}
	}

	return Object.append(this, {
		event: event,
		type: type,

		page: page,
		client: client,
		rightClick: rightClick,

		wheel: wheel,

		relatedTarget: document.id(related),
		target: document.id(target),

		code: code,
		key: key,

		shift: event.shiftKey,
		control: event.ctrlKey,
		alt: event.altKey,
		meta: event.metaKey
	});
});

Event.Keys = {
	'enter': 13,
	'up': 38,
	'down': 40,
	'left': 37,
	'right': 39,
	'esc': 27,
	'space': 32,
	'backspace': 8,
	'tab': 9,
	'delete': 46
};

//<1.2compat>

Event.Keys = new Hash(Event.Keys);

//</1.2compat>

Event.implement({

	stop: function(){
		return this.stopPropagation().preventDefault();
	},

	stopPropagation: function(){
		if (this.event.stopPropagation) this.event.stopPropagation();
		else this.event.cancelBubble = true;
		return this;
	},

	preventDefault: function(){
		if (this.event.preventDefault) this.event.preventDefault();
		else this.event.returnValue = false;
		return this;
	}

});

/*
---
 
script: LSD.js
 
description: LSD namespace definition
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - Core/Class
  - Core/Events
  - Core/Options
  - Core/Browser
  - Core/Object
  - Ext/Macro
  - Ext/States
  - Ext/Class.mixin
  - Ext/Object.Array
 
provides: 
  - LSD
 
...
*/

var LSD = Object.append(new Events, {
  Events: {},
  Attributes: {
    Numeric: Array.object('tabindex', 'width', 'height'),
    Boolean: Array.object('readonly', 'disabled', 'hidden', 'checked')
  },
  Styles: {},
  States: {
    Known: {
      built:    {enabler: 'build',      disabler: 'destroy',   reflect: false},
      attached: {enabler: 'attach',     disabler: 'detach',    reflect: false},
      hidden:   {enabler: 'hide',       disabler: 'show'},
      disabled: {enabler: 'disable',    disabler: 'enable'},
      active:   {enabler: 'activate',   disabler: 'deactivate'},
      focused:  {enabler: 'focus',      disabler: 'blur'},     
      selected: {enabler: 'select',     disabler: 'unselect'}, 
      checked:  {enabler: 'check',      disabler: 'uncheck',   toggler: 'toggle'},
      collapsed:{enabler: 'collapse',   disabler: 'expand',  toggler: 'toggle'},
      working:  {enabler: 'busy',       disabler: 'idle'},
      chosen:   {enabler: 'choose',     disabler: 'forget'},
      empty:    {enabler: 'empty',      disabler: 'fill',      property: 'unfilled', initial: true},
      invalid:  {enabler: 'invalidate', disabler: 'validate',   events: {enabler: 'invalid', disabler: 'valid'}},
      valid:    {enabler: 'validate',   disabler: 'invalidate', events: {enabler: 'valid', disabler: 'invalid'}},
      editing:  {enabler: 'edit',       disabler: 'finish'},
      placeheld:{enabler: 'placehold',  disabler: 'unplacehold'}
    },
    Positive: {
      disabled: 'disabled',
      focused: 'focused'
    },
    Negative: {
      enabled: 'disabled',
      blured: 'focused'
    },
    Attributes: {
      disabled: 'disabled',
      hidden: 'hidden'
    }
  },
  Options: {},
  useNative: true
});

States.get = function(name) { 
  return LSD.States.Known[name];
};
/*
---
 
script: Object.js
 
description: An observable object 
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD
  
provides:
  - LSD.Object
  
...
*/

LSD.Object = function(object) {
  if (object) for (var key in object) this.set(key, object[key]);
}
LSD.Object.prototype = {
  set: function(key, value) {
    var old = this[key];
    if (old === value) return false;
    if (old) {
      var onBeforeChange = this._beforechange;
      if (onBeforeChange) for (var i = 0, fn; fn = onBeforeChange[i++];) fn(key, old, false);
    }

    this[key] = value;
    var onChange = this._change;
    if (onChange) for (var i = 0, fn; fn = onChange[i++];) fn(key, value, true);
    var watched = this._watched;
    if (watched && (watched = watched[key])) for (var i = 0, fn; fn = watched[i++];) fn(value, old);
    return true;
  },
  unset: function(key, value) {
    var old = this[key];
    if (old == null) return false;
    for (var i = 0, a = this._change, fn; a && (fn = a[i++]);) fn(key, old, false);
    var watched = this._watched;
    if (watched && (watched = watched[key])) for (var i = 0, fn; fn = watched[i++];) fn(null, old);
    delete this[key];
    return true;
  },
  addEvent: function(name, callback) {
    var key = '_' + name;
    (this[key] || (this[key] = [])).push(callback);
    return this;
  },
  removeEvent: function(name, callback) {
    var key = '_' + name;
    var index = this[key].indexOf(callback);
    if (index > -1) this[key].splice(0, 1);
    return this;
  },
  watch: function(name, callback, lazy) {
    var index = name.indexOf('.');
    if (index > -1) {
      var finder = function(value, old) {
        (value || old)[value ? 'watch' : 'unwatch'](name.substring(index + 1), callback);
      };
      finder.callback = callback;
      this.watch(name.substr(0, index), finder)
    } else {
      var watched = (this._watched || (this._watched = {}));
      (watched[name] || (watched[name] = [])).push(callback);
      var value = this[name];
      if (!lazy && value != null) callback(value);
    }
  },
  unwatch: function(name, callback) {
    var index = name.indexOf('.');
    if (index > -1) {
      this.unwatch(name.substr(0, index), callback)
    } else {
      var watched = this._watched[name];
      for (var i = 0, fn; fn = watched[i++];) {
        if (fn == callback || fn.callback == callback) {
          watched.splice(i, 1);
          if (value != null) fn(null, value);
          break;
        }
      }
    }
  },
  toObject: function() {
    var object = {};
    for (var name in this) if (this.hasProperty(name)) object[name] = this[name];
    return {};
  },
  join: function(separator) {
    var ary = [];
    for (var name in this) if (this.hasProperty(name)) ary.push(name);
    return ary.join(separator)
  },
  hasProperty: function(name) {
    return this.hasOwnProperty(name) && (name.charAt(0) != '_')
  }
};


/*
---
 
script: Helpers.js
 
description: Some useful functions that are used internally 
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD
  
provides:
  - LSD.Helpers
  
...
*/

Object.append(LSD, {
  toLowerCase: function(lowercased) {
    return function(string) { 
      return (lowercased[string]) || (lowercased[string] = string.toLowerCase())
    }
  }(LSD.lowercased = {}),
  
  capitalize: function(capitalized) {
    return function(string) {
      return (capitalized[string]) || (capitalized[string] = string.capitalize())
    }
  }(LSD.capitalized = {}),
  
  toClassName: function(classnamed) {
    return function(string) {
      return (classnamed[string]) || (classnamed[string] = string.replace(/(^|-)([a-z])/g, function(a, b, c) { return (b ? '.' : '') + c.toUpperCase()}))
    }
  }(LSD.classnamed = {}),
  
  uid: function(object) {
    if (object.lsd) return object.lsd;
    if (object.localName) return $uid(object);
    return (object.lsd = ++LSD.UID); 
  },
  
  position: function(box, size, x, y) {
    var position = {x: 0, y: 0};

    switch (x) {
      case "left":
        position.x = 0;
      case "right":
        position.x = box.width - size.width;
      case "center":
        position.x = (box.width - size.width) / 2;
    }
    switch (y) {
      case "top":
        position.y = 0;
      case "bottom":
        position.y = box.height - size.height;
      case "center":
        position.y = (box.height- size.height) / 2;
    }
    return position;
  },
  
  UID: 0,
  
  slice: (Browser.ie ? function(list, start) {
    for (var i = start || 0, j = list.length, ary = []; i < j; i++) ary.push(list[i]);
    return ary;
  } : function(list, start) {
    return Array.prototype.slice.call(list, start || 0);
  })
});

if (!window.console) window.console = {};
if (!window.console.log) window.console.log = function() {};
['log', 'error', 'warn', 'info', 'dir'].each(function(method) {
  try { 
    LSD[method] = function() {
      try {
        (console[method] || console.log).apply(console.arguments);
      } catch(e){}
    } 
  } catch(e) {};
});

(function(toString) {
  Type.isEnumerable = function(item){
    return (item != null && !item.localName && !item.nodeType && toString.call(item) != '[object Function]' && typeof item.length == 'number');
  };
})(Object.prototype.toString);

/*
---
 
script: Action.js
 
description: Action encapsulates a single external node manipulation with the logic to revert it 
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires: 
  - LSD
  - LSD.Helpers
 
provides: 
  - LSD.Action
 
...
*/


LSD.Action = function(options, name) {
  this.options = this.options ? Object.append(options || {}, this.options) : options || {};
  this.name = name;
  this.events = {
    enable:  this.enable.bind(this),
    disable: this.disable.bind(this),
    detach:  this.disable.bind(this)
  }
  return this;
};

LSD.Action.initialize = function(options) {
  if (options.enabler) LSD.Action[LSD.toClassName(options.enabler)] = LSD.Action.build({
    enable: options.enable,
    disable: options.disable,
    getState: function() { return true; }
  })
  if (options.disabler) LSD.Action[LSD.toClassName(options.disabler)] = LSD.Action.build({
    enable: options.disable,
    disable: options.enable,
    getState: function() { return true; }
  })
};

LSD.Action.prototype = {
  
  enable: function() {
    if (this.enabled) return false;
    this.commit(this.target, arguments, this.target);
    if (this.options.events) this.target.addEvents(this.target.events[this.options.events]);
    if (this.enabled == null) this.target.addEvents(this.events);
    this.enabled = true;
    return true;
  },

  disable: function() {
    if (!this.enabled) return false;
    this.revert(this.target, arguments, this.target);
    if (this.options.events) this.target.removeEvents(this.target.events[this.options.events]);
    if (this.enabled != null) this.target.removeEvents(this.events);
    this.enabled = false;
    return true;
  },
  
  commit: function(target, args, bind) {
    if (this.state) this.target[this.state.enabler]();
    return this.options.enable && this.options.enable.apply(bind || this, [target].concat(args));
  },
  
  revert: function(target, args, bind) {
    if (this.state) this.target[this.state.disabler]();
    return this.options.disable && this.options.disable.apply(bind || this, [target].concat(args));
  },
  
  perform: function(target, args) {
    var method = (!this.options.getState || this.options.getState.apply(this, [target].concat(args))) ? 'commit' : 'revert';
    return this[method].apply(this, arguments);
  },

  use: function(widget, state) {
    var widgets = Array.prototype.slice.call(arguments, 0);
    var state = widgets.pop();
    this[state ? 'enable' : 'disable'].apply(this, widgets);
  },

  watch: function(widget, state) {
    if (!this[state ? 'enable' : 'disable'](widget)) //try enable the action
      this.options[state ? 'enable' : 'disable'].call(this.target, widget); //just fire the callback 
  },
  
  inject: function() {
    this.enable();
    if (this.state) this[state.enabler]();
  },

  attach: function(widget) {
    this.target = widget;
    this.state = this.name && widget.$states && widget.$states[this.name];
    if (this.state) {
      this.events[this.state.enabler] = this.options.enable.bind(this.target);
      this.events[this.state.disabler] = this.options.disabler.bind(this.target);
    }
    this.target.addEvents(this.events);
    if (this.options.uses) {
      this.target.use(this.options.uses, this.use.bind(this));
    } else if (this.options.watches) {
      this.target.watch(this.options.watches, this.watch.bind(this));
    } else if (!this.state || (name && this.target[name])) {
      if (this.target.lsd) {
        this.target.addEvent('setDocument', this.injection || ((this.injection = this.inject.bind(this))));
        if (this.target.document) this.inject();
      } else this.inject();
    }
  },

  detach: function(widget) {
    this.target.removeEvents(this.events);
    if (this.options.watches) this.target.unwatch(this.options.watches, this.watch);
    else if (this.options.uses) {
      
    } else {
      this.target.removeEvent('setDocument', this.injection);
    }
    if (this.enabled) this.disable();
    if (this.state) {
      this[this.state.disabler]();
      delete this.events[this.state.enabler], this.events[this.state.disabler];
    }
    this.target = this.state = null;
  },
  
  store: function(key, value) {
    if (!this.storage) this.storage = {};
    if (!key.indexOf && (typeof key !== 'number')) key = LSD.uid(key);
    this.storage[key] = value;
   },
  
  retrieve: function(key) {
    if (!this.storage) return;
    if (!key.indexOf && (typeof key !== 'number')) key = LSD.uid(key);
    return this.storage[key];
  },
  
  eliminate: function(key) {
    if (!this.storage) return;
    if (!key.indexOf && (typeof key !== 'number')) key = LSD.uid(key);
    delete this.storage[key];
  },
  
  getInvoker: function() {
    return this.invoker;
  },
  
  getDocument: function() {
    return this.invoker && this.invoker.document;
  }
}

LSD.Action.build = function(curry) {
  var action = function(options) {
    LSD.Action.apply(this, arguments);
  };
  action.prototype = Object.merge({options: curry}, LSD.Action.prototype);
  LSD.Action.initialize(action.prototype.options)
  return action;
};
/*
---
 
script: Create.js
 
description: Creates a layout based on selector object or DOM elements
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Action
 
provides:
  - LSD.Action.Create
 
...
*/


LSD.Action.Create = LSD.Action.build({
  enable: function(target) {
    
  }
});
/*
---
 
script: Update.js
 
description: Update widget with html or json
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Action

provides:
  - LSD.Action.Update
  - LSD.Action.Append
  - LSD.Action.Replace
  - LSD.Action.Before
  - LSD.Action.After

...
*/

LSD.Action.Update = LSD.Action.build({
  container: true,
  
  enable: function(target, content) {
    if (!content) return LSD.warn('Update action did not recieve content');
    var widget = LSD.Module.DOM.find(target);
    var fragment = document.createFragment(content);
    var children = LSD.slice(fragment.childNodes);
    var element = target.lsd ? target.toElement() : target;
    var container = (target.lsd || (widget.element == target && widget)) ? widget[this.options.container ? 'getWrapper' : 'toElement']() : element;
    var args = [container, widget, fragment, children, content];
    this.options.update.apply(this, args);
  },
  
  update: function(target, parent, fragment, children) {
    document.id(target).empty().appendChild(fragment);
    parent.fireEvent('DOMNodeInserted', [children]);
  }
});

LSD.Action.Append = LSD.Action.build({
  enable: LSD.Action.Update.prototype.options.enable,
  
  update: function(target, parent, fragment, children) {
    target.appendChild(fragment);
    parent.fireEvent('DOMNodeInserted', [children]);
  }
});

LSD.Action.Replace = LSD.Action.build({
  enable: LSD.Action.Update.prototype.options.enable,

  update: function(target, parent, fragment, children) {
    target.parentNode.replaceChild(fragment, target);
    parent.fireEvent('DOMNodeInserted', [children, target]);
  }
});

LSD.Action.Before = LSD.Action.build({
  enable: LSD.Action.Update.prototype.options.enable,

  update: function(target, parent, fragment, children) {
    target.parentNode.insertBefore(fragment, target);
    parent.fireEvent('DOMNodeInsertedBefore', [children, target]);
  }
});

LSD.Action.After = LSD.Action.build({
  enable: LSD.Action.Update.prototype.options.enable,

  update: function(target, widget, fragment, children) {
    target.parentNode.insertBefore(fragment, target.nextSibling);
    parent.fireEvent('DOMNodeInsertedBefore', [children, target.nextSibling]);
  }
});
/*
---

script: Delete.js

description: Deletes a widget or element

license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin

requires:
  - LSD.Action

provides:
  - LSD.Action.Delete

...
*/


LSD.Action.Delete = LSD.Action.build({
  enable: function(target) {
    var widget = LSD.Module.DOM.find(target, true);
    if (!widget) {
      widget = LSD.Module.DOM.find(target);
      LSD.Module.DOM.walk(target, function(node) {
        widget.dispatchEvent('nodeRemoved', node);
      });
      console.log('dispose', target)
      return Element.dispose(target);
    } else return (widget['delete'] || widget.dispose).call(widget);
  }
});
/*
---
 
script: Submit.js
 
description: Does a request or navigates url to the link
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Action
 
provides:
  - LSD.Action.Submit
 
...
*/


LSD.Action.Submit = LSD.Action.build({
  fork: true,
  
  enable: function(target, event) {
    if (this.retrieve(target)) return;
    var args = Array.prototype.slice.call(arguments, 1);
    var widget = LSD.Module.DOM.find(target, true);
    if (widget) target = widget;
    if (target.lsd && !target.submit && this.invoker != target && (!event || event.type != 'click')) {
      if (target.chainPhase == -1 || (target.getCommandAction && target.getCommandAction() == 'submit')) 
        return target.callChain.apply(target, args);
    }
    var method = (target.submit || target.send || target.click);
    var submission = method.apply(target, args);
    if (submission && submission != target) {
      this.store(target, submission);
      var self = this, callback = function() {
        this.removeEvents(events);
        self.eliminate(target);
      };
      var events = { complete: callback, cancel: callback };
      submission.addEvents(events);
    }
    return submission
  },
  
  disable: function(target) {
    var submission = this.retrieve(target);
    if (submission) {
      if (submission !== true && submission.running) submission.cancel();
      this.eliminate(target);
    } else {
      if (target.cancel) return target.cancel.apply(target, Array.prototype.slice.call(arguments, 1));
    }
  },
  
  getState: function(target) {
    var submission = this.retrieve(target);
    return !submission || !(submission !== true || submission.running);
  }
});
/*
---
 
script: State.js
 
description: Changes the state of a widget
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Action
 
provides:
  - LSD.Action.State
 
...
*/

LSD.Action.State = LSD.Action.build({
  enable: function(target, name) {
    target.addClass(name);
  },
  
  disable: function(target, name) {
    target.removeClass(name);
  },
  
  getState: function(target, name, state) {
    return !((state !== true && state !== false) ? target.hasClass(name) : state);
  }
});
/*
---
 
script: Set.js
 
description: Changes or synchronizes values
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Action

provides:
  - LSD.Action.Set
 
...
*/

LSD.Action.Set = LSD.Action.build({
  enable: function(target, value) {
    var widget = LSD.Module.DOM.find(target, true);
    switch (LSD.toLowerCase(target.tagName)) {
      case 'input': case 'textarea':
        if (target.applyValue) target.applyValue(value);
        else target.value = value; break;
      default:
        if (widget && widget.findItemByValue) {
          var item = widget.findItemByValue(value);
          if (item) item.check();
        } else if (!target.lsd) target.set('html', value);
        break;
    }
  }
});
/*
---
 
script: List.js
 
description: Shows or hides things
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Action
 
provides:
  - LSD.Action.List
  - LSD.Action.Next
  - LSD.Action.Previous
 
...
*/

LSD.Action.List = LSD.Action.build({
  enable: function(target) {
    var widget = LSD.Module.DOM.find(target, true);
    if (widget && widget.pseudos.list) widget.next();
  },
  
  disable: function(target) {
    var widget = LSD.Module.DOM.find(target, true);
    if (widget && widget.pseudos.list) widget.previous();
  },
  
  getState: function(target, state) {
    return state == 'true';
  },
  
  enabler: 'next',
  disabler: 'previous'
});
/*
---
 
script: Display.js
 
description: Shows or hides things
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Action
 
provides:
  - LSD.Action.Display
  - LSD.Action.Show
  - LSD.Action.Hide
 
...
*/

LSD.Action.Display = LSD.Action.build({
  enable: function(target) {
    var widget = LSD.Module.DOM.find(target, true);
    if (widget && widget.show) widget.show();
    else if (target.setStyle) {
      target.setStyle('display', target.retrieve('style:display') || 'inherit');
      target.removeAttribute('hidden');
    }
  },
  
  disable: function(target) {
    var widget = LSD.Module.DOM.find(target, true);
    if (widget && widget.hide) widget.hide();
    else if (target.setStyle) {
      target.store('style:display', target.getStyle('display'));
      target.setStyle('display', 'none');
      target.setAttribute('hidden', 'hidden');
    }
  },
  
  getState: function(target) {
    var element = (target.element || target);
    return target.hidden || (target.getAttribute && (target.getAttribute('hidden') == 'hidden')) || (element.getStyle && (element.getStyle('display') == 'none'));
  },
  
  enabler: 'show',
  disabler: 'hide'
});
/*
---
 
script: Toggle.js
 
description: Changes the checkedness state of a checkbox
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Action
 
provides:
  - LSD.Action.Toggle
  - LSD.Action.Check
  - LSD.Action.Uncheck
 
...
*/


LSD.Action.Toggle = LSD.Action.build({
  enable: function(target) {
    if (!target || target == this.invoker || target.element == this.invoker) return;
    var widget = LSD.Module.DOM.find(target, true);
    if (widget) target = widget;
    if (!target.checked) (target.check || target.click).apply(target, Array.prototype.slice.call(arguments, 1));
  },
  
  disable: function(target) {
    if (!target || target == this.invoker || target.element == this.invoker) return;
    var widget = LSD.Module.DOM.find(target, true);
    if (widget) target = widget;
    if (target.checked) (target.uncheck || target.click).apply(target, Array.prototype.slice.call(arguments, 1));
  },
  
  getState: function(target, name, state) {
    return (state !== true && state !== false) ? this.invoker.checked : !state;
  },

  enabler: 'check',
  disabler: 'uncheck'
});
/*
---
 
script: Clone.js
 
description: Clones an element and inserts it back to parent again
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Action
 
provides:
  - LSD.Action.Clone
 
...
*/


LSD.Action.Clone = LSD.Action.build({
  enable: function(target, where) {
    var widget = LSD.Module.DOM.find(target);
    if (widget == target) var element = widget.element, parent = widget.parentNode;
    else var element = target, parent = widget;
    var clone = widget.layout.render(element, parent, {clone: true});
    switch(where) {
      case "before": case "after": case "top": case "bottom":
        break;
      default:
        where = 'after'
    };
    document.id(clone).inject(target, where);
  }
});
/*
---
 
script: Focus.js
 
description: Brings attention to element
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Action
 
provides:
  - LSD.Action.Focus
 
...
*/

LSD.Action.Focus = LSD.Action.build({
  enable: function(target) {
    return (target.focus || target.click).apply(target, Array.prototype.slice(arguments, 1));
  },
  
  disable: function(target) {
    if (target.blur) return target.blur();
  }
})
/*
---
 
script: Counter.js
 
description: Increments the number and the label in html element
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Action
  - String.Inflections/String.camelize
 
provides:
  - LSD.Action.Counter
  - LSD.Action.Increment
  - LSD.Action.Decrement
 
...
*/


!function() {

LSD.Action.Counter = LSD.Action.build({
  enable: function(target, number) {
    var counter = this.retrieve(target)
    if (!counter) this.store(target, (counter = new Counter(target.innerHTML)));
    target.innerHTML = counter.increment(number).toString();
  },
  
  disable: function(target, number) {
    var counter = this.retrieve(target)
    if (!counter) this.store(target, (counter = new Counter(target.innerHTML)));
    target.innerHTML = counter.decrement(number).toString();
  },

  enabler: 'increment',
  disabler: 'decrement'
});

var Counter = String.Counter = function(string) {
  this.parsed = this.parse(string);
  if (this.parsed) {
    this.parsed.shift();
    if (this.parsed[3].toLowerCase() == 'one') this.parsed[3] = 1;
    this.parsed[3] = parseInt(this.parsed[3]);
    var singular = (this.parsed[3] == 1);
    this[singular ? 'singular' : 'plural'] = this.parsed[9];
    this[singular ? 'plural' : 'singular'] = this.parsed[9][singular ? 'pluralize' : 'singularize']()
  }
};

Counter.prototype = {
  parse: function(string) {
    return (this.parsed = string.match(Counter.regexp));
  },
  
  increment: function(arg) {
    this.parsed[3] += (arg || 1)
    return this;
  },
  
  decrement: function(arg) {
    this.parsed[3] -= (arg || 1)
    return this;
  },
  
  toString: function() {
    var clone = this.parsed.slice(0);
    if (this.parsed[3]) {
      delete this.parsed[1];
      delete this.parsed[13];
    }
    this.parsed[9] = this[this.parsed[3] == 1 ? 'singular' : 'plural'];
    return this.parsed.join('');
  }
}

Counter.regexp = new RegExp('^(.*?\\s*)' + 
                            '((?:just|only)\\s*?)?' + 
                            '(<[^\\s\>]+?[^>]*?>\\s*)?' + 
                            '(\\d+|no|one)' + 
                            '(\\s*)' +
                            '(<\\/[^\\s]+?[^>]+?>)?' + 
                            '(\\s*)' +
                            '(<[^\\s]+?[^>]+?>)?' + 
                            '(\\s*)' +
                            '(.+?)' +
                            '(\\s*?)' + 
                            '(<\\/[^\\s]+?[^>]+?>)?' + 
                            '(\\s*?)' +
                            '(\\s*yet)?' +
                            '($|(?:\\s(?:now|on|if|under|at|in|for|by|so|and|to)\\s|[\\.\\!\\?\\;\\,]))(.*?)$', 'mi');
                            
}();
/*
---
 
script: Invoke.js
 
description: Invokes a widget and breaks execution chain
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Action
 
provides:
  - LSD.Action.p
 
...
*/


LSD.Action.Invoke = LSD.Action.build({
  enable: function(target) {
    var widget = LSD.Module.DOM.find(target);
    this.store(target, widget);
    var result = widget.invoke.apply(widget, [this.invoker].concat(Array.slice(arguments, 1)));
    return (result == true || result == widget) ? false : result;
  },
  
  disable: function(target) {
    var invokee = this.retrieve(target);
    if (invokee) invokee.revoke();
  }
});
/*
---
 
script: Checkbox.js
 
description: A triggerable interaction abstraction
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD
 
provides: 
  - LSD.Command
 
...
*/

LSD.Command = function(document, options) {
  this.setOptions(options);
  this.widgets = [];
  this.$events = Object.clone(this.$events);
  if (document) {
    this.document = document;
    if (!this.document.commands) this.document.commands = {};
    this.document.commands[this.options.id] = this;
  }
  if (this.options.type) this.setType(this.options.type);
};

LSD.Command.prototype = Object.append(new Options, new Events, new States, {
  options: {
    id: null,
    action: null
  },
  
  click: function() {
    this.fireEvent('click', arguments);
  },
  
  attach: function(widget) {
    for (var name in this.$states) {
      if (!widget.$states[name]) {
        widget.addState(name);
        widget.$states[name].origin = this;
      }
      this.linkState(widget, name, name, true);
      widget.linkState(this, name, name, true);
    }
    widget.fireEvent('register', ['command', this]);
    this.widgets.push(widget);
    return this;
  },
  
  detach: function(widget) {
    widget.fireEvent('unregister', ['command', this]);
    for (var name in this.$states) {
      this.linkState(widget, name, name, false);
      if (widget.$states[name].origin == this); widget.removeState(name);
    }
    this.widgets.erase(widget);
    return this;
  },
  
  setType: function(type, unset) {
    if (this.type == type) return;
    if (this.type) this.unsetType(type);
    switch (type) {
      case "checkbox":
        /*
          Checkbox commands are useful when you need to track and toggle
          state of some linked object. 

          Provide your custom logic hooking on *check* and *uncheck*
          state transitions. Use *checked* property to get the current state.

          Examples:
            - Button that toggles visibility of a sidebar
            - Context menu item that shows or hides line numbers in editor
        */
        this.events = {
          click: function() {
            this.toggle();
          }
        }
        break;
        

      /*
        Radio groupping is a way to links commands together to allow
        only one in the group be active at the moment of time.

        Activation (*check*ing) of the commands deactivates all 
        other commands in a radiogroup.

        Examples: 
          - Tabs on top of a content window
          - Select box with a dropdown menu
      */
      case "radio":
        var name = this.options.radiogroup;
        if (name) {
          var groups = this.document.radiogroups;
          if (!groups) groups = this.document.radiogroups = {};
          var group = groups[name];
          if (!group) group = groups[name] = [];
          group.push(this);
          this.group = group;
          this.events = {
            click: function() {
              this.check.apply(this, arguments);
            },
            check: function() {
              group.each(function(sibling) {
                if (sibling != this) sibling.uncheck();
              }, this);
            }
          };
        }
    }
    if (this.events) this.addEvents(this.events);
  },
  
  unsetType: function() {
    if (this.events) {
      this.removeEvents(this.events);
      delete this.events;
    }
    delete this.type;
  }
});

LSD.Command.prototype.addStates('disabled', 'checked');
/*
---

script: More.js

name: More

description: MooTools More

license: MIT-style license

authors:
  - Guillermo Rauch
  - Thomas Aylott
  - Scott Kyle
  - Arian Stolwijk
  - Tim Wienk
  - Christoph Pojer
  - Aaron Newton
  - Jacob Thornton

requires:
  - Core/MooTools

provides: [MooTools.More]

...
*/

MooTools.More = {
	'version': '1.3.2.2dev',
	'build': '%build%'
};

/*
---

script: Class.Binds.js

name: Class.Binds

description: Automagically binds specified methods in a class to the instance of the class.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Class
  - /MooTools.More

provides: [Class.Binds]

...
*/

Class.Mutators.Binds = function(binds){
	if (!this.prototype.initialize) this.implement('initialize', function(){});
	return Array.from(binds).concat(this.prototype.Binds || []);
};

Class.Mutators.initialize = function(initialize){
	return function(){
		Array.from(this.Binds).each(function(name){
			var original = this[name];
			if (original) this[name] = original.bind(this);
		}, this);
		return initialize.apply(this, arguments);
	};
};


/*
---

script: Class.Binds.js

description: Removes mutators added by Class.Binds that breaks multiple inheritance

license: MIT-style license

authors:
  - Aaron Newton

extends: More/Class.Binds
...
*/

//empty

delete Class.Mutators.Binds;
delete Class.Mutators.initialize;
/*
---

script: String.QueryString.js

name: String.QueryString

description: Methods for dealing with URI query strings.

license: MIT-style license

authors:
  - Sebastian Markbåge
  - Aaron Newton
  - Lennart Pilon
  - Valerio Proietti

requires:
  - Core/Array
  - Core/String
  - /MooTools.More

provides: [String.QueryString]

...
*/

String.implement({

	parseQueryString: function(decodeKeys, decodeValues){
		if (decodeKeys == null) decodeKeys = true;
		if (decodeValues == null) decodeValues = true;

		var vars = this.split(/[&;]/),
			object = {};
		if (!vars.length) return object;

		vars.each(function(val){
			var index = val.indexOf('=') + 1,
				value = index ? val.substr(index) : '',
				keys = index ? val.substr(0, index - 1).match(/([^\]\[]+|(\B)(?=\]))/g) : [val],
				obj = object;
			if (!keys) return;
			if (decodeValues) value = decodeURIComponent(value);
			keys.each(function(key, i){
				if (decodeKeys) key = decodeURIComponent(key);
				var current = obj[key];

				if (i < keys.length - 1) obj = obj[key] = current || {};
				else if (typeOf(current) == 'array') current.push(value);
				else obj[key] = current != null ? [current, value] : value;
			});
		});

		return object;
	},

	cleanQueryString: function(method){
		return this.split('&').filter(function(val){
			var index = val.indexOf('='),
				key = index < 0 ? '' : val.substr(0, index),
				value = val.substr(index + 1);

			return method ? method.call(null, key, value) : (value || value === 0);
		}).join('&');
	}

});

/*
---

script: String.js

name: String

description: Normalized query string methods with array empty index support

license: MIT-style license

extends: More/String.QueryString

...
*/

String.implement({
	parseQueryString: function(decodeKeys, decodeValues){
		var object = {};
		for (var pair, bits, pairs = this.split('&'), i = 0, j = pairs.length; i < j; i++) {
			pair = pairs[i].split('=');
			var name = pair[0], value = pair[1];
			if (decodeValues !== false && value != null) value = decodeURIComponent(value);
			if (decodeKeys !== false) name = decodeURIComponent(name);
			var keys = name.match(/([^\]\[]+|(\B)(?=\]))/g);
			for (var key, bit, path = object, k = 0, l = keys.length; (key = keys[k]) || k < l; k++) {
				if (k == l - 1) key ? (path[key] = value) : path.push(value);
				else path = (path[key] || (path[key] = path[key] = (keys[k + 1] == "") ? [] : {}))
			}
		}
  	return object;
	}
});
/*
---

script: Object.Extras.js

name: Object.Extras

description: Extra Object generics, like getFromPath which allows a path notation to child elements.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Object
  - /MooTools.More

provides: [Object.Extras]

...
*/

(function(){

var defined = function(value){
	return value != null;
};

var hasOwnProperty = Object.prototype.hasOwnProperty;

Object.extend({

	getFromPath: function(source, parts){
		if (typeof parts == 'string') parts = parts.split('.');
		for (var i = 0, l = parts.length; i < l; i++){
			if (hasOwnProperty.call(source, parts[i])) source = source[parts[i]];
			else return null;
		}
		return source;
	},

	cleanValues: function(object, method){
		method = method || defined;
		for (var key in object) if (!method(object[key])){
			delete object[key];
		}
		return object;
	},

	erase: function(object, key){
		if (hasOwnProperty.call(object, key)) delete object[key];
		return object;
	},

	run: function(object){
		var args = Array.slice(arguments, 1);
		for (var key in object) if (object[key].apply){
			object[key].apply(object, args);
		}
		return object;
	}

});

})();

/*
---

script: Locale.js

name: Locale

description: Provides methods for localization.

license: MIT-style license

authors:
  - Aaron Newton
  - Arian Stolwijk

requires:
  - Core/Events
  - /Object.Extras
  - /MooTools.More

provides: [Locale, Lang]

...
*/

(function(){

var current = null,
	locales = {},
	inherits = {};

var getSet = function(set){
	if (instanceOf(set, Locale.Set)) return set;
	else return locales[set];
};

var Locale = this.Locale = {

	define: function(locale, set, key, value){
		var name;
		if (instanceOf(locale, Locale.Set)){
			name = locale.name;
			if (name) locales[name] = locale;
		} else {
			name = locale;
			if (!locales[name]) locales[name] = new Locale.Set(name);
			locale = locales[name];
		}

		if (set) locale.define(set, key, value);

		/*<1.2compat>*/
		if (set == 'cascade') return Locale.inherit(name, key);
		/*</1.2compat>*/

		if (!current) current = locale;

		return locale;
	},

	use: function(locale){
		locale = getSet(locale);

		if (locale){
			current = locale;

			this.fireEvent('change', locale);

			/*<1.2compat>*/
			this.fireEvent('langChange', locale.name);
			/*</1.2compat>*/
		}

		return this;
	},

	getCurrent: function(){
		return current;
	},

	get: function(key, args){
		return (current) ? current.get(key, args) : '';
	},

	inherit: function(locale, inherits, set){
		locale = getSet(locale);

		if (locale) locale.inherit(inherits, set);
		return this;
	},

	list: function(){
		return Object.keys(locales);
	}

};

Object.append(Locale, new Events);

Locale.Set = new Class({

	sets: {},

	inherits: {
		locales: [],
		sets: {}
	},

	initialize: function(name){
		this.name = name || '';
	},

	define: function(set, key, value){
		var defineData = this.sets[set];
		if (!defineData) defineData = {};

		if (key){
			if (typeOf(key) == 'object') defineData = Object.merge(defineData, key);
			else defineData[key] = value;
		}
		this.sets[set] = defineData;

		return this;
	},

	get: function(key, args, _base){
		var value = Object.getFromPath(this.sets, key);
		if (value != null){
			var type = typeOf(value);
			if (type == 'function') value = value.apply(null, Array.from(args));
			else if (type == 'object') value = Object.clone(value);
			return value;
		}

		// get value of inherited locales
		var index = key.indexOf('.'),
			set = index < 0 ? key : key.substr(0, index),
			names = (this.inherits.sets[set] || []).combine(this.inherits.locales).include('en-US');
		if (!_base) _base = [];

		for (var i = 0, l = names.length; i < l; i++){
			if (_base.contains(names[i])) continue;
			_base.include(names[i]);

			var locale = locales[names[i]];
			if (!locale) continue;

			value = locale.get(key, args, _base);
			if (value != null) return value;
		}

		return '';
	},

	inherit: function(names, set){
		names = Array.from(names);

		if (set && !this.inherits.sets[set]) this.inherits.sets[set] = [];

		var l = names.length;
		while (l--) (set ? this.inherits.sets[set] : this.inherits.locales).unshift(names[l]);

		return this;
	}

});

/*<1.2compat>*/
var lang = MooTools.lang = {};

Object.append(lang, Locale, {
	setLanguage: Locale.use,
	getCurrentLanguage: function(){
		var current = Locale.getCurrent();
		return (current) ? current.name : null;
	},
	set: function(){
		Locale.define.apply(this, arguments);
		return this;
	},
	get: function(set, key, args){
		if (key) set += '.' + key;
		return Locale.get(set, args);
	}
});
/*</1.2compat>*/

})();

/*
---

name: Locale.en-US.Date

description: Date messages for US English.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - /Locale

provides: [Locale.en-US.Date]

...
*/

Locale.define('en-US', 'Date', {

	months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	months_abbr: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	days_abbr: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

	// Culture's date order: MM/DD/YYYY
	dateOrder: ['month', 'date', 'year'],
	shortDate: '%m/%d/%Y',
	shortTime: '%I:%M%p',
	AM: 'AM',
	PM: 'PM',
	firstDayOfWeek: 0,

	// Date.Extras
	ordinal: function(dayOfMonth){
		// 1st, 2nd, 3rd, etc.
		return (dayOfMonth > 3 && dayOfMonth < 21) ? 'th' : ['th', 'st', 'nd', 'rd', 'th'][Math.min(dayOfMonth % 10, 4)];
	},

	lessThanMinuteAgo: 'less than a minute ago',
	minuteAgo: 'about a minute ago',
	minutesAgo: '{delta} minutes ago',
	hourAgo: 'about an hour ago',
	hoursAgo: 'about {delta} hours ago',
	dayAgo: '1 day ago',
	daysAgo: '{delta} days ago',
	weekAgo: '1 week ago',
	weeksAgo: '{delta} weeks ago',
	monthAgo: '1 month ago',
	monthsAgo: '{delta} months ago',
	yearAgo: '1 year ago',
	yearsAgo: '{delta} years ago',

	lessThanMinuteUntil: 'less than a minute from now',
	minuteUntil: 'about a minute from now',
	minutesUntil: '{delta} minutes from now',
	hourUntil: 'about an hour from now',
	hoursUntil: 'about {delta} hours from now',
	dayUntil: '1 day from now',
	daysUntil: '{delta} days from now',
	weekUntil: '1 week from now',
	weeksUntil: '{delta} weeks from now',
	monthUntil: '1 month from now',
	monthsUntil: '{delta} months from now',
	yearUntil: '1 year from now',
	yearsUntil: '{delta} years from now'

});

/*
---

script: Date.js

name: Date

description: Extends the Date native object to include methods useful in managing dates.

license: MIT-style license

authors:
  - Aaron Newton
  - Nicholas Barthelemy - https://svn.nbarthelemy.com/date-js/
  - Harald Kirshner - mail [at] digitarald.de; http://digitarald.de
  - Scott Kyle - scott [at] appden.com; http://appden.com

requires:
  - Core/Array
  - Core/String
  - Core/Number
  - MooTools.More
  - Locale
  - Locale.en-US.Date

provides: [Date]

...
*/

(function(){

var Date = this.Date;

var DateMethods = Date.Methods = {
	ms: 'Milliseconds',
	year: 'FullYear',
	min: 'Minutes',
	mo: 'Month',
	sec: 'Seconds',
	hr: 'Hours'
};

['Date', 'Day', 'FullYear', 'Hours', 'Milliseconds', 'Minutes', 'Month', 'Seconds', 'Time', 'TimezoneOffset',
	'Week', 'Timezone', 'GMTOffset', 'DayOfYear', 'LastMonth', 'LastDayOfMonth', 'UTCDate', 'UTCDay', 'UTCFullYear',
	'AMPM', 'Ordinal', 'UTCHours', 'UTCMilliseconds', 'UTCMinutes', 'UTCMonth', 'UTCSeconds', 'UTCMilliseconds'].each(function(method){
	Date.Methods[method.toLowerCase()] = method;
});

var pad = function(n, digits, string){
	if (digits == 1) return n;
	return n < Math.pow(10, digits - 1) ? (string || '0') + pad(n, digits - 1, string) : n;
};

Date.implement({

	set: function(prop, value){
		prop = prop.toLowerCase();
		var method = DateMethods[prop] && 'set' + DateMethods[prop];
		if (method && this[method]) this[method](value);
		return this;
	}.overloadSetter(),

	get: function(prop){
		prop = prop.toLowerCase();
		var method = DateMethods[prop] && 'get' + DateMethods[prop];
		if (method && this[method]) return this[method]();
		return null;
	}.overloadGetter(),

	clone: function(){
		return new Date(this.get('time'));
	},

	increment: function(interval, times){
		interval = interval || 'day';
		times = times != null ? times : 1;

		switch (interval){
			case 'year':
				return this.increment('month', times * 12);
			case 'month':
				var d = this.get('date');
				this.set('date', 1).set('mo', this.get('mo') + times);
				return this.set('date', d.min(this.get('lastdayofmonth')));
			case 'week':
				return this.increment('day', times * 7);
			case 'day':
				return this.set('date', this.get('date') + times);
		}

		if (!Date.units[interval]) throw new Error(interval + ' is not a supported interval');

		return this.set('time', this.get('time') + times * Date.units[interval]());
	},

	decrement: function(interval, times){
		return this.increment(interval, -1 * (times != null ? times : 1));
	},

	isLeapYear: function(){
		return Date.isLeapYear(this.get('year'));
	},

	clearTime: function(){
		return this.set({hr: 0, min: 0, sec: 0, ms: 0});
	},

	diff: function(date, resolution){
		if (typeOf(date) == 'string') date = Date.parse(date);

		return ((date - this) / Date.units[resolution || 'day'](3, 3)).round(); // non-leap year, 30-day month
	},

	getLastDayOfMonth: function(){
		return Date.daysInMonth(this.get('mo'), this.get('year'));
	},

	getDayOfYear: function(){
		return (Date.UTC(this.get('year'), this.get('mo'), this.get('date') + 1)
			- Date.UTC(this.get('year'), 0, 1)) / Date.units.day();
	},

	setDay: function(day, firstDayOfWeek){
		if (firstDayOfWeek == null){
			firstDayOfWeek = Date.getMsg('firstDayOfWeek');
			if (firstDayOfWeek === '') firstDayOfWeek = 1;
		}

		day = (7 + Date.parseDay(day, true) - firstDayOfWeek) % 7;
		var currentDay = (7 + this.get('day') - firstDayOfWeek) % 7;

		return this.increment('day', day - currentDay);
	},

	getWeek: function(firstDayOfWeek){
		if (firstDayOfWeek == null){
			firstDayOfWeek = Date.getMsg('firstDayOfWeek');
			if (firstDayOfWeek === '') firstDayOfWeek = 1;
		}

		var date = this,
			dayOfWeek = (7 + date.get('day') - firstDayOfWeek) % 7,
			dividend = 0,
			firstDayOfYear;

		if (firstDayOfWeek == 1){
			// ISO-8601, week belongs to year that has the most days of the week (i.e. has the thursday of the week)
			var month = date.get('month'),
				startOfWeek = date.get('date') - dayOfWeek;

			if (month == 11 && startOfWeek > 28) return 1; // Week 1 of next year

			if (month == 0 && startOfWeek < -2){
				// Use a date from last year to determine the week
				date = new Date(date).decrement('day', dayOfWeek);
				dayOfWeek = 0;
			}

			firstDayOfYear = new Date(date.get('year'), 0, 1).get('day') || 7;
			if (firstDayOfYear > 4) dividend = -7; // First week of the year is not week 1
		} else {
			// In other cultures the first week of the year is always week 1 and the last week always 53 or 54.
			// Days in the same week can have a different weeknumber if the week spreads across two years.
			firstDayOfYear = new Date(date.get('year'), 0, 1).get('day');
		}

		dividend += date.get('dayofyear');
		dividend += 6 - dayOfWeek; // Add days so we calculate the current date's week as a full week
		dividend += (7 + firstDayOfYear - firstDayOfWeek) % 7; // Make up for first week of the year not being a full week

		return (dividend / 7);
	},

	getOrdinal: function(day){
		return Date.getMsg('ordinal', day || this.get('date'));
	},

	getTimezone: function(){
		return this.toString()
			.replace(/^.*? ([A-Z]{3}).[0-9]{4}.*$/, '$1')
			.replace(/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/, '$1$2$3');
	},

	getGMTOffset: function(){
		var off = this.get('timezoneOffset');
		return ((off > 0) ? '-' : '+') + pad((off.abs() / 60).floor(), 2) + pad(off % 60, 2);
	},

	setAMPM: function(ampm){
		ampm = ampm.toUpperCase();
		var hr = this.get('hr');
		if (hr > 11 && ampm == 'AM') return this.decrement('hour', 12);
		else if (hr < 12 && ampm == 'PM') return this.increment('hour', 12);
		return this;
	},

	getAMPM: function(){
		return (this.get('hr') < 12) ? 'AM' : 'PM';
	},

	parse: function(str){
		this.set('time', Date.parse(str));
		return this;
	},

	isValid: function(date){
		return !isNaN((date || this).valueOf());
	},

	format: function(format){
		if (!this.isValid()) return 'invalid date';

		if (!format) format = '%x %X';
		if (typeof format == 'string') format = formats[format.toLowerCase()] || format;
		if (typeof format == 'function') return format(this);

		var d = this;
		return format.replace(/%([a-z%])/gi,
			function($0, $1){
				switch ($1){
					case 'a': return Date.getMsg('days_abbr')[d.get('day')];
					case 'A': return Date.getMsg('days')[d.get('day')];
					case 'b': return Date.getMsg('months_abbr')[d.get('month')];
					case 'B': return Date.getMsg('months')[d.get('month')];
					case 'c': return d.format('%a %b %d %H:%M:%S %Y');
					case 'd': return pad(d.get('date'), 2);
					case 'e': return pad(d.get('date'), 2, ' ');
					case 'H': return pad(d.get('hr'), 2);
					case 'I': return pad((d.get('hr') % 12) || 12, 2);
					case 'j': return pad(d.get('dayofyear'), 3);
					case 'k': return pad(d.get('hr'), 2, ' ');
					case 'l': return pad((d.get('hr') % 12) || 12, 2, ' ');
					case 'L': return pad(d.get('ms'), 3);
					case 'm': return pad((d.get('mo') + 1), 2);
					case 'M': return pad(d.get('min'), 2);
					case 'o': return d.get('ordinal');
					case 'p': return Date.getMsg(d.get('ampm'));
					case 's': return Math.round(d / 1000);
					case 'S': return pad(d.get('seconds'), 2);
					case 'T': return d.format('%H:%M:%S');
					case 'U': return pad(d.get('week'), 2);
					case 'w': return d.get('day');
					case 'x': return d.format(Date.getMsg('shortDate'));
					case 'X': return d.format(Date.getMsg('shortTime'));
					case 'y': return d.get('year').toString().substr(2);
					case 'Y': return d.get('year');
					case 'z': return d.get('GMTOffset');
					case 'Z': return d.get('Timezone');
				}
				return $1;
			}
		);
	},

	toISOString: function(){
		return this.format('iso8601');
	}

}).alias({
	toJSON: 'toISOString',
	compare: 'diff',
	strftime: 'format'
});

// The day and month abbreviations are standardized, so we cannot use simply %a and %b because they will get localized
var rfcDayAbbr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
	rfcMonthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

var formats = {
	db: '%Y-%m-%d %H:%M:%S',
	compact: '%Y%m%dT%H%M%S',
	'short': '%d %b %H:%M',
	'long': '%B %d, %Y %H:%M',
	rfc822: function(date){
		return rfcDayAbbr[date.get('day')] + date.format(', %d ') + rfcMonthAbbr[date.get('month')] + date.format(' %Y %H:%M:%S %Z');
	},
	rfc2822: function(date){
		return rfcDayAbbr[date.get('day')] + date.format(', %d ') + rfcMonthAbbr[date.get('month')] + date.format(' %Y %H:%M:%S %z');
	},
	iso8601: function(date){
		return (
			date.getUTCFullYear() + '-' +
			pad(date.getUTCMonth() + 1, 2) + '-' +
			pad(date.getUTCDate(), 2) + 'T' +
			pad(date.getUTCHours(), 2) + ':' +
			pad(date.getUTCMinutes(), 2) + ':' +
			pad(date.getUTCSeconds(), 2) + '.' +
			pad(date.getUTCMilliseconds(), 3) + 'Z'
		);
	}
};

var parsePatterns = [],
	nativeParse = Date.parse;

var parseWord = function(type, word, num){
	var ret = -1,
		translated = Date.getMsg(type + 's');
	switch (typeOf(word)){
		case 'object':
			ret = translated[word.get(type)];
			break;
		case 'number':
			ret = translated[word];
			if (!ret) throw new Error('Invalid ' + type + ' index: ' + word);
			break;
		case 'string':
			var match = translated.filter(function(name){
				return this.test(name);
			}, new RegExp('^' + word, 'i'));
			if (!match.length) throw new Error('Invalid ' + type + ' string');
			if (match.length > 1) throw new Error('Ambiguous ' + type);
			ret = match[0];
	}

	return (num) ? translated.indexOf(ret) : ret;
};

var startCentury = 1900,
	startYear = 70;

Date.extend({

	getMsg: function(key, args){
		return Locale.get('Date.' + key, args);
	},

	units: {
		ms: Function.from(1),
		second: Function.from(1000),
		minute: Function.from(60000),
		hour: Function.from(3600000),
		day: Function.from(86400000),
		week: Function.from(608400000),
		month: function(month, year){
			var d = new Date;
			return Date.daysInMonth(month != null ? month : d.get('mo'), year != null ? year : d.get('year')) * 86400000;
		},
		year: function(year){
			year = year || new Date().get('year');
			return Date.isLeapYear(year) ? 31622400000 : 31536000000;
		}
	},

	daysInMonth: function(month, year){
		return [31, Date.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
	},

	isLeapYear: function(year){
		return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
	},

	parse: function(from){
		var t = typeOf(from);
		if (t == 'number') return new Date(from);
		if (t != 'string') return from;
		from = from.clean();
		if (!from.length) return null;

		var parsed;
		parsePatterns.some(function(pattern){
			var bits = pattern.re.exec(from);
			return (bits) ? (parsed = pattern.handler(bits)) : false;
		});

		if (!(parsed && parsed.isValid())){
			parsed = new Date(nativeParse(from));
			if (!(parsed && parsed.isValid())) parsed = new Date(from.toInt());
		}
		return parsed;
	},

	parseDay: function(day, num){
		return parseWord('day', day, num);
	},

	parseMonth: function(month, num){
		return parseWord('month', month, num);
	},

	parseUTC: function(value){
		var localDate = new Date(value);
		var utcSeconds = Date.UTC(
			localDate.get('year'),
			localDate.get('mo'),
			localDate.get('date'),
			localDate.get('hr'),
			localDate.get('min'),
			localDate.get('sec'),
			localDate.get('ms')
		);
		return new Date(utcSeconds);
	},

	orderIndex: function(unit){
		return Date.getMsg('dateOrder').indexOf(unit) + 1;
	},

	defineFormat: function(name, format){
		formats[name] = format;
		return this;
	},

	//<1.2compat>
	parsePatterns: parsePatterns,
	//</1.2compat>

	defineParser: function(pattern){
		parsePatterns.push((pattern.re && pattern.handler) ? pattern : build(pattern));
		return this;
	},

	defineParsers: function(){
		Array.flatten(arguments).each(Date.defineParser);
		return this;
	},

	define2DigitYearStart: function(year){
		startYear = year % 100;
		startCentury = year - startYear;
		return this;
	}

}).extend({
	defineFormats: Date.defineFormat.overloadSetter()
});

var regexOf = function(type){
	return new RegExp('(?:' + Date.getMsg(type).map(function(name){
		return name.substr(0, 3);
	}).join('|') + ')[a-z]*');
};

var replacers = function(key){
	switch (key){
		case 'T':
			return '%H:%M:%S';
		case 'x': // iso8601 covers yyyy-mm-dd, so just check if month is first
			return ((Date.orderIndex('month') == 1) ? '%m[-./]%d' : '%d[-./]%m') + '([-./]%y)?';
		case 'X':
			return '%H([.:]%M)?([.:]%S([.:]%s)?)? ?%p? ?%z?';
	}
	return null;
};

var keys = {
	d: /[0-2]?[0-9]|3[01]/,
	H: /[01]?[0-9]|2[0-3]/,
	I: /0?[1-9]|1[0-2]/,
	M: /[0-5]?\d/,
	s: /\d+/,
	o: /[a-z]*/,
	p: /[ap]\.?m\.?/,
	y: /\d{2}|\d{4}/,
	Y: /\d{4}/,
	z: /Z|[+-]\d{2}(?::?\d{2})?/
};

keys.m = keys.I;
keys.S = keys.M;

var currentLanguage;

var recompile = function(language){
	currentLanguage = language;

	keys.a = keys.A = regexOf('days');
	keys.b = keys.B = regexOf('months');

	parsePatterns.each(function(pattern, i){
		if (pattern.format) parsePatterns[i] = build(pattern.format);
	});
};

var build = function(format){
	if (!currentLanguage) return {format: format};

	var parsed = [];
	var re = (format.source || format) // allow format to be regex
	 .replace(/%([a-z])/gi,
		function($0, $1){
			return replacers($1) || $0;
		}
	).replace(/\((?!\?)/g, '(?:') // make all groups non-capturing
	 .replace(/ (?!\?|\*)/g, ',? ') // be forgiving with spaces and commas
	 .replace(/%([a-z%])/gi,
		function($0, $1){
			var p = keys[$1];
			if (!p) return $1;
			parsed.push($1);
			return '(' + p.source + ')';
		}
	).replace(/\[a-z\]/gi, '[a-z\\u00c0-\\uffff;\&]'); // handle unicode words

	return {
		format: format,
		re: new RegExp('^' + re + '$', 'i'),
		handler: function(bits){
			bits = bits.slice(1).associate(parsed);
			var date = new Date().clearTime(),
				year = bits.y || bits.Y;

			if (year != null) handle.call(date, 'y', year); // need to start in the right year
			if ('d' in bits) handle.call(date, 'd', 1);
			if ('m' in bits || bits.b || bits.B) handle.call(date, 'm', 1);

			for (var key in bits) handle.call(date, key, bits[key]);
			return date;
		}
	};
};

var handle = function(key, value){
	if (!value) return this;

	switch (key){
		case 'a': case 'A': return this.set('day', Date.parseDay(value, true));
		case 'b': case 'B': return this.set('mo', Date.parseMonth(value, true));
		case 'd': return this.set('date', value);
		case 'H': case 'I': return this.set('hr', value);
		case 'm': return this.set('mo', value - 1);
		case 'M': return this.set('min', value);
		case 'p': return this.set('ampm', value.replace(/\./g, ''));
		case 'S': return this.set('sec', value);
		case 's': return this.set('ms', ('0.' + value) * 1000);
		case 'w': return this.set('day', value);
		case 'Y': return this.set('year', value);
		case 'y':
			value = +value;
			if (value < 100) value += startCentury + (value < startYear ? 100 : 0);
			return this.set('year', value);
		case 'z':
			if (value == 'Z') value = '+00';
			var offset = value.match(/([+-])(\d{2}):?(\d{2})?/);
			offset = (offset[1] + '1') * (offset[2] * 60 + (+offset[3] || 0)) + this.getTimezoneOffset();
			return this.set('time', this - offset * 60000);
	}

	return this;
};

Date.defineParsers(
	'%Y([-./]%m([-./]%d((T| )%X)?)?)?', // "1999-12-31", "1999-12-31 11:59pm", "1999-12-31 23:59:59", ISO8601
	'%Y%m%d(T%H(%M%S?)?)?', // "19991231", "19991231T1159", compact
	'%x( %X)?', // "12/31", "12.31.99", "12-31-1999", "12/31/2008 11:59 PM"
	'%d%o( %b( %Y)?)?( %X)?', // "31st", "31st December", "31 Dec 1999", "31 Dec 1999 11:59pm"
	'%b( %d%o)?( %Y)?( %X)?', // Same as above with month and day switched
	'%Y %b( %d%o( %X)?)?', // Same as above with year coming first
	'%o %b %d %X %z %Y', // "Thu Oct 22 08:11:23 +0000 2009"
	'%T', // %H:%M:%S
	'%H:%M( ?%p)?' // "11:05pm", "11:05 am" and "11:05"
);

Locale.addEvent('change', function(language){
	if (Locale.get('Date')) recompile(language);
}).fireEvent('change', Locale.getCurrent());

})();

/*
---
name: Slick.Parser
description: Standalone CSS3 Selector parser
provides: Slick.Parser
replaces: Core/Slick.Parser
...
*/

;(function(){

var parsed,
	separatorIndex,
	combinatorIndex,
	reversed,
	cache = {},
	reverseCache = {},
	reUnescape = /\\/g;

var parse = function(expression, isReversed){
	if (expression == null) return null;
	if (expression.Slick === true) return expression;
	expression = ('' + expression).replace(/^\s+|\s+$/g, '');
	reversed = !!isReversed;
	var currentCache = (reversed) ? reverseCache : cache;
	if (currentCache[expression]) return currentCache[expression];
	parsed = {
		Slick: true,
		expressions: [],
		raw: expression,
		reverse: function(){
			return parse(this.raw, true);
		}
	};
	separatorIndex = -1;
	while (expression != (expression = expression.replace(regexp, parser)));
	parsed.length = parsed.expressions.length;
	return currentCache[parsed.raw] = (reversed) ? reverse(parsed) : parsed;
};

var reverseCombinator = function(combinator){
	if (combinator === '!') return ' ';
	else if (combinator === ' ') return '!';
	else if ((/^!/).test(combinator)) return combinator.replace(/^!/, '');
	else return '!' + combinator;
};

var reverse = function(expression){
	var expressions = expression.expressions;
	for (var i = 0; i < expressions.length; i++){
		var exp = expressions[i];
		var last = {tag: '*', combinator: reverseCombinator(exp[0].combinator)};

		for (var j = 0; j < exp.length; j++){
			var cexp = exp[j];
			if (!cexp.reverseCombinator) cexp.reverseCombinator = ' ';
			cexp.combinator = cexp.reverseCombinator;
			delete cexp.reverseCombinator;
		}

		exp.reverse().push(last);
	}
	return expression;
};

var escapeRegExp = function(string){// Credit: XRegExp 0.6.1 (c) 2007-2008 Steven Levithan <http://stevenlevithan.com/regex/xregexp/> MIT License
	return string.replace(/[-[\]{}()*+?.\\^$|,#\s]/g, function(match){
		return '\\' + match;
	});
};

var regexp = new RegExp(
/*
#!/usr/bin/env ruby
puts "\t\t" + DATA.read.gsub(/\(\?x\)|\s+#.*$|\s+|\\$|\\n/,'')
__END__
	"(?x)^(?:\
	  \\s* ( , ) \\s*               # Separator          \n\
	| \\s* ( <combinator>+ ) \\s*   # Combinator         \n\
	|      ( \\s+ )                 # CombinatorChildren \n\
	|      ( <unicode>+ | \\* )     # Tag                \n\
	| \\#  ( <unicode>+       )     # ID                 \n\
	| \\.  ( <unicode>+       )     # ClassName          \n\
	|                               # Attribute          \n\
	\\[  \
		\\s* (<unicode1>+)  (?:  \
			\\s* ([*^$!~|]?=)  (?:  \
				\\s* (?:\
					([\"']?)(.*?)\\9 \
				)\
			)  \
		)?  \\s*  \
	\\](?!\\]) \n\
	|   :+ ( <unicode>+ )(?:\
	\\( (?:\
		(?:([\"'])([^\\12]*)\\12)|((?:\\([^)]+\\)|[^()]*)+)\
	) \\)\
	)?\
	)"
*/
	"^(?:\\s*(,)\\s*|\\s*(<combinator>+)\\s*|(\\s+)|(<unicode>+|\\*)|\\#(<unicode>+)|\\.(<unicode>+)|\\[\\s*(<unicode1>+)(?:\\s*([*^$!~|]?=)(?:\\s*(?:([\"']?)(.*?)\\9)))?\\s*\\](?!\\])|(:)(<unicode>+)(?:\\((?:(?:([\"'])([^\\13]*)\\13)|((?:\\([^)]+\\)|[^()]*)+))\\))?)"
	.replace(/<combinator>/, '(?:\\:\\:|[' + escapeRegExp(">+~`!@$%^&={}\\;</") + '])')
	.replace(/<unicode>/g, '(?:[\\w\\u00a1-\\uFFFF-]|\\\\[^\\s0-9a-f])')
	.replace(/<unicode1>/g, '(?:[:\\w\\u00a1-\\uFFFF-]|\\\\[^\\s0-9a-f])')
);

function parser(
	rawMatch,

	separator,
	combinator,
	combinatorChildren,

	tagName,
	id,
	className,

	attributeKey,
	attributeOperator,
	attributeQuote,
	attributeValue,

	pseudoMarker,
	pseudoClass,
	pseudoQuote,
	pseudoClassQuotedValue,
	pseudoClassValue
){
	if (separator || separatorIndex === -1){
		parsed.expressions[++separatorIndex] = [];
		combinatorIndex = -1;
		if (separator) return '';
	}

	if (combinator || combinatorChildren || combinatorIndex === -1){
		combinator = combinator || ' ';
		var currentSeparator = parsed.expressions[separatorIndex];
		if (reversed && currentSeparator[combinatorIndex])
			currentSeparator[combinatorIndex].reverseCombinator = reverseCombinator(combinator);
		currentSeparator[++combinatorIndex] = {combinator: combinator, tag: '*'};
	}

	var currentParsed = parsed.expressions[separatorIndex][combinatorIndex];

	if (tagName){
		currentParsed.tag = tagName.replace(reUnescape, '');

	} else if (id){
		currentParsed.id = id.replace(reUnescape, '');

	} else if (className){
		className = className.replace(reUnescape, '');

		if (!currentParsed.classList) currentParsed.classList = [];
		if (!currentParsed.classes) currentParsed.classes = [];
		currentParsed.classList.push(className);
		currentParsed.classes.push({
			value: className,
			regexp: new RegExp('(^|\\s)' + escapeRegExp(className) + '(\\s|$)')
		});

	} else if (pseudoClass){
		pseudoClassValue = pseudoClassValue || pseudoClassQuotedValue;
		pseudoClassValue = pseudoClassValue ? pseudoClassValue.replace(reUnescape, '') : null;

		if (!currentParsed.pseudos) currentParsed.pseudos = [];
		currentParsed.pseudos.push({
			key: pseudoClass.replace(reUnescape, ''),
			value: pseudoClassValue,
			type: pseudoMarker.length == 1 ? 'class' : 'element'
		});

	} else if (attributeKey){
		attributeKey = attributeKey.replace(reUnescape, '');
		attributeValue = (attributeValue || '').replace(reUnescape, '');

		var test, regexp;

		switch (attributeOperator){
			case '^=' : regexp = new RegExp(       '^'+ escapeRegExp(attributeValue)            ); break;
			case '$=' : regexp = new RegExp(            escapeRegExp(attributeValue) +'$'       ); break;
			case '~=' : regexp = new RegExp( '(^|\\s)'+ escapeRegExp(attributeValue) +'(\\s|$)' ); break;
			case '|=' : regexp = new RegExp(       '^'+ escapeRegExp(attributeValue) +'(-|$)'   ); break;
			case  '=' : test = function(value){
				return attributeValue == value;
			}; break;
			case '*=' : test = function(value){
				return value && value.indexOf(attributeValue) > -1;
			}; break;
			case '!=' : test = function(value){
				return attributeValue != value;
			}; break;
			default   : test = function(value){
				return !!value;
			};
		}

		if (attributeValue == '' && (/^[*$^]=$/).test(attributeOperator)) test = function(){
			return false;
		};

		if (!test) test = function(value){
			return value && regexp.test(value);
		};

		if (!currentParsed.attributes) currentParsed.attributes = [];
		currentParsed.attributes.push({
			key: attributeKey,
			operator: attributeOperator,
			value: attributeValue,
			test: test
		});

	}

	return '';
};

// Slick NS

var Slick = (this.Slick || {});

Slick.parse = function(expression){
	return parse(expression);
};

Slick.escapeRegExp = escapeRegExp;

if (!this.Slick) this.Slick = Slick;

}).apply(/*<CommonJS>*/(typeof exports != 'undefined') ? exports : /*</CommonJS>*/this);

/*
---

name: Events.Pseudos

description: Adds the functionality to add pseudo events

license: MIT-style license

authors:
  - Arian Stolwijk

requires: [Core/Class.Extras, Core/Slick.Parser, More/MooTools.More]

provides: [Events.Pseudos]

...
*/

Events.Pseudos = function(pseudos, addEvent, removeEvent){

	var storeKey = 'monitorEvents:';

	var storageOf = function(object){
		return {
			store: object.store ? function(key, value){
				object.store(storeKey + key, value);
			} : function(key, value){
				(object.$monitorEvents || (object.$monitorEvents = {}))[key] = value;
			},
			retrieve: object.retrieve ? function(key, dflt){
				return object.retrieve(storeKey + key, dflt);
			} : function(key, dflt){
				if (!object.$monitorEvents) return dflt;
				return object.$monitorEvents[key] || dflt;
			}
		};
	};

	var splitType = function(type){
		if (type.indexOf(':') == -1 || !pseudos) return null;

		var parsed = Slick.parse(type).expressions[0][0],
			parsedPseudos = parsed.pseudos,
			l = parsedPseudos.length,
			splits = [];

		while (l--) if (pseudos[parsedPseudos[l].key]){
			splits.push({
				event: parsed.tag,
				value: parsedPseudos[l].value,
				pseudo: parsedPseudos[l].key,
				original: type
			});
		}

		return splits.length ? splits : null;
	};

	var mergePseudoOptions = function(split){
		return Object.merge.apply(this, split.map(function(item){
			return pseudos[item.pseudo].options || {};
		}));
	};

	return {

		addEvent: function(type, fn, internal){
			var split = splitType(type);
			if (!split) return addEvent.call(this, type, fn, internal);

			var storage = storageOf(this),
				events = storage.retrieve(type, []),
				eventType = split[0].event,
				options = mergePseudoOptions(split),
				stack = fn,
				eventOptions = options[eventType] || {},
				args = Array.slice(arguments, 2),
				self = this,
				monitor;

			if (eventOptions.args) args.append(Array.from(eventOptions.args));
			if (eventOptions.base) eventType = eventOptions.base;
			if (eventOptions.onAdd) eventOptions.onAdd(this);

			split.each(function(item){
				var stackFn = stack;
				stack = function(){
					(eventOptions.listener || pseudos[item.pseudo].listener).call(self, item, stackFn, arguments, monitor, options);
				};
			});
			monitor = stack.bind(this);

			events.include({event: fn, monitor: monitor});
			storage.store(type, events);

			addEvent.apply(this, [type, fn].concat(args));
			return addEvent.apply(this, [eventType, monitor].concat(args));
		},

		removeEvent: function(type, fn){
			var split = splitType(type);
			if (!split) return removeEvent.call(this, type, fn);

			var storage = storageOf(this),
				events = storage.retrieve(type);
			if (!events) return this;

			var eventType = split[0].event,
				options = mergePseudoOptions(split),
				eventOptions = options[eventType] || {},
				args = Array.slice(arguments, 2);

			if (eventOptions.args) args.append(Array.from(eventOptions.args));
			if (eventOptions.base) eventType = eventOptions.base;
			if (eventOptions.onRemove) eventOptions.onRemove(this);

			removeEvent.apply(this, [type, fn].concat(args));
			events.each(function(monitor, i){
				if (!fn || monitor.event == fn) removeEvent.apply(this, [eventType, monitor.monitor].concat(args));
				delete events[i];
			}, this);

			storage.store(type, events);
			return this;
		}

	};

};

(function(){

var pseudos = {

	once: {
		listener: function(split, fn, args, monitor){
			fn.apply(this, args);
			this.removeEvent(split.event, monitor)
				.removeEvent(split.original, fn);
		}
	},

	throttle: {
		listener: function(split, fn, args){
			if (!fn._throttled){
				fn.apply(this, args);
				fn._throttled = setTimeout(function(){
					fn._throttled = false;
				}, split.value || 250);
			}
		}
	},

	pause: {
		listener: function(split, fn, args){
			clearTimeout(fn._pause);
			fn._pause = fn.delay(split.value || 250, this, args);
		}
	}

};

Events.definePseudo = function(key, listener){
	pseudos[key] = Type.isFunction(listener) ? {listener: listener} : listener;
	return this;
};

Events.lookupPseudo = function(key){
	return pseudos[key];
};

var proto = Events.prototype;
Events.implement(Events.Pseudos(pseudos, proto.addEvent, proto.removeEvent));

['Request', 'Fx'].each(function(klass){
	if (this[klass]) this[klass].implement(Events.prototype);
});

})();

/*
---
name: Slick.Finder
description: The new, superfast css selector engine.
provides: Slick.Finder
requires: Slick.Parser
replaces: Core/Slick.Finder
...
*/

;(function(){

var local = {},
	featuresCache = {},
	toString = Object.prototype.toString;

// Feature / Bug detection

local.isNativeCode = function(fn){
	return (/\{\s*\[native code\]\s*\}/).test('' + fn);
};

local.isXML = function(document){
	return (!!document.xmlVersion) || (!!document.xml) || (toString.call(document) == '[object XMLDocument]') ||
	(document.nodeType == 9 && document.documentElement.nodeName != 'HTML');
};

local.setDocument = function(document){

	// convert elements / window arguments to document. if document cannot be extrapolated, the function returns.
	var nodeType = document.nodeType;
	if (nodeType == 9); // document
	else if (nodeType) document = document.ownerDocument; // node
	else if (document.navigator) document = document.document; // window
	else return;

	// check if it's the old document

	if (this.document === document) return;
	this.document = document;

	// check if we have done feature detection on this document before

	var root = document.documentElement,
		rootUid = this.getUIDXML(root),
		features = document.slickFeatures || featuresCache[rootUid],
		feature;

	if (features){
		for (feature in features){
			this[feature] = features[feature];
		}
		return;
	}

	features = featuresCache[rootUid] = {};

	features.root = root;
	features.isXMLDocument = this.isXML(document);

	features.brokenStarGEBTN
	= features.starSelectsClosedQSA
	= features.idGetsName
	= features.brokenMixedCaseQSA
	= features.brokenGEBCN
	= features.brokenCheckedQSA
	= features.brokenEmptyAttributeQSA
	= features.isHTMLDocument
	= features.nativeMatchesSelector
	= false;

	var starSelectsClosed, starSelectsComments,
		brokenSecondClassNameGEBCN, cachedGetElementsByClassName,
		brokenFormAttributeGetter;

	var selected, id = 'slick_uniqueid';
	var testNode = document.createElement('div');
	
	var testRoot = document.body || document.getElementsByTagName('body')[0] || root;
	testRoot.appendChild(testNode);

	// on non-HTML documents innerHTML and getElementsById doesnt work properly
	try {
		testNode.innerHTML = '<a id="'+id+'"></a>';
		features.isHTMLDocument = !!document.getElementById(id);
	} catch(e){};

	if (features.isHTMLDocument){

		testNode.style.display = 'none';

		// IE returns comment nodes for getElementsByTagName('*') for some documents
		testNode.appendChild(document.createComment(''));
		starSelectsComments = (testNode.getElementsByTagName('*').length > 1);

		// IE returns closed nodes (EG:"</foo>") for getElementsByTagName('*') for some documents
		try {
			testNode.innerHTML = 'foo</foo>';
			selected = testNode.getElementsByTagName('*');
			starSelectsClosed = (selected && !!selected.length && selected[0].nodeName.charAt(0) == '/');
		} catch(e){};

		features.brokenStarGEBTN = starSelectsComments || starSelectsClosed;

		// IE returns elements with the name instead of just id for getElementsById for some documents
		try {
			testNode.innerHTML = '<a name="'+ id +'"></a><b id="'+ id +'"></b>';
			features.idGetsName = document.getElementById(id) === testNode.firstChild;
		} catch(e){};

		if (testNode.getElementsByClassName){

			// Safari 3.2 getElementsByClassName caches results
			try {
				testNode.innerHTML = '<a class="f"></a><a class="b"></a>';
				testNode.getElementsByClassName('b').length;
				testNode.firstChild.className = 'b';
				cachedGetElementsByClassName = (testNode.getElementsByClassName('b').length != 2);
			} catch(e){};

			// Opera 9.6 getElementsByClassName doesnt detects the class if its not the first one
			try {
				testNode.innerHTML = '<a class="a"></a><a class="f b a"></a>';
				brokenSecondClassNameGEBCN = (testNode.getElementsByClassName('a').length != 2);
			} catch(e){};

			features.brokenGEBCN = cachedGetElementsByClassName || brokenSecondClassNameGEBCN;
		}
		
		if (testNode.querySelectorAll){
			// IE 8 returns closed nodes (EG:"</foo>") for querySelectorAll('*') for some documents
			try {
				testNode.innerHTML = 'foo</foo>';
				selected = testNode.querySelectorAll('*');
				features.starSelectsClosedQSA = (selected && !!selected.length && selected[0].nodeName.charAt(0) == '/');
			} catch(e){};

			// Safari 3.2 querySelectorAll doesnt work with mixedcase on quirksmode
			try {
				testNode.innerHTML = '<a class="MiX"></a>';
				features.brokenMixedCaseQSA = !testNode.querySelectorAll('.MiX').length;
			} catch(e){};

			// Webkit and Opera dont return selected options on querySelectorAll
			try {
				testNode.innerHTML = '<select><option selected="selected">a</option></select>';
				features.brokenCheckedQSA = (testNode.querySelectorAll(':checked').length == 0);
			} catch(e){};

			// IE returns incorrect results for attr[*^$]="" selectors on querySelectorAll
			try {
				testNode.innerHTML = '<a class=""></a>';
				features.brokenEmptyAttributeQSA = (testNode.querySelectorAll('[class*=""]').length != 0);
			} catch(e){};

		}

		// IE6-7, if a form has an input of id x, form.getAttribute(x) returns a reference to the input
		try {
			testNode.innerHTML = '<form action="s"><input id="action"/></form>';
			brokenFormAttributeGetter = (testNode.firstChild.getAttribute('action') != 's');
		} catch(e){};

		// native matchesSelector function
		features.nativeMatchesSelector = root.matchesSelector || /*root.msMatchesSelector ||*/ root.mozMatchesSelector || root.webkitMatchesSelector;
		if (features.nativeMatchesSelector) try {
			// if matchesSelector trows errors on incorrect sintaxes we can use it
			features.nativeMatchesSelector.call(root, ':slick');
			features.nativeMatchesSelector = null;
		} catch(e){};

	}

	try {
		root.slick_expando = 1;
		delete root.slick_expando;
		features.getUID = this.getUIDHTML;
	} catch(e) {
		features.getUID = this.getUIDXML;
	}

	testRoot.removeChild(testNode);
	testNode = selected = testRoot = null;

	// getAttribute

	features.getAttribute = (features.isHTMLDocument && brokenFormAttributeGetter) ? function(node, name){
		var method = this.attributeGetters[name];
		if (method) return method.call(node);
		var attributeNode = node.getAttributeNode(name);
		return (attributeNode) ? attributeNode.nodeValue : null;
	} : function(node, name){
		var method = this.attributeGetters[name];
		return (method) ? method.call(node) : node.getAttribute(name);
	};

	// hasAttribute

	features.hasAttribute = (root && this.isNativeCode(root.hasAttribute)) ? function(node, attribute) {
		return node.hasAttribute(attribute);
	} : function(node, attribute) {
		node = node.getAttributeNode(attribute);
		return !!(node && (node.specified || node.nodeValue));
	};

	// contains
	// FIXME: Add specs: local.contains should be different for xml and html documents?
	features.contains = (root && this.isNativeCode(root.contains)) ? function(context, node){
		return context.contains(node);
	} : (root && root.compareDocumentPosition) ? function(context, node){
		return context === node || !!(context.compareDocumentPosition(node) & 16);
	} : function(context, node){
		if (node) do {
			if (node === context) return true;
		} while ((node = node.parentNode));
		return false;
	};

	// document order sorting
	// credits to Sizzle (http://sizzlejs.com/)

	features.documentSorter = (root.compareDocumentPosition) ? function(a, b){
		if (!a.compareDocumentPosition || !b.compareDocumentPosition) return 0;
		return a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
	} : ('sourceIndex' in root) ? function(a, b){
		if (!a.sourceIndex || !b.sourceIndex) return 0;
		return a.sourceIndex - b.sourceIndex;
	} : (document.createRange) ? function(a, b){
		if (!a.ownerDocument || !b.ownerDocument) return 0;
		var aRange = a.ownerDocument.createRange(), bRange = b.ownerDocument.createRange();
		aRange.setStart(a, 0);
		aRange.setEnd(a, 0);
		bRange.setStart(b, 0);
		bRange.setEnd(b, 0);
		return aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
	} : null ;
	
	// pseudo elements
	
	features.getPseudoElementsByName = function(node, name, value) {
		var value = node[name];
		if (value) {
			var length = value.length;
			if (length == null) return [value];
			for (var i = 0, element, result = []; element = value[i]; i++) result[i] = element;
			return result;
		}
		return [];
	}

	root = null;

	for (feature in features){
		this[feature] = features[feature];
	}
};

// Main Method

var reSimpleSelector = /^([#.]?)((?:[\w-]+|\*))$/,
	reEmptyAttribute = /\[.+[*$^]=(?:""|'')?\]/,
	qsaFailExpCache = {};

local.search = function(context, expression, append, first){

	var found = this.found = (first) ? null : (append || []);
	
	if (!context) return found;
	else if (context.navigator) context = context.document; // Convert the node from a window to a document
	else if (!context.nodeType) return found;

	// setup

	var parsed, i,
		uniques = this.uniques = {},
		hasOthers = !!(append && append.length),
		contextIsDocument = (context.nodeType == 9);

	if (this.document !== (contextIsDocument ? context : context.ownerDocument)) this.setDocument(context);

	// avoid duplicating items already in the append array
	if (hasOthers) for (i = found.length; i--;) uniques[this.getUID(found[i])] = true;

	// expression checks

	if (typeof expression == 'string'){ // expression is a string

		/*<simple-selectors-override>*/
		var simpleSelector = expression.match(reSimpleSelector);
		simpleSelectors: if (simpleSelector) {

			var symbol = simpleSelector[1],
				name = simpleSelector[2],
				node, nodes;

			if (!symbol){

				if (name == '*' && this.brokenStarGEBTN) break simpleSelectors;
				nodes = context.getElementsByTagName(name);
				if (first) return nodes[0] || null;
				for (i = 0; node = nodes[i++];){
					if (!(hasOthers && uniques[this.getUID(node)])) found.push(node);
				}

			} else if (symbol == '#'){

				if (!this.isHTMLDocument || !contextIsDocument) break simpleSelectors;
				node = context.getElementById(name);
				if (!node) return found;
				if (this.idGetsName && node.getAttributeNode('id').nodeValue != name) break simpleSelectors;
				if (first) return node || null;
				if (!(hasOthers && uniques[this.getUID(node)])) found.push(node);

			} else if (symbol == '.'){

				if (!this.isHTMLDocument || ((!context.getElementsByClassName || this.brokenGEBCN) && context.querySelectorAll)) break simpleSelectors;
				if (context.getElementsByClassName && !this.brokenGEBCN){
					nodes = context.getElementsByClassName(name);
					if (first) return nodes[0] || null;
					for (i = 0; node = nodes[i++];){
						if (!(hasOthers && uniques[this.getUID(node)])) found.push(node);
					}
				} else {
					var matchClass = new RegExp('(^|\\s)'+ Slick.escapeRegExp(name) +'(\\s|$)');
					nodes = context.getElementsByTagName('*');
					for (i = 0; node = nodes[i++];){
						className = node.className;
						if (!(className && matchClass.test(className))) continue;
						if (first) return node;
						if (!(hasOthers && uniques[this.getUID(node)])) found.push(node);
					}
				}

			}

			if (hasOthers) this.sort(found);
			return (first) ? null : found;

		}
		/*</simple-selectors-override>*/

		/*<query-selector-override>*/
		querySelector: if (context.querySelectorAll) {
			if (!this.isHTMLDocument
				|| qsaFailExpCache[expression]
				//TODO: only skip when expression is actually mixed case
				|| this.brokenMixedCaseQSA
				|| (this.brokenCheckedQSA && expression.indexOf(':checked') > -1)
				|| (this.brokenEmptyAttributeQSA && reEmptyAttribute.test(expression))
				|| (!contextIsDocument && (//Abort when !contextIsDocument and...
					//  there are multiple expressions in the selector
					//  since we currently only fix non-document rooted QSA for single expression selectors
					expression.indexOf(',') > -1
					//  and the expression begins with a + or ~ combinator
					//  since non-document rooted QSA can't access nodes that aren't descendants of the context
					|| (/^\s*[~+]/).test(expression)
				))
				|| Slick.disableQSA
			) break querySelector;
			var _expression = expression, _context = context;
			if (!contextIsDocument){
				// non-document rooted QSA
				// credits to Andrew Dupont
				var currentId = _context.getAttribute('id'), slickid = 'slickid__';
				_context.setAttribute('id', slickid);
				_expression = '#' + slickid + ' ' + _expression;
				context = _context.parentNode;
			}

			try {
				if (first) return context.querySelector(_expression) || null;
				else nodes = context.querySelectorAll(_expression);
			} catch(e) {
				qsaFailExpCache[expression] = 1;
				break querySelector;
			} finally {
				if (!contextIsDocument){
					if (currentId) _context.setAttribute('id', currentId);
					else _context.removeAttribute('id');
					context = _context;
				}
			}

			if (this.starSelectsClosedQSA) for (i = 0; node = nodes[i++];){
				if (node.nodeName > '@' && !(hasOthers && uniques[this.getUID(node)])) found.push(node);
			} else for (i = 0; node = nodes[i++];){
				if (!(hasOthers && uniques[this.getUID(node)])) found.push(node);
			}

			if (hasOthers) this.sort(found);
			return found;

		}
		/*</query-selector-override>*/

		parsed = this.Slick.parse(expression);
		if (!parsed.length) return found;
	} else if (expression == null){ // there is no expression
		return found;
	} else if (expression.Slick){ // expression is a parsed Slick object
		parsed = expression;
	} else if (this.contains(context.documentElement || context, expression)){ // expression is a node
		(found) ? found.push(expression) : found = expression;
		return found;
	} else { // other junk
		return found;
	}

	/*<pseudo-selectors>*//*<nth-pseudo-selectors>*/

	// cache elements for the nth selectors

	this.posNTH = {};
	this.posNTHLast = {};
	this.posNTHType = {};
	this.posNTHTypeLast = {};

	/*</nth-pseudo-selectors>*//*</pseudo-selectors>*/

	// if append is null and there is only a single selector with one expression use pushArray, else use pushUID
	this.push = (!hasOthers && (first || (parsed.length == 1 && parsed.expressions[0].length == 1))) ? this.pushArray : this.pushUID;

	if (found == null) found = [];

	// default engine

	var j, m, n;
	var combinator, tag, id, classList, classes, attributes, pseudos;
	var currentItems, currentExpression, currentBit, lastBit, expressions = parsed.expressions;

	search: for (i = 0; (currentExpression = expressions[i]); i++) for (j = 0; (currentBit = currentExpression[j]); j++){

		combinator = 'combinator:' + currentBit.combinator;
		if (!this[combinator]) continue search;

		tag				= currentBit.tag;//(this.isXMLDocument) ? currentBit.tag : currentBit.tag.toUpperCase();
		id				 = currentBit.id;
		classList	= currentBit.classList;
		classes		= currentBit.classes;
		attributes = currentBit.attributes;
		pseudos		= currentBit.pseudos;
		lastBit		= (j === (currentExpression.length - 1));

		this.bitUniques = {};

		if (lastBit){
			this.uniques = uniques;
			this.found = found;
		} else {
			this.uniques = {};
			this.found = [];
		}

		if (j === 0){
			this[combinator](context, tag, id, classes, attributes, pseudos, classList);
			if (first && lastBit && found.length) break search;
		} else {
			if (first && lastBit) for (m = 0, n = currentItems.length; m < n; m++){
				this[combinator](currentItems[m], tag, id, classes, attributes, pseudos, classList);
				if (found.length) break search;
			} else for (m = 0, n = currentItems.length; m < n; m++) this[combinator](currentItems[m], tag, id, classes, attributes, pseudos, classList);
		}

		currentItems = this.found;
	}

	// should sort if there are nodes in append and if you pass multiple expressions.
	if (hasOthers || (parsed.expressions.length > 1)) this.sort(found);

	return (first) ? (found[0] || null) : found;
};

// Utils

local.uidx = 1;
local.uidk = 'slick-uniqueid';

local.getUIDXML = function(node){
	var uid = node.getAttribute(this.uidk);
	if (!uid){
		uid = this.uidx++;
		node.setAttribute(this.uidk, uid);
	}
	return uid;
};

local.getUIDHTML = function(node){
	return node.uniqueNumber || (node.uniqueNumber = this.uidx++);
};

// sort based on the setDocument documentSorter method.

local.sort = function(results){
	if (!this.documentSorter) return results;
	results.sort(this.documentSorter);
	return results;
};

/*<pseudo-selectors>*//*<nth-pseudo-selectors>*/

local.cacheNTH = {};

local.matchNTH = /^([+-]?\d*)?([a-z]+)?([+-]\d+)?$/;

local.parseNTHArgument = function(argument){
	var parsed = argument.match(this.matchNTH);
	if (!parsed) return false;
	var special = parsed[2] || false;
	var a = parsed[1] || 1;
	if (a == '-') a = -1;
	var b = +parsed[3] || 0;
	parsed =
		(special == 'n')	? {a: a, b: b} :
		(special == 'odd')	? {a: 2, b: 1} :
		(special == 'even')	? {a: 2, b: 0} : {a: 0, b: a};

	return (this.cacheNTH[argument] = parsed);
};

local.createNTHPseudo = function(child, sibling, positions, ofType){
	return function(node, argument){
		var uid = this.getUID(node);
		if (!this[positions][uid]){
			var parent = node.parentNode;
			if (!parent) return false;
			var el = parent[child], count = 1;
			if (ofType){
				var nodeName = node.nodeName;
				do {
					if (el.nodeName != nodeName) continue;
					this[positions][this.getUID(el)] = count++;
				} while ((el = el[sibling]));
			} else {
				do {
					if (el.nodeType != 1) continue;
					this[positions][this.getUID(el)] = count++;
				} while ((el = el[sibling]));
			}
		}
		argument = argument || 'n';
		var parsed = this.cacheNTH[argument] || this.parseNTHArgument(argument);
		if (!parsed) return false;
		var a = parsed.a, b = parsed.b, pos = this[positions][uid];
		if (a == 0) return b == pos;
		if (a > 0){
			if (pos < b) return false;
		} else {
			if (b < pos) return false;
		}
		return ((pos - b) % a) == 0;
	};
};

/*</nth-pseudo-selectors>*//*</pseudo-selectors>*/

local.pushArray = function(node, tag, id, classes, attributes, pseudos){
	if (this.matchSelector(node, tag, id, classes, attributes, pseudos)) this.found.push(node);
};

local.pushUID = function(node, tag, id, classes, attributes, pseudos){
	var uid = this.getUID(node);
	if (!this.uniques[uid] && this.matchSelector(node, tag, id, classes, attributes, pseudos)){
		this.uniques[uid] = true;
		this.found.push(node);
	}
};

var reSingularCombinator = /^\!?[>+^]$/; // "+", ">", "^"
local.matchNode = function(node, selector, needle){
	if (!needle && this.isHTMLDocument && this.nativeMatchesSelector && selector.indexOf){
		try {
			return this.nativeMatchesSelector.call(node, selector.replace(/\[([^=]+)=\s*([^'"\]]+?)\s*\]/g, '[$1="$2"]'));
		} catch(matchError) {}
	}

	var parsed = this.Slick.parse(selector);
	if (!parsed) return true;

	parsed = parsed.reverse();
	for (var i = 0, expression, expressions, built, length, multiple; expression = parsed.expressions[i]; i++) {
		var first = expression[0];
		if (this.matchSelector(node, (this.isXMLDocument) ? first.tag : first.tag.toUpperCase(), first.id, first.classes, first.attributes, first.pseudos)) { // matching first selector against element
			if ((length = expression.length) == (1 + !needle)) continue;
			if (!built) built = {Slick: true, expressions: [], length: 0};
			built.expressions.push(expressions = []);
			built.length++;
			for (var j = 1; j < length; j++) expressions.push(expression[j]);
			if (!multiple) multiple = !expression[expression.length - 1].combinator.match(reSingularCombinator);
		} else return false;
	}
	var found = built ? this.search(node, built, null, !(multiple && needle)) : node;
	return needle ? (multiple ? found.indexOf(needle) > -1 : found == needle) : !!found;
};


local.matchPseudo = function(node, name, argument){
	var pseudoName = 'pseudo:' + name;
	if (this[pseudoName]) return this[pseudoName](node, argument);
	var attribute = this.getAttribute(node, name);
	return (argument) ? argument == attribute : !!attribute;
};


var uppercased = {};
local.matchSelector = function(node, tag, id, classes, attributes, pseudos){
	if (tag){
		var nodeName = (this.isXMLDocument) ? node.nodeName : node.nodeName.toUpperCase();
		if (tag == '*'){
			if (nodeName < '@') return false; // Fix for comment nodes and closed nodes
		} else {
			if (nodeName != (uppercased[tag] || (uppercased[tag] = tag.toUpperCase()))) return false;
		}
	}

	if (id && node.getAttribute('id') != id) return false;

	var i, part, cls, elements;
	if (classes) for (i = classes.length; i--;){
		cls = node.getAttribute('class') || node.className;
		if (!(cls && classes[i].regexp.test(cls))) return false;
	}
	if (attributes) for (i = attributes.length; i--;){
		part = attributes[i];
		if (part.operator ? !part.test(this.getAttribute(node, part.key)) : !this.hasAttribute(node, part.key)) return false;
	}
	if (pseudos) for (i = 0; part = pseudos[i++];){
		switch(part.type) {
			case 'class':
				if (!this.matchPseudo(node, part.key, part.value)) return false;			
				break;
		}
	}
	return true;
};

var combinators = {

	' ': function(node, tag, id, classes, attributes, pseudos, classList){ // all child nodes, any level

		var i, item, children;

		if (this.isHTMLDocument){
			getById: if (id){
				item = this.document.getElementById(id);
				if ((!item && node.all) || (this.idGetsName && item && item.getAttributeNode('id').nodeValue != id)){
					// all[id] returns all the elements with that name or id inside node
					// if theres just one it will return the element, else it will be a collection
					children = node.all[id];
					if (!children) return;
					if (!children[0]) children = [children];
					for (i = 0; item = children[i++];){
						var idNode = item.getAttributeNode('id');
						if (idNode && idNode.nodeValue == id){
							this.push(item, tag, null, classes, attributes, pseudos);
							break;
						}
					} 
					return;
				}
				if (!item){
					// if the context is in the dom we return, else we will try GEBTN, breaking the getById label
					if (this.contains(this.root, node)) return;
					else break getById;
				} else if (this.document !== node && !this.contains(node, item)) return;
				this.push(item, tag, null, classes, attributes, pseudos);
				return;
			}
			getByClass: if (classes && node.getElementsByClassName && !this.brokenGEBCN){
				children = node.getElementsByClassName(classList.join(' '));
				if (!(children && children.length)) break getByClass;
				for (i = 0; item = children[i++];) this.push(item, tag, id, null, attributes, pseudos);
				return;
			}
		}
		getByTag: {
			children = node.getElementsByTagName(tag);
			if (!(children && children.length)) break getByTag;
			if (!this.brokenStarGEBTN) tag = null;
			for (i = 0; item = children[i++];) this.push(item, tag, id, classes, attributes, pseudos);
		}
	},

	'>': function(node, tag, id, classes, attributes, pseudos){ // direct children
		if ((node = node.firstChild)) do {
			if (node.nodeType == 1) this.push(node, tag, id, classes, attributes, pseudos);
		} while ((node = node.nextSibling));
	},

	'+': function(node, tag, id, classes, attributes, pseudos){ // next sibling
		while ((node = node.nextSibling)) if (node.nodeType == 1){
			this.push(node, tag, id, classes, attributes, pseudos);
			break;
		}
	},

	'^': function(node, tag, id, classes, attributes, pseudos){ // first child
		node = node.firstChild;
		if (node){
			if (node.nodeType == 1) this.push(node, tag, id, classes, attributes, pseudos);
			else this['combinator:+'](node, tag, id, classes, attributes, pseudos);
		}
	},

	'~': function(node, tag, id, classes, attributes, pseudos){ // next siblings
		while ((node = node.nextSibling)){
			if (node.nodeType != 1) continue;
			var uid = this.getUID(node);
			if (this.bitUniques[uid]) break;
			this.bitUniques[uid] = true;
			this.push(node, tag, id, classes, attributes, pseudos);
		}
	},

	'++': function(node, tag, id, classes, attributes, pseudos){ // next sibling and previous sibling
		this['combinator:+'](node, tag, id, classes, attributes, pseudos);
		this['combinator:!+'](node, tag, id, classes, attributes, pseudos);
	},

	'~~': function(node, tag, id, classes, attributes, pseudos){ // next siblings and previous siblings
		this['combinator:~'](node, tag, id, classes, attributes, pseudos);
		this['combinator:!~'](node, tag, id, classes, attributes, pseudos);
	},

	'!': function(node, tag, id, classes, attributes, pseudos){ // all parent nodes up to document
		while ((node = node.parentNode)) if (node !== this.document) this.push(node, tag, id, classes, attributes, pseudos);
	},

	'!>': function(node, tag, id, classes, attributes, pseudos){ // direct parent (one level)
		node = node.parentNode;
		if (node !== this.document) this.push(node, tag, id, classes, attributes, pseudos);
	},

	'!+': function(node, tag, id, classes, attributes, pseudos){ // previous sibling
		while ((node = node.previousSibling)) if (node.nodeType == 1){
			this.push(node, tag, id, classes, attributes, pseudos);
			break;
		}
	},

	'!^': function(node, tag, id, classes, attributes, pseudos){ // last child
		node = node.lastChild;
		if (node){
			if (node.nodeType == 1) this.push(node, tag, id, classes, attributes, pseudos);
			else this['combinator:!+'](node, tag, id, classes, attributes, pseudos);
		}
	},

	'!~': function(node, tag, id, classes, attributes, pseudos){ // previous siblings
		while ((node = node.previousSibling)){
			if (node.nodeType != 1) continue;
			var uid = this.getUID(node);
			if (this.bitUniques[uid]) break;
			this.bitUniques[uid] = true;
			this.push(node, tag, id, classes, attributes, pseudos);
		}
	}
};

for (var c in combinators) local['combinator:' + c] = combinators[c];

var pseudos = {

	/*<pseudo-selectors>*/

	'empty': function(node){
		var child = node.firstChild;
		return !(child && child.nodeType == 1) && !(node.innerText || node.textContent || '').length;
	},

	'not': function(node, expression){
		return !this.matchNode(node, expression);
	},

	'contains': function(node, text){
		return (node.innerText || node.textContent || '').indexOf(text) > -1;
	},

	'first-child': function(node){
		while ((node = node.previousSibling)) if (node.nodeType == 1) return false;
		return true;
	},

	'last-child': function(node){
		while ((node = node.nextSibling)) if (node.nodeType == 1) return false;
		return true;
	},

	'only-child': function(node){
		var prev = node;
		while ((prev = prev.previousSibling)) if (prev.nodeType == 1) return false;
		var next = node;
		while ((next = next.nextSibling)) if (next.nodeType == 1) return false;
		return true;
	},

	/*<nth-pseudo-selectors>*/

	'nth-child': local.createNTHPseudo('firstChild', 'nextSibling', 'posNTH'),

	'nth-last-child': local.createNTHPseudo('lastChild', 'previousSibling', 'posNTHLast'),

	'nth-of-type': local.createNTHPseudo('firstChild', 'nextSibling', 'posNTHType', true),

	'nth-last-of-type': local.createNTHPseudo('lastChild', 'previousSibling', 'posNTHTypeLast', true),

	'index': function(node, index){
		return this['pseudo:nth-child'](node, '' + index + 1);
	},

	'even': function(node){
		return this['pseudo:nth-child'](node, '2n');
	},

	'odd': function(node){
		return this['pseudo:nth-child'](node, '2n+1');
	},

	/*</nth-pseudo-selectors>*/

	/*<of-type-pseudo-selectors>*/

	'first-of-type': function(node){
		var nodeName = node.nodeName;
		while ((node = node.previousSibling)) if (node.nodeName == nodeName) return false;
		return true;
	},

	'last-of-type': function(node){
		var nodeName = node.nodeName;
		while ((node = node.nextSibling)) if (node.nodeName == nodeName) return false;
		return true;
	},

	'only-of-type': function(node){
		var prev = node, nodeName = node.nodeName;
		while ((prev = prev.previousSibling)) if (prev.nodeName == nodeName) return false;
		var next = node;
		while ((next = next.nextSibling)) if (next.nodeName == nodeName) return false;
		return true;
	},

	/*</of-type-pseudo-selectors>*/

	// custom pseudos

	'enabled': function(node){
		return !node.disabled;
	},

	'disabled': function(node){
		return node.disabled;
	},

	'checked': function(node){
		return node.checked || node.selected;
	},

	'focus': function(node){
		return this.isHTMLDocument && this.document.activeElement === node && (node.href || node.type || this.hasAttribute(node, 'tabindex'));
	},

	'root': function(node){
		return (node === this.root);
	},
	
	'selected': function(node){
		return node.selected;
	}

	/*</pseudo-selectors>*/
};

for (var p in pseudos) local['pseudo:' + p] = pseudos[p];

// attributes methods

local.attributeGetters = {

	'class': function(){
		return this.getAttribute('class') || this.className;
	},

	'for': function(){
		return ('htmlFor' in this) ? this.htmlFor : this.getAttribute('for');
	},

	'href': function(){
		return ('href' in this) ? this.getAttribute('href', 2) : this.getAttribute('href');
	},

	'style': function(){
		return (this.style) ? this.style.cssText : this.getAttribute('style');
	},
	
	'tabindex': function(){
		var attributeNode = this.getAttributeNode('tabindex');
		return (attributeNode && attributeNode.specified) ? attributeNode.nodeValue : null;
	},

	'type': function(){
		return this.getAttribute('type');
	}

};

// Slick

var Slick = local.Slick = (this.Slick || {});

Slick.version = '1.1.5';

// Slick finder

Slick.search = function(context, expression, append){
	return local.search(context, expression, append);
};

Slick.find = function(context, expression){
	return local.search(context, expression, null, true);
};

// Slick containment checker

Slick.contains = function(container, node){
	local.setDocument(container);
	return local.contains(container, node);
};

// Slick attribute getter

Slick.getAttribute = function(node, name){
	return local.getAttribute(node, name);
};

// Slick matcher

Slick.match = function(node, selector){
	if (!(node && selector)) return false;
	if (!selector || selector === node) return true;
	local.setDocument(node);
	return local.matchNode(node, selector);
};


Slick.matchSelector = function(node, tag, id, classes, attributes, pseudos){
  if (!node) return false;
	local.setDocument(node);
	return local.matchSelector(node, tag, id, classes, attributes, pseudos);
};

// Slick attribute accessor

Slick.defineAttributeGetter = function(name, fn){
	local.attributeGetters[name] = fn;
	return this;
};

Slick.lookupAttributeGetter = function(name){
	return local.attributeGetters[name];
};

// Slick combinator accessor

Slick.defineCombinator = function(name, fn){
	local['combinator:' + name] = function(node, argument){
		return fn.apply(this, arguments);
	};
	return this;
};

Slick.lookupCombinator = function(name){
	var combinator = local['combinator:' + name];
	if (combinator) return function(argument){
		return combinator.call(this, argument);
	};
	return null;
};


// Slick pseudo accessor

Slick.definePseudo = function(name, fn){
	local['pseudo:' + name] = function(node, argument){
		return fn.call(node, argument);
	};
	return this;
};

Slick.lookupPseudo = function(name){
	var pseudo = local['pseudo:' + name];
	if (pseudo) return function(argument){
		return pseudo.call(this, argument);
	};
	return null;
};

// Slick overrides accessor

Slick.override = function(regexp, fn){
	local.override(regexp, fn);
	return this;
};

Slick.isXML = local.isXML;

Slick.uidOf = function(node){
	return local.getUIDHTML(node);
};

if (!this.Slick) this.Slick = Slick;

}).apply(/*<CommonJS>*/(typeof exports != 'undefined') ? exports : /*</CommonJS>*/this);

/*
---

name: Element

description: One of the most important items in MooTools. Contains the dollar function, the dollars function, and an handful of cross-browser, time-saver methods to let you easily work with HTML Elements.

license: MIT-style license.

requires: [Window, Document, Array, String, Function, Number, Slick.Parser, Slick.Finder]

provides: [Element, Elements, $, $$, Iframe, Selectors]

...
*/

var Element = function(tag, props){
	var konstructor = Element.Constructors[tag];
	if (konstructor) return konstructor(props);
	if (typeof tag != 'string') return document.id(tag).set(props);

	if (!props) props = {};

	if (!(/^[\w-]+$/).test(tag)){
		var parsed = Slick.parse(tag).expressions[0][0];
		tag = (parsed.tag == '*') ? 'div' : parsed.tag;
		if (parsed.id && props.id == null) props.id = parsed.id;

		var attributes = parsed.attributes;
		if (attributes) for (var attr, i = 0, l = attributes.length; i < l; i++){
			attr = attributes[i];
			if (props[attr.key] != null) continue;

			if (attr.value != null && attr.operator == '=') props[attr.key] = attr.value;
			else if (!attr.value && !attr.operator) props[attr.key] = true;
		}

		if (parsed.classList && props['class'] == null) props['class'] = parsed.classList.join(' ');
	}

	return document.newElement(tag, props);
};

if (Browser.Element) Element.prototype = Browser.Element.prototype;

new Type('Element', Element).mirror(function(name){
	if (Array.prototype[name]) return;

	var obj = {};
	obj[name] = function(){
		var results = [], args = arguments, elements = true;
		for (var i = 0, l = this.length; i < l; i++){
			var element = this[i], result = results[i] = element[name].apply(element, args);
			elements = (elements && typeOf(result) == 'element');
		}
		return (elements) ? new Elements(results) : results;
	};

	Elements.implement(obj);
});

if (!Browser.Element){
	Element.parent = Object;

	Element.Prototype = {'$family': Function.from('element').hide()};

	Element.mirror(function(name, method){
		Element.Prototype[name] = method;
	});
}

Element.Constructors = {};

//<1.2compat>

Element.Constructors = new Hash;

//</1.2compat>

var IFrame = new Type('IFrame', function(){
	var params = Array.link(arguments, {
		properties: Type.isObject,
		iframe: function(obj){
			return (obj != null);
		}
	});

	var props = params.properties || {}, iframe;
	if (params.iframe) iframe = document.id(params.iframe);
	var onload = props.onload || function(){};
	delete props.onload;
	props.id = props.name = [props.id, props.name, iframe ? (iframe.id || iframe.name) : 'IFrame_' + String.uniqueID()].pick();
	iframe = new Element(iframe || 'iframe', props);

	var onLoad = function(){
		onload.call(iframe.contentWindow);
	};

	if (window.frames[props.id]) onLoad();
	else iframe.addListener('load', onLoad);
	return iframe;
});

var Elements = this.Elements = function(nodes){
	if (nodes && nodes.length){
		var uniques = {}, node;
		for (var i = 0; node = nodes[i++];){
			var uid = Slick.uidOf(node);
			if (!uniques[uid]){
				uniques[uid] = true;
				this.push(node);
			}
		}
	}
};

Elements.prototype = {length: 0};
Elements.parent = Array;

new Type('Elements', Elements).implement({

	filter: function(filter, bind){
		if (!filter) return this;
		return new Elements(Array.filter(this, (typeOf(filter) == 'string') ? function(item){
			return item.match(filter);
		} : filter, bind));
	}.protect(),

	push: function(){
		var length = this.length;
		for (var i = 0, l = arguments.length; i < l; i++){
			var item = document.id(arguments[i]);
			if (item) this[length++] = item;
		}
		return (this.length = length);
	}.protect(),

	unshift: function(){
		var items = [];
		for (var i = 0, l = arguments.length; i < l; i++){
			var item = document.id(arguments[i]);
			if (item) items.push(item);
		}
		return Array.prototype.unshift.apply(this, items);
	}.protect(),

	concat: function(){
		var newElements = new Elements(this);
		for (var i = 0, l = arguments.length; i < l; i++){
			var item = arguments[i];
			if (Type.isEnumerable(item)) newElements.append(item);
			else newElements.push(item);
		}
		return newElements;
	}.protect(),

	append: function(collection){
		for (var i = 0, l = collection.length; i < l; i++) this.push(collection[i]);
		return this;
	}.protect(),

	empty: function(){
		while (this.length) delete this[--this.length];
		return this;
	}.protect()

});

//<1.2compat>

Elements.alias('extend', 'append');

//</1.2compat>

(function(){

// FF, IE
var splice = Array.prototype.splice, object = {'0': 0, '1': 1, length: 2};

splice.call(object, 1, 1);
if (object[1] == 1) Elements.implement('splice', function(){
	var length = this.length;
	splice.apply(this, arguments);
	while (length >= this.length) delete this[length--];
	return this;
}.protect());

Elements.implement(Array.prototype);

Array.mirror(Elements);

/*<ltIE8>*/
var createElementAcceptsHTML;
try {
	var x = document.createElement('<input name=x>');
	createElementAcceptsHTML = (x.name == 'x');
} catch(e){}

var escapeQuotes = function(html){
	return ('' + html).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
};
/*</ltIE8>*/

Document.implement({

	newElement: function(tag, props){
		if (props && props.checked != null) props.defaultChecked = props.checked;
		/*<ltIE8>*/// Fix for readonly name and type properties in IE < 8
		if (createElementAcceptsHTML && props){
			tag = '<' + tag;
			if (props.name) tag += ' name="' + escapeQuotes(props.name) + '"';
			if (props.type) tag += ' type="' + escapeQuotes(props.type) + '"';
			tag += '>';
			delete props.name;
			delete props.type;
		}
		/*</ltIE8>*/
		return this.id(this.createElement(tag)).set(props);
	}

});

})();

Document.implement({

	newTextNode: function(text){
		return this.createTextNode(text);
	},

	getDocument: function(){
		return this;
	},

	getWindow: function(){
		return this.window;
	},

	id: (function(){

		var types = {

			string: function(id, nocash, doc){
				id = Slick.find(doc, '#' + id.replace(/(\W)/g, '\\$1'));
				return (id) ? types.element(id, nocash) : null;
			},

			element: function(el, nocash){
				$uid(el);
				if (!nocash && !el.$family && !(/^(?:object|embed)$/i).test(el.tagName)){
					Object.append(el, Element.Prototype);
				}
				return el;
			},

			object: function(obj, nocash, doc){
				if (obj.toElement) return types.element(obj.toElement(doc), nocash);
				return null;
			}

		};

		types.textnode = types.whitespace = types.window = types.document = function(zero){
			return zero;
		};

		return function(el, nocash, doc){
			if (el && el.$family && el.uid) return el;
			var type = typeOf(el);
			return (types[type]) ? types[type](el, nocash, doc || document) : null;
		};

	})()

});

if (window.$ == null) Window.implement('$', function(el, nc){
	return document.id(el, nc, this.document);
});

Window.implement({

	getDocument: function(){
		return this.document;
	},

	getWindow: function(){
		return this;
	}

});

[Document, Element].invoke('implement', {

	getElements: function(expression){
		return Slick.search(this, expression, new Elements);
	},

	getElement: function(expression){
		return document.id(Slick.find(this, expression));
	}

});

//<1.2compat>

(function(search, find, match){

	this.Selectors = {};
	var pseudos = this.Selectors.Pseudo = new Hash();

	var addSlickPseudos = function(){
		for (var name in pseudos) if (pseudos.hasOwnProperty(name)){
			Slick.definePseudo(name, pseudos[name]);
			delete pseudos[name];
		}
	};

	Slick.search = function(context, expression, append){
		addSlickPseudos();
		return search.call(this, context, expression, append);
	};

	Slick.find = function(context, expression){
		addSlickPseudos();
		return find.call(this, context, expression);
	};

	Slick.match = function(node, selector){
		addSlickPseudos();
		return match.call(this, node, selector);
	};

})(Slick.search, Slick.find, Slick.match);

if (window.$$ == null) Window.implement('$$', function(selector){
	var elements = new Elements;
	if (arguments.length == 1 && typeof selector == 'string') return Slick.search(this.document, selector, elements);
	var args = Array.flatten(arguments);
	for (var i = 0, l = args.length; i < l; i++){
		var item = args[i];
		switch (typeOf(item)){
			case 'element': elements.push(item); break;
			case 'string': Slick.search(this.document, item, elements);
		}
	}
	return elements;
});

//</1.2compat>

if (window.$$ == null) Window.implement('$$', function(selector){
	if (arguments.length == 1){
		if (typeof selector == 'string') return Slick.search(this.document, selector, new Elements);
		else if (Type.isEnumerable(selector)) return new Elements(selector);
	}
	return new Elements(arguments);
});

(function(){

var collected = {}, storage = {};
var formProps = {input: 'checked', option: 'selected', textarea: 'value'};

var get = function(uid){
	return (storage[uid] || (storage[uid] = {}));
};

var clean = function(item){
	var uid = item.uid;
	if (item.removeEvents) item.removeEvents();
	if (item.clearAttributes) item.clearAttributes();
	if (uid != null){
		delete collected[uid];
		delete storage[uid];
	}
	return item;
};

var camels = ['defaultValue', 'accessKey', 'cellPadding', 'cellSpacing', 'colSpan', 'frameBorder', 'maxLength', 'readOnly',
	'rowSpan', 'tabIndex', 'useMap'
];
var bools = ['compact', 'nowrap', 'ismap', 'declare', 'noshade', 'checked', 'disabled', 'readOnly', 'multiple', 'selected',
	'noresize', 'defer', 'defaultChecked'
];
 var attributes = {
	'html': 'innerHTML',
	'class': 'className',
	'for': 'htmlFor',
	'text': (function(){
		var temp = document.createElement('div');
		return (temp.textContent == null) ? 'innerText' : 'textContent';
	})()
};
var readOnly = ['type'];
var expandos = ['value', 'defaultValue'];
var uriAttrs = /^(?:href|src|usemap)$/i;

bools = bools.associate(bools);
camels = camels.associate(camels.map(String.toLowerCase));
readOnly = readOnly.associate(readOnly);

Object.append(attributes, expandos.associate(expandos));

var inserters = {

	before: function(context, element){
		var parent = element.parentNode;
		if (parent) parent.insertBefore(context, element);
	},

	after: function(context, element){
		var parent = element.parentNode;
		if (parent) parent.insertBefore(context, element.nextSibling);
	},

	bottom: function(context, element){
		element.appendChild(context);
	},

	top: function(context, element){
		element.insertBefore(context, element.firstChild);
	}

};

inserters.inside = inserters.bottom;

//<1.2compat>

Object.each(inserters, function(inserter, where){

	where = where.capitalize();

	var methods = {};

	methods['inject' + where] = function(el){
		inserter(this, document.id(el, true));
		return this;
	};

	methods['grab' + where] = function(el){
		inserter(document.id(el, true), this);
		return this;
	};

	Element.implement(methods);

});

//</1.2compat>

var injectCombinator = function(expression, combinator){
	if (!expression) return combinator;

	expression = Object.clone(Slick.parse(expression));

	var expressions = expression.expressions;
	for (var i = expressions.length; i--;)
		expressions[i][0].combinator = combinator;

	return expression;
};

Element.implement({

	set: function(prop, value){
		var property = Element.Properties[prop];
		(property && property.set) ? property.set.call(this, value) : this.setProperty(prop, value);
	}.overloadSetter(),

	get: function(prop){
		var property = Element.Properties[prop];
		return (property && property.get) ? property.get.apply(this) : this.getProperty(prop);
	}.overloadGetter(),

	erase: function(prop){
		var property = Element.Properties[prop];
		(property && property.erase) ? property.erase.apply(this) : this.removeProperty(prop);
		return this;
	},

	setProperty: function(attribute, value){
		attribute = camels[attribute] || attribute;
		if (value == null) return this.removeProperty(attribute);
		var key = attributes[attribute];
		(key) ? this[key] = value :
			(bools[attribute]) ? this[attribute] = !!value : this.setAttribute(attribute, '' + value);
		return this;
	},

	setProperties: function(attributes){
		for (var attribute in attributes) this.setProperty(attribute, attributes[attribute]);
		return this;
	},

	getProperty: function(attribute){
		attribute = camels[attribute] || attribute;
		var key = attributes[attribute] || readOnly[attribute];
		return (key) ? this[key] :
			(bools[attribute]) ? !!this[attribute] :
			(uriAttrs.test(attribute) ? this.getAttribute(attribute, 2) :
			(key = this.getAttributeNode(attribute)) ? key.nodeValue : null) || null;
	},

	getProperties: function(){
		var args = Array.from(arguments);
		return args.map(this.getProperty, this).associate(args);
	},

	removeProperty: function(attribute){
		attribute = camels[attribute] || attribute;
		var key = attributes[attribute];
		(key) ? this[key] = '' :
			(bools[attribute]) ? this[attribute] = false : this.removeAttribute(attribute);
		return this;
	},

	removeProperties: function(){
		Array.each(arguments, this.removeProperty, this);
		return this;
	},

	hasClass: function(className){
		return this.className.clean().contains(className, ' ');
	},

	addClass: function(className){
		if (!this.hasClass(className)) this.className = (this.className + ' ' + className).clean();
		return this;
	},

	removeClass: function(className){
		this.className = this.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)'), '$1');
		return this;
	},

	toggleClass: function(className, force){
		if (force == null) force = !this.hasClass(className);
		return (force) ? this.addClass(className) : this.removeClass(className);
	},

	adopt: function(){
		var parent = this, fragment, elements = Array.flatten(arguments), length = elements.length;
		if (length > 1) parent = fragment = document.createDocumentFragment();

		for (var i = 0; i < length; i++){
			var element = document.id(elements[i], true);
			if (element) parent.appendChild(element);
		}

		if (fragment) this.appendChild(fragment);

		return this;
	},

	appendText: function(text, where){
		return this.grab(this.getDocument().newTextNode(text), where);
	},

	grab: function(el, where){
		inserters[where || 'bottom'](document.id(el, true), this);
		return this;
	},

	inject: function(el, where){
		inserters[where || 'bottom'](this, document.id(el, true));
		return this;
	},

	replaces: function(el){
		el = document.id(el, true);
		el.parentNode.replaceChild(this, el);
		return this;
	},

	wraps: function(el, where){
		el = document.id(el, true);
		return this.replaces(el).grab(el, where);
	},

	getPrevious: function(expression){
		return document.id(Slick.find(this, injectCombinator(expression, '!~')));
	},

	getAllPrevious: function(expression){
		return Slick.search(this, injectCombinator(expression, '!~'), new Elements);
	},

	getNext: function(expression){
		return document.id(Slick.find(this, injectCombinator(expression, '~')));
	},

	getAllNext: function(expression){
		return Slick.search(this, injectCombinator(expression, '~'), new Elements);
	},

	getFirst: function(expression){
		return document.id(Slick.search(this, injectCombinator(expression, '>'))[0]);
	},

	getLast: function(expression){
		return document.id(Slick.search(this, injectCombinator(expression, '>')).getLast());
	},

	getParent: function(expression){
		return document.id(Slick.find(this, injectCombinator(expression, '!')));
	},

	getParents: function(expression){
		return Slick.search(this, injectCombinator(expression, '!'), new Elements);
	},

	getSiblings: function(expression){
		return Slick.search(this, injectCombinator(expression, '~~'), new Elements);
	},

	getChildren: function(expression){
		return Slick.search(this, injectCombinator(expression, '>'), new Elements);
	},

	getWindow: function(){
		return this.ownerDocument.window;
	},

	getDocument: function(){
		return this.ownerDocument;
	},

	getElementById: function(id){
		return document.id(Slick.find(this, '#' + ('' + id).replace(/(\W)/g, '\\$1')));
	},

	getSelected: function(){
		this.selectedIndex; // Safari 3.2.1
		return new Elements(Array.from(this.options).filter(function(option){
			return option.selected;
		}));
	},

	toQueryString: function(){
		var queryString = [];
		this.getElements('input, select, textarea').each(function(el){
			var type = el.type;
			if (!el.name || el.disabled || type == 'submit' || type == 'reset' || type == 'file' || type == 'image') return;

			var value = (el.get('tag') == 'select') ? el.getSelected().map(function(opt){
				// IE
				return document.id(opt).get('value');
			}) : ((type == 'radio' || type == 'checkbox') && !el.checked) ? null : el.get('value');

			Array.from(value).each(function(val){
				if (typeof val != 'undefined') queryString.push(encodeURIComponent(el.name) + '=' + encodeURIComponent(val));
			});
		});
		return queryString.join('&');
	},

	destroy: function(){
		var children = clean(this).getElementsByTagName('*');
		Array.each(children, clean);
		Element.dispose(this);
		return null;
	},

	empty: function(){
		Array.from(this.childNodes).each(Element.dispose);
		return this;
	},

	dispose: function(){
		return (this.parentNode) ? this.parentNode.removeChild(this) : this;
	},

	match: function(expression){
		return !expression || Slick.match(this, expression);
	}

});

var cleanClone = function(node, element, keepid){
	if (!keepid) node.setAttributeNode(document.createAttribute('id'));
	if (node.clearAttributes){
		node.clearAttributes();
		node.mergeAttributes(element);
		node.removeAttribute('uid');
		if (node.options){
			var no = node.options, eo = element.options;
			for (var i = no.length; i--;) no[i].selected = eo[i].selected;
		}
	}

	var prop = formProps[element.tagName.toLowerCase()];
	if (prop && element[prop]) node[prop] = element[prop];
};

Element.implement('clone', function(contents, keepid){
	contents = contents !== false;
	var clone = this.cloneNode(contents), i;

	if (contents){
		var ce = clone.getElementsByTagName('*'), te = this.getElementsByTagName('*');
		for (i = ce.length; i--;) cleanClone(ce[i], te[i], keepid);
	}

	cleanClone(clone, this, keepid);

	if (Browser.ie){
		var co = clone.getElementsByTagName('object'), to = this.getElementsByTagName('object');
		for (i = co.length; i--;) co[i].outerHTML = to[i].outerHTML;
	}
	return document.id(clone);
});

var contains = {contains: function(element){
	return Slick.contains(this, element);
}};

if (!document.contains) Document.implement(contains);
if (!document.createElement('div').contains) Element.implement(contains);

//<1.2compat>

Element.implement('hasChild', function(element){
	return this !== element && this.contains(element);
});

//</1.2compat>

[Element, Window, Document].invoke('implement', {

	addListener: function(type, fn){
		if (type == 'unload'){
			var old = fn, self = this;
			fn = function(){
				self.removeListener('unload', fn);
				old();
			};
		} else {
			collected[$uid(this)] = this;
		}
		if (this.addEventListener) this.addEventListener(type, fn, !!arguments[2]);
		else this.attachEvent('on' + type, fn);
		return this;
	},

	removeListener: function(type, fn){
		if (this.removeEventListener) this.removeEventListener(type, fn, !!arguments[2]);
		else this.detachEvent('on' + type, fn);
		return this;
	},

	retrieve: function(property, dflt){
		var storage = get($uid(this)), prop = storage[property];
		if (dflt != null && prop == null) prop = storage[property] = dflt;
		return prop != null ? prop : null;
	},

	store: function(property, value){
		var storage = get($uid(this));
		storage[property] = value;
		return this;
	},

	eliminate: function(property){
		var storage = get($uid(this));
		delete storage[property];
		return this;
	}

});

/*<ltIE9>*/
if (window.attachEvent && !window.addEventListener) window.addListener('unload', function(){
	Object.each(collected, clean);
	if (window.CollectGarbage) CollectGarbage();
});
/*</ltIE9>*/

})();

Element.Properties = {};

//<1.2compat>

Element.Properties = new Hash;

//</1.2compat>

Element.Properties.style = {

	set: function(style){
		this.style.cssText = style;
	},

	get: function(){
		return this.style.cssText;
	},

	erase: function(){
		this.style.cssText = '';
	}

};

Element.Properties.tag = {

	get: function(){
		return this.tagName.toLowerCase();
	}

};

/*<ltIE9>*/
(function(maxLength){
	if (maxLength != null) Element.Properties.maxlength = Element.Properties.maxLength = {
		get: function(){
			var maxlength = this.getAttribute('maxLength');
			return maxlength == maxLength ? null : maxlength;
		}
	};
})(document.createElement('input').getAttribute('maxLength'));
/*</ltIE9>*/

/*<!webkit>*/
Element.Properties.html = (function(){

	var tableTest = Function.attempt(function(){
		var table = document.createElement('table');
		table.innerHTML = '<tr><td></td></tr>';
	});

	var wrapper = document.createElement('div');

	var translations = {
		table: [1, '<table>', '</table>'],
		select: [1, '<select>', '</select>'],
		tbody: [2, '<table><tbody>', '</tbody></table>'],
		tr: [3, '<table><tbody><tr>', '</tr></tbody></table>']
	};
	translations.thead = translations.tfoot = translations.tbody;

	var html = {
		set: function(){
			var html = Array.flatten(arguments).join('');
			var wrap = (!tableTest && translations[this.get('tag')]);
			if (wrap){
				var first = wrapper;
				first.innerHTML = wrap[1] + html + wrap[2];
				for (var i = wrap[0]; i--;) first = first.firstChild;
				this.empty().adopt(first.childNodes);
			} else {
				this.innerHTML = html;
			}
		}
	};

	html.erase = html.set;

	return html;
})();
/*</!webkit>*/

/*
---
 
script: Element.onDispose.js
 
description: Fires event when element is destroyed
 
license: MIT-style license.

extends: Core/Element
 
...
*/

!function(dispose) { 
  Element.implement({
    dispose: function() {
      if (this.fireEvent) this.fireEvent('dispose', this.parentNode);
  		return (this.parentNode) ? this.parentNode.removeChild(this) : this;
    },
    
    replaces: function(el) {
      el = document.id(el, true);
      var parent = el.parentNode;
  		parent.replaceChild(this, el);
      if (el.fireEvent) el.fireEvent('dispose', parent);
  		return this;
    }
  });
  Element.dispose = function(element) {
    return Element.prototype.dispose.call(element);
  }
  Element.replaces = function(element, el) {
    return Element.prototype.dispose.call(element, el);
  }
}(Element.prototype.dispose, Element.prototype.replaces);
/*
---
 
script: Element.from.js
 
description: Methods to create elements from strings
 
license: MIT-style license.

credits: 
  - http://jdbartlett.github.com/innershiv
 
extends: Core/Element

*/

Document.implement('id', (function(){

	var types = {

		string: function(id, nocash, doc){
			id = Slick.find(doc, '#' + id.replace(/(\W)/g, '\\$1'));
			return (id) ? types.element(id, nocash) : null;
		},

		element: function(el, nocash){
			$uid(el);
			if (!nocash && !el.$family && !(/^(?:object|embed)$/i).test(el.tagName)){
				Object.append(el, Element.Prototype);
			}
			return el;
		}

	};

	types.textnode = types.whitespace = types.window = types.document = function(zero){
		return zero;
	};

	return function(el, nocash, doc){
		if (el && el.$family && el.uid) return el;
		if (el && el.toElement) return types.element(el.toElement(doc), nocash);
		var type = typeOf(el);
		return (types[type]) ? types[type](el, nocash, doc || document) : null;
	};

})());
/*
---

name: Element.Event

description: Contains Element methods for dealing with events. This file also includes mouseenter and mouseleave custom Element Events.

license: MIT-style license.

requires: [Element, Event]

provides: Element.Event

...
*/

(function(){

Element.Properties.events = {set: function(events){
	this.addEvents(events);
}};

[Element, Window, Document].invoke('implement', {

	addEvent: function(type, fn){
		var events = this.retrieve('events', {});
		if (!events[type]) events[type] = {keys: [], values: []};
		if (events[type].keys.contains(fn)) return this;
		events[type].keys.push(fn);
		var realType = type,
			custom = Element.Events[type],
			condition = fn,
			self = this;
		if (custom){
			if (custom.onAdd) custom.onAdd.call(this, fn);
			if (custom.condition){
				condition = function(event){
					if (custom.condition.call(this, event)) return fn.call(this, event);
					return true;
				};
			}
			realType = custom.base || realType;
		}
		var defn = function(){
			return fn.call(self);
		};
		var nativeEvent = Element.NativeEvents[realType];
		if (nativeEvent){
			if (nativeEvent == 2){
				defn = function(event){
					event = new Event(event, self.getWindow());
					if (condition.call(self, event) === false) event.stop();
				};
			}
			this.addListener(realType, defn, arguments[2]);
		}
		events[type].values.push(defn);
		return this;
	},

	removeEvent: function(type, fn){
		var events = this.retrieve('events');
		if (!events || !events[type]) return this;
		var list = events[type];
		var index = list.keys.indexOf(fn);
		if (index == -1) return this;
		var value = list.values[index];
		delete list.keys[index];
		delete list.values[index];
		var custom = Element.Events[type];
		if (custom){
			if (custom.onRemove) custom.onRemove.call(this, fn);
			type = custom.base || type;
		}
		return (Element.NativeEvents[type]) ? this.removeListener(type, value, arguments[2]) : this;
	},

	addEvents: function(events){
		for (var event in events) this.addEvent(event, events[event]);
		return this;
	},

	removeEvents: function(events){
		var type;
		if (typeOf(events) == 'object'){
			for (type in events) this.removeEvent(type, events[type]);
			return this;
		}
		var attached = this.retrieve('events');
		if (!attached) return this;
		if (!events){
			for (type in attached) this.removeEvents(type);
			this.eliminate('events');
		} else if (attached[events]){
			attached[events].keys.each(function(fn){
				this.removeEvent(events, fn);
			}, this);
			delete attached[events];
		}
		return this;
	},

	fireEvent: function(type, args, delay){
		var events = this.retrieve('events');
		if (!events || !events[type]) return this;
		args = Array.from(args);

		events[type].keys.each(function(fn){
			if (delay) fn.delay(delay, this, args);
			else fn.apply(this, args);
		}, this);
		return this;
	},

	cloneEvents: function(from, type){
		from = document.id(from);
		var events = from.retrieve('events');
		if (!events) return this;
		if (!type){
			for (var eventType in events) this.cloneEvents(from, eventType);
		} else if (events[type]){
			events[type].keys.each(function(fn){
				this.addEvent(type, fn);
			}, this);
		}
		return this;
	}

});

Element.NativeEvents = {
	click: 2, dblclick: 2, mouseup: 2, mousedown: 2, contextmenu: 2, //mouse buttons
	mousewheel: 2, DOMMouseScroll: 2, //mouse wheel
	mouseover: 2, mouseout: 2, mousemove: 2, selectstart: 2, selectend: 2, //mouse movement
	keydown: 2, keypress: 2, keyup: 2, //keyboard
	orientationchange: 2, // mobile
	touchstart: 2, touchmove: 2, touchend: 2, touchcancel: 2, // touch
	gesturestart: 2, gesturechange: 2, gestureend: 2, // gesture
	focus: 2, blur: 2, change: 2, reset: 2, select: 2, submit: 2, //form elements
	load: 2, unload: 1, beforeunload: 2, resize: 1, move: 1, DOMContentLoaded: 1, readystatechange: 1, //window
	error: 1, abort: 1, scroll: 1 //misc
};

var check = function(event){
	var related = event.relatedTarget;
	if (related == null) return true;
	if (!related) return false;
	return (related != this && related.prefix != 'xul' && typeOf(this) != 'document' && !this.contains(related));
};

Element.Events = {

	mouseenter: {
		base: 'mouseover',
		condition: check
	},

	mouseleave: {
		base: 'mouseout',
		condition: check
	},

	mousewheel: {
		base: (Browser.firefox) ? 'DOMMouseScroll' : 'mousewheel'
	}

};

//<1.2compat>

Element.Events = new Hash(Element.Events);

//</1.2compat>

})();

/*
---

name: History

description: History Management via popstate or hashchange.

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Events, Core/Element.Event]

provides: History

...
*/

(function(){

var events = Element.NativeEvents,
	location = window.location,
	base = location.pathname,
	history = window.history,
	hasPushState = ('pushState' in history),
	event = hasPushState ? 'popstate' : 'hashchange';

this.History = new new Class({

	Implements: [Events],

	initialize: hasPushState ? function(){
		events[event] = 2;
		window.addEvent(event, this.pop.bind(this));
	} : function(){
		events[event] = 1;
		window.addEvent(event, this.pop.bind(this));

		this.hash = location.hash;
		var hashchange = ('onhashchange' in window);
		if (!(hashchange && (document.documentMode === undefined || document.documentMode > 7)))
			this.timer = this.check.periodical(200, this);
	},

	push: hasPushState ? function(url, title, state){
		if (base && base != url) base = null;
		
		history.pushState(state || null, title || null, url);
		this.onChange(url, state);
	} : function(url){
		location.hash = url;
	},

	replace: hasPushState ? function(url, title, state){
		history.replaceState(state || null, title || null, url);
	} : function(url){
		this.hash = '#' + url;
		this.push(url);
	},

	pop: hasPushState ? function(event){
		var url = location.pathname;
		if (url == base){
			base = null;
			return;
		}
		this.onChange(url, event.event.state);
	} : function(){
		var hash = location.hash;
		if (this.hash == hash) return;

		this.hash = hash;
		this.onChange(hash.substr(1));
	},

	onChange: function(url, state){
		this.fireEvent('change', [url, state || {}]);
	},

	back: function(){
		history.back();
	},

	forward: function(){
		history.forward();
	},
	
	getPath: function(){
		return hasPushState ? location.pathname : location.hash.substr(1);
	},

	hasPushState: function(){
		return hasPushState;
	},

	check: function(){
		if (this.hash != location.hash) this.pop();
	}

});

}).call(this);

/*
---
 
script: History.js
 
description: History Action Management.
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Action
  - History/History
 
provides:
  - LSD.Action.History
 
...
*/

LSD.Action.History = LSD.Action.build({
  enable: function(target, content) {
    var url = target.getAttribute('src')|| target.getAttribute('action') || target.getAttribute('href');
    if (url) History.push(url);
  }
});
/*
---

name: Element.Event.Pseudos

description: Adds the functionality to add pseudo events for Elements

license: MIT-style license

authors:
  - Arian Stolwijk

requires: [Core/Element.Event, Events.Pseudos]

provides: [Element.Event.Pseudos]

...
*/

(function(){

var pseudos = {},
	copyFromEvents = ['once', 'throttle', 'pause'],
	count = copyFromEvents.length;

while (count--) pseudos[copyFromEvents[count]] = Events.lookupPseudo(copyFromEvents[count]);

Event.definePseudo = function(key, listener){
	pseudos[key] = Type.isFunction(listener) ? {listener: listener} : listener;
	return this;
};

var proto = Element.prototype;
[Element, Window, Document].invoke('implement', Events.Pseudos(pseudos, proto.addEvent, proto.removeEvent));

})();

/*
---

script: Element.Delegation.js

name: Element.Delegation

description: Extends the Element native object to include the delegate method for more efficient event management.

credits:
  - "Event checking based on the work of Daniel Steigerwald. License: MIT-style license. Copyright: Copyright (c) 2008 Daniel Steigerwald, daniel.steigerwald.cz"

license: MIT-style license

authors:
  - Aaron Newton
  - Daniel Steigerwald

requires: [/MooTools.More, Element.Event.Pseudos]

provides: [Element.Delegation]

...
*/

(function(){

var eventListenerSupport = !(window.attachEvent && !window.addEventListener),
	nativeEvents = Element.NativeEvents;

nativeEvents.focusin = 2;
nativeEvents.focusout = 2;

var check = function(split, target, event){
	var elementEvent = Element.Events[split.event], condition;
	if (elementEvent) condition = elementEvent.condition;
	return Slick.match(target, split.value) && (!condition || condition.call(target, event));
};

var bubbleUp = function(split, event, fn){
	for (var target = event.target; target && target != this; target = document.id(target.parentNode)){
		if (target && check(split, target, event)) return fn.call(target, event, target);
	}
};

var formObserver = function(eventName){

	var $delegationKey = '$delegation:';

	return {
		base: 'focusin',

		onRemove: function(element){
			element.retrieve($delegationKey + 'forms', []).each(function(el){
				el.retrieve($delegationKey + 'listeners', []).each(function(listener){
					el.removeEvent(eventName, listener);
				});
				el.eliminate($delegationKey + eventName + 'listeners')
					.eliminate($delegationKey + eventName + 'originalFn');
			});
		},

		listener: function(split, fn, args, monitor, options){
			var event = args[0],
				forms = this.retrieve($delegationKey + 'forms', []),
				target = event.target,
				form = (target.get('tag') == 'form') ? target : event.target.getParent('form');
				
			if (!form) return;
				
			var formEvents = form.retrieve($delegationKey + 'originalFn', []),
				formListeners = form.retrieve($delegationKey + 'listeners', []),
				self = this;

			forms.include(form);
			this.store($delegationKey + 'forms', forms);

			if (!formEvents.contains(fn)){
				var formListener = function(event){
					bubbleUp.call(self, split, event, fn);
				};
				form.addEvent(eventName, formListener);

				formEvents.push(fn);
				formListeners.push(formListener);

				form.store($delegationKey + eventName + 'originalFn', formEvents)
					.store($delegationKey + eventName + 'listeners', formListeners);
			}
		}
	};
};

var inputObserver = function(eventName){
	return {
		base: 'focusin',
		listener: function(split, fn, args){
			var events = {blur: function(){
				this.removeEvents(events);
			}}, self = this;
			events[eventName] = function(event){
				bubbleUp.call(self, split, event, fn);
			};
			args[0].target.addEvents(events);
		}
	};
};

var eventOptions = {
	mouseenter: {
		base: 'mouseover'
	},
	mouseleave: {
		base: 'mouseout'
	},
	focus: {
		base: 'focus' + (eventListenerSupport ? '' : 'in'),
		args: [true]
	},
	blur: {
		base: eventListenerSupport ? 'blur' : 'focusout',
		args: [true]
	}
};

if (!eventListenerSupport) Object.append(eventOptions, {
	submit: formObserver('submit'),
	reset: formObserver('reset'),
	change: inputObserver('change'),
	select: inputObserver('select')
});

Event.definePseudo('relay', {
	listener: function(split, fn, args){
		bubbleUp.call(this, split, args[0], fn);
	},
	options: eventOptions
});

})();

/*
---

name: Element.defineCustomEvent

description: Allows to create custom events based on other custom events.

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Element.Event]

provides: Element.defineCustomEvent

...
*/

(function(){

[Element, Window, Document].invoke('implement', {hasEvent: function(event){
	var events = this.retrieve('events'),
		list = (events && events[event]) ? events[event].values : null;
	if (list){
		for (var i = list.length; i--;) if (i in list){
			return true;
		}
	}
	return false;
}});

var wrap = function(custom, method, extended, name){
	method = custom[method];
	extended = custom[extended];

	return function(fn, customName){
		if (!customName) customName = name;

		if (extended && !this.hasEvent(customName)) extended.call(this, fn, customName);
		if (method) method.call(this, fn, customName);
	};
};

var inherit = function(custom, base, method, name){
	return function(fn, customName){
		base[method].call(this, fn, customName || name);
		custom[method].call(this, fn, customName || name);
	};
};

var events = Element.Events;

Element.defineCustomEvent = function(name, custom){

	var base = events[custom.base];

	custom.onAdd = wrap(custom, 'onAdd', 'onSetup', name);
	custom.onRemove = wrap(custom, 'onRemove', 'onTeardown', name);

	events[name] = base ? Object.append({}, custom, {

		base: base.base,

		condition: function(event){
			return (!base.condition || base.condition.call(this, event)) &&
				(!custom.condition || custom.condition.call(this, event));
		},

		onAdd: inherit(custom, base, 'onAdd', name),
		onRemove: inherit(custom, base, 'onRemove', name)

	}) : custom;

	return this;

};

var loop = function(name){
	var method = 'on' + name.capitalize();
	Element[name + 'CustomEvents'] = function(){
		Object.each(events, function(event, name){
			if (event[method]) event[method].call(event, name);
		});
	};
	return loop;
};

loop('enable')('disable');

})();

/*
---

name: Touch

description: Provides a custom touch event on mobile devices

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Element.Event, Custom-Event/Element.defineCustomEvent, Browser.Features.Touch]

provides: Touch

...
*/

(function(){

var preventDefault = function(event){
	event.preventDefault();
};

var disabled;

Element.defineCustomEvent('touch', {

	base: 'touchend',

	condition: function(event){
		if (disabled || event.targetTouches.length != 0) return false;

		var touch = event.changedTouches[0],
			target = document.elementFromPoint(touch.clientX, touch.clientY);

		do {
			if (target == this) return true;
		} while ((target = target.parentNode) && target);

		return false;
	},

	onSetup: function(){
		this.addEvent('touchstart', preventDefault);
	},

	onTeardown: function(){
		this.removeEvent('touchstart', preventDefault);
	},

	onEnable: function(){
		disabled = false;
	},

	onDisable: function(){
		disabled = true;
	}

});

})();

/*
---

name: Click

description: Provides a replacement for click events on mobile devices

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Touch]

provides: Click

...
*/

if (Browser.Features.iOSTouch) (function(){

var name = 'click';
delete Element.NativeEvents[name];

Element.defineCustomEvent(name, {

	base: 'touch'

});

})();

/*
---

name: Mouse

description: Maps mouse events to their touch counterparts

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Custom-Event/Element.defineCustomEvent, Browser.Features.Touch]

provides: Mouse

...
*/

if (!Browser.Features.Touch) (function(){

var condition = function(event){
  event.targetTouches = [];
  event.changedTouches = event.touches = [{
    pageX: event.page.x, pageY: event.page.y,
    clientX: event.client.x, clientY: event.client.y
  }];

  return true;
};

var mouseup = function(e) {
  var target = e.target;
  while (target != this && (target = target.parentNode));
  this.fireEvent(target ? 'touchend' : 'touchcancel', arguments);
  document.removeEvent('mouseup', this.retrieve('touch:mouseup'));
};

Element.defineCustomEvent('touchstart', {

  base: 'mousedown',

  condition: function() {
    var bound = this.retrieve('touch:mouseup');
    if (!bound) {
      bound = mouseup.bind(this);
      this.store('touch:mouseup', bound);
    }
    document.addEvent('mouseup', bound);
    return condition.apply(this, arguments);
  }

}).defineCustomEvent('touchmove', {

  base: 'mousemove',

  condition: condition

});

})();

/*
---

name: DOMReady

description: Contains the custom event domready.

license: MIT-style license.

requires: [Browser, Element, Element.Event]

provides: [DOMReady, DomReady]

...
*/

(function(window, document){

var ready,
	loaded,
	checks = [],
	shouldPoll,
	timer,
	testElement = document.createElement('div');

var domready = function(){
	clearTimeout(timer);
	if (ready) return;
	Browser.loaded = ready = true;
	document.removeListener('DOMContentLoaded', domready).removeListener('readystatechange', check);
	
	document.fireEvent('domready');
	window.fireEvent('domready');
};

var check = function(){
	for (var i = checks.length; i--;) if (checks[i]()){
		domready();
		return true;
	}
	return false;
};

var poll = function(){
	clearTimeout(timer);
	if (!check()) timer = setTimeout(poll, 10);
};

document.addListener('DOMContentLoaded', domready);

/*<ltIE8>*/
// doScroll technique by Diego Perini http://javascript.nwbox.com/IEContentLoaded/
// testElement.doScroll() throws when the DOM is not ready, only in the top window
var doScrollWorks = function(){
	try {
		testElement.doScroll();
		return true;
	} catch (e){}
	return false;
}
// If doScroll works already, it can't be used to determine domready
//   e.g. in an iframe
if (testElement.doScroll && !doScrollWorks()){
	checks.push(doScrollWorks);
	shouldPoll = true;
}
/*</ltIE8>*/

if (document.readyState) checks.push(function(){
	var state = document.readyState;
	return (state == 'loaded' || state == 'complete');
});

if ('onreadystatechange' in document) document.addListener('readystatechange', check);
else shouldPoll = true;

if (shouldPoll) poll();

Element.Events.domready = {
	onAdd: function(fn){
		if (ready) fn.call(this);
	}
};

// Make sure that domready fires before load
Element.Events.load = {
	base: 'load',
	onAdd: function(fn){
		if (loaded && this == window) fn.call(this);
	},
	condition: function(){
		if (this == window){
			domready();
			delete Element.Events.load;
		}
		return true;
	}
};

// This is based on the custom load event
window.addEvent('load', function(){
	loaded = true;
});

})(window, document);

/*
---
 
script: Item.js
 
description: Methods to get and set microdata closely to html5 spsec
 
license: MIT-style license.
 
requires:
- Core/Element
 
provides: [Element.prototype.getItems, Element.Properties.item, Element.Microdata, Element.Item]
 
...
*/
Element.Item = {
  walk: function(element, callback, memo, prefix) {
    var prop = element.getAttribute('itemprop');
    var scope = !!element.getAttribute('itemscope');
    if (prefix && prop) {
      if (!memo) memo = [];
      memo.push(prop);
    }
    for (var i = 0, children = element.childNodes, child; child = children[i++];) {
      if (child.nodeType != 1) continue;
      memo = Element.Item.walk.call(this, child, callback, memo, prefix);
    }
    var reference = element.getAttribute('itemref');
    if (scope && reference) {
      for (var i = 0, bits = reference.split(/\s*/), j = bits.length; i < j; i++) {
        var node = document.getElementById(bits[i]);
        if (node) Element.Item.walk.call(this, child, callback, memo, prefix);
      }
    }
    if (prefix && prop) memo.pop();
    return (prop) ? callback.call(this, element, prop, scope, memo) : memo;
  },
  
  serialize: function(element) {
    return Element.Item.walk(element, function(element, prop, scope, object) {
      if (!object) object = {};
      if (scope) {
        var obj = {};
        obj[prop] = object;
        return obj;
      } else {
        object[prop] = Element.get(element, 'itemvalue');
        return object;
      }
    })
  }
};

[Document, Element].invoke('implement', {
  getItems: function(tokens, strict) {
    var selector = '[itemscope]:not([itemprop])';
    if (tokens) selector += tokens.split(' ').map(function(type) {
      return '[itemtype' + (strict ? '~' : '*') + '=' + type + ']'
    }).join('');
    return this.getElements(selector).each(function(element) {
      return element.get('item');
    }).get('item')
  }
});

(function() {
  var push = function(properties, property, value) {
    var old = properties[property];
    if (old) { //multiple values, convert to array
      if (!old.push) properties[property] = [old];
      properties[property].push(value)
    } else {
      properties[property] = value;
    }
  }

Element.Properties.properties = {
  get: function() {
    var properties = {};
    var property = Element.getProperty(this, 'itemprop'), scope;
    if (property) {
      var scope = Element.getProperty(this, 'itemscope');
      if (!scope) {
        var value = Element.get(this, 'itemvalue');
        if (value) push(properties, property, value);
      }
    }
    for (var i = 0, child; child = this.childNodes[i++];) {
      if (child.nodeType != 1) continue;
      var values = Element.get(child, 'properties');
      for (var prop in values) push(properties, prop, values[prop]);
    }
    
    var reference = Element.getProperty(this, 'itemref');
    if (reference) {
      var selector = reference.split(' ').map(function(id) { return '#' + id}).join(', ');
      var elements = Slick.search(document.body, selector);
      for (var i = 0, reference; reference = elements[i++];) {
        var values = Element.get(reference, 'properties');
        for (var prop in values) push(properties, prop, values[prop]);
      }
    }
    
    if (scope) {
      var props = {};
      props[property] = properties;
      return props;
    }
    return properties;
  },
  
  set: function(value) {
    for (var i = 0, child; child = this.childNodes[i++];) {
      if (child.nodeType != 1) continue;
      var property = Element.getProperty(child, 'itemprop');
      if (property) Element.set(child, 'itemvalue', value[property]);
      else Element.set(child, 'properties', value)
    };
  }
};

})();

Element.Properties.item = {
  get: function() {
    if (!Element.getProperty(this, 'itemscope')) return;
    return Element.get(this, 'properties');
  },
  
  set: function(value) {
    if (!Element.getProperty(this, 'itemscope')) return;
    return Element.set(this, 'properties', value);
  }
};

(function() {

var resolve = function(url) {
  if (!url) return '';
  var img = document.createElement('img');
  img.setAttribute('src', url);
  return img.src;
}

Element.Properties.itemvalue = {
  get: function() {
    var property = this.getProperty('itemprop');
    if (!property) return;
    switch (this.get('tag')) {
      case 'meta':
        return this.get('content') || '';
      case 'input':
      case 'select':
      case 'textarea':
        return this.get('value');
      case 'audio':
      case 'embed':
      case 'iframe':
      case 'img':
      case 'source':
      case 'video':
        return resolve(this.get('src'));
      case 'a':
      case 'area':
      case 'link':
        return resolve(this.get('href'));
      case 'object':
        return resolve(this.get('data'));
      case 'time':
        var datetime = this.get('datetime');
        if (!(datetime === undefined)) return Date.parse(datetime);
      default:
        return this.getProperty('itemvalue') || this.get('text').trim();
    }
  },

  set: function(value) {
    var property = this.getProperty('itemprop');
    var scope = this.getProperty('itemscope');
    if (property === undefined) return;
    else if (scope && Object.type(value[scope])) return this.set('item', value[scope]);
    
    switch (this.get('tag')) {
      case 'meta':
        return this.set('content', value);
      case 'audio':
      case 'embed':
      case 'iframe':
      case 'img':
      case 'source':
      case 'video':
        return this.set('src', value);
      case 'a':
      case 'area':
      case 'link':
        return this.set('href', value);
      case 'object':
        return this.set('data', value);
      case 'time':
        var datetime = this.get('datetime');
        if (!(datetime === undefined)) this.set('datetime', value)
      default:
        return this.set('html', value);
    }
  }
}

})();
/*
---
 
script: Microdata.js
 
description: Data that comes from specially html5 formatted elements
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD
  - LSD.Object
  - Ext/Element.Item
  
provides:
  - LSD.Microdata
  
...
*/

LSD.Microdata = function(element, name) {
  this._element = element;
  this._name = name;
};

LSD.Microdata.prototype = new LSD.Object({
  add: function(element, property, value) {
    var group = (this._elements || (this._elements = {}))[property];
    if (!group) group = element
    else if (!group.push) group = [group]
    else if (group.push) group.push(name);
    if (value == null) value = Element.get(element, 'itemvalue');
    this.set(property, value);
    var callback = Element.retrieve(element, 'microdata:setter');
    if (!callback) Element.store(element, 'microdata:setter', (callback = function(value) {
      Element.set(element, 'itemvalue', value);      
    }))
    this.watch(property, callback, true)
  },
  remove: function(element, property, value) {
    var group = (this._elements || (this._elements = {}))[property];
    if (group.push) group.erase(element)
    else delete this._elements[property];
    if (value == null) value = Element.get(element, 'itemvalue');
    if (this.property && this.property == value) this.unset(property);
    this.unwatch(property, Element.retrieve(element, 'microdata:setter'));
  }
});

LSD.Microdata.element = function(element, widget, parent) {
  var itemprop = element.getAttribute('itemprop');
  if (itemprop) {
    var itemscope = element.getAttribute('itemscope');
    if (itemscope) {
      var scope = Element.retrieve(element, 'microdata:scope');
      if (!scope)
        Element.store(element, 'microdata:scope', (scope = new LSD.Microdata(element, itemprop)));
      if (widget) {
        if (widget.element == element) widget.itemscope = scope;
        for (var node = widget; node; node = (!parent && node.parentNode)) {
          LSD.Module.Interpolations.addInterpolator.call(node, itemprop, scope);
        if (!widget.itemPropertyExportCallback) widget.itemPropertyExportCallback = function(name, value, state) {
          if (!value.watch) widget[state ? 'addInterpolator' : 'removeInterpolator'](name, value);
        }
        if (scope && widget.itemscope && widget.itemscope == scope)
          scope.addEvent('change', widget.itemPropertyExportCallback).addEvent('beforechange', widget.itemPropertyExportCallback);
        }
      }
    }
    if (parent) parent.add(element, itemprop, scope);
  }
  return scope;
};
/*
---

name: Element.Style

description: Contains methods for interacting with the styles of Elements in a fashionable way.

license: MIT-style license.

requires: Element

provides: Element.Style

...
*/

(function(){

var html = document.html;

Element.Properties.styles = {set: function(styles){
	this.setStyles(styles);
}};

var hasOpacity = (html.style.opacity != null);
var reAlpha = /alpha\(opacity=([\d.]+)\)/i;

var setOpacity = function(element, opacity){
	if (!element.currentStyle || !element.currentStyle.hasLayout) element.style.zoom = 1;
	if (hasOpacity){
		element.style.opacity = opacity;
	} else {
		opacity = (opacity * 100).limit(0, 100).round();
		opacity = (opacity == 100) ? '' : 'alpha(opacity=' + opacity + ')';
		var filter = element.style.filter || element.getComputedStyle('filter') || '';
		element.style.filter = reAlpha.test(filter) ? filter.replace(reAlpha, opacity) : filter + opacity;
	}
};

Element.Properties.opacity = {

	set: function(opacity){
		var visibility = this.style.visibility;
		if (opacity == 0 && visibility != 'hidden') this.style.visibility = 'hidden';
		else if (opacity != 0 && visibility != 'visible') this.style.visibility = 'visible';

		setOpacity(this, opacity);
	},

	get: (hasOpacity) ? function(){
		var opacity = this.style.opacity || this.getComputedStyle('opacity');
		return (opacity == '') ? 1 : opacity;
	} : function(){
		var opacity, filter = (this.style.filter || this.getComputedStyle('filter'));
		if (filter) opacity = filter.match(reAlpha);
		return (opacity == null || filter == null) ? 1 : (opacity[1] / 100);
	}

};

var floatName = (html.style.cssFloat == null) ? 'styleFloat' : 'cssFloat';

Element.implement({

	getComputedStyle: function(property){
		if (this.currentStyle) return this.currentStyle[property.camelCase()];
		var defaultView = Element.getDocument(this).defaultView,
			computed = defaultView ? defaultView.getComputedStyle(this, null) : null;
		return (computed) ? computed.getPropertyValue((property == floatName) ? 'float' : property.hyphenate()) : null;
	},

	setOpacity: function(value){
		setOpacity(this, value);
		return this;
	},

	getOpacity: function(){
		return this.get('opacity');
	},

	setStyle: function(property, value){
		switch (property){
			case 'opacity': return this.set('opacity', parseFloat(value));
			case 'float': property = floatName;
		}
		property = property.camelCase();
		if (typeOf(value) != 'string'){
			var map = (Element.Styles[property] || '@').split(' ');
			value = Array.from(value).map(function(val, i){
				if (!map[i]) return '';
				return (typeOf(val) == 'number') ? map[i].replace('@', Math.round(val)) : val;
			}).join(' ');
		} else if (value == String(Number(value))){
			value = Math.round(value);
		}
		this.style[property] = value;
		return this;
	},

	getStyle: function(property){
		switch (property){
			case 'opacity': return this.get('opacity');
			case 'float': property = floatName;
		}
		property = property.camelCase();
		var result = this.style[property];
		if (!result || property == 'zIndex'){
			result = [];
			for (var style in Element.ShortStyles){
				if (property != style) continue;
				for (var s in Element.ShortStyles[style]) result.push(this.getStyle(s));
				return result.join(' ');
			}
			result = this.getComputedStyle(property);
		}
		if (result){
			result = String(result);
			var color = result.match(/rgba?\([\d\s,]+\)/);
			if (color) result = result.replace(color[0], color[0].rgbToHex());
		}
		if (Browser.opera || (Browser.ie && isNaN(parseFloat(result)))){
			if ((/^(height|width)$/).test(property)){
				var values = (property == 'width') ? ['left', 'right'] : ['top', 'bottom'], size = 0;
				values.each(function(value){
					size += this.getStyle('border-' + value + '-width').toInt() + this.getStyle('padding-' + value).toInt();
				}, this);
				return this['offset' + property.capitalize()] - size + 'px';
			}
			if (Browser.opera && String(result).indexOf('px') != -1) return result;
			if ((/^border(.+)Width|margin|padding/).test(property)) return '0px';
		}
		return result;
	},

	setStyles: function(styles){
		for (var style in styles) this.setStyle(style, styles[style]);
		return this;
	},

	getStyles: function(){
		var result = {};
		Array.flatten(arguments).each(function(key){
			result[key] = this.getStyle(key);
		}, this);
		return result;
	}

});

Element.Styles = {
	left: '@px', top: '@px', bottom: '@px', right: '@px',
	width: '@px', height: '@px', maxWidth: '@px', maxHeight: '@px', minWidth: '@px', minHeight: '@px',
	backgroundColor: 'rgb(@, @, @)', backgroundPosition: '@px @px', color: 'rgb(@, @, @)',
	fontSize: '@px', letterSpacing: '@px', lineHeight: '@px', clip: 'rect(@px @px @px @px)',
	margin: '@px @px @px @px', padding: '@px @px @px @px', border: '@px @ rgb(@, @, @) @px @ rgb(@, @, @) @px @ rgb(@, @, @)',
	borderWidth: '@px @px @px @px', borderStyle: '@ @ @ @', borderColor: 'rgb(@, @, @) rgb(@, @, @) rgb(@, @, @) rgb(@, @, @)',
	zIndex: '@', 'zoom': '@', fontWeight: '@', textIndent: '@px', opacity: '@'
};

//<1.2compat>

Element.Styles = new Hash(Element.Styles);

//</1.2compat>

Element.ShortStyles = {margin: {}, padding: {}, border: {}, borderWidth: {}, borderStyle: {}, borderColor: {}};

['Top', 'Right', 'Bottom', 'Left'].each(function(direction){
	var Short = Element.ShortStyles;
	var All = Element.Styles;
	['margin', 'padding'].each(function(style){
		var sd = style + direction;
		Short[style][sd] = All[sd] = '@px';
	});
	var bd = 'border' + direction;
	Short.border[bd] = All[bd] = '@px @ rgb(@, @, @)';
	var bdw = bd + 'Width', bds = bd + 'Style', bdc = bd + 'Color';
	Short[bd] = {};
	Short.borderWidth[bdw] = Short[bd][bdw] = All[bdw] = '@px';
	Short.borderStyle[bds] = Short[bd][bds] = All[bds] = '@';
	Short.borderColor[bdc] = Short[bd][bdc] = All[bdc] = 'rgb(@, @, @)';
});

})();

/*
---

name: Element.Dimensions

description: Contains methods to work with size, scroll, or positioning of Elements and the window object.

license: MIT-style license.

credits:
  - Element positioning based on the [qooxdoo](http://qooxdoo.org/) code and smart browser fixes, [LGPL License](http://www.gnu.org/licenses/lgpl.html).
  - Viewport dimensions based on [YUI](http://developer.yahoo.com/yui/) code, [BSD License](http://developer.yahoo.com/yui/license.html).

requires: [Element, Element.Style]

provides: [Element.Dimensions]

...
*/

(function(){

var element = document.createElement('div'),
	child = document.createElement('div');
element.style.height = '0';
element.appendChild(child);
var brokenOffsetParent = (child.offsetParent === element);
element = child = null;

var isOffset = function(el){
	return styleString(el, 'position') != 'static' || isBody(el);
};

var isOffsetStatic = function(el){
	return isOffset(el) || (/^(?:table|td|th)$/i).test(el.tagName);
};

Element.implement({

	scrollTo: function(x, y){
		if (isBody(this)){
			this.getWindow().scrollTo(x, y);
		} else {
			this.scrollLeft = x;
			this.scrollTop = y;
		}
		return this;
	},

	getSize: function(){
		if (isBody(this)) return this.getWindow().getSize();
		return {x: this.offsetWidth, y: this.offsetHeight};
	},

	getScrollSize: function(){
		if (isBody(this)) return this.getWindow().getScrollSize();
		return {x: this.scrollWidth, y: this.scrollHeight};
	},

	getScroll: function(){
		if (isBody(this)) return this.getWindow().getScroll();
		return {x: this.scrollLeft, y: this.scrollTop};
	},

	getScrolls: function(){
		var element = this.parentNode, position = {x: 0, y: 0};
		while (element && !isBody(element)){
			position.x += element.scrollLeft;
			position.y += element.scrollTop;
			element = element.parentNode;
		}
		return position;
	},

	getOffsetParent: brokenOffsetParent ? function(){
		var element = this;
		if (isBody(element) || styleString(element, 'position') == 'fixed') return null;

		var isOffsetCheck = (styleString(element, 'position') == 'static') ? isOffsetStatic : isOffset;
		while ((element = element.parentNode)){
			if (isOffsetCheck(element)) return element;
		}
		return null;
	} : function(){
		var element = this;
		if (isBody(element) || styleString(element, 'position') == 'fixed') return null;

		try {
			return element.offsetParent;
		} catch(e) {}
		return null;
	},

	getOffsets: function(){
		if (this.getBoundingClientRect && !Browser.Platform.ios){
			var bound = this.getBoundingClientRect(),
				html = document.id(this.getDocument().documentElement),
				htmlScroll = html.getScroll(),
				elemScrolls = this.getScrolls(),
				isFixed = (styleString(this, 'position') == 'fixed');

			return {
				x: bound.left.toInt() + elemScrolls.x + ((isFixed) ? 0 : htmlScroll.x) - html.clientLeft,
				y: bound.top.toInt()  + elemScrolls.y + ((isFixed) ? 0 : htmlScroll.y) - html.clientTop
			};
		}

		var element = this, position = {x: 0, y: 0};
		if (isBody(this)) return position;

		while (element && !isBody(element)){
			position.x += element.offsetLeft;
			position.y += element.offsetTop;

			if (Browser.firefox){
				if (!borderBox(element)){
					position.x += leftBorder(element);
					position.y += topBorder(element);
				}
				var parent = element.parentNode;
				if (parent && styleString(parent, 'overflow') != 'visible'){
					position.x += leftBorder(parent);
					position.y += topBorder(parent);
				}
			} else if (element != this && Browser.safari){
				position.x += leftBorder(element);
				position.y += topBorder(element);
			}

			element = element.offsetParent;
		}
		if (Browser.firefox && !borderBox(this)){
			position.x -= leftBorder(this);
			position.y -= topBorder(this);
		}
		return position;
	},

	getPosition: function(relative){
		if (isBody(this)) return {x: 0, y: 0};
		var offset = this.getOffsets(),
			scroll = this.getScrolls();
		var position = {
			x: offset.x - scroll.x,
			y: offset.y - scroll.y
		};
		
		if (relative && (relative = document.id(relative))){
			var relativePosition = relative.getPosition();
			return {x: position.x - relativePosition.x - leftBorder(relative), y: position.y - relativePosition.y - topBorder(relative)};
		}
		return position;
	},

	getCoordinates: function(element){
		if (isBody(this)) return this.getWindow().getCoordinates();
		var position = this.getPosition(element),
			size = this.getSize();
		var obj = {
			left: position.x,
			top: position.y,
			width: size.x,
			height: size.y
		};
		obj.right = obj.left + obj.width;
		obj.bottom = obj.top + obj.height;
		return obj;
	},

	computePosition: function(obj){
		return {
			left: obj.x - styleNumber(this, 'margin-left'),
			top: obj.y - styleNumber(this, 'margin-top')
		};
	},

	setPosition: function(obj){
		return this.setStyles(this.computePosition(obj));
	}

});


[Document, Window].invoke('implement', {

	getSize: function(){
		var doc = getCompatElement(this);
		return {x: doc.clientWidth, y: doc.clientHeight};
	},

	getScroll: function(){
		var win = this.getWindow(), doc = getCompatElement(this);
		return {x: win.pageXOffset || doc.scrollLeft, y: win.pageYOffset || doc.scrollTop};
	},

	getScrollSize: function(){
		var doc = getCompatElement(this),
			min = this.getSize(),
			body = this.getDocument().body;

		return {x: Math.max(doc.scrollWidth, body.scrollWidth, min.x), y: Math.max(doc.scrollHeight, body.scrollHeight, min.y)};
	},

	getPosition: function(){
		return {x: 0, y: 0};
	},

	getCoordinates: function(){
		var size = this.getSize();
		return {top: 0, left: 0, bottom: size.y, right: size.x, height: size.y, width: size.x};
	}

});

// private methods

var styleString = Element.getComputedStyle;

function styleNumber(element, style){
	return styleString(element, style).toInt() || 0;
}

function borderBox(element){
	return styleString(element, '-moz-box-sizing') == 'border-box';
}

function topBorder(element){
	return styleNumber(element, 'border-top-width');
}

function leftBorder(element){
	return styleNumber(element, 'border-left-width');
}

function isBody(element){
	return (/^(?:body|html)$/i).test(element.tagName);
}

function getCompatElement(element){
	var doc = element.getDocument();
	return (!doc.compatMode || doc.compatMode == 'CSS1Compat') ? doc.html : doc.body;
}

})();

//aliases
Element.alias({position: 'setPosition'}); //compatability

[Window, Document, Element].invoke('implement', {

	getHeight: function(){
		return this.getSize().y;
	},

	getWidth: function(){
		return this.getSize().x;
	},

	getScrollTop: function(){
		return this.getScroll().y;
	},

	getScrollLeft: function(){
		return this.getScroll().x;
	},

	getScrollHeight: function(){
		return this.getScrollSize().y;
	},

	getScrollWidth: function(){
		return this.getScrollSize().x;
	},

	getTop: function(){
		return this.getPosition().y;
	},

	getLeft: function(){
		return this.getPosition().x;
	}

});

/*
---

script: Drag.js

name: Drag

description: The base Drag Class. Can be used to drag and resize Elements using mouse events.

license: MIT-style license

authors:
  - Valerio Proietti
  - Tom Occhinno
  - Jan Kassens

requires:
  - Core/Events
  - Core/Options
  - Core/Element.Event
  - Core/Element.Style
  - Core/Element.Dimensions
  - /MooTools.More

provides: [Drag]
...

*/

var Drag = new Class({

	Implements: [Events, Options],

	options: {/*
		onBeforeStart: function(thisElement){},
		onStart: function(thisElement, event){},
		onSnap: function(thisElement){},
		onDrag: function(thisElement, event){},
		onCancel: function(thisElement){},
		onComplete: function(thisElement, event){},*/
		snap: 6,
		unit: 'px',
		grid: false,
		style: true,
		limit: false,
		handle: false,
		invert: false,
		preventDefault: false,
		stopPropagation: false,
		modifiers: {x: 'left', y: 'top'}
	},

	initialize: function(){
		var params = Array.link(arguments, {
			'options': Type.isObject,
			'element': function(obj){
				return obj != null;
			}
		});

		this.element = document.id(params.element);
		this.document = this.element.getDocument();
		this.setOptions(params.options || {});
		var htype = typeOf(this.options.handle);
		this.handles = ((htype == 'array' || htype == 'collection') ? $$(this.options.handle) : document.id(this.options.handle)) || this.element;
		this.mouse = {'now': {}, 'pos': {}};
		this.value = {'start': {}, 'now': {}};

		this.selection = (Browser.ie) ? 'selectstart' : 'mousedown';


		if (Browser.ie && !Drag.ondragstartFixed){
			document.ondragstart = Function.from(false);
			Drag.ondragstartFixed = true;
		}

		this.bound = {
			start: this.start.bind(this),
			check: this.check.bind(this),
			drag: this.drag.bind(this),
			stop: this.stop.bind(this),
			cancel: this.cancel.bind(this),
			eventStop: Function.from(false)
		};
		this.attach();
	},

	attach: function(){
		this.handles.addEvent('mousedown', this.bound.start);
		return this;
	},

	detach: function(){
		this.handles.removeEvent('mousedown', this.bound.start);
		return this;
	},

	start: function(event){
		var options = this.options;

		if (event.rightClick) return;

		if (options.preventDefault) event.preventDefault();
		if (options.stopPropagation) event.stopPropagation();
		this.mouse.start = event.page;

		this.fireEvent('beforeStart', this.element);

		var limit = options.limit;
		this.limit = {x: [], y: []};

		var z, coordinates;
		for (z in options.modifiers){
			if (!options.modifiers[z]) continue;

			var style = this.element.getStyle(options.modifiers[z]);

			// Some browsers (IE and Opera) don't always return pixels.
			if (style && !style.match(/px$/)){
				if (!coordinates) coordinates = this.element.getCoordinates(this.element.getOffsetParent());
				style = coordinates[options.modifiers[z]];
			}

			if (options.style) this.value.now[z] = (style || 0).toInt();
			else this.value.now[z] = this.element[options.modifiers[z]];

			if (options.invert) this.value.now[z] *= -1;

			this.mouse.pos[z] = event.page[z] - this.value.now[z];

			if (limit && limit[z]){
				var i = 2;
				while (i--){
					var limitZI = limit[z][i];
					if (limitZI || limitZI === 0) this.limit[z][i] = (typeof limitZI == 'function') ? limitZI() : limitZI;
				}
			}
		}

		if (typeOf(this.options.grid) == 'number') this.options.grid = {
			x: this.options.grid,
			y: this.options.grid
		};

		var events = {
			mousemove: this.bound.check,
			mouseup: this.bound.cancel
		};
		events[this.selection] = this.bound.eventStop;
		this.document.addEvents(events);
	},

	check: function(event){
		if (this.options.preventDefault) event.preventDefault();
		var distance = Math.round(Math.sqrt(Math.pow(event.page.x - this.mouse.start.x, 2) + Math.pow(event.page.y - this.mouse.start.y, 2)));
		if (distance > this.options.snap){
			this.cancel();
			this.document.addEvents({
				mousemove: this.bound.drag,
				mouseup: this.bound.stop
			});
			this.fireEvent('start', [this.element, event]).fireEvent('snap', this.element);
		}
	},

	drag: function(event){
		var options = this.options;

		if (options.preventDefault) event.preventDefault();
		this.mouse.now = event.page;

		for (var z in options.modifiers){
			if (!options.modifiers[z]) continue;
			this.value.now[z] = this.mouse.now[z] - this.mouse.pos[z];

			if (options.invert) this.value.now[z] *= -1;

			if (options.limit && this.limit[z]){
				if ((this.limit[z][1] || this.limit[z][1] === 0) && (this.value.now[z] > this.limit[z][1])){
					this.value.now[z] = this.limit[z][1];
				} else if ((this.limit[z][0] || this.limit[z][0] === 0) && (this.value.now[z] < this.limit[z][0])){
					this.value.now[z] = this.limit[z][0];
				}
			}

			if (options.grid[z]) this.value.now[z] -= ((this.value.now[z] - (this.limit[z][0]||0)) % options.grid[z]);

			if (options.style) this.element.setStyle(options.modifiers[z], this.value.now[z] + options.unit);
			else this.element[options.modifiers[z]] = this.value.now[z];
		}

		this.fireEvent('drag', [this.element, event]);
	},

	cancel: function(event){
		this.document.removeEvents({
			mousemove: this.bound.check,
			mouseup: this.bound.cancel
		});
		if (event){
			this.document.removeEvent(this.selection, this.bound.eventStop);
			this.fireEvent('cancel', this.element);
		}
	},

	stop: function(event){
		var events = {
			mousemove: this.bound.drag,
			mouseup: this.bound.stop
		};
		events[this.selection] = this.bound.eventStop;
		this.document.removeEvents(events);
		if (event) this.fireEvent('complete', [this.element, event]);
	}

});

Element.implement({

	makeResizable: function(options){
		var drag = new Drag(this, Object.merge({
			modifiers: {
				x: 'width',
				y: 'height'
			}
		}, options));

		this.store('resizer', drag);
		return drag.addEvent('drag', function(){
			this.fireEvent('resize', drag);
		}.bind(this));
	}

});

/*
---
 
script: Drag.Limits.js
 
description: A set of function to easily cap Drag's limit
 
license: MIT-style license.
 
requires:
- More/Drag

provides: [Drag.Limits]
 
...
*/

Drag.implement({
  setMaxX: function(x) {
    var limit = this.options.limit;
    limit.x[1] = x//Math.max(x, limit.x[1]);
    limit.x[0] = Math.min(limit.x[0], limit.x[1]);
  },
  
  setMaxY: function(y) {
    var limit = this.options.limit;
    limit.y[1] = y//Math.max(y, limit.y[1]);
    limit.y[0] = Math.min(limit.y[0], limit.y[1]);
  },
  
  setMinX: function(x) {
    var limit = this.options.limit;
    limit.x[0] = x//Math.min(x, limit.x[0]);
    limit.x[1] = Math.max(limit.x[1], limit.x[0]);
  },
  
  setMinY: function(y) {
    var limit = this.options.limit;
    limit.y[0] = y//Math.min(y, limit.y[0]);
    limit.y[1] = Math.max(limit.y[1], limit.y[0]);
  }
});

/*
---

script: Drag.Move.js

name: Drag.Move

description: A Drag extension that provides support for the constraining of draggables to containers and droppables.

license: MIT-style license

authors:
  - Valerio Proietti
  - Tom Occhinno
  - Jan Kassens
  - Aaron Newton
  - Scott Kyle

requires:
  - Core/Element.Dimensions
  - /Drag

provides: [Drag.Move]

...
*/

Drag.Move = new Class({

	Extends: Drag,

	options: {/*
		onEnter: function(thisElement, overed){},
		onLeave: function(thisElement, overed){},
		onDrop: function(thisElement, overed, event){},*/
		droppables: [],
		container: false,
		precalculate: false,
		includeMargins: true,
		checkDroppables: true
	},

	initialize: function(element, options){
		this.parent(element, options);
		element = this.element;

		this.droppables = $$(this.options.droppables);
		this.container = document.id(this.options.container);

		if (this.container && typeOf(this.container) != 'element')
			this.container = document.id(this.container.getDocument().body);

		if (this.options.style){
			if (this.options.modifiers.x == 'left' && this.options.modifiers.y == 'top'){
				var parent = element.getOffsetParent(),
					styles = element.getStyles('left', 'top');
				if (parent && (styles.left == 'auto' || styles.top == 'auto')){
					element.setPosition(element.getPosition(parent));
				}
			}

			if (element.getStyle('position') == 'static') element.setStyle('position', 'absolute');
		}

		this.addEvent('start', this.checkDroppables, true);
		this.overed = null;
	},

	start: function(event){
		if (this.container) this.options.limit = this.calculateLimit();

		if (this.options.precalculate){
			this.positions = this.droppables.map(function(el){
				return el.getCoordinates();
			});
		}

		this.parent(event);
	},

	calculateLimit: function(){
		var element = this.element,
			container = this.container,

			offsetParent = document.id(element.getOffsetParent()) || document.body,
			containerCoordinates = container.getCoordinates(offsetParent),
			elementMargin = {},
			elementBorder = {},
			containerMargin = {},
			containerBorder = {},
			offsetParentPadding = {};

		['top', 'right', 'bottom', 'left'].each(function(pad){
			elementMargin[pad] = element.getStyle('margin-' + pad).toInt();
			elementBorder[pad] = element.getStyle('border-' + pad).toInt();
			containerMargin[pad] = container.getStyle('margin-' + pad).toInt();
			containerBorder[pad] = container.getStyle('border-' + pad).toInt();
			offsetParentPadding[pad] = offsetParent.getStyle('padding-' + pad).toInt();
		}, this);

		var width = element.offsetWidth + elementMargin.left + elementMargin.right,
			height = element.offsetHeight + elementMargin.top + elementMargin.bottom,
			left = 0,
			top = 0,
			right = containerCoordinates.right - containerBorder.right - width,
			bottom = containerCoordinates.bottom - containerBorder.bottom - height;

		if (this.options.includeMargins){
			left += elementMargin.left;
			top += elementMargin.top;
		} else {
			right += elementMargin.right;
			bottom += elementMargin.bottom;
		}

		if (element.getStyle('position') == 'relative'){
			var coords = element.getCoordinates(offsetParent);
			coords.left -= element.getStyle('left').toInt();
			coords.top -= element.getStyle('top').toInt();

			left -= coords.left;
			top -= coords.top;
			if (container.getStyle('position') != 'relative'){
				left += containerBorder.left;
				top += containerBorder.top;
			}
			right += elementMargin.left - coords.left;
			bottom += elementMargin.top - coords.top;

			if (container != offsetParent){
				left += containerMargin.left + offsetParentPadding.left;
				top += ((Browser.ie6 || Browser.ie7) ? 0 : containerMargin.top) + offsetParentPadding.top;
			}
		} else {
			left -= elementMargin.left;
			top -= elementMargin.top;
			if (container != offsetParent){
				left += containerCoordinates.left + containerBorder.left;
				top += containerCoordinates.top + containerBorder.top;
			}
		}

		return {
			x: [left, right],
			y: [top, bottom]
		};
	},

	getDroppableCoordinates: function(element){
		var position = element.getCoordinates();
		if (element.getStyle('position') == 'fixed'){
			var scroll = window.getScroll();
			position.left += scroll.x;
			position.right += scroll.x;
			position.top += scroll.y;
			position.bottom += scroll.y;
		}
		return position;
	},

	checkDroppables: function(){
		var overed = this.droppables.filter(function(el, i){
			el = this.positions ? this.positions[i] : this.getDroppableCoordinates(el);
			var now = this.mouse.now;
			return (now.x > el.left && now.x < el.right && now.y < el.bottom && now.y > el.top);
		}, this).getLast();

		if (this.overed != overed){
			if (this.overed) this.fireEvent('leave', [this.element, this.overed]);
			if (overed) this.fireEvent('enter', [this.element, overed]);
			this.overed = overed;
		}
	},

	drag: function(event){
		this.parent(event);
		if (this.options.checkDroppables && this.droppables.length) this.checkDroppables();
	},

	stop: function(event){
		this.checkDroppables();
		this.fireEvent('drop', [this.element, this.overed, event]);
		this.overed = null;
		return this.parent(event);
	}

});

Element.implement({

	makeDraggable: function(options){
		var drag = new Drag.Move(this, options);
		this.store('dragger', drag);
		return drag;
	}

});

/*
---
name: Uploader

description: Base classes for uploaders

requires: [Core/Browser, Core/Class, Core/Class.Extras, Core/Element, Core/Element.Event, Core/Element.Dimensions]

provides: [Uploader, Uploader.File]

version: 1.0

license: MIT License

authors: 
  - Harald Kirschner <http://digitarald.de>
...
*/

!function() {
  

var Uploader = this.Uploader = function(options) {
  options = Object.merge(Uploader.options, options)
  if (!options.adapter) options.adapter = Uploader.getAdapter();
  var Klass = Uploader.getAdapterClass(options.adapter);
  if (!options.fileClass) 
    options.fileClass = (options.getFileClass ? options : Uploader).getFileClass(options.adapter, Klass);
  return new Klass(options);
};

Uploader.options = {
  verbose: true,
  target: true
}

Object.append(Uploader, {
  METHODS: ['Request', 'Swiff', 'Iframe', 'Request'],

  STATUS_QUEUED: 0,
  STATUS_RUNNING: 1,
  STATUS_ERROR: 2,
  STATUS_COMPLETE: 3,
  STATUS_STOPPED: 4,

  log: function() {
    if (window.console && console.info) console.info.apply(console, arguments);
  },

  unitLabels: {
    b: [{min: 1, unit: 'B'}, {min: 1024, unit: 'kB'}, {min: 1048576, unit: 'MB'}, {min: 1073741824, unit: 'GB'}],
    s: [{min: 1, unit: 's'}, {min: 60, unit: 'm'}, {min: 3600, unit: 'h'}, {min: 86400, unit: 'd'}]
  },
  
  getAdapterClass: function(name) {
    return Uploader[name.capitalize()];
  },
  
  getAdapter: function(options) {
    if (this.adapter) return this.adapter;
    for (var adapter, i = 0; adapter = Uploader.METHODS[i++];)
      if (Uploader[adapter] && Uploader[adapter].condition(options))
        return (this.adapter = adapter);
  },

  formatUnit: function(base, type, join) {
    var labels = Uploader.unitLabels[(type == 'bps') ? 'b' : type];
    var append = (type == 'bps') ? '/s' : '';
    var i, l = labels.length, value;

    if (base < 1) return '0 ' + labels[0].unit + append;

    if (type == 's') {
      var units = [];

      for (i = l - 1; i >= 0; i--) {
        value = Math.floor(base / labels[i].min);
        if (value) {
          units.push(value + ' ' + labels[i].unit);
          base -= value * labels[i].min;
          if (!base) break;
        }
      }

      return (join === false) ? units : units.join(join || ', ');
    }

    for (i = l - 1; i >= 0; i--) {
      value = labels[i].min;
      if (base >= value) break;
    }

    return (base / value).toFixed(1) + ' ' + labels[i].unit + append;
  },

  qualifyPath: (function() {
    var anchor;
    return function(path) {
      (anchor || (anchor = new Element('a'))).href = path;
      return anchor.href;
    };
  })(),
  
  getFileClass: function(method, klass) {
    return klass.File;
  }

});

Uploader.File = new Class({
  Implements: [Events, Options],
  
  options: {
    url: null,
    method: null,
    data: null,
    mergeData: true,
    fieldName: null
  },
  
  setBase: function(base) {
    this.base = base;
    this.target = base.target;
    if (this.options.fieldName == null)
      this.options.fieldName = this.base.options.fieldName;
    this.fireEvent('setBase', base);
    var args = Array.prototype.slice.call(arguments, 1);
    if (args.length) this.setData.apply(this, args);
	  return this;
  },
  
  setData: function(data) {
    this.setFile(data);
    return this;
  },

  triggerEvent: function(name) {
    var args = [this].concat(Array.prototype.slice.call(arguments, 1));
    this.base.fireEvent('file' + name.capitalize(), args);
    Uploader.log('File::' + name, args);
    return this.fireEvent(name, args);
  },
  
  setFile: function(file) {
    if (file) Object.append(this, file);
    if (!this.name && this.filename) this.name = this.filename;
    this.fireEvent('setFile', this);
    if (this.name) this.extension = this.name.replace(/^.*\./, '').toLowerCase();
    return this;
  },
  
  render: function() {
    return this;
  },
  
  cancel: function() {
    if (this.base) this.stop();
    this.remove();
  }
});

Uploader.Targeting = new Class({
  options: {
    zIndex: 9999
  },
  
  getTargetRelayEvents: function() {
    return {
      buttonEnter: this.targetRelay.bind(this, 'mouseenter'),
      buttonLeave: this.targetRelay.bind(this, 'mouseleave'),
      buttonDown: this.targetRelay.bind(this, 'mousedown'),
      buttonDisable: this.targetRelay.bind(this, 'disable')
    }
  },
  
  getTargetEvents: function() {
    if (this.targetEvents) return this.targetEvents;
    this.targetEvents = {
      mousemove: this.reposition.bind(this)
    };
    return this.targetEvents;
  },
  
  targetRelay: function(name) {
    if (this.target) this.target.fireEvent(name);
  },
  
  attach: function(target) {
    target = document.id(target);
    if (!this.target) this.addEvents(this.getTargetRelayEvents());
    else this.detach();
    this.target = target;
    this.target.addEvents(this.getTargetEvents(this.target));
  },
  
  detach: function(target) {
    if (!target) target = this.target;
    target.removeEvents(this.getTargetEvents(target));
    delete this.target;
  },

  reposition: function(coords) {
    // update coordinates, manual or automatically
    coords = coords || (this.target && this.target.offsetHeight)
      ? this.target.getCoordinates(this.box.getOffsetParent())
      : {top: window.getScrollTop(), left: 0, width: 40, height: 40}
    this.box.setStyles(coords);
    this.fireEvent('reposition', [coords, this.box, this.target]);
  },
  
  getBox: function() {
    if (this.box) return this.box;
    this.box = new Element('div').setStyles({
      position: 'absolute',
      opacity: 0.02,
      zIndex: this.options.zIndex,
      overflow: 'hidden',
      height: 100, width: 100,
      top: scroll.y, left: scroll.x
    });
    this.box.inject(document.id(this.options.container) || document.body);
    return this.box;
  }
})

}.call(this);
/*
---
name: Uploader.Iframe

description: Uploader that uses iframes to send one file at time

requires: [Uploader]

provides: [Uploader.Iframe, Uploader.Iframe.File]

version: 1.1

license: MIT License

author: Harald Kirschner <http://digitarald.de>
...
*/

if (!this.Uploader) this.Uploader = {}
this.Uploader.Iframe = new Class({

  Implements: [Options, Events, Uploader.Targeting],

  options: {
    container: null,

    queued: true,
    verbose: false,

    url: null,
    method: null,
    data: null,
    mergeData: true,
    fieldName: null,

    allowDuplicates: false,
    fileListMax: 0,

    instantStart: false,
    appendCookieData: false,

    fileClass: null
  },

  initialize: function(options) {
    this.setOptions(options);
    
    this.uploading = 0;
    this.fileList = [];
    
    this.getBox().addEvents({
      'mouseenter': this.fireEvent.bind(this, 'buttonEnter'),
      'mouseleave': this.fireEvent.bind(this, 'buttonLnter')
    })

    this.createIFrame();
    
    var target = document.id(this.options.target);
    if (target) this.attach(target);
  },
  
  createIFrame: function() {
    this.iframe = new Element('iframe', {
      src: "javascript:'<html></html>'",
      frameborder: 'no',
      border: 0,
      styles: {
        width: '100%',
        height: '100%'
      }
    }).inject(this.getBox());
    this.runner = this.createIBody.periodical(50, this);
    return this.iframe;
  },

  createIBody: function() {
    var doc = this.iframe.contentWindow.document;
    
    if (!doc || !doc.body) return;
    clearTimeout(this.runner);
        
    var align = (Browser.Engine.trident) ? 'left' : 'right';
    doc.body.innerHTML = '<form method="post" enctype="multipart/form-data" id="form">' +
      '<input type="file" id="file" style="position:absolute;' + align + ':0;top:0" />' +
      '<input type="submit" /><div id="data"></div></form>' + 
      '<style type="text/css">*{margin:0;padding:0;border:0;overflow:hidden;cursor:pointer;}</style>';
    
    this.doc = doc;
    
    this.processIBody.delay(50, this);
  },
  
  processIBody: function() {
    this.doc;
    
    if (!(this.file = this.doc.getElementById('file')) || !this.file.offsetHeight) {
      this.createIBody(); // WTF: FF forgot to update the HTML?!
      return;
    }
    
    Object.append(this.file, {
      onmousedown: function() {
        if (Browser.Engine.presto) return true;
        (function() {
          this.file.click();
          this.fireEvent('buttonDown');
        }).delay(10, this);
        return false;
      }.bind(this),
      onfocus: function() {
        return false;
      },
      onchange: this.select.bind(this),
      onmouseover: this.fireEvent.bind(this, 'buttonEnter'),
      onmouseout: this.fireEvent.bind(this, 'buttonLeave')
    });
  },

  select: function() {
    this.file.onchange = this.file.onmousedown = this.file.onfocus = null;
    var name = this.file.value.replace(/^.*[\\\/]/, '');
    var cls = this.options.fileClass || Uploader.Iframe.File;
    var ret = new cls;
    this.fireEvent('onBeforeSelect');
    ret.setBase(this, name, this.iframe.setStyle('display', 'none'));
    if (!ret.validate()) {
      ret.invalidate();
      ret.render();
      this.fireEvent('onSelectFailed', [[ret]]);
      return;
    }

    this.fileList.push(ret);
    ret.render();
    this.fireEvent('onSelectSuccess', [[ret]]);
    if (this.options.instantStart) this.start();
    
    this.file = null;

    this.createIFrame();
  },

  start: function() {
    this.fireEvent('beforeStart');
    var queued = this.options.queued;
    queued = (queued) ? ((queued > 1) ? queued : 1) : 0;
    for (var i = 0, file; file = this.fileList[i]; i++) {
      if (this.fileList[i].status != Uploader.STATUS_QUEUED) continue;
      this.fileList[i].start();
      if (queued && this.uploading >= queued) break;
    }
    return this;
  },

  stop: function() {
    this.fireEvent('beforeStop');
    for (var i = this.fileList.length; i--;) this.fileList[i].stop();
  },

  remove: function() {
    this.fireEvent('beforeRemove');
    for (var i = this.fileList.length; i--;) this.fileList[i].remove();
  },

  setEnabled: function(status) {
    this.file.disabled = !!(status);
    if (status) this.fireEvent('buttonDisable');
  }

});

Uploader.Iframe.File = new Class({

  Implements: Uploader.File,
  
  setData: function(name, iframe) {
    this.status = Uploader.STATUS_QUEUED;
    this.dates = {};
    this.dates.add = new Date();
    this.iframe = iframe.addEvents({
      abort: this.stop.bind(this),
      load: this.onLoad.bind(this)
    });
    this.setFile({name: name});
	  return this;
  },
  
  validate: function() {
    var base = this.base.options;

    if (!base.allowDuplicates) {
      var name = this.name;
      var dup = this.base.fileList.some(function(file) {
        return (file.name == name);
      });
      if (dup) {
        this.validationError = 'duplicate';
        return false;
      }
    }

    if (base.fileListMax && this.base.fileList.length >= base.fileListMax) {
      this.validationError = 'fileListMax';
      return false;
    }

    return true;
  },

  invalidate: function() {
    this.invalid = true;
    return this.triggerEvent('invalid');
  },

  render: function() {
    return this;
  },

  onLoad: function() {
    if (this.status != Uploader.STATUS_RUNNING) return;

    this.status = Uploader.STATUS_COMPLETE;

    var win = this.iframe.contentWindow;
    var doc = win.document;
    
    this.response = {
      window: win,
      document: doc,
      text: doc.body.innerHTML || ''
    };

    this.base.uploading--;
    this.dates.complete = new Date();

    this.triggerEvent('complete');

    this.base.start();
  },

  start: function() {
    if (this.status != Uploader.STATUS_QUEUED) return this;

    var base = this.base.options, options = this.options;
    
    var merged = {};
    for (var key in base) {
      merged[key] = (this.options[key] != null) ? this.options[key] : base[key];
    }
    
    merged.url = merged.url || location.href;
    merged.method = (merged.method) ? (merged.method.toLowerCase()) : 'post';
    
    var doc = this.iframe.contentWindow.document;

    var more = doc.getElementById('data');
    more.innerHTML = '';
    if (merged.data) {
      if (merged.mergeData && base.data && options.data) {
        if (typeOf(base.data) == 'string') merged.data = base.data + '&' + options.data;
        else merged.data = Object.merge(base.data, options.data);
      }
      
      var query = (typeOf(merged.data) == 'string') ? merged.data : Hash.toQueryString(merged.data);
      
      if (query.length) {
        if (merged.method == 'get') {
          if (data.length) merged.url += ((merged.url.contains('?')) ? '&' : '?') + query;
        } else {
          query.split('&').map(function(value) {
            value = value.split('=');
            var input = doc.createElement('input');
            input.type = 'hidden';
            input.name = decodeURIComponent(value[0]);
            input.value = decodeURIComponent(value[1] || '');
            more.appendChild(input);
          }).join('');
        }
      }
      
    }

    var form = doc.forms[0];
    form.action = merged.url;

    var input = form.elements[0];
    input.name = merged.fieldName || 'Filedata';

    this.status = Uploader.STATUS_RUNNING;
    this.base.uploading++;
    form.submit();

    this.dates.start = new Date();

    this.triggerEvent('start');

    return this;
  },

  requeue: function() {
    this.stop();
    this.status = Uploader.STATUS_QUEUED;
    this.triggerEvent('requeue');
  },

  stop: function(soft) {
    if (this.status == Uploader.STATUS_RUNNING) {
      this.status = Uploader.STATUS_STOPPED;
      this.base.uploading--;
      this.base.start();
      if (!soft) {
        this.iframe.contentWindow.history.back();
        this.triggerEvent('stop');
      }
    }
    return this;
  },

  remove: function() {
    this.stop(true);
    if (this.iframe) {
      this.iframe = this.iframe.destroy();
      delete this.iframe;
    }
    this.base.fileList.erase(this);
    this.triggerEvent('remove');
    return this;
  }

});

this.Uploader.Iframe.condition = function() {
  return true;
};

/*
---
name: Uploader.Request

description: XHR-based request uploader. Doesnt load files in memory on clientside, although sends malformed request.

requires: [Uploader]

provides: [Uploader.Request, Uploader.Request.File]

version: 1.0

license: MIT License

credits:
  - François de Metz <https://github.com/coolaj86/html5-formdata> 

authors: 
  - Harald Kirschner <http://digitarald.de>
  - Yaroslaff Fedin
...
*/

Uploader.Request = new Class({

  Implements: [Options, Events, Uploader.Targeting],

  options: {
    container: null,

    multiple: true,
    queued: true,
    verbose: false,

    url: null,
    method: null,
    data: null,
    mergeData: true,
    fieldName: null,

    allowDuplicates: false,
    fileListMax: 0,

    instantStart: false,
    appendCookieData: false,

    fileClass: null
  },

  initialize: function(options) {
    this.setOptions(options);

    this.target = $(this.options.target);

    this.box = this.getBox().addEvents({
      'mouseenter': this.fireEvent.bind(this, 'buttonEnter'),
      'mouseleave': this.fireEvent.bind(this, 'buttonLnter')
    });

    this.createInput().inject(this.box);
    
    this.reposition();
    window.addEvent('resize', this.reposition.bind(this));

    this.box.inject(this.options.container || document.body);
    
    this.uploading = 0;
    this.fileList = [];
    
    var target = document.id(this.options.target);
    if (target) this.attach(target);
  },
  
  createInput: function() {
    return this.input = new Element('input', {
      type: 'file',
      name: 'Filedata',
      multiple: this.options.multiple,
      styles: {
        margin: 0,
        padding: 0,
        border: 0,
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'block',
        visibility: 'visible'
      },
      events: {
        change: this.select.bind(this),
        focus: function() {
          return false;
        },
        mousedown: function() {
          if (Browser.opera || Browser.chrome) return true;
          (function() {
            this.input.click();
            this.fireEvent('buttonDown');
          }).delay(10, this)
          return false;
        }.bind(this)
      }
    });
  },
  
  select: function() {
    var files = this.input.files, success = [], failure = [];
    //this.file.onchange = this.file.onmousedown = this.file.onfocus = null;
    this.fireEvent('beforeSelect');
    
    for (var i = 0, file; file = files[i++];) {
      var cls = this.options.fileClass || Uploader.Request.File;
      var ret = new cls;
      ret.setBase(this, file)
      if (!ret.validate()) {
        ret.invalidate()
        ret.render();
        failure.push(ret);
        continue;
      } else {        
        this.fileList.push(ret);
        ret.render();
        success.push(ret)
      }
    }
    if (success.length) this.fireEvent('onSelectSuccess', [success]);
    if (failure.length) this.fireEvent('onSelectFailed', [failure]);
    
    if (this.options.instantStart) this.start();
  },

  start: function() {
    var queued = this.options.queued;
    queued = (queued) ? ((queued > 1) ? queued : 1) : 0;

    for (var i = 0, file; file = this.fileList[i]; i++) {
      if (this.fileList[i].status != Uploader.STATUS_QUEUED) continue;
      this.fileList[i].start();
      if (queued && this.uploading >= queued) break;
    }
    return this;
  },

  stop: function() {
    for (var i = this.fileList.length; i--;) this.fileList[i].stop();
  },

  remove: function() {
    for (var i = this.fileList.length; i--;) this.fileList[i].remove();
  },

  setEnabled: function(status) {
    this.input.disabled = !!(status);
    if (status) this.fireEvent('buttonDisable');
  }

});

Uploader.Request.File = new Class({

  Implements: Uploader.File,
  
  setData: function(file) {
    this.status = Uploader.STATUS_QUEUED;
    this.dates = {};
    this.dates.add = new Date();
    this.file = file;
    this.setFile({name: file.name, size: file.size, type: file.type});
	  return this;
  },

  validate: function() {
    var base = this.base.options;

    if (!base.allowDuplicates) {
      var name = this.name;
      var dup = this.base.fileList.some(function(file) {
        return (file.name == name);
      });
      if (dup) {
        this.validationError = 'duplicate';
        return false;
      }
    }
    
    if (base.fileListSizeMax && (this.base.size + this.size) > base.fileListSizeMax) {
      this.validationError = 'fileListSizeMax';
      return false;
    }

    if (base.fileListMax && this.base.fileList.length >= base.fileListMax) {
      this.validationError = 'fileListMax';
      return false;
    }

    return true;
  },

  invalidate: function() {
    this.invalid = true;
    return this.triggerEvent('invalid');
  },

  onProgress: function(progress) {
    this.$progress = {
      bytesLoaded: progress.loaded,
      percentLoaded: progress.loaded / progress.total * 100,
      total: progress.total
    };
    this.triggerEvent('progress', this.$progress);
  },
  
  onFailure: function() {
    if (this.status != Uploader.STATUS_RUNNING) return;
    
    this.status = Uploader.STATUS_ERROR;
    delete this.xhr;
    
    this.triggerEvent('fail')
    console.error('failure :(', this, Array.from(arguments))
  },

  onSuccess: function(response) {
    if (this.status != Uploader.STATUS_RUNNING) return;

    this.status = Uploader.STATUS_COMPLETE;
    
    delete this.file;
      
    this.base.uploading--;
    this.dates.complete = new Date();
    this.response = response;

    this.triggerEvent('complete');
    this.base.start();
    
    delete this.xhr;
  },

  start: function() {
    if (this.status != Uploader.STATUS_QUEUED) return this;

    var base = this.base.options, options = this.options;
    
    var merged = {};
    for (var key in base) {
      merged[key] = (this.options[key] != null) ? this.options[key] : base[key];
    }

    if (merged.data) {
      if (merged.mergeData && base.data && options.data) {
        if (typeOf(base.data) == 'string') merged.data = base.data + '&' + options.data;
        else merged.data = Object.merge(base.data, options.data);
      }
  		var query = (typeOf(merged.data) == 'string') ? merged.data : Hash.toQueryString(merged.data);      
    } 
    
    var xhr = this.xhr = new XMLHttpRequest, self = this;
    xhr.upload.onprogress = this.onProgress.bind(this);
    xhr.upload.onload = function() {
      setTimeout(function(){
        if(xhr.readyState === 4) {
          try { var status = xhr.status } catch(e) {};
          self.response = {text: xhr.responseText}
          self[(status < 300 && status > 199) ? 'onSuccess' : 'onFailure'](self.response)
        } else setTimeout(arguments.callee, 15);
      }, 15);
    }
    xhr.upload.onerror = xhr.upload.onabort = this.onFailure.bind(this)

    this.status = Uploader.STATUS_RUNNING;
    this.base.uploading++;
    
    xhr.open("post", (merged.url) + (query ? "?" + query : ""), true);
    xhr.setRequestHeader("Cache-Control", "no-cache");
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    
    var data = new FormData();
    data.append(this.options.fieldName, this.file);
    if (data.fake) {
       xhr.setRequestHeader("Content-Type", "multipart/form-data; boundary="+ data.boundary);
       xhr.sendAsBinary(data.toString());
    } else {
       xhr.send(data);
    }
    
    this.dates.start = new Date();

    this.triggerEvent('start');

    return this;
  },

  requeue: function() {
    this.stop();
    this.status = Uploader.STATUS_QUEUED;
    this.triggerEvent('requeue');
  },

  stop: function(soft) {
    if (this.status == Uploader.STATUS_RUNNING) {
      this.status = Uploader.STATUS_STOPPED;
      this.base.uploading--;
      this.base.start();
      this.xhr.abort();
      if (!soft) this.triggerEvent('stop');
    }
    return this;
  },

  remove: function() {
    this.stop(true);
    delete this.xhr;
    this.base.fileList.erase(this);
    this.triggerEvent('remove');
    return this;
  }
});

Uploader.Request.condition = function() {
  return (Browser.safari && Browser.version > 3) || Browser.chrome || (Browser.firefox && Browser.firefox.version > 2);
};

(function(w) {
    if (w.FormData)
        return;
    function FormData() {
        this.fake = true;
        this.boundary = "--------FormData" + Math.random();
        this._fields = [];
    }
    FormData.prototype.append = function(key, value) {
        this._fields.push([key, value]);
    }
    FormData.prototype.toString = function() {
        var boundary = this.boundary;
        var body = "";
        this._fields.forEach(function(field) {
            body += "--" + boundary + "\r\n";
            // file upload
            if (field[1].name) {
                var file = field[1];
                body += "Content-Disposition: form-data; name=\""+ field[0] +"\"; filename=\""+ file.name +"\"\r\n";
                body += "Content-Type: "+ file.type +"\r\n\r\n";
                body += file.getAsBinary() + "\r\n";
            } else {
                body += "Content-Disposition: form-data; name=\""+ field[0] +"\";\r\n\r\n";
                body += field[1] + "\r\n";
            }
        });
        body += "--" + boundary +"--";
        return body;
    }
    w.FormData = FormData;
})(window);
/*
---

script: Element.Measure.js

name: Element.Measure

description: Extends the Element native object to include methods useful in measuring dimensions.

credits: "Element.measure / .expose methods by Daniel Steigerwald License: MIT-style license. Copyright: Copyright (c) 2008 Daniel Steigerwald, daniel.steigerwald.cz"

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Element.Style
  - Core/Element.Dimensions
  - /MooTools.More

provides: [Element.Measure]

...
*/

(function(){

var getStylesList = function(styles, planes){
	var list = [];
	Object.each(planes, function(directions){
		Object.each(directions, function(edge){
			styles.each(function(style){
				list.push(style + '-' + edge + (style == 'border' ? '-width' : ''));
			});
		});
	});
	return list;
};

var calculateEdgeSize = function(edge, styles){
	var total = 0;
	Object.each(styles, function(value, style){
		if (style.test(edge)) total = total + value.toInt();
	});
	return total;
};

var isVisible = function(el){
	return !!(!el || el.offsetHeight || el.offsetWidth);
};


Element.implement({

	measure: function(fn){
		if (isVisible(this)) return fn.call(this);
		var parent = this.getParent(),
			toMeasure = [];
		while (!isVisible(parent) && parent != document.body){
			toMeasure.push(parent.expose());
			parent = parent.getParent();
		}
		var restore = this.expose(),
			result = fn.call(this);
		restore();
		toMeasure.each(function(restore){
			restore();
		});
		return result;
	},

	expose: function(){
		if (this.getStyle('display') != 'none') return function(){};
		var before = this.style.cssText;
		this.setStyles({
			display: 'block',
			position: 'absolute',
			visibility: 'hidden'
		});
		return function(){
			this.style.cssText = before;
		}.bind(this);
	},

	getDimensions: function(options){
		options = Object.merge({computeSize: false}, options);
		var dim = {x: 0, y: 0};

		var getSize = function(el, options){
			return (options.computeSize) ? el.getComputedSize(options) : el.getSize();
		};

		var parent = this.getParent('body');

		if (parent && this.getStyle('display') == 'none'){
			dim = this.measure(function(){
				return getSize(this, options);
			});
		} else if (parent){
			try { //safari sometimes crashes here, so catch it
				dim = getSize(this, options);
			}catch(e){}
		}

		return Object.append(dim, (dim.x || dim.x === 0) ? {
				width: dim.x,
				height: dim.y
			} : {
				x: dim.width,
				y: dim.height
			}
		);
	},

	getComputedSize: function(options){
		//<1.2compat>
		//legacy support for my stupid spelling error
		if (options && options.plains) options.planes = options.plains;
		//</1.2compat>

		options = Object.merge({
			styles: ['padding','border'],
			planes: {
				height: ['top','bottom'],
				width: ['left','right']
			},
			mode: 'both'
		}, options);

		var styles = {},
			size = {width: 0, height: 0},
			dimensions;

		if (options.mode == 'vertical'){
			delete size.width;
			delete options.planes.width;
		} else if (options.mode == 'horizontal'){
			delete size.height;
			delete options.planes.height;
		}

		getStylesList(options.styles, options.planes).each(function(style){
			styles[style] = this.getStyle(style).toInt();
		}, this);

		Object.each(options.planes, function(edges, plane){

			var capitalized = plane.capitalize(),
				style = this.getStyle(plane);

			if (style == 'auto' && !dimensions) dimensions = this.getDimensions();

			style = styles[plane] = (style == 'auto') ? dimensions[plane] : style.toInt();
			size['total' + capitalized] = style;

			edges.each(function(edge){
				var edgesize = calculateEdgeSize(edge, styles);
				size['computed' + edge.capitalize()] = edgesize;
				size['total' + capitalized] += edgesize;
			});

		}, this);

		return Object.append(size, styles);
	}

});

})();

/*
---

script: Slider.js

name: Slider

description: Class for creating horizontal and vertical slider controls.

license: MIT-style license

authors:
  - Valerio Proietti

requires:
  - Core/Element.Dimensions
  - /Class.Binds
  - /Drag
  - /Element.Measure

provides: [Slider]

...
*/

var Slider = new Class({

	Implements: [Events, Options],

	Binds: ['clickedElement', 'draggedKnob', 'scrolledElement'],

	options: {/*
		onTick: function(intPosition){},
		onChange: function(intStep){},
		onComplete: function(strStep){},*/
		onTick: function(position){
			this.setKnobPosition(position);
		},
		initialStep: 0,
		snap: false,
		offset: 0,
		range: false,
		wheel: false,
		steps: 100,
		mode: 'horizontal'
	},

	initialize: function(element, knob, options){
		this.setOptions(options);
		options = this.options;
		this.element = document.id(element);
		knob = this.knob = document.id(knob);
		this.previousChange = this.previousEnd = this.step = -1;

		var limit = {},
			modifiers = {x: false, y: false};

		switch (options.mode){
			case 'vertical':
				this.axis = 'y';
				this.property = 'top';
				this.offset = 'offsetHeight';
				break;
			case 'horizontal':
				this.axis = 'x';
				this.property = 'left';
				this.offset = 'offsetWidth';
		}

		this.setSliderDimensions();
		this.setRange(options.range);

		if (knob.getStyle('position') == 'static') knob.setStyle('position', 'relative');
		knob.setStyle(this.property, -options.offset);
		modifiers[this.axis] = this.property;
		limit[this.axis] = [-options.offset, this.full - options.offset];

		var dragOptions = {
			snap: 0,
			limit: limit,
			modifiers: modifiers,
			onDrag: this.draggedKnob,
			onStart: this.draggedKnob,
			onBeforeStart: (function(){
				this.isDragging = true;
			}).bind(this),
			onCancel: function(){
				this.isDragging = false;
			}.bind(this),
			onComplete: function(){
				this.isDragging = false;
				this.draggedKnob();
				this.end();
			}.bind(this)
		};
		if (options.snap) this.setSnap(dragOptions);

		this.drag = new Drag(knob, dragOptions);
		this.attach();
		if (options.initialStep != null) this.set(options.initialStep);
	},

	attach: function(){
		this.element.addEvent('mousedown', this.clickedElement);
		if (this.options.wheel) this.element.addEvent('mousewheel', this.scrolledElement);
		this.drag.attach();
		return this;
	},

	detach: function(){
		this.element.removeEvent('mousedown', this.clickedElement)
			.removeEvent('mousewheel', this.scrolledElement);
		this.drag.detach();
		return this;
	},

	autosize: function(){
		this.setSliderDimensions()
			.setKnobPosition(this.toPosition(this.step));
		this.drag.options.limit[this.axis] = [-this.options.offset, this.full - this.options.offset];
		if (this.options.snap) this.setSnap();
		return this;
	},

	setSnap: function(options){
		if (!options) options = this.drag.options;
		options.grid = Math.ceil(this.stepWidth);
		options.limit[this.axis][1] = this.full;
		return this;
	},

	setKnobPosition: function(position){
		if (this.options.snap) position = this.toPosition(this.step);
		this.knob.setStyle(this.property, position);
		return this;
	},

	setSliderDimensions: function(){
		this.full = this.element.measure(function(){
			this.half = this.knob[this.offset] / 2;
			return this.element[this.offset] - this.knob[this.offset] + (this.options.offset * 2);
		}.bind(this));
		return this;
	},

	set: function(step){
		if (!((this.range > 0) ^ (step < this.min))) step = this.min;
		if (!((this.range > 0) ^ (step > this.max))) step = this.max;

		this.step = Math.round(step);
		return this.checkStep()
			.fireEvent('tick', this.toPosition(this.step))
			.end();
	},

	setRange: function(range, pos){
		this.min = Array.pick([range[0], 0]);
		this.max = Array.pick([range[1], this.options.steps]);
		this.range = this.max - this.min;
		this.steps = this.options.steps || this.full;
		this.stepSize = Math.abs(this.range) / this.steps;
		this.stepWidth = this.stepSize * this.full / Math.abs(this.range);
		if (range) this.set(Array.pick([pos, this.step]).floor(this.min).max(this.max));
		return this;
	},

	clickedElement: function(event){
		if (this.isDragging || event.target == this.knob) return;

		var dir = this.range < 0 ? -1 : 1,
			position = event.page[this.axis] - this.element.getPosition()[this.axis] - this.half;

		position = position.limit(-this.options.offset, this.full - this.options.offset);

		this.step = Math.round(this.min + dir * this.toStep(position));

		this.checkStep()
			.fireEvent('tick', position)
			.end();
	},

	scrolledElement: function(event){
		var mode = (this.options.mode == 'horizontal') ? (event.wheel < 0) : (event.wheel > 0);
		this.set(this.step + (mode ? -1 : 1) * this.stepSize);
		event.stop();
	},

	draggedKnob: function(){
		var dir = this.range < 0 ? -1 : 1,
			position = this.drag.value.now[this.axis];

		position = position.limit(-this.options.offset, this.full -this.options.offset);

		this.step = Math.round(this.min + dir * this.toStep(position));
		this.checkStep();
	},

	checkStep: function(){
		var step = this.step;
		if (this.previousChange != step){
			this.previousChange = step;
			this.fireEvent('change', step);
		}
		return this;
	},

	end: function(){
		var step = this.step;
		if (this.previousEnd !== step){
			this.previousEnd = step;
			this.fireEvent('complete', step + '');
		}
		return this;
	},

	toStep: function(position){
		var step = (position + this.options.offset) * this.stepSize / this.full * this.steps;
		return this.options.steps ? Math.round(step -= step % this.stepSize) : step;
	},

	toPosition: function(step){
		return (this.full * Math.abs(this.min - step)) / (this.steps * this.stepSize) - this.options.offset;
	}

});

/*
---
 
script: Slider.js
 
description: Methods to update slider without reinitializing the thing
 
license: MIT-style license.
 
requires:
- Drag.Limits
- More/Slider

provides: [Slider.prototype.update]
 
...
*/


Slider.implement({
  update: function() {
		var offset = (this.options.mode == 'vertical') ?  'offsetHeight' : 'offsetWidth'
		this.half = this.knob[offset] / 2; 
		this.full =  this.element[offset] - this.knob[offset] + (this.options.offset * 2); 
		
		//this.setRange(this.options.range);

		this.knob.setStyle(this.property, this.toPosition(this.step));
		var X = this.axis.capitalize();
		this.drag['setMin' + X](- this.options.offset)
		this.drag['setMax' + X](this.full - this.options.offset)
  }
});
/*
---

name: Fx.CSS

description: Contains the CSS animation logic. Used by Fx.Tween, Fx.Morph, Fx.Elements.

license: MIT-style license.

requires: [Fx, Element.Style]

provides: Fx.CSS

...
*/

Fx.CSS = new Class({

	Extends: Fx,

	//prepares the base from/to object

	prepare: function(element, property, values){
		values = Array.from(values);
		if (values[1] == null){
			values[1] = values[0];
			values[0] = element.getStyle(property);
		}
		var parsed = values.map(this.parse);
		return {from: parsed[0], to: parsed[1]};
	},

	//parses a value into an array

	parse: function(value){
		value = Function.from(value)();
		value = (typeof value == 'string') ? value.split(' ') : Array.from(value);
		return value.map(function(val){
			val = String(val);
			var found = false;
			Object.each(Fx.CSS.Parsers, function(parser, key){
				if (found) return;
				var parsed = parser.parse(val);
				if (parsed || parsed === 0) found = {value: parsed, parser: parser};
			});
			found = found || {value: val, parser: Fx.CSS.Parsers.String};
			return found;
		});
	},

	//computes by a from and to prepared objects, using their parsers.

	compute: function(from, to, delta){
		var computed = [];
		(Math.min(from.length, to.length)).times(function(i){
			computed.push({value: from[i].parser.compute(from[i].value, to[i].value, delta), parser: from[i].parser});
		});
		computed.$family = Function.from('fx:css:value');
		return computed;
	},

	//serves the value as settable

	serve: function(value, unit){
		if (typeOf(value) != 'fx:css:value') value = this.parse(value);
		var returned = [];
		value.each(function(bit){
			returned = returned.concat(bit.parser.serve(bit.value, unit));
		});
		return returned;
	},

	//renders the change to an element

	render: function(element, property, value, unit){
		element.setStyle(property, this.serve(value, unit));
	},

	//searches inside the page css to find the values for a selector

	search: function(selector){
		if (Fx.CSS.Cache[selector]) return Fx.CSS.Cache[selector];
		var to = {}, selectorTest = new RegExp('^' + selector.escapeRegExp() + '$');
		Array.each(document.styleSheets, function(sheet, j){
			var href = sheet.href;
			if (href && href.contains('://') && !href.contains(document.domain)) return;
			var rules = sheet.rules || sheet.cssRules;
			Array.each(rules, function(rule, i){
				if (!rule.style) return;
				var selectorText = (rule.selectorText) ? rule.selectorText.replace(/^\w+/, function(m){
					return m.toLowerCase();
				}) : null;
				if (!selectorText || !selectorTest.test(selectorText)) return;
				Object.each(Element.Styles, function(value, style){
					if (!rule.style[style] || Element.ShortStyles[style]) return;
					value = String(rule.style[style]);
					to[style] = ((/^rgb/).test(value)) ? value.rgbToHex() : value;
				});
			});
		});
		return Fx.CSS.Cache[selector] = to;
	}

});

Fx.CSS.Cache = {};

Fx.CSS.Parsers = {

	Color: {
		parse: function(value){
			if (value.match(/^#[0-9a-f]{3,6}$/i)) return value.hexToRgb(true);
			return ((value = value.match(/(\d+),\s*(\d+),\s*(\d+)/))) ? [value[1], value[2], value[3]] : false;
		},
		compute: function(from, to, delta){
			return from.map(function(value, i){
				return Math.round(Fx.compute(from[i], to[i], delta));
			});
		},
		serve: function(value){
			return value.map(Number);
		}
	},

	Number: {
		parse: parseFloat,
		compute: Fx.compute,
		serve: function(value, unit){
			return (unit) ? value + unit : value;
		}
	},

	String: {
		parse: Function.from(false),
		compute: function(zero, one){
			return one;
		},
		serve: function(zero){
			return zero;
		}
	}

};

//<1.2compat>

Fx.CSS.Parsers = new Hash(Fx.CSS.Parsers);

//</1.2compat>

/*
---

name: Fx.Morph

description: Formerly Fx.Styles, effect to transition any number of CSS properties for an element using an object of rules, or CSS based selector rules.

license: MIT-style license.

requires: Fx.CSS

provides: Fx.Morph

...
*/

Fx.Morph = new Class({

	Extends: Fx.CSS,

	initialize: function(element, options){
		this.element = this.subject = document.id(element);
		this.parent(options);
	},

	set: function(now){
		if (typeof now == 'string') now = this.search(now);
		for (var p in now) this.render(this.element, p, now[p], this.options.unit);
		return this;
	},

	compute: function(from, to, delta){
		var now = {};
		for (var p in from) now[p] = this.parent(from[p], to[p], delta);
		return now;
	},

	start: function(properties){
		if (!this.check(properties)) return this;
		if (typeof properties == 'string') properties = this.search(properties);
		var from = {}, to = {};
		for (var p in properties){
			var parsed = this.prepare(this.element, p, properties[p]);
			from[p] = parsed.from;
			to[p] = parsed.to;
		}
		return this.parent(from, to);
	}

});

Element.Properties.morph = {

	set: function(options){
		this.get('morph').cancel().setOptions(options);
		return this;
	},

	get: function(){
		var morph = this.retrieve('morph');
		if (!morph){
			morph = new Fx.Morph(this, {link: 'cancel'});
			this.store('morph', morph);
		}
		return morph;
	}

};

Element.implement({

	morph: function(props){
		this.get('morph').start(props);
		return this;
	}

});

/*
---

script: Sortables.js

name: Sortables

description: Class for creating a drag and drop sorting interface for lists of items.

license: MIT-style license

authors:
  - Tom Occhino

requires:
  - Core/Fx.Morph
  - /Drag.Move

provides: [Sortables]

...
*/

var Sortables = new Class({

	Implements: [Events, Options],

	options: {/*
		onSort: function(element, clone){},
		onStart: function(element, clone){},
		onComplete: function(element){},*/
		opacity: 1,
		clone: false,
		revert: false,
		handle: false,
		dragOptions: {}/*<1.2compat>*/,
		snap: 4,
		constrain: false,
		preventDefault: false
		/*</1.2compat>*/
	},

	initialize: function(lists, options){
		this.setOptions(options);

		this.elements = [];
		this.lists = [];
		this.idle = true;

		this.addLists($$(document.id(lists) || lists));

		if (!this.options.clone) this.options.revert = false;
		if (this.options.revert) this.effect = new Fx.Morph(null, Object.merge({
			duration: 250,
			link: 'cancel'
		}, this.options.revert));
	},

	attach: function(){
		this.addLists(this.lists);
		return this;
	},

	detach: function(){
		this.lists = this.removeLists(this.lists);
		return this;
	},

	addItems: function(){
		Array.flatten(arguments).each(function(element){
			this.elements.push(element);
			var start = element.retrieve('sortables:start', function(event){
				this.start.call(this, event, element);
			}.bind(this));
			(this.options.handle ? element.getElement(this.options.handle) || element : element).addEvent('mousedown', start);
		}, this);
		return this;
	},

	addLists: function(){
		Array.flatten(arguments).each(function(list){
			this.lists.include(list);
			this.addItems(list.getChildren());
		}, this);
		return this;
	},

	removeItems: function(){
		return $$(Array.flatten(arguments).map(function(element){
			this.elements.erase(element);
			var start = element.retrieve('sortables:start');
			(this.options.handle ? element.getElement(this.options.handle) || element : element).removeEvent('mousedown', start);

			return element;
		}, this));
	},

	removeLists: function(){
		return $$(Array.flatten(arguments).map(function(list){
			this.lists.erase(list);
			this.removeItems(list.getChildren());

			return list;
		}, this));
	},

	getClone: function(event, element){
		if (!this.options.clone) return new Element(element.tagName).inject(document.body);
		if (typeOf(this.options.clone) == 'function') return this.options.clone.call(this, event, element, this.list);
		var clone = element.clone(true).setStyles({
			margin: 0,
			position: 'absolute',
			visibility: 'hidden',
			width: element.getStyle('width')
		}).addEvent('mousedown', function(event){
			element.fireEvent('mousedown', event);
		});
		//prevent the duplicated radio inputs from unchecking the real one
		if (clone.get('html').test('radio')){
			clone.getElements('input[type=radio]').each(function(input, i){
				input.set('name', 'clone_' + i);
				if (input.get('checked')) element.getElements('input[type=radio]')[i].set('checked', true);
			});
		}

		return clone.inject(this.list).setPosition(element.getPosition(element.getOffsetParent()));
	},

	getDroppables: function(){
		var droppables = this.list.getChildren().erase(this.clone).erase(this.element);
		if (!this.options.constrain) droppables.append(this.lists).erase(this.list);
		return droppables;
	},

	insert: function(dragging, element){
		var where = 'inside';
		if (this.lists.contains(element)){
			this.list = element;
			this.drag.droppables = this.getDroppables();
		} else {
			where = this.element.getAllPrevious().contains(element) ? 'before' : 'after';
		}
		this.element.inject(element, where);
		this.fireEvent('sort', [this.element, this.clone]);
	},

	start: function(event, element){
		if (
			!this.idle ||
			event.rightClick ||
			['button', 'input', 'a', 'textarea'].contains(event.target.get('tag'))
		) return;

		this.idle = false;
		this.element = element;
		this.opacity = element.get('opacity');
		this.list = element.getParent();
		this.clone = this.getClone(event, element);

		this.drag = new Drag.Move(this.clone, Object.merge({
			/*<1.2compat>*/
			preventDefault: this.options.preventDefault,
			snap: this.options.snap,
			container: this.options.constrain && this.element.getParent(),
			/*</1.2compat>*/
			droppables: this.getDroppables()
		}, this.options.dragOptions)).addEvents({
			onSnap: function(){
				event.stop();
				this.clone.setStyle('visibility', 'visible');
				this.element.set('opacity', this.options.opacity || 0);
				this.fireEvent('start', [this.element, this.clone]);
			}.bind(this),
			onEnter: this.insert.bind(this),
			onCancel: this.end.bind(this),
			onComplete: this.end.bind(this)
		});

		this.clone.inject(this.element, 'before');
		this.drag.start(event);
	},

	end: function(){
		this.drag.detach();
		this.element.set('opacity', this.opacity);
		if (this.effect){
			var dim = this.element.getStyles('width', 'height'),
				clone = this.clone,
				pos = clone.computePosition(this.element.getPosition(this.clone.getOffsetParent()));

			var destroy = function(){
				this.removeEvent('cancel', destroy);
				clone.destroy();
			};

			this.effect.element = clone;
			this.effect.start({
				top: pos.top,
				left: pos.left,
				width: dim.width,
				height: dim.height,
				opacity: 0.25
			}).addEvent('cancel', destroy).chain(destroy);
		} else {
			this.clone.destroy();
		}
		this.reset();
	},

	reset: function(){
		this.idle = true;
		this.fireEvent('complete', this.element);
	},

	serialize: function(){
		var params = Array.link(arguments, {
			modifier: Type.isFunction,
			index: function(obj){
				return obj != null;
			}
		});
		var serial = this.lists.map(function(list){
			return list.getChildren().map(params.modifier || function(element){
				return element.get('id');
			}, this);
		}, this);

		var index = params.index;
		if (this.lists.length == 1) index = 0;
		return (index || index === 0) && index >= 0 && index < this.lists.length ? serial[index] : serial;
	}

});

/*
---

name: Fx.Tween

description: Formerly Fx.Style, effect to transition any CSS property for an element.

license: MIT-style license.

requires: Fx.CSS

provides: [Fx.Tween, Element.fade, Element.highlight]

...
*/

Fx.Tween = new Class({

	Extends: Fx.CSS,

	initialize: function(element, options){
		this.element = this.subject = document.id(element);
		this.parent(options);
	},

	set: function(property, now){
		if (arguments.length == 1){
			now = property;
			property = this.property || this.options.property;
		}
		this.render(this.element, property, now, this.options.unit);
		return this;
	},

	start: function(property, from, to){
		if (!this.check(property, from, to)) return this;
		var args = Array.flatten(arguments);
		this.property = this.options.property || args.shift();
		var parsed = this.prepare(this.element, this.property, args);
		return this.parent(parsed.from, parsed.to);
	}

});

Element.Properties.tween = {

	set: function(options){
		this.get('tween').cancel().setOptions(options);
		return this;
	},

	get: function(){
		var tween = this.retrieve('tween');
		if (!tween){
			tween = new Fx.Tween(this, {link: 'cancel'});
			this.store('tween', tween);
		}
		return tween;
	}

};

Element.implement({

	tween: function(property, from, to){
		this.get('tween').start(arguments);
		return this;
	},

	fade: function(how){
		var fade = this.get('tween'), o = 'opacity', toggle;
		how = [how, 'toggle'].pick();
		switch (how){
			case 'in': fade.start(o, 1); break;
			case 'out': fade.start(o, 0); break;
			case 'show': fade.set(o, 1); break;
			case 'hide': fade.set(o, 0); break;
			case 'toggle':
				var flag = this.retrieve('fade:flag', this.get('opacity') == 1);
				fade.start(o, (flag) ? 0 : 1);
				this.store('fade:flag', !flag);
				toggle = true;
			break;
			default: fade.start(o, arguments);
		}
		if (!toggle) this.eliminate('fade:flag');
		return this;
	},

	highlight: function(start, end){
		if (!end){
			end = this.retrieve('highlight:original', this.getStyle('background-color'));
			end = (end == 'transparent') ? '#fff' : end;
		}
		var tween = this.get('tween');
		tween.start('background-color', start || '#ffff88', end).chain(function(){
			this.setStyle('background-color', this.retrieve('highlight:original'));
			tween.callChain();
		}.bind(this));
		return this;
	}

});

/*
---
 
script: Data.js
 
description: Get/Set javascript controller into element
 
license: MIT-style license.
 
requires:
- Core/Element
 
provides: [Element.Properties.widget]
 
...
*/

Element.Properties.widget = {
  get: function(){
    var widget, element = this;
    while (element && !(widget = element.retrieve('widget'))) element = element.getParent();
    //if (widget && (element != this)) this.store('widget', widget);
    return widget;
  },
	
	set: function(options) {
	  
	}
};




/*
---

name: Request

description: Powerful all purpose Request Class. Uses XMLHTTPRequest.

license: MIT-style license.

requires: [Object, Element, Chain, Events, Options, Browser]

provides: Request

...
*/

(function(){

var empty = function(){},
	progressSupport = ('onprogress' in new Browser.Request);

var Request = this.Request = new Class({

	Implements: [Chain, Events, Options],

	options: {/*
		onRequest: function(){},
		onLoadstart: function(event, xhr){},
		onProgress: function(event, xhr){},
		onComplete: function(){},
		onCancel: function(){},
		onSuccess: function(responseText, responseXML){},
		onFailure: function(xhr){},
		onException: function(headerName, value){},
		onTimeout: function(){},
		user: '',
		password: '',*/
		url: '',
		data: '',
		headers: {
			'X-Requested-With': 'XMLHttpRequest',
			'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
		},
		async: true,
		format: false,
		method: 'post',
		link: 'ignore',
		isSuccess: null,
		emulation: true,
		urlEncoded: true,
		encoding: 'utf-8',
		evalScripts: false,
		evalResponse: false,
		timeout: 0,
		noCache: false
	},

	initialize: function(options){
		this.xhr = new Browser.Request();
		this.setOptions(options);
		this.headers = this.options.headers;
	},

	onStateChange: function(){
		var xhr = this.xhr;
		if (xhr.readyState != 4 || !this.running) return;
		this.running = false;
		this.status = 0;
		Function.attempt(function(){
			var status = xhr.status;
			this.status = (status == 1223) ? 204 : status;
		}.bind(this));
		xhr.onreadystatechange = empty;
		if (progressSupport) xhr.onprogress = xhr.onloadstart = empty;
		clearTimeout(this.timer);
		
		this.response = {text: this.xhr.responseText || '', xml: this.xhr.responseXML};
		if (this.options.isSuccess.call(this, this.status))
			this.success(this.response.text, this.response.xml);
		else
			this.failure();
	},

	isSuccess: function(){
		var status = this.status;
		return (status >= 200 && status < 300);
	},

	isRunning: function(){
		return !!this.running;
	},

	processScripts: function(text){
		if (this.options.evalResponse || (/(ecma|java)script/).test(this.getHeader('Content-type'))) return Browser.exec(text);
		return text.stripScripts(this.options.evalScripts);
	},

	success: function(text, xml){
		this.onSuccess(this.processScripts(text), xml);
	},

	onSuccess: function(){
		this.fireEvent('complete', arguments).fireEvent('success', arguments).callChain();
	},

	failure: function(){
		this.onFailure();
	},

	onFailure: function(){
		this.fireEvent('complete').fireEvent('failure', this.xhr);
	},
	
	loadstart: function(event){
		this.fireEvent('loadstart', [event, this.xhr]);
	},
	
	progress: function(event){
		this.fireEvent('progress', [event, this.xhr]);
	},
	
	timeout: function(){
		this.fireEvent('timeout', this.xhr);
	},

	setHeader: function(name, value){
		this.headers[name] = value;
		return this;
	},

	getHeader: function(name){
		return Function.attempt(function(){
			return this.xhr.getResponseHeader(name);
		}.bind(this));
	},

	check: function(){
		if (!this.running) return true;
		switch (this.options.link){
			case 'cancel': this.cancel(); return true;
			case 'chain': this.chain(this.caller.pass(arguments, this)); return false;
		}
		return false;
	},
	
	send: function(options){
		if (!this.check(options)) return this;

		this.options.isSuccess = this.options.isSuccess || this.isSuccess;
		this.running = true;

		var type = typeOf(options);
		if (type == 'string' || type == 'element') options = {data: options};

		var old = this.options;
		options = Object.append({data: old.data, url: old.url, method: old.method}, options);
		var data = options.data, url = String(options.url), method = options.method.toLowerCase();

		switch (typeOf(data)){
			case 'element': data = document.id(data).toQueryString(); break;
			case 'object': case 'hash': data = Object.toQueryString(data);
		}

		if (this.options.format){
			var format = 'format=' + this.options.format;
			data = (data) ? format + '&' + data : format;
		}

		if (this.options.emulation && !['get', 'post'].contains(method)){
			var _method = '_method=' + method;
			data = (data) ? _method + '&' + data : _method;
			method = 'post';
		}

		if (this.options.urlEncoded && ['post', 'put'].contains(method)){
			var encoding = (this.options.encoding) ? '; charset=' + this.options.encoding : '';
			this.headers['Content-type'] = 'application/x-www-form-urlencoded' + encoding;
		}

		if (!url) url = document.location.pathname;
		
		var trimPosition = url.lastIndexOf('/');
		if (trimPosition > -1 && (trimPosition = url.indexOf('#')) > -1) url = url.substr(0, trimPosition);

		if (this.options.noCache)
			url += (url.contains('?') ? '&' : '?') + String.uniqueID();

		if (data && method == 'get'){
			url += (url.contains('?') ? '&' : '?') + data;
			data = null;
		}

		var xhr = this.xhr;
		if (progressSupport){
			xhr.onloadstart = this.loadstart.bind(this);
			xhr.onprogress = this.progress.bind(this);
		}

		xhr.open(method.toUpperCase(), url, this.options.async, this.options.user, this.options.password);
		if (this.options.user && 'withCredentials' in xhr) xhr.withCredentials = true;
		
		xhr.onreadystatechange = this.onStateChange.bind(this);

		Object.each(this.headers, function(value, key){
			try {
				xhr.setRequestHeader(key, value);
			} catch (e){
				this.fireEvent('exception', [key, value]);
			}
		}, this);

		this.fireEvent('request');
		xhr.send(data);
		if (!this.options.async) this.onStateChange();
		if (this.options.timeout) this.timer = this.timeout.delay(this.options.timeout, this);
		return this;
	},

	cancel: function(){
		if (!this.running) return this;
		this.running = false;
		var xhr = this.xhr;
		xhr.abort();
		clearTimeout(this.timer);
		xhr.onreadystatechange = empty;
		if (progressSupport) xhr.onprogress = xhr.onloadstart = empty;
		this.xhr = new Browser.Request();
		this.fireEvent('cancel');
		return this;
	}

});

var methods = {};
['get', 'post', 'put', 'delete', 'GET', 'POST', 'PUT', 'DELETE'].each(function(method){
	methods[method] = function(data){
		var object = {
			method: method
		};
		if (data != null) object.data = data;
		return this.send(object);
	};
});

Request.implement(methods);

Element.Properties.send = {

	set: function(options){
		var send = this.get('send').cancel();
		send.setOptions(options);
		return this;
	},

	get: function(){
		var send = this.retrieve('send');
		if (!send){
			send = new Request({
				data: this, link: 'cancel', method: this.get('method') || 'post', url: this.get('action')
			});
			this.store('send', send);
		}
		return send;
	}

};

Element.implement({

	send: function(url){
		var sender = this.get('send');
		sender.send({data: this, url: url || sender.options.url});
		return this;
	}

});

})();
/*
---

name: Request.Statuses

description: Statuses fire events on request. Also passes arguments to callChain

license: MIT-style license.

references:
  - http://en.wikipedia.org/wiki/List_of_HTTP_status_codes

requires: 
  - Core/Request
  
extends: Core/Request

provides: 
  - Request.Headers

...
*/

/* 
  This is a hack to parse response to failure
  event handlers. Mootools doesnt do this. 
  
  This monkey patch ensures your json is
  parsed (and html applied) even if the status 
  is "non successful" (anything but 2xx).
  
*/
(function(onSuccess) {

var Statuses = Request.Statuses = {
  200: 'Ok',
  201: 'Created',
  202: 'Accepted',
  204: 'NoContent',
  205: 'ResetContent',
  206: 'PartialContent',

  300: 'MultipleChoices',
  301: 'MovedPermantently',
  302: 'Found',
  303: 'SeeOther',
  304: 'NotModified',
  307: 'TemporaryRedirect',

  400: "BadRequest",
  401: "Unathorized",
  402: "PaymentRequired",
  403: "Forbidden",
  404: "NotFound",
  405: "MethodNotAllowed",
  406: "NotAcceptable",
  409: "Conflict",
  410: "Gone",
  411: "LengthRequired",
  412: "PreconditionFailed",
  413: "RequestEntityTooLarge",
  414: "RequestURITooLong",
  415: "UnsupportedMediaType",
  416: "RequestRangeNotSatisfiable",
  417: "ExpectationFailed",

  500: "InternalServerError",
  501: "NotImplemented",
  502: "BadGateway",
  503: "ServiceUnvailable",
  504: "GatewayTimeout",
  505: "VariantAlsoNegotiates",
  507: "InsufficientStorage",
  509: "BandwidthLimitExceeded",
  510: "NotExtended"
};
    
Object.merge(Request.prototype, {  
  options: {
    isSuccess: function() {
      return true;
    }
  },
  
  onSuccess: function() {
    if (this.isSuccess()) this.fireEvent('complete', arguments).fireEvent('success', arguments).callChain.apply(this, arguments);
    else this.onFailure.apply(this, arguments);
    var status = Request.Statuses[this.status];
    if (status) this.fireEvent('on' + status, arguments)
  },

  onFailure: function(){
    this.fireEvent('complete', arguments).fireEvent('failure', arguments);
  }
});
  
})(Request.prototype.onSuccess);
/*
---

name: Request.Headers

description: Headers of response fire events on request

license: MIT-style license.

requires: 
  - Core/Request
  
extends: Core/Request

provides: 
  - Request.Headers

...
*/

(function() {
  
var Headers = Request.Headers = {};

Request.defineHeader = function(header, value) {
  Headers[header] = value || true;
};

Request.prototype.addEvent('complete', function() {
  for (var header in Headers) {
    var value = this.getHeader(header);
    if (value) {
      var args = Array.concat(value, arguments);
      this.fireEvent(header.camelCase(), args);
      var callback = Headers[header];
      if (callback && callback.call) callback.apply(this, args)
    }
  }
});

})();
/*
---

name: Request.HTML

description: Extends the basic Request Class with additional methods for interacting with HTML responses.

license: MIT-style license.

requires: [Element, Request]

provides: Request.HTML

...
*/

Request.HTML = new Class({

	Extends: Request,

	options: {
		update: false,
		append: false,
		evalScripts: true,
		filter: false,
		headers: {
			Accept: 'text/html, application/xml, text/xml, */*'
		}
	},

	success: function(text){
		var options = this.options, response = this.response;

		response.html = text.stripScripts(function(script){
			response.javascript = script;
		});

		var match = response.html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
		if (match) response.html = match[1];
		var temp = new Element('div').set('html', response.html);

		response.tree = temp.childNodes;
		response.elements = temp.getElements(options.filter || '*');

		if (options.filter) response.tree = response.elements;
		if (options.update){
			var update = document.id(options.update).empty();
			if (options.filter) update.adopt(response.elements);
			else update.set('html', response.html);
		} else if (options.append){
			var append = document.id(options.append);
			if (options.filter) response.elements.reverse().inject(append);
			else append.adopt(temp.getChildren());
		}
		if (options.evalScripts) Browser.exec(response.javascript);

		this.onSuccess(response.tree, response.elements, response.html, response.javascript);
	}

});

Element.Properties.load = {

	set: function(options){
		var load = this.get('load').cancel();
		load.setOptions(options);
		return this;
	},

	get: function(){
		var load = this.retrieve('load');
		if (!load){
			load = new Request.HTML({data: this, link: 'cancel', update: this, method: 'get'});
			this.store('load', load);
		}
		return load;
	}

};

Element.implement({

	load: function(){
		this.get('load').send(Array.link(arguments, {data: Type.isObject, url: Type.isString}));
		return this;
	}

});

/*
---

name: Request.JSON

description: Extends the basic Request Class with additional methods for sending and receiving JSON data.

license: MIT-style license.

requires: [Request, JSON]

provides: Request.JSON

...
*/

Request.JSON = new Class({

	Extends: Request,

	options: {
		/*onError: function(text, error){},*/
		secure: true
	},

	initialize: function(options){
		this.parent(options);
		Object.append(this.headers, {
			'Accept': 'application/json',
			'X-Request': 'JSON'
		});
	},

	success: function(text){
		var json;
		try {
			json = this.response.json = JSON.decode(text, this.options.secure);
		} catch (error){
			this.fireEvent('error', [text, error]);
			return;
		}
		if (json == null) this.onFailure();
		else this.onSuccess(json, text);
	}

});

/*
---

name: Request.Auto

description: Accepts both json and html as response

license: MIT-style license.

requires: 
  - Core/Request.JSON
  - Core/Request.HTML

provides: 
  - Request.Auto
...
*/

Request.Auto = new Class({
	Extends: Request,
	
	options: {
	  headers: {
			Accept: 'application/json, text/html'
		}
	},
	
	success: function() {
	  var contentType = this.getContentType();
	  if (!contentType) return false;
	  var type = contentType.indexOf('json') > -1 ? 'JSON' : false;
	  return (type ? Request[type] : Request).prototype.success.apply(this, arguments);
	},
	
	getContentType: function() {
	  return this.getHeader('Content-Type') ? this.getHeader('Content-Type').split(';')[0] : null;
	}
});
/*
---
 
script: Resource.js
 
description: Base class that defines remote resource
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin

credits:
  Influenced by Jester javascript library

requires:
  - Core/Options
  - Core/Events
  - Core/Chain
  - String.Inflections/String.camelize
  - Ext/Request.Auto

provides:
  - Resource
 
...
*/


Resource = new Class({
  Implements: [Options, Events, Chain],

  options: {
    format: 'json',
    urls: {
      'list': '/:plural',
      'show': '/:plural/:id',
      'destroy': '/:plural/:id',
      'new': '/:plural/new'
    },
    request: {
      secure: false
    },
    associations: {}, //{users: ['Person', options]}
    prefix: '', //If prefix is 'true' it respects parent association's path
    custom: {}, //Name => method hash or an array of PUT methods
    postprocess: function(data) {
      if (typeOf(data) != 'array' || data.some(function(e) { return e.length != 2})) return data
      return {
        errors: data.map(function(i) { return i.join(' ')})
      }
    }
  },
  
  associations: {},

  initialize: function(name, options) {
    
    this.name = name;
    Object.append(this.options, {
      singular: name.tableize().singularize(),
      plural: name.tableize().pluralize(),
      name: name
    });
    
    this.setOptions(options)
    Object.append(this.options, {
      singular_xml: this.options.singular.replace(/_/g, '-'),
      plural_xml: this.options.plural.replace(/_/g, '-')
    })
    
    this.klass = new Class({
      Extends: Resource.Model
    })
    Object.append(this.klass, this)
    this.klass.implement({resource: this})
    this.klass.implement(this.setAssociations(this.options.associations))
    this.klass.implement(this.setCustomActions(this.options.custom))
    return this.klass
  },
  
  setAssociations: function(associations) {
    if (!associations) return
    
    var obj = {}
    Object.each(associations, function(association, name) {      
      var singular = name.singularize().camelCase().capitalize()
      this['get' + singular] = function(data) {
        return new (this.resource.associations[name])(data, true)
      }
      var reflection = association[0]      
      var options = Object.append({prefix: true}, association[1] || {})      
      options.prefix_given = options.prefix
      
      
      if (options.prefix == true) {
        options.prefix = this.locate.bind(this)        
      } else if (options.prefix == false) {
        options.prefix = this.options.prefix
      }
      var assoc = this.associations[name] = new Resource(reflection, options)
      var klsfd = name.camelCase().pluralize().capitalize()
      var singular = klsfd.singularize()
      obj['get' + singular] = function() {
        if (!this[name]) return;
        return this[name]
      }
      obj['get' + klsfd] = function() {
        return assoc.claim(this)
      }
      obj['get' + klsfd + 'Association'] = function() {
        return assoc.claim(this)
      }
      obj['set' + singular] = function(value, existant) {
        return this[name] = new assoc(value, existant, this)
      }
      obj['set' + klsfd] = function(value, existant) {
        return this[name] = value.map(function(el) {
          return new assoc(el, existant, this)
        }.bind(this))
      }
      obj['new' + singular] = function(data) {
        return new assoc(data, false, this)
      }
      obj['init' + singular] = function(data) {
        return new assoc(data, true, this)
      }
    }, this)
    return obj
  },
  
  setCustomActions: function(actions) {
    if (!actions) return;
    var methods = {};
    
    if (typeOf(actions) == 'array') { //We assume that array of custom methods is all of PUTs
      var arr = actions.push ? actions : [actions];
      actions = {};
      for (var i = 0, j = arr.length; i < j; i++) actions[arr[i]] = 'put';
    }
    
    Object.each(actions, function(value, key) {
      methods[key] = Resource.Model.createCustomAction.call(this, key, value);
    }, this);
    
    return methods;
  },

  getRequest: function() {
    return this.options.getRequest ? this.options.getRequest.call(this, this.options.request) : new Request.Auto(this.options.request)
  },
  
  create: function(a, b) { //Ruby-style Model#create backward compat
    return new (this.klass || this)(a, b)
  },
  
  init: function(a) {
    return this.create(a, true)
  },
  
  claim: function(thing) {
    this.options.prefix = thing.prefix || (this.options.prefix && this.options.prefix.call ? this.options.prefix(thing) : this.options.prefix)
    return this
  },
  
  request: function(options, callback, model) {
    if (options.route) options.url = this.getFormattedURL(options.route, options);
    if (options.data && options.data.call) options.data = options.data.call(model);
    if (options.attributes) 
      options.data = options.data ? Object.merge(options.data, model.getData()) : model.getData();
    var req = this.getRequest();
    ['success', 'failure', 'request', 'complete'].each(function(e) {
      var cc = 'on' + e.capitalize()
      req.addEvent(e, function(data) {
        data = this[this[cc] ? cc : "handle"].apply(this, arguments);
        if (e == 'success') {
          if (callback) {
            switch (typeOf(callback)) {
              case "string":
                this.fireEvent(callback, data);
                break;
              case "function":
                if (typeOf(data) == "array") {
                  callback.apply(window, data)
                } else {
                  callback(data);
                }
            }
          }
        }
        if (options[cc]) options[cc](data);
        if (e == 'success') this.callChain(data);
        model.fireEvent(e, data);
      }.bind(this));
      return req;
    }, this)
    req.send(options)
    
    return req;
  },

  onFailure: function(response) {
    return this.getParser('json').parse(JSON.decode(response))
  },
  
  handle: function() {
    var parser = this.getParser();
    var data = this.options.postprocess(parser.parse.apply(parser, arguments));
    switch(typeOf(data)) {
      case "array":
        return data.map(this.init.bind(this));
      case "string":
        return data;
      case "object": case "hash":
        return this.init(data);
    }
  },
  
  find: function(id, params, callback) {
    if (!callback && typeOf(params) != 'object') {
      callback = params;
      params = null;
    }
    switch (id) {
      case 'first': return this.find('all', callback)
      case 'all': return this.request({method: 'get', route: 'list', data: params}, callback);
      default: return this.request({method: 'get', route: 'show', data: params, id: id}, callback);
    }
  },
  
  getParser: function(format) {
    var parser = Resource.Parser[(format || this.options.format).toUpperCase()];
    if (!parser.instance) parser.instance = new parser;
    return parser.instance;
  },
  
  getURL: function(route, thing) {
    var prefix = thing.prefix || (this.options.prefix && this.options.prefix.call ? this.options.prefix(thing) : this.options.prefix);
    var route = (this.options.urls[route] || (this.options.urls.show + '/' + route));
    if (route.charAt(0) == '/' && prefix.charAt(prefix.length - 1) == '/') prefix = prefix.substring(0, prefix.length - 1);
    return Resource.interpolate(prefix + route, thing, this.options)
  },
  
  locate: function(thing) {
    return this.getURL('show', thing)
  },
   
  getFormattedURL: function(route, thing) {
    return this.format(this.getURL(route, thing || {}))
  },
  
  format: function(string) {
    return string;
  }
});

!function() {
  
  var fill = function (what, thing, opts) {
    switch(what) {
      case 'format':
        return '.' + opts.format
      case 'singular': 
      case 'plural': 
        return opts[what]
      default:
        if (!thing) return (opts) ? opts[what] : null
        if (thing.resource) return thing.get(what.replace(/::/g, '.')) 
        return (typeof(thing[what]) == 'function' ? thing[what]() : thing[what])
    }
  }
  
  var interpolation = function(thing, opts) {
    return function(m, what) {
      return fill(what, thing, opts)
    }
  }
  var regex = /:((?:[a-zA-Z0-9]|::)+)/g;
  Resource.interpolate = function(str, thing, opts) {
    return str.replace(regex, interpolation(thing, opts))
  }
  
}();
/*
---
 
script: Model.js
 
description: A single resource instance
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
  
requires:
  - Resource
  
provides:
  - Resource.Model
 
...
*/

Resource.Model = new Class({
  Implements: [Options, Events],
  
  initialize: function(attributes, existant_record, claiming) {
    this._claiming = claiming
    this._defaults = attributes
    
    this.set(attributes);
    this._new_record = (existant_record == false) || !this.get('id');
    return this;
  },
  
  set: function(key, value) {
    if (arguments.length == 2) {
      this.setAttribute(key, value)
    } else {
      switch (typeOf(key)) {
        case 'element':
           //try to get attribute resource_id
           //else assume that id is formatted like resource_123.
          var id = Resource.Model.id(key, this.getPrefix());
          break;
        case 'object': case 'array':
          var complex = []
          for (var k in key) {
            if (['array', 'object'].contains(typeOf(key[k]))) {
              complex.push(k)
            } else {  
              this.setAttribute(k, key[k])
            }
          }
          break;
        case 'string': case 'number':
          var id = key;
      }
      
      if (id) {
        this.set('id', id);
        this._new_record = false;
      }
      
      if (this._claiming) {
        this.claim(this._claiming)
        delete this._claiming
      }
      
      if (complex && complex.length) complex.each(function(k) {
        this.setAttribute(k, key[k])
      }, this)
    }
    
    return this
  },
  
  get: function(name) {
    var bits = name.split('.')
    var obj = this
    bits.each(function(bit) {
      if (obj == null || !obj.getAttribute) return obj = null
      obj = obj.getAttribute(bit)
    })
    return obj
  },
  
  setAttribute: function(name, value) {
    if (this['set' + name.camelize()]) value = this['set' + name.camelize()](value)
    this[name] = value
  },  
  
  getAttribute: function(name) {
    if (this['get' + name.camelize()]) return this['get' + name.camelize()]()
    return this[name]
  },
  
  getAssociated: function(name) {
    return this.resource.associations[name]
  },
  
  request: function(options, callback) {
    return this.resource.request(Object.append(this.getClean(), options), callback, this)
  },
  
  getClean: function(){
    //Here we overcome JS's inability to have crossbrowser getters & setters
    //I wouldnt use these pseudoprivate _underscore properties otherwise
    var clean = {};
    for (var key in this){
      if (
        key != 'prototype' && 
        key != 'resource' &&
        key.match(/^[^_$A-Z]/) && //doesnt start with _, $ or capital letter
        typeof(this[key]) != 'function'
      ) clean[key] = this[key];
    }
    return clean;
  },
  
  getAttributes: function() {
    return this.getClean();
  },
  
  isNew: function() {
    return this._new_record
  },
  
  isDirty: function() {
    return this._defaults == this.getClean();
  },
  
  onFailure: function() {
    console.error('Achtung', arguments);
  },
  
  getPrefix: function() {
    return this.resource.options.singular
  },
  
  getData: function() {
    return this.getPrefixedClean()
  },
  
  getPrefixedClean: function() {
    var obj = {}
    var clean = this.getClean()
    delete clean.prefix
    obj[this.getPrefix()] = clean
    
    return obj
  },
  
  getURL: function(route) {
    return this.resource.getURL(route || 'show', this)
  },
  
  claim: function(what) {
    this.prefix = (this.resource.options.prefix_given) && this.resource.options.prefix.run ? this.resource.options.prefix(what) : what.prefix
    return this
  }
});


Resource.Model.id = function(element, prefix) {
  var id;
  if (prefix) id = element.get(prefix + '_id');
  if (!id && (id = element.get('id'))) {
    var regex = '(.*)$';
    if (prefix) {
      regex = '^' + prefix + '[_-]' + regex;
    } else {
      regex = '_' + regex;
    }
    id = (id.match(new RegExp(regex)) || [null, null])[1];
  }
  return id;
};
/*
---
 
script: Resource.Model.Actions.js
 
description: Set of methods to metaprogrammatically generate action set for resource
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
  
requires:
  - Resource.Model
  
provides:
  - Resource.Model.Actions
 
...
*/


Resource.Model.Actions = {
  save: function() {
    if (!this._new_record) return Resource.Model.Actions.update.call(this)
    return {method: 'post', route: 'list', attributes: true, onComplete: this.set.bind(this), onFailure: this.onFailure.bind(this)}
  },
  
  destroy: function() {
    return {method: 'delete', route: 'destroy'}
  },
  
  update: function() {
    return {method: 'put', attributes: true, route: 'show'}
  },
  
  reload: function() {
    if (!this.id) return this;
    return {method: 'get', route: 'show'}
  },
  
  'new': function() {
    return {method: 'get', route: 'new', attributes: true}
  }
};


Resource.Model.extend({
  createAction: function(name, options) {
    if (!options) options = {};
    if (!options.action) options.action = Resource.Model.Actions[name];
    return function() {
      var args = Array.prototype.slice.call(arguments, 0);
      if (typeof args[args.length - 1] == 'function') var callback = args.pop();
      Object.append(options, options.action.apply(this, args));
      if (options.arguments !== false) {
        for (var i = 0, arg, j = args.length; i < j; i++) {
          if ((arg = args[i])) {
            if (arg.parseQueryString) {
              if (!options.data) options.data = {};
              Object.append(options.data, arg.parseQueryString())
            } else {
              this.set(arg);
            }
          }
        }
      }
      this.fireEvent('before' + name.capitalize());
      var req = this.request(options, callback);
      return req.chain(function(data) {
        this.fireEvent('after' + name.capitalize(), data);
        return req.callChain(data);
      }.bind(this));
      
      return this;
    }
  },
  
  createCustomAction: function(name, method, obj) {
    if (method.method) {
      obj = method;
      method = obj.method;
    }
    if (!this.options.urls[name]) this.options.urls[name] = '/:plural/:id/' + name
    return Resource.Model.createAction(name, Object.append({
      action: function () {
        var options = {}
        if (method == 'put') options.onComplete = this.set.bind(this);
        return options;
      },
      route: name, 
      method: method
    }, obj));
  }
});

Object.each(Resource.Model.Actions, function(action, name) {
  Resource.Model.prototype[name] = Resource.Model.createAction(name);
});
/*
---
 
script: Resource.Collection.js
 
description: Extended collection of models array (just like Elements in mootools)
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin

requires:
  - Resource.Model
  
provides:
  - Resource.Collection
 
...
*/

Resource.Collection = function(models) {
  return Object.append(models, this)
};

Resource.Collection.extend({
  createAction: function(name) {
    return function() {
      var args = Array.prototype.slice.call(arguments, 0);
      if (args.getLast()) var callback = args.pop();
      this.each(function(model) {
        model[a](args)
      });
      if (callback) callback.call(this)
    }
  }
});

Object.each(Resource.Model.Actions, function(action, name) {
  Resource.Collection.prototype[name] = Resource.Collection.createAction(name);
});
/*
---
 
script: Resource.Parser.js
 
description: A base class to convert any object to model properties
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
  
requires:
  - Resource
  
provides:
  - Resource.Parser
 
...
*/


Resource.Parser = new Class({
  
  integer: function(value) {
    var parsed = parseInt(value);
    return (isNaN(parsed)) ? value : parsed
  },
  
  datetime: function(value) {
    return new Date(Date.parse(value))
  },
  
  'boolean': function(value) {
    return value == 'true'
  },

  array: function(children) {
    return children.map(function(c) { return this.parse(c) }.bind(this))
  }, 
  
  object: function(value) {
    var obj = {}
    Object.each(value, function(val, key) {
      obj[key] = this.parse(val, key)
    }, this)
    return obj
  }
});

Resource.prototype.options.parsers = Resource.Parser;

/*
---
 
script: Resource.Parser.JSON.js
 
description: Applies json as model properties and does type casting
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
  
requires:
  - Resource.Parser
  
provides:
  - Resource.Parser.JSON
 
...
*/

Resource.Parser.JSON = new Class({
  Extends: Resource.Parser,
  
  parse: function(value, key) {
    if (!key && !value) return []
    var type = typeOf(value)
    if (type == 'object') return this.object(value)
    if (key) {
      //if (key == 'id' || key.substr(-3, 3) == '_id') return this.integer(value, key)
      if (key.substr(-3, 3) == '_at') return this.datetime(value, key)
    }
    if (type == 'array') return this.array(value, key)
    return value
  }
});
/*
---
 
script: Resource.Parser.HTML.js
 
description: Handles HTML responses from actions
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
  
requires:
  - Resource.Parser
  
provides:
  - Resource.Parser.HTML

...
*/


Resource.Parser.HTML = new Class({
  Extends: Resource.Parser,
  
  parse: function(a, b, html) {
    return html;
  }
});
/*
---
 
script: Resource.Parser.XML.js
 
description: Convert xml response based on @type attributes
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
  
requires:
  - Resource.Parser
  
provides:
  - Resource.Parser.XML
 
...
*/

Resource.Parser.XML = new Class({
  Extends: Resource.Parser,
  
  parse: function(data) {
    obj = {}
    Object.each(data, function(key, value) {
      obj[key] = this[value['@type']] ? this[value['@type']](value['#text']) : value['#text']
    }, this)
    return obj
  }
});
/*
---

name: Request.Form

description: Create & submit forms.

license: MIT-style license.

requires: 
  - Core/Request
  - More/String.QueryString

provides: 
  - Request.Form

...
*/


(function() {
  var convert = function(thing, prefix) {
    var html = [];
    
    switch (typeOf(thing)) {
      case "object":
        for (var key in thing) html.push(convert(thing[key], prefix ? (prefix + '[' + key + ']') : key));
        break;
      case "array":
        for (var key = 0, length = thing.length; key < length; key++) html.push(convert(thing[key], prefix + '[]'));
        break;
      case "boolean":
        break;
      default:
        if (thing) return ["<input type='hidden' name='", prefix, "' value='", thing.toString().replace(/\"/g, '\\"'), "'/>"].join("");
    }
    return html.join("\n")
  }

  Request.Form = new Class({
  
    Implements: [Options, Events, Chain],
  
    options: {
      url: null,
      method: "get",
      emulation: true,
      async: false,
      form: null,
      data: null
    },
  
    initialize: function(options) {
      if (!options.data) delete options.data;
      this.setOptions(options)
      return this
    },
    
    getData: function(data) {
      return (data && data.toQueryString) ? data.toQueryString().parseQueryString() : data;
    },
    
    getOptions: function(options) {
      options = Object.merge({}, this.options, options)
      var data = this.getData(options.data, options);
      if (this.options.emulation && !['get', 'post'].contains(options.method)) {
        if (!data) data = {};
        data._method = options.method
        options.method = "post"
      }
      if (data) options.data = data;
      return options;
    },
  
    getForm: function(options, attrs) {
      var form = document.createElement('form');
      form.setAttribute('method', options.method);
      form.setAttribute('action', options.url);
      form.innerHTML = convert(options.data);
      document.body.appendChild(form);
      return form;
    },

    send: function(options) {
      options = this.getOptions(options);
      this.fireEvent('request', options);
      if (!this.unloader) {
        var self = this;
        var onfocus = function() {
          self.fireEvent('complete');
          window.removeListener(Browser.ie ? 'focusout' : 'blur', onfocus)
        }
        onfocus.delay(10000, this)
        window.addListener(Browser.ie ? 'focusout' : 'blur', onfocus)
      }
      if (options.method == 'get') {
        var url = options.url
        if (options.data) {
          url = url.split("?");
          if (url[1]) Object.append(options.data, url[1].parseQueryString());
          url = url[0] + (Object.getLength(options.data) > 0 ? ("?" + Object.toQueryString(options.data)) : "");
        }
        location.href = url;
      } else this.getForm(options).submit();
      return this;
    }
  })
})();
/*
---
 
script: BorderRadius.js
 
description: Set border radius for all the browsers
 
license: Public domain (http://unlicense.org).
 
requires:
- Core/Element
 
provides: [Element.Properties.borderRadius]
 
...
*/


(function() {
  if (Browser.safari || Browser.chrome) 
    var properties = ['webkitBorderTopLeftRadius', 'webkitBorderTopRightRadius', 'webkitBorderBottomRightRadius', 'webkitBorderBottomLeftRadius'];
  else if (Browser.firefox)
    var properties = ['MozBorderRadiusTopleft', 'MozBorderRadiusTopright', 'MozBorderRadiusBottomright', 'MozBorderRadiusBottomleft']
  else
    var properties = ['borderRadiusTopLeft', 'borderRadiusTopRight', 'borderRadiusBottomRight', 'borderRadiusBottomLeft']
  
  Element.Properties.borderRadius = {

  	set: function(radius){
	    if (radius.each) radius.each(function(value, i) {
	      this.style[properties[i]] = value + 'px';
	    }, this);
  	},

  	get: function(){
	  
    }

  };

})();
/*
---
 
script: BoxShadow.js
 
description: Set box shadow in an accessible way
 
license: Public domain (http://unlicense.org).
 
requires:
- Core/Element
 
provides: [Element.Properties.boxShadow]
 
...
*/
(function() {
  if (Browser.safari)            var property = 'webkitBoxShadow';
  else if (Browser.firefox)      var property = 'MozBoxShadow'
  else                           var property = 'boxShadow';
  if (property) {
    var dummy = document.createElement('div');
    var cc = property.hyphenate();
    if (cc.charAt(0) == 'w') cc = '-' + cc;
    dummy.style.cssText = cc + ': 1px 1px 1px #ccc'
    Browser.Features.boxShadow = !!dummy.style[property];
    delete dummy;
  }  
  Element.Properties.boxShadow = {
    set: function(value) {
      if (!property) return;
      switch ($type(value)) {
        case "number": 
          value = {blur: value};
          break;
        case "array":
          value = {
            color: value[0],
            blur: value[1],
            x: value[2],
            y: value[3]
          }
          break;
        case "boolean":
          if (value) value = {blur: 10};
          else value = false
        case "object":
         if (value.isColor) value = {color: value}
      }
      if (!value) {
        if (!this.retrieve('shadow:value')) return;
        this.eliminate('shadow:value');
        this.style[property] = 'none';
        return;
      }
      this.store('shadow:value', value)
      var color = value.color ? value.color.toString() : 'transparent'
      this.style[property] = (value.x || 0) + 'px ' + (value.y || 0) + 'px ' + (value.blur || 0) + 'px ' + color;
    }
  }
})();
/*
---

name: Swiff

description: Wrapper for embedding SWF movies. Supports External Interface Communication.

license: MIT-style license.

credits:
  - Flash detection & Internet Explorer + Flash Player 9 fix inspired by SWFObject.

requires: [Options, Object, Element]

provides: Swiff

...
*/

(function(){

var Swiff = this.Swiff = new Class({

	Implements: Options,

	options: {
		id: null,
		height: 1,
		width: 1,
		container: null,
		properties: {},
		params: {
			quality: 'high',
			allowScriptAccess: 'always',
			wMode: 'window',
			swLiveConnect: true
		},
		callBacks: {},
		vars: {}
	},

	toElement: function(){
		return this.object;
	},

	initialize: function(path, options){
		this.instance = 'Swiff_' + String.uniqueID();

		this.setOptions(options);
		options = this.options;
		var id = this.id = options.id || this.instance;
		var container = document.id(options.container);

		Swiff.CallBacks[this.instance] = {};

		var params = options.params, vars = options.vars, callBacks = options.callBacks;
		var properties = Object.append({height: options.height, width: options.width}, options.properties);

		var self = this;

		for (var callBack in callBacks){
			Swiff.CallBacks[this.instance][callBack] = (function(option){
				return function(){
					return option.apply(self.object, arguments);
				};
			})(callBacks[callBack]);
			vars[callBack] = 'Swiff.CallBacks.' + this.instance + '.' + callBack;
		}

		params.flashVars = Object.toQueryString(vars);
		if (Browser.ie){
			properties.classid = 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000';
			params.movie = path;
		} else {
			properties.type = 'application/x-shockwave-flash';
		}
		properties.data = path;

		var build = '<object id="' + id + '"';
		for (var property in properties) build += ' ' + property + '="' + properties[property] + '"';
		build += '>';
		for (var param in params){
			if (params[param]) build += '<param name="' + param + '" value="' + params[param] + '" />';
		}
		build += '</object>';
		this.object = ((container) ? container.empty() : new Element('div')).set('html', build).firstChild;
	},

	replaces: function(element){
		element = document.id(element, true);
		element.parentNode.replaceChild(this.toElement(), element);
		return this;
	},

	inject: function(element){
		document.id(element, true).appendChild(this.toElement());
		return this;
	},

	remote: function(){
		return Swiff.remote.apply(Swiff, [this.toElement()].append(arguments));
	}

});

Swiff.CallBacks = {};

Swiff.remote = function(obj, fn){
	var rs = obj.CallFunction('<invoke name="' + fn + '" returntype="javascript">' + __flash__argumentsToXML(arguments, 2) + '</invoke>');
	return eval(rs);
};

})();

/*
---
name: Swiff.Uploader

description: Swiff.Uploader - Flash FileReference Control

requires: [Uploader, Core/Swiff]

provides: [Swiff.Uploader, Swiff.Uploader.File, Uploader.Swiff, Uploader.Swiff.File]

version: 3.0

license: MIT License

author: Harald Kirschner <http://digitarald.de>
...
*/
	
Uploader.Swiff = Swiff.Uploader = new Class({

	Extends: Swiff,

	Implements: [Events, Uploader.Targeting],

	options: {
		path: 'Swiff.Uploader.swf',
		
		target: null,
		
		callBacks: null,
		params: {
			wMode: 'opaque',
			menu: 'false',
			allowScriptAccess: 'always'
		},

		typeFilter: null,
		multiple: true,
		queued: true,
		verbose: false,
		height: 30,
		width: 100,
		passStatus: null,

		url: null,
		method: null,
		data: null,
		mergeData: true,
		fieldName: null,

		fileSizeMin: 1,
		fileSizeMax: null, // Official limit is 100 MB for FileReference, but I tested up to 2Gb!
		allowDuplicates: false,
		timeLimit: (Browser.Platform.linux) ? 0 : 30,

		policyFile: null,
		buttonImage: null,
		
		fileListMax: 0,
		fileListSizeMax: 0,

		instantStart: false,
		appendCookieData: false,
		
		fileClass: null
		/*
		onLoad: $empty,
		onFail: $empty,
		onStart: $empty,
		onQueue: $empty,
		onComplete: $empty,
		onBrowse: $empty,
		onDisabledBrowse: $empty,
		onCancel: $empty,
		onSelect: $empty,
		onSelectSuccess: $empty,
		onSelectFail: $empty,
		
		onButtonEnter: $empty,
		onButtonLeave: $empty,
		onButtonDown: $empty,
		onButtonDisable: $empty,
		
		onFileStart: $empty,
		onFileStop: $empty,
		onFileRequeue: $empty,
		onFileOpen: $empty,
		onFileProgress: $empty,
		onFileComplete: $empty,
		onFileRemove: $empty,
		
		onBeforeStart: $empty,
		onBeforeStop: $empty,
		onBeforeRemove: $empty
		*/
	},

	initialize: function(options) {
		// protected events to control the class, added
		// before setting options (which adds own events)
		this.addEvent('load', this.initializeSwiff, true)
			.addEvent('select', this.processFiles, true)
			.addEvent('complete', this.setData, true)
			.addEvent('fileRemove', function(file) {
				this.fileList.erase(file);
			}.bind(this), true);

		this.setOptions(options);

		// callbacks are no longer in the options, every callback
		// is fired as event, this is just compat
		if (this.options.callBacks) {
			Hash.each(this.options.callBacks, function(fn, name) {
				this.addEvent(name, fn);
			}, this);
		}

		this.options.callBacks = {
			fireCallback: this.fireCallback.bind(this)
		};

		var path = this.options.path;
		if (!path.contains('?')) path += '?noCache=' + Date.now(); // cache in IE

		// target 
		if (this.options.target) {
			// we force wMode to transparent for the overlay effect
			this.parent(path, {
				params: {
					wMode: 'transparent'
				},
				height: '100%',
				width: '100%'
			});
		} else {
			this.parent(path);
		}

		this.inject(this.getBox());

		this.fileList = [];
		
		this.size = this.uploading = this.bytesLoaded = this.percentLoaded = 0;
		
		this.verifyLoad.delay(1000, this);
		
    var target = document.id(this.options.target);
    if (target) this.attach(target);
	},
	
	verifyLoad: function() {
		if (this.loaded) return;
		if (!this.object.parentNode) {
			this.fireEvent('fail', ['disabled']);
		} else if (this.object.style.display == 'none') {
			this.fireEvent('fail', ['hidden']);
		} else if (!this.object.offsetWidth) {
			this.fireEvent('fail', ['empty']);
		}
	},

	fireCallback: function(name, args) {
		// file* callbacks are relayed to the specific file
		if (name.substr(0, 4) == 'file') {
			// updated queue data is the second argument
			if (args.length > 1) this.setData(args[1]);
			var data = args[0];
			
			var file = this.findFile(data.id);
			this.fireEvent(name, file || data, 5);
			if (file) {
				var fire = name.replace(/^file([A-Z])/, function($0, $1) {
					return $1.toLowerCase();
				});
				file.setData(data).fireEvent(fire, [data], 10);
			}
		} else {
			this.fireEvent(name, args, 5);
		}
	},

	setData: function(data) {
		// the data is saved right to the instance 
		Object.append(this, data);
		this.fireEvent('queue', [this], 10);
		return this;
	},

	findFile: function(id) {
		for (var i = 0; i < this.fileList.length; i++) {
			if (this.fileList[i].id == id) return this.fileList[i];
		}
		return null;
	},

	initializeSwiff: function() {
		// extracted options for the swf 
		this.remote('xInitialize', {
			typeFilter: this.options.typeFilter,
			multiple: this.options.multiple,
			queued: this.options.queued,
			verbose: this.options.verbose,
			width: this.options.width,
			height: this.options.height,
			passStatus: this.options.passStatus,
			url: this.options.url,
			method: this.options.method,
			data: this.options.data,
			mergeData: this.options.mergeData,
			fieldName: this.options.fieldName,
			fileSizeMin: this.options.fileSizeMin,
			fileSizeMax: this.options.fileSizeMax,
			allowDuplicates: this.options.allowDuplicates,
			timeLimit: this.options.timeLimit,
			policyFile: this.options.policyFile,
			buttonImage: this.options.buttonImage
		});

		this.loaded = true;

		this.appendCookieData();
	},
	
	setOptions: function(options) {
		if (options) {
			if (options.url) options.url = Uploader.qualifyPath(options.url);
			if (options.buttonImage) options.buttonImage = Uploader.qualifyPath(options.buttonImage);
			this.parent(options);
			if (this.loaded) this.remote('xSetOptions', options);
		}
		return this;
	},

	setEnabled: function(status) {
		this.remote('xSetEnabled', status);
	},

	start: function() {
		this.fireEvent('beforeStart');
		this.remote('xStart');
	},

	stop: function() {
		this.fireEvent('beforeStop');
		this.remote('xStop');
	},

	remove: function() {
		this.fireEvent('beforeRemove');
		this.remote('xRemove');
	},

	fileStart: function(file) {
		this.remote('xFileStart', file.id);
	},

	fileStop: function(file) {
		this.remote('xFileStop', file.id);
	},

	fileRemove: function(file) {
		this.remote('xFileRemove', file.id);
	},

	fileRequeue: function(file) {
		this.remote('xFileRequeue', file.id);
	},

	appendCookieData: function() {
		var append = this.options.appendCookieData;
		if (!append) return;
		
		var hash = {};
		document.cookie.split(/;\s*/).each(function(cookie) {
			cookie = cookie.split('=');
			if (cookie.length == 2) {
				hash[decodeURIComponent(cookie[0])] = decodeURIComponent(cookie[1]);
			}
		});

		var data = this.options.data || {};
		if (typeOf(append) == 'string') data[append] = hash;
		else Object.append(data, hash);

		this.setOptions({data: data});
	},

	processFiles: function(successraw, failraw, queue) {
		var cls = this.options.fileClass || Swiff.Uploader.File;

		var fail = [], success = [];
		
		this.fireEvent('beforeSelect');

		if (successraw) {
			successraw.each(function(data) {
				var ret = new cls;
				ret.setBase(this, data);
				if (!ret.validate()) {
					ret.remove.delay(10, ret);
					fail.push(ret);
				} else {
					this.size += data.size;
					this.fileList.push(ret);
					success.push(ret);
					ret.render();
				}
			}, this);

			this.fireEvent('selectSuccess', [success], 10);
		}

		if (failraw || fail.length) {
			fail.append((failraw) ? failraw.map(function(data) {
				var row = new cls;
				row.setBase(this, data);
				return row;
			}, this) : []).each(function(file) {
				file.invalidate();
				file.render();
			});

			this.fireEvent('selectFail', [fail], 10);
		}

		this.setData(queue);

		if (this.options.instantStart && success.length) this.start();
	}

});

Swiff.Uploader.log = Uploader.log;

Swiff.Uploader.File = new Class({
	Implements: Uploader.File,

	validate: function() {
		var options = this.base.options;
		
		if (options.fileListMax && this.base.fileList.length >= options.fileListMax) {
			this.validationError = 'fileListMax';
			return false;
		}
		
		if (options.fileListSizeMax && (this.base.size + this.size) > options.fileListSizeMax) {
			this.validationError = 'fileListSizeMax';
			return false;
		}
		
		return true;
	},

	invalidate: function() {
		this.invalid = true;
		this.base.fireEvent('fileInvalid', this, 10);
		return this.fireEvent('invalid', this, 10);
	},

	setSwiffOptions: function(options) {
		if (options) {
			if (options.url) options.url = Uploader.qualifyPath(options.url);
			this.base.remote('xFileSetOptions', this.id, options);
			this.options = Object.merge(this.options, options);
		}
		return this;
	},

	start: function() {
		this.base.fileStart(this);
		return this;
	},

	stop: function() {
		this.base.fileStop(this);
		return this;
	},

	remove: function() {
		this.base.fileRemove(this);
		return this;
	},

	requeue: function() {
		this.base.fileRequeue(this);
	} 

});

Swiff.Uploader.condition = function() {
	return Browser.Plugins.Flash && Browser.Plugins.Flash.version > 8;
};

/*
---
 
script: Element.Selection.js
 
description: Methods to toggle selectability on element
 
license: MIT-style license.
 
requires:
- Core/Element
 
provides: [Element.disableSelection, Element.enableSelection]
 
...
*/

Element.implement({
  disableSelection: function() {
    if (Browser.ie) {
      if (!this.retrieve('events:selectstart')) this.store('events:selectstart', function() {
        return false
      });
      this.addEvent('selectstart', this.retrieve('events:selectstart'));
    } else if (Browser.safari || Browser.chrome) {
      this.style.WebkitUserSelect = "none";
    } else {
      this.style.MozUserSelect = "none";
    }
    return this;
  },
  
  enableSelection: function() {
    if (Browser.ie) {
      this.removeEvent('selectstart', this.retrieve('events:selectstart'));
    } else if (Browser.safari || Browser.chrome){
      this.style.WebkitUserSelect = "";
    } else {
      this.style.MozUserSelect = "";
    }
    return this;
  }
});



/*
---

script: URI.js

name: URI

description: Provides methods useful in managing the window location and uris.

license: MIT-style license

authors:
  - Sebastian Markbåge
  - Aaron Newton

requires:
  - Core/Object
  - Core/Class
  - Core/Class.Extras
  - Core/Element
  - /String.QueryString

provides: [URI]

...
*/

(function(){

var toString = function(){
	return this.get('value');
};

var URI = this.URI = new Class({

	Implements: Options,

	options: {
		/*base: false*/
	},

	regex: /^(?:(\w+):)?(?:\/\/(?:(?:([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?)?(\.\.?$|(?:[^?#\/]*\/)*)([^?#]*)(?:\?([^#]*))?(?:#(.*))?/,
	parts: ['scheme', 'user', 'password', 'host', 'port', 'directory', 'file', 'query', 'fragment'],
	schemes: {http: 80, https: 443, ftp: 21, rtsp: 554, mms: 1755, file: 0},

	initialize: function(uri, options){
		this.setOptions(options);
		var base = this.options.base || URI.base;
		if (!uri) uri = base;

		if (uri && uri.parsed) this.parsed = Object.clone(uri.parsed);
		else this.set('value', uri.href || uri.toString(), base ? new URI(base) : false);
	},

	parse: function(value, base){
		var bits = value.match(this.regex);
		if (!bits) return false;
		bits.shift();
		return this.merge(bits.associate(this.parts), base);
	},

	merge: function(bits, base){
		if ((!bits || !bits.scheme) && (!base || !base.scheme)) return false;
		if (base){
			this.parts.every(function(part){
				if (bits[part]) return false;
				bits[part] = base[part] || '';
				return true;
			});
		}
		bits.port = bits.port || this.schemes[bits.scheme.toLowerCase()];
		bits.directory = bits.directory ? this.parseDirectory(bits.directory, base ? base.directory : '') : '/';
		return bits;
	},

	parseDirectory: function(directory, baseDirectory){
		directory = (directory.substr(0, 1) == '/' ? '' : (baseDirectory || '/')) + directory;
		if (!directory.test(URI.regs.directoryDot)) return directory;
		var result = [];
		directory.replace(URI.regs.endSlash, '').split('/').each(function(dir){
			if (dir == '..' && result.length > 0) result.pop();
			else if (dir != '.') result.push(dir);
		});
		return result.join('/') + '/';
	},

	combine: function(bits){
		return bits.value || bits.scheme + '://' +
			(bits.user ? bits.user + (bits.password ? ':' + bits.password : '') + '@' : '') +
			(bits.host || '') + (bits.port && bits.port != this.schemes[bits.scheme] ? ':' + bits.port : '') +
			(bits.directory || '/') + (bits.file || '') +
			(bits.query ? '?' + bits.query : '') +
			(bits.fragment ? '#' + bits.fragment : '');
	},

	set: function(part, value, base){
		if (part == 'value'){
			var scheme = value.match(URI.regs.scheme);
			if (scheme) scheme = scheme[1];
			if (scheme && this.schemes[scheme.toLowerCase()] == null) this.parsed = { scheme: scheme, value: value };
			else this.parsed = this.parse(value, (base || this).parsed) || (scheme ? { scheme: scheme, value: value } : { value: value });
		} else if (part == 'data'){
			this.setData(value);
		} else {
			this.parsed[part] = value;
		}
		return this;
	},

	get: function(part, base){
		switch (part){
			case 'value': return this.combine(this.parsed, base ? base.parsed : false);
			case 'data' : return this.getData();
		}
		return this.parsed[part] || '';
	},

	go: function(){
		document.location.href = this.toString();
	},

	toURI: function(){
		return this;
	},

	getData: function(key, part){
		var qs = this.get(part || 'query');
		if (!(qs || qs === 0)) return key ? null : {};
		var obj = qs.parseQueryString();
		return key ? obj[key] : obj;
	},

	setData: function(values, merge, part){
		if (typeof values == 'string'){
			var data = this.getData();
			data[arguments[0]] = arguments[1];
			values = data;
		} else if (merge){
			values = Object.merge(this.getData(), values);
		}
		return this.set(part || 'query', Object.toQueryString(values));
	},

	clearData: function(part){
		return this.set(part || 'query', '');
	},

	toString: toString,
	valueOf: toString

});

URI.regs = {
	endSlash: /\/$/,
	scheme: /^(\w+):/,
	directoryDot: /\.\/|\.$/
};

URI.base = new URI(Array.from(document.getElements('base[href]', true)).getLast(), {base: document.location});

String.implement({

	toURI: function(options){
		return new URI(this, options);
	}

});

})();

/*
---
 
script: Element.from.js
 
description: Methods to create elements from strings
 
license: MIT-style license.

credits: 
  - http://jdbartlett.github.com/innershiv
 
requires:
- Core/Element
 
provides: [Element.from, window.innerShiv, Elements.from, document.createFragment]
 
...
*/

document.createFragment = window.innerShiv = (function() {
	var d, r;
	
	return function(h, u) {
	  if (!d) {
			d = document.createElement('div');
			r = document.createDocumentFragment();
			/*@cc_on d.style.display = 'none';@*/
		}
		
		var e = d.cloneNode(true);
		/*@cc_on document.body.appendChild(e);@*/
		e.innerHTML = h;
		/*@cc_on document.body.removeChild(e);@*/
		
		if (u === false) return e.childNodes;
		
		var f = r.cloneNode(true), i = e.childNodes.length;
		while (i--) f.appendChild(e.firstChild);
		
		return f;
	}
}());

Element.from = function(html) {
  new Element(innerShiv(html, false)[0])
};
Elements.from = function(html) {
  new Elements(innerShiv(html))
};
/*
---
 
script: Behavior.js
 
description: Defines global selectors that mix the mixins in
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD
  - Slick/Slick.Parser
  
provides:
  - LSD.Behavior
  
...
*/

LSD.Behavior = function() {
  this.attached = [];
  this.expectations = {};
  this.parsed = {};
}

LSD.Behavior.prototype = {
  define: function(selector, behavior) {
    selector.split(/\s*,\s*/).each(function(bit) {
      var group = this.expectations[bit];
      if (!group) group = this.expectations[bit] = [];
      group.push(behavior);
      this.attached.each(function(object) {
        this.expect(object, bit, behavior)
      }, this);
    }, this);
  },
  
  expect: function(object, selector, behavior) {
    var proto = object.prototype, type = typeOf(behavior);
    var watcher = function(widget, state) {
      if (type == 'object') widget[state ? 'setOptions' : 'unsetOptions'](behavior);
      else widget[state ? 'mixin' : 'unmix'](behavior, true);
    }
    if (proto.expect) {
      //var parsed// = this.parsed[selector];
      //if (!parsed) {
        var parsed = this.parsed[selector] = Object.clone(Slick.parse(selector).expressions[0][0]);
        delete parsed.combinator;
      //}
      proto.expect(parsed, watcher);
    } else {
      //var options = proto.options, expectations = options.expectations;
      //if (!expectations) expectations = options.expecations = {};
      //expectations[selector] = watcher;
    }
  },
  
  attach: function(object) {
    this.attached.push(object);
    for (var expectation in this.expectations) 
      for (var exps = this.expectations[expectation], i = 0, exp; exp = exps[i++];)
        this.expect(object, expectation, exp);
  }
};

LSD.Behavior = new LSD.Behavior;
/*
---
 
script: Type.js
 
description: A base class for all class pools
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Behavior
  - LSD.Helpers
  - More/Object.Extras
  
provides:
  - LSD.Type
  - LSD.Module
  - LSD.Trait
  - LSD.Mixin
  - LSD.Element
  - LSD.Native
  
...
*/

LSD.Type = function(name, namespace) {
  this.name = name;
  this.namespace = namespace || 'LSD';
  var holder = Object.getFromPath(window, this.namespace);
  if (this.storage = holder[name]) {
    
    for (var key in this) {
      this.storage[key] = (this[key].call) ? this[key].bind(this) : this[key];
    }
  }
  else this.storage = (holder[name] = this);
  if (typeOf(this.storage) == 'class') this.klass = this.storage;
  this.pool = [this.storage];
  this.queries = {};
};

LSD.Type.prototype = {
  each: function(callback, bind) {
    for (var name in this.storage) {
      var value = this.storage[name];
      if (value && value.$family && value.$family() == 'class') callback.call(bind || this, value, name)
    }
  },
  
  find: function(name) {
    if (name.push) {
      for (; name.length; name.pop()) {
        var found = this.find(name.join('-'));
        if (found) return found;
      }
      return false;
    }
    if (!this.queries) this.queries = {};
    else if (this.queries[name] != null) return this.queries[name];
    name = LSD.toClassName(name);
    for (var i = 0, storage; storage = this.pool[i++];) {
      var result = Object.getFromPath(storage, name);
      if (result) return (this.queries[name] = result);
    }
    return (this.queries[name] = false);
  },
  
  create: function(element, options) {
    return new LSD.Widget(element, options)
  },
  
  convert: function(element, options) {
    var source = options.source || (options.tag && LSD.Layout.getSource(options.attributes, options.tag)) || LSD.Layout.getSource(element);
    if (!this.find(source)) return;
    var klass = this.klass || LSD.Widget;
    return new LSD.Widget(element, options);
  }
}
// must-have stuff for all widgets 
new LSD.Type('Module');
// some widgets may use those
new LSD.Type('Trait');
// these may be applied in runtime
new LSD.Type('Mixin');
// a widget holder
new LSD.Type('Element');
// native browser controls
new LSD.Type('Native');

// Inject native widgets into default widget pool as a fallback
LSD.Element.pool[LSD.useNative ? 'unshift' : 'push'](LSD.Native);

/*
---
 
script: Submittable.js
 
description: Makes widget result in either submission or cancellation
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Mixin
 
provides:
  - LSD.Mixin.Submittable
 
...
*/


LSD.Mixin.Submittable = new Class({
  options: {
    actions: {
      autosubmission: {
        enable: function() {
          if (this.attributes.autosubmit) this.submit();
        }
      }
    },
    events: {
      _form: {
        attach: function(element) {
          if (LSD.toLowerCase(element.tagName) == 'form') element.addEvent('submit', this.bindEvent('submit'));
        },
        detach: function(element) {
          if (LSD.toLowerCase(element.tagName) == 'form') element.removeEvent('submit', this.bindEvent('submit'));
        }
      }
    }
  },
  
  submit: function(event) {
    if (event && event.type == 'submit' && event.target == this.element)
      event.preventDefault();
    var submission = this.captureEvent('submit', arguments);
    if (submission) return submission;
    else if (submission !== false) this.callChain();
    return this;
  },
  
  cancel: function() {
    var submission = this.captureEvent('cancel', arguments);
    if (submission) return submission;
    else if (submission !== false) {
      var target = this.getSubmissionTarget();
      if (target) target.uncallChain();
      this.uncallChain();
    };
    return this;
  }
});

LSD.Behavior.define(':submittable', LSD.Mixin.Submittable);
/*
---
 
script: Fieldset.js
 
description: Wrapper around set of form fields
 
license: Public domain (http://unlicense.org).
 
requires:
  - LSD.Mixin
 
provides: 
  - LSD.Mixin.Fieldset
 
...
*/
!function() {
  
LSD.Mixin.Fieldset = new Class({
  options: {
    has: {
      many: {
        elements: {
          selector: ':form-associated',
          scopes: {
            submittable: {
              filter: '[name]:valued'
            }
          },
          callbacks: {
            'add': 'addField',
            'remove': 'removeField'
          }
        }
      }
    },
    expects: {
      ':form': function(widget, state) {
        widget[state ? 'addRelation' : 'removeRelation']('elements', {as: 'form'})
      }
    }
  },
  
  constructors: {
    fieldset: function() {
      this.names = {};
      this.params = {};
      return {
        events: {
          request: {
            request: 'validateFields',
            badRequest: 'parseFieldErrors'
          },
          self: {
            beforeNodeBuild: function(query, widget) {
              if (!widget.options.clone) return;
              var attrs = query.attributes, attributes = widget.attributes;
              var name = attributes.name, id = attributes.id;
              // bump name index
              if (name) (attrs || (attrs = {})).name = Fieldset.bumpName(name) || name;
              // bump id index
              if (id) (attrs || (attrs = {})).id = Fieldset.bumpId(id) || id;
              if (widget.tagName == 'label') {
                var four = attributes['for'];
                if (four) (attrs || (attrs = {}))['for'] = Fieldset.bumpId(four) || four;
              }
              if (attrs) query.attributes = attrs;
            }
          }
        }
      }
    }
  },
  
  checkValidity: function() {
    var valid = true;
    for (var i = 0, element; element = this.elements[i++];) if (!element.checkValidity()) valid = false;
    return valid;
  },
  
  getData: function() {
    var data = {}
    for (var name in this.names) {
      var memo = this.names[name];
      if (memo.push) {
        for (var i = 0, radio; radio = memo[i++];) if (radio.checked) data[name] = radio.toData(); break;
      } else {
        var value = memo.toData();
        if (value != null) data[name] = value;
      }
    }
    return data;
  },

  getRequestData: function() {
    return this.getData();
  },
  
  reset: function() {
    
  },
  
  addFieldErrors: function(errors) {
    for (var name in errors) {
      var field = this.names[name];
      if (!field) continue;
      field.invalidate(errors[name]);
      this.invalid = true;
    }
  },

  parseFieldErrors: function(response) {
    var result = {}, errors = response.errors;
    if (errors) { //rootless response ({errors: {}), old rails
      for (var i = 0, error; error = errors[i++];)
        result[Fieldset.getName(this.getModelName(error[0]), error[0])] = error[1];
    } else { //rooted response (publication: {errors: {}}), new rails
      var regex = Fieldset.rPrefixAppender;
      for (var model in response) {
        var value = response[model], errors = value.errors;
        if (!errors) continue;
        for (var i = 0, error; error = errors[i++];)
          result[Fieldset.getName(model, error[0])] = error[1];
      }
    }
    if (Object.getLength(result) > 0) this.addFieldErrors(result);
  },
  
  addField: function(widget) {
    var name = widget.attributes.name, radio = (widget.commandType == 'radio');
    if (!name || !widget.toData) return;
    if (radio) {
      if (!this.names[name]) this.names[name] = [];
      this.names[name].push(widget);
    } else this.names[name] = widget;
    for (var regex = Fieldset.rNameParser, object = this.params, match, bit;;) {
      match = regex.exec(name)
      if (bit != null) {
        if (!match) {
          if (!object[bit] && radio) object[bit] = [];
          if (object[bit] && object[bit].push) object[bit].push(widget);
          else object[bit] = widget;
        } else object = object[bit] || (object[bit] = (bit ? {} : []));
      }
      if (!match) break;
      else bit = match[1] ||match[2];
    }
    return object
  },
  
  getParams: function(object) {
    if (!object) object = this.params;
    var result = {};
    for (var name in object) {
      var value = object[name];
      if (value && !value.indexOf) value = value.nodeType ? value.getValue() : this.getParams(value);
      result[name] = value;
    }
    return result;
  },
  
  removeField: function(widget) {
    var name = widget.attributes.name, radio = (widget.commandType == 'radio');
    if (!name) return;
    if (radio) this.names[name].erase(widget);
    else delete this.names[name];
    for (var regex = Fieldset.rNameParser, object = this.params, match, bit;;) {
      match = regex.exec(name)
      if (bit != null) {
        if (!match) {
          if (radio) object[bit].erase(widget)
          else delete object[bit];
        } else object = object[bit];
      }
      if (!match) break;
      else bit = match[1] ||match[2];
    }
    return object
  },

  invalidateFields: function(errors) {
    this.getFields(errors, function(field, error) {
      field.invalidate(error);
    });
  },
  
  getFieldsByName: function(fields, callback, root) {
    if (fields.call && (callback = fields)) fields = null;
    if (!fields) fields = this.elements;
    if (!callback && fields.indexOf) return root[fields]
    if (fields.map && fields.each && (!callback || !root)) return fields.map(function(field) {
      return this.getFieldsByName(field, callback, root)
    }.bind(this));
  },
  
  validateFields: function(fields) {
    if (!this.invalid) return;
    this.elements.each(function(field) {
      if (field.invalid) field.validate(true);
    });
  },

  getModelName: function() {
    for (var name in this.params) if (!this.params[name].nodeType) return name;
  }
});

var Fieldset = Object.append(LSD.Mixin.Fieldset, {
  rNameIndexBumper: /(\[)(\d+?)(\])/,
  rIdIndexBumper:   /(_)(\d+?)(_|$)/,
  rNameParser:      /(^[^\[]+)|\[([^\]]*)\]/g,
  rNameMultiplier:  /(?:\[\])?$/,
  rPrefixAppender:  /^[^\[]+/,
  getName: function(model, name) {
    return model + name.replace(Fieldset.rPrefixAppender, function(match) {return '[' + match + ']'});
  },
  bumpName: function(string) {
    return string.replace(Fieldset.rNameIndexBumper, function(m, a, index, b) { 
      return a + (parseInt(index) + 1) + b;
    })
  },
  bumpId: function(string) {
    return string.replace(Fieldset.rIdIndexBumper, function(m, a, index, b) { 
      return a + (parseInt(index) + 1) + b;
    })
  },
  multiplyName: function(string) {
    return string.replace(Fieldset.rNameMultiplier, '[]')
  }
});

LSD.Behavior.define(':fieldset', Fieldset);

}();
/*
---
 
script: Draggable.js
 
description: Drag widget around the screen
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Mixin
  - More/Drag

provides: 
  - LSD.Mixin.Draggable
 
...
*/

LSD.Mixin.Draggable = new Class({
  options: {
    dragger: {
      modifiers: {
        x: 'left',
        y: 'top'
      },
      snap: 5,
      style: false,
      container: true,
      limit: {
        x: [0, 3000],
        y: [0, 3000]
      },
      handle: []
    },
    actions: {
      draggable: {
        enable: function(handle) {
          if (this.index++ == 0) {
            if (this.dragger) this.dragger.attach();
            else this.getDragger();
            this.onStateChange('draggable', true);
          }
          if (!handle) return;
          this.handles.push(handle);
          document.id(handle).addEvent('mousedown', this.dragger.bound.start);
        },
        
        disable: function(handle) {
          if (!this.dragger) return;
          if (--this.index == 0) {
            this.onStateChange('draggable', false);
            this.dragger.detach();
          }
          if (!handle) return;
          this.handles.erase(handle)
          document.id(handle).removeEvent('mousedown', this.dragger.bound.start);
        }
      }
    }
  },
  
  initialize: function() {
    this.parent.apply(this, arguments);
    this.handles = [];
    this.index = 0;
  },
  
  unitialize: function() {
    this.handles.each(this.options.actions.draggable.disable, this);
    this.onStateChange('draggable', false);
    delete this.dragger;
  },
  
  getDragger: function() {
    if (this.dragger) return this.dragger;
    var element = this.element;
    this.addEvent('setDocument', function() {
      var position = element.getPosition();
      element.left = position.x - element.getStyle('margin-left').toInt();
      element.top = position.y - element.getStyle('margin-top').toInt();
    }.create({delay: 50}));
    this.dragger = new Drag(element, Object.append(this.options.dragger, this.options.dragger));
    this.dragger.addEvents(this.events.dragger);
    this.dragger.addEvents({
      'start': this.onDragStart.bind(this),
      'complete': this.onDragComplete.bind(this),
      'cancel': this.onDragComplete.bind(this),
      'drag': this.onDrag.bind(this)
    }, true);
    return this.dragger;
  },
  
  onDragStart: function() {
    this.onStateChange('dragged', true);
  },
  
  onDragComplete: function() {
    this.onStateChange('dragged', false);
  },
  
  onDrag: function() {
    this.setStyles({
      top: this.dragger.value.now.y,
      left: this.dragger.value.now.x
    });
  }
  
});

LSD.Behavior.define('[draggable]', LSD.Mixin.Draggable);
/*
---
 
script: Resizable.js
 
description: Resize widget with the mouse freely
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Mixin
  - More/Drag

provides: 
  - LSD.Mixin.Resizable 
...
*/


LSD.Mixin.Resizable = new Class({
  options: {
    resizer: {
      modifiers: {
        x: 'width',
        y: 'height'
      },
      snap: false,
      style: false,
      crop: false,
      handle: [],
      container: true,
      limit: {
        x: [0, 3000],
        y: [0, 3000]
      },
    },
    actions: {
      resizable: {
        enable: function(handle, resizable) {
          this.handle = handle;
          this.resized = resizable || this;
          this.onStateChange('resizable', true);
          var resizer = this.resizer;
          if (resizer == this.getResizer(document.id(this.resized))) resizer.attach();
          if (handle) document.id(handle).addEvent('mousedown', this.resizer.bound.start);
          if (this.options.resizer.fit) this.fit(resizable)
        },

        disable: function(handle, content) {
          this.onStateChange('resizable', false);
          if (this.resizer) this.resizer.detach();
          if (handle) document.id(handle).removeEvent('mousedown', this.resizer.bound.start);
          delete this.resized, delete this.handle;
        },
      }
    }
  },
  
  initialize: function() {
    this.parent.apply(this, arguments);
    var options = this.options.resizer;
    var rules = (new Object.Array).concat(this.getAttribute('resizable').split(/\s+/));
    options.modifiers.x = (!rules.x && rules.y) ? false : 'width';
    options.modifiers.y = (!rules.y && rules.x) ? false : 'height';
    options.fit = !!rules.fit;
  },
  
  uninitialize: function() {
    if (this.handle) this.options.actions.resizable.disable.call(this, this.handle, this.resized);
    delete this.resizer;
  },
   
  getResizer: function(resized) {
    var element = resized
    if (this.resizer) {
      if (this.resizer.element == element) return this.resizer;
      return this.resizer.element = element;
    }
    var resizer = this.resizer = new Drag(element, Object.append(this.options, this.options.resizer));
    this.fireEvent('register', ['resizer', resizer]);
    resizer.addEvents({
      'beforeStart': this.onBeforeResize.bind(this),
      'start': this.onResizeStart.bind(this),
      'complete': this.onResizeComplete.bind(this),
      'cancel': this.onResizeComplete.bind(this),
      'drag': this.onResize.bind(this)
    }, true);
    return resizer;
  },
  
  check: function(size) {
    if (!this.resizer) return;
    var width = this.element.offsetWidth - this.offset.inner.left - this.offset.inner.right;
    if (!size) size = {width: this.resized.toElement().width}
    if (size.width < width) {
      if (!$chk(this.limit)) this.limit = this.resized.getStyle('minWidth') || 1
      this.resized.setStyle('minWidth', width);
      $clear(this.delay);
      this.delay = (function() { //reset limit options in one second
        this.resized.setStyle('minWidth', this.limit);
      }).delay(1000, this); 
      size.width = width;
    }
    return size;
  },
  
  onBeforeResize: function() {
    Object.append(this.resized.toElement(), this.resized.size)
  },
  
  onResizeStart: function() {
    this.onStateChange('resized', true);
    var getLiquid = function(child, prop) {
      var value = child.style.current[prop];
      return ((value == 'inherit') || (value == 'auto') || child.style.expressed[prop]) ? value : null
    }
    if (!this.liquid) {
      this.liquid = LSD.Module.DOM.walk(this, function(child) { 
        return getLiquid(c, 'width')
      }) || []
      this.liquid.include(this.resized);
      if (this.resized != this) {
        var style = this.resized.style.liquid = {};
        var width = getLiquid(this.resized, 'width');
        if (width) style.width = width;
        var height = getLiquid(this.resized, 'height');
        if (height) style.height = height;
      }
    }
  },
  
  onResizeComplete: function() {
    if (this.resized.style.liquid) this.resized.setStyles(this.resized.style.liquid);
    this.onStateChange('resized', false);
    delete this.liquid
  },
  
  onResize: function() {
    var now = this.resizer.value.now;
    var resized = this.resized;
    if (!resized.style.dimensions) {
      resized.style.dimensions = {};
      var width = resized.style.current.width
      if (width == 'auto') resized.style.dimensions.width = 'auto';
      var height = resized.toElement().getStyle('height');
      if (height == 'auto') resized.style.dimensions.height = 'auto';
    }
    if (!now.x) now.x = resized.size.width;
    if (!now.y) now.y = resized.size.height;
    var size = this.check({width: resized.setWidth(now.x) || now.x, height: resized.setHeight(now.y) || now.y});
    resized.setStyles(size);
    if (this.liquid) {
      this.liquid.each(function(child) {
        child.update();
      })
    }
    this.refresh();
  },
  
  fit: function(content) {
    if (!content) content = this.resized;
    var element = content.getWrapper();
    var display = element.getStyle('display');
    if (display != 'inline-block') element.setStyle('display', 'inline-block');
    var width = element.offsetWidth;
    var height = element.offsetHeight;
    element.setStyle('display', display)
    content.setHeight(height);
    content.setWidth(width);
    this.refresh({
      maxWidth: width, maxHeight: height
    });
  },
  
  getScrolled: function() {
    return this.resized.getWrapper();
  }
});

LSD.Behavior.define('[resizable][resizable!=false]', LSD.Mixin.Resizable);
/*
---
 
script: Touchable.js
 
description: A mousedown event that lasts even when you move your mouse over. 
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Mixin
  - Mobile/Mouse
  - Mobile/Click
  - Mobile/Touch

 
provides:   
  - LSD.Mixin.Touchable
 
...
*/


LSD.Mixin.Touchable = new Class({
  options: {
    events: {
      enabled: {
        element: {
          'touchstart': 'activate',
          'touchend': 'deactivate',
          'touchcancel': 'deactivate'
        }
      }
    },
    states: Array.object('active')
  }
});

LSD.Behavior.define(':touchable', LSD.Mixin.Touchable);
/*
---
 
script: Placeholder.js
 
description: Placeholder for form fileds.
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Mixin

 
provides:   
  - LSD.Mixin.Placeholder
 
...
*/


LSD.Mixin.Placeholder = new Class({
  
  options: {
    actions: {
      placeholder: {
        enable: function(){
          this.element.set('autocomplete', 'off');
          this.onPlacehold();
        },
        disable: function(){
          this.onUnplacehold();
        }
      }
    },
    events: {
      enabled: {
        element: {
          'focus': 'onUnplacehold',
          'blur': 'onPlacehold',
          'keypress': 'onUnplacehold'
        }
      }
    },
    states: Array.object('placeheld')
  },
  
  getPlaceholder: function(){
    return this.attributes.placeholder;
  },
  
  onUnplacehold: function(){
    if (this.placeheld){
      this.applyValue('');
      this.unplacehold();
      return true;
    };
  },
  
  onPlacehold: function(){
    var value = this.getRawValue();
    if (!value || value.match(/^\s*$/) || value == this.getPlaceholder()){
      this.applyValue(this.getPlaceholder());
      this.placehold();
      return true;
    };
  }
  
});

LSD.Behavior.define('[placeholder]', LSD.Mixin.Placeholder);
/*
---
 
script: Request.js
 
description: Make various requests to back end
 
license: Public domain (http://unlicense.org).
 
requires:
  - LSD.Mixin
  - Core/Request
  - Ext/Request.Form
  - Ext/Request.Auto
  - Ext/document.createFragment
  
provides: 
  - LSD.Mixin.Request
 
...
*/

LSD.Mixin.Request = new Class({
  options: {
    request: {
      method: 'get'
    },
    states: Array.object('working'),
    events: {
      self: {
        submit: function() {
          return this.send.apply(this, arguments);
        },
        
        cancel: function() {
          return this.stop()
        },
        
        getCommandAction: function() {
          if (!this.isRequestURLLocal()) return 'submit';
        },

        getTargetAction: function() {
          if (this.getCommandAction() == 'submit') return 'update';
        }
      },
      request: {
        request: 'busy',
        complete: 'idle'
      }
    }
  },
  
  send: function() {
    var data = this.getRequestData && this.getRequestData() || null;
    var options = Object.merge({}, this.options.request, {data: data, url: this.getRequestURL(), method: this.getRequestMethod()});
    for (var i = 0, j = arguments.length, arg, opts; i < j; i++) {
      var arg = arguments[i];
      if (!arg) continue;
      if (typeof arg == 'object' && !arg.event && !arg.indexOf) {
        if (("url" in arg) || ("method" in arg) || ("data" in arg)) Object.merge(options, arg)
        else options.data = Object.merge(options.data || {}, arg);
      } else if (arg.call) var callback = arg;
    }
    var request = this.getRequest(options);
    request.addEvent('complete:once', function() {
      if (callback) callback();
      if (request.isSuccess() && this.getCommandAction && this.getCommandAction() == 'submit')
        if (this.chainPhase == -1 || (this.chainPhase == this.getActionChain().length - 1))  
          this.eachLink('optional', arguments, true);
    }.bind(this));
    return request.send(options);
  },
  
  stop: function() {
    if (this.request) this.request.cancel();
    return this;
  },
  
  getRequest: function(options, fresh) {
    var type = (options && options.type) || this.getRequestType();
    if (fresh || !this.request || this.request.type != type) {
      this.request = this[type == 'xhr' ? 'getXHRRequest' : 'getFormRequest'](options);
      if (!this.request.type) {
        this.request.type = type;
        this.fireEvent('register', ['request', this.request, type]);
      }
    }
    return this.request;
  },
  
  getXHRRequest: function(options) {
    return new Request.Auto(options);
  },
  
  getFormRequest: function(options) {
    return new Request.Form(options);
  },
  
  getRequestType: function() {
    return this.attributes.transport || this.options.request.type;
  },
  
  getRequestMethod: function() {
    return this.attributes.method || this.options.request.method;
  },
  
  getRequestURL: function() {
    return this.attributes.href || this.attributes.src || this.attributes.action;
  },
  
  isRequestURLLocal: function(base, host) {
    if (!host) host = location.host;
    if (!base) base = location.pathname;
    var url = this.getRequestURL();
    return !url || (url.charAt(0) == "#") || url.match(new RegExp('(?:' + host + ')?' + base + '/?#'));
  }
});

LSD.Behavior.define(':form[action], [src], [href]', LSD.Mixin.Request);
/*
---
 
script: Resource.js
 
description: Make various requests to back end
 
license: Public domain (http://unlicense.org).
 
requires:
  - LSD.Mixin
  - Resource/*
  - More/URI
  
provides: 
  - LSD.Mixin.Resource
 
...
*/

LSD.Mixin.Resource = new Class({
  options: {
    resource: {
      prefix: null,
      name: null
    },
    request: {
      type: 'xhr'
    }
  },
  
  getResource: function(options) {
    if (!options) options = this.options.resource
    if (!this.resource) {
      var name = options.name;
      var prefix = options.prefix;
      if (!name || !prefix) {
        var uri = this.attributes.itemtype.split(/\s+/).getLast();
        if (uri) {
          if (uri.toURI) uri = uri.toURI();
          prefix = uri.get('directory');
          name = uri.get('file');
          /*
            Parses the last URL bit that can be singularized 
          */
          while (!name || !(name = name.singularize())) {
            var dirs = prefix.split('/');
            name = dirs.pop();
            prefix = dirs.join('/')
          }
        }
      }
      var options = Object.clone(this.options.resource);
      if (prefix) options.prefix = prefix;
      options.getRequest = this.bindEvent('getRequest');
      this.resource = new Resource(name, options);
      if (!this.getRequest) this.setAttribute('href', this.resource.getFormattedURL('plural'));
    }
    return this.resource;
  },
  
  getResourceID: function() {
    return this.attributes.itemid;
  },
  
  getModel: function() {
    return this.getResource().init(this.getResourceID() || this.element);
  },
  
  submit: function() {
    var model = this.getModel();
    return model.save.apply(model, arguments);
  },
  
  'delete': function() {
    this.dispose()
    return this.getModel().destroy();
  }
});

LSD.Behavior.define(':resource, [itemscope]', LSD.Mixin.Resource);
/*
---
 
script: Validity.js
 
description: Validates widgets against preset rules
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
references:
  - http://www.w3.org/TR/html5/association-of-controls-and-forms.html#constraints
 
requires:
  - LSD.Mixin
 
provides: 
  - LSD.Mixin.Validity
...
*/

/* 
  There is a slight difference between this and a w3c spec.
  Spec states that as a result of a validation, there should
  be a .validity object on widget that holds all possible
  validation errors as keys and true or false as values. 
  
  Our .validity object doesnt not contain validations that
  passed successfuly and only holds errors. This gets it
  closer to ActiveRecord's validation system.
*/
   

!function() {

LSD.Mixin.Validity = new Class({
  initialize: function() {
    this.parent.apply(this, arguments);
    this.addClass(this.attributes.required ? 'required' : 'optional');
  },
  
  checkValidity: function() {
    var validity = this.validity = {};
    var value = this.getValue();
    for (attribute in Attributes) {
      var constraint = this.attributes[attribute]
      if (!constraint) continue;
      var result = Attributes[attribute].call(this, value, constraint)
      if (!result) continue;
      validity[result] = true;
    }
    for (var i in validity) return !this.invalidate();
    return this.validate(true);
  },
  
  validate: function(value) {
    if (value !== true && !this.checkValidity()) return false;
    this.setStateTo('valid', true);
    this.setStateTo('invalid', false);
    return true;
  },
  
  invalidate: function(value) {
    this.setStateTo('invalid', true);
    this.setStateTo('valid', false);
    return true;
  },
  
  setCustomValidity: function(validity) {
    this.validationMessage = validity;
    this.validity.customError = true;
  }
});

var Attributes = LSD.Mixin.Validity.Attributes = {
  required: function(value) {
    if (!value) return "valueMissing"
  },
  type: function(value, type) {
    if (!value.match()) return "typeMismatch"
  },
  pattern: function(value, pattern) {
    if (!value.match(pattern)) return "patternMismatch"
  },
  maxlength: function(value, length) {
    if ((value !== null) && (value.toString().length > length)) return "tooLong"
  },
  min: function(value, min) {
    if (value < min) return "rangeUnderflow"
  },
  max: function(value, max) {
    if (value > max) return "rangeOverflow"
  },
  step: function(value, step) {
    if (value % step > 0) return "stepMismatch"
  }
}

LSD.Behavior.define('[name], :value', LSD.Mixin.Validity);

}();
/*
---
 
script: Value.js
 
description: Add your widget have a real form value.
 
license: Public domain (http://unlicense.org).
 
requires:
  - LSD.Mixin
 
provides: 
  - LSD.Mixin.Value
 
...
*/

LSD.Mixin.Value = new Class({
  options: {
    actions: {
      value: {
        enable: function() {
          if (this.attributes.multiple) {
            this.values = [];
          } else {
            if (typeof this.value != 'undefined') return;
            this.setValue();
          }
        },
        disable: function() {
          
        }
      }
    }
  },
  
  setValue: function(value, unset) {
    if (value == null || (value.event && value.type)) value = this.getDefaultValue();
    
    else if (value.getValue) value = this.processValue(value.getValue());
    var result = false;
    if (this.isValueDifferent(value) ^ unset) {
      result = this.writeValue(value, unset);
      var previous = this.getPreviousValue();
      this.fireEvent('change', [value, previous]);
      if (!this.click) this.callChain(value, previous);
    }
    return result
  },
  
  unsetValue: function(item) {
    return this.setValue(item, true)
  },

  getValue: function() {
    if (this.attributes.multiple) {
      if (this.values) this.values = []; 
      return this.values.map(this.formatValue, this);
    } else {
      if (typeof this.value == 'undefined') this.value = this.getDefaultValue();
      return this.formatValue(this.value);
    }
  },
  
  writeValue: function(value, unset) {
    if (this.attributes.multiple) {
      if (unset) {
        var index = this.values.indexOf(value);
        if (index > -1) {
          this.values.splice(index, 1);
          this.valueInputs.splice(index, 1)[0].dispose();
        }
      } else {  
        this.previousValue = this.values.clone();
        this.values.push(value);
        (this.valueInputs || (this.valueInputs = [])).push(this.getValueInput().set('value', value));
        this.applyValue(this.values);
      }
      if (this.values.length == +!unset) this[unset ? 'removePseudo' : 'addPseudo']('valued');
    } else {
      var input = this.valueInput || (this.valueInput = this.getValueInput());
      this.previousValue = this.value;
      if (unset) {
        if (this.value) this.removePseudo('valued');
        delete this.value;
      } else {
        if (!this.value) this.addPseudo('valued');
        this.value = value;
      }
      input.set('value', unset ? '' : value);
      this.applyValue(this.value);
    }
  },
  
  applyValue: function(value) {
    return this;
  },

  formatValue: function(value) {
    return value;
  },
  
  processValue: function(value) {
    return value;
  },
  
  getDefaultValue: function() {
    var value = this.getRawValue();
    if (value != null) return this.processValue(value);
  },
  
  getRawValue: function() {
    return this.attributes.value || LSD.Module.DOM.getID(this) || this.innerText;
  },
  
  getPreviousValue: function() {
    return this.previousValue
  },
  
  shouldCallChainOnValueChange: function() {
    var type = this.getCommandType ? this.getCommandType() : this.commandType; 
    return !type || type == 'command';
  },
  
  isValueDifferent: function(value) {
    if (this.attributes.multiple) {
      return this.values.indexOf(value) == -1
    } else {
      return this.value != value;
    }
  },
  
  toData: function() {
    switch (this.commandType || (this.getCommandType && this.getCommandType())) {
      case "checkbox": case "radio":
        if (!this.checked) return;
    }
    return this.getValue();
  },
  
  getData: function() {
    var data = {};
    if (this.attributes.name) data[this.attributes.name] = this.toData();
    return data;
  },
  
  canElementHoldValue: function() {
    var tag = LSD.toLowerCase(this.element.tagName)
    return (!this.attributes.multiple && this.attributes.type != 'file' 
      && (tag == 'input' || tag == 'textarea')) 
  },
  
  getValueInput: function() {
    if (this.canElementHoldValue()) return this.element;
    var name = this.attributes.name;
    if (this.attributes.miltiple) name += '[]';
    return new Element('input[type=hidden]', {name: name}).inject(this.element);
  }
});

LSD.Behavior.define(':value', LSD.Mixin.Value);
/*
---
 
script: Animation.js
 
description: Animated ways to show/hide widget
 
license: Public domain (http://unlicense.org).
 
requires:
  - LSD.Mixin
  - Core/Fx.Tween
 
provides: 
  - LSD.Mixin.Animation
 
...
*/

LSD.Mixin.Animation = new Class({
  
  options: {
    animation: {}
  },
  
  getAnimation: function() {
    if (!this.animation) {
      this.animation = this.getAnimatedElement().set('tween', this.options.animation).get('tween');
      if (this.options.animation.value) this.animation.set(this.options.animation.value);
    }
    return this.animation;
  },
  
  fade: function(how){
    return this.getAnimation().start('opacity', how == 'in' ? 1 : 0);
  },
  
  slide: function(how){
    this.getAnimatedElement().store('style:overflow', this.getAnimatedElement().getStyle('overflow'));
    this.getAnimatedElement().setStyle('overflow', 'hidden');
    return this.getAnimation().start('height', how == 'in' ? this.getAnimatedElement().scrollHeight - this.getAnimatedElement().offsetHeight : 0);
  },
  
  show: function() {
    var parent = this.parent;
    this.getAnimatedElement().setStyle('display', this.getAnimatedElement().retrieve('style:display') || 'inherit');
    this[this.attributes.animation]('in').chain(function(){
      this.getAnimatedElement().setStyle('overflow', this.getAnimatedElement().retrieve('style:overflow') || 'inherit');
      LSD.Widget.prototype.show.apply(this, arguments);
    }.bind(this));
  },
  
  hide: function(how) {
    var parent = this;
    this[this.attributes.animation]('out').chain(function(){
      this.getAnimatedElement().setStyle('overflow', this.getAnimatedElement().retrieve('style:overflow') || 'inherit');
      this.getAnimatedElement().store('style:display', this.getAnimatedElement().getStyle('display'));
      this.getAnimatedElement().setStyle('display', 'none');
      LSD.Widget.prototype.hide.apply(this, arguments);
    }.bind(this));
  },
  
  remove: function() {
    return this[this.attributes.animation]('out').chain(this.dispose.bind(this));
  },
  
  dispose: function() {
    return this.getAnimatedElement().dispose()
  },
  
  getAnimatedElement: function() {
    return this.element;
  }
  
});

LSD.Behavior.define('[animation]', LSD.Mixin.Animation);
/*
---
 
script: Unselectable.js
 
description: DisableS in browser native selection for element
 
license: Public domain (http://unlicense.org).
 
requires:
  - LSD.Mixin
  - Ext/Element.disableSelection
 
provides: 
  - LSD.Mixin.Unselectable
 
...
*/

LSD.Mixin.Unselectable = new Class({
  options: {
    actions: {
      selection: {
        enable: function() {
          this.element.disableSelection()
        },
        disable: function() {
          this.element.enableSelection();
        }
      }
    }
  }
});

LSD.Behavior.define(':unselectable', LSD.Mixin.Unselectable);
/*
---
 
script: ContentEditable.js
 
description: Animated ways to show/hide widget
 
license: Public domain (http://unlicense.org).
 
requires:
  - LSD.Mixin
  
uses:
  - CKEDITOR
 
provides: 
  - LSD.Mixin.ContentEditable
...
*/

LSD.Mixin.ContentEditable = new Class({
  options: {
    ckeditor: {
      toolbarCanCollapse: false,
      linkShowAdvancedTab: false,
      linkShowTargetTab: false,
      invisibility: true,
      skin: 'ias',
      toolbar: [['Bold', 'Italic', 'Strike', '-', 'Link', 'Unlink', '-', 'NumberedList', 'BulletedList', '-', 'Indent', 'Outdent', '-','Styles', '-', 'PasteFromWord', 'RemoveFormat']],
      removeFormatTags: 'dialog,img,input,textarea,b,big,code,del,dfn,em,font,i,ins,kbd,q,samp,small,span,strike,strong,sub,sup,tt,u,var,iframe',
      removeFormatAttributes: 'id,class,style,lang,width,height,align,hspace,valign',
      contentsCss: '/stylesheets/layout/application/iframe.css',
      extraPlugins: 'autogrow',
      customConfig: false,
      language: 'en',
      removePlugins: 'bidi,dialogadvtab,liststyle,about,elementspath,blockquote,popup,undo,colorbutton,colordialog,div,entities,filebrowser,find,flash,font,format,forms,horizontalrule,image,justify,keystrokes,maximize,newpage,pagebreak,preview,print,resize,save,scayt,smiley,showblocks,showborders,sourcearea,style,table,tabletools,specialchar,templates,wsc,a11yhelp,a11yhelp',
      stylesSet: [
        { name : 'Paragraph', element : 'p' },
      	{ name : 'Heading 1', element : 'h1' },
      	{ name : 'Heading 2', element : 'h2' }
      ]
    }
  },
  
  getEditor: function() {
    if (this.editor) return this.editor;
    use('CKEDITOR', function(CKEDITOR) {
      var value = this.getValueForEditor();
      var editor = this.editor = new CKEDITOR.editor( this.options.ckeditor, this.getEditedElement(), 1, value);
      CKEDITOR.add(editor);
      editor.on('focus', function() {
        if (this.editor) this.getEditorContainer().addClass('focused');
        this.onFocus.apply(this, arguments);
      }.bind(this));
      editor.on('blur', function() {
        if (this.editor) this.getEditorContainer().removeClass('focused');
        this.onBlur.apply(this, arguments);
      }.bind(this));
      editor.on('uiReady', function() {
        this.showEditor();
        this.fireEvent('editorReady');
        !function() {/*
          if (Browser.firefox) {
            var body = this.getEditorBody()
            body.contentEditable = false;
            body.contentEditable = true;
        }*/
        this.editor.focus();
        this.editor.forceNextSelectionCheck();
        this.editor.focus();
        }.delay(100, this)
      }.bind(this));
    }.bind(this))
  },
  
  getValueForEditor: function() {
    var element = this.getEditedElement();
    switch (element.get('tag')) {
      case "input": case "textarea":
        return element.get('value');
      default:
        return element.innerHTML;
    }
  },
  
  showEditor: function() {
    this.element.setStyle('display', 'none');
    this.getEditorContainer().setStyle('display', 'block');
  },
  
  hideEditor: function() {
    this.element.setStyle('display', '');
    this.getEditorContainer().setStyle('display', 'none');
  },
  
  openEditor: function(callback) {
    if (this.editor && this.editor.document) {
      if (callback) callback.call(this.editor);
      this.showEditor();
    } else {
      if (callback) this.addEvent('editorReady:once', callback);
      this.getEditor();
    }
  },
  
  closeEditor: function(callback) {
    this.editor.updateElement();
    this.hideEditor();
  },
  
  getEditorContainer: function() {
    return $(this.editor.container.$);
  },
  
  getEditorBody: function() {
    return this.editor.document.$.body;
  },
  
  getEditedElement: function() {
    return this.toElement();
  }
});

LSD.Behavior.define('[contenteditable=editor]', LSD.Mixin.ContentEditable);
/*
---
 
script: List.js
 
description: Mixin that makes it simple to work with a list of item (and select one of them)
 
license: Public domain (http://unlicense.org).
 
requires:
  - LSD.Mixin
  - Core/Element
  - Ext/Element.Properties.item
 
provides: 
  - LSD.Mixin.List
 
...
*/


LSD.Mixin.List = new Class({  
  options: {
    endless: true,
    force: false,
    proxies: {
      container: {
        condition: function(widget) {
          return !!widget.setList
        }
      }
    },
    shortcuts: {
      previous: 'previous',
      next: 'next'
    },
    has: {
      many: {
        items: {
          selector: ':item',
          traits: Array.object('selectable'),
          as: 'list',
          pseudos: Array.object('value'),
          options: function() {
            if (this.attributes.multiple) {
              return {pseudos: Array.object('checkbox')};
            } else {
              return {pseudos: Array.object('radio'), radiogroup: this.lsd};
            }
          },
          states: {
            link: {
              checked: 'selected',
              selected: 'checked'
            },
            add: Array.object('selected', 'checked')
          },
          callbacks: {
            fill: 'fill',
            empty: 'empty'
          }
        }
      }
    },
    states: Array.object('empty')
  },
  
  findItemByValue: function(value) {
    for (var i = 0, widget; widget = this.items[i++];) {
      var val = widget.value == null ? (widget.getValue ? widget.getValue() : null) : widget.value;
      if (val === value) return this.items[i - 1];
    }
    return null;
  },
  
  sort: function(sort) {
    return this.getItems().sort(sort)
  },
  
  filter: function(filter) {
    return this.getItems().filter(filter)
  },
  
  next: function() {
    var index = this.items.indexOf(this.selectedItems[0]);
    var item = this.items[index + 1] || (this.options.endless && this.items[0]);
    return item && item.check();
  },
  
  previous: function() {
    var index = this.items.indexOf(this.selectedItems[0]);
    var item = this.items[index - 1] || (this.options.endless && this.items.getLast());
    return item && item.check();
  }
  
});


LSD.Behavior.define(':list', LSD.Mixin.List);
/*
---
 
script: Choice.js
 
description: Mixin that adds List. Allows one item to be chosen and one selected (think navigating to a menu item to select)
 
license: Public domain (http://unlicense.org).
 
requires:
  - LSD.Mixin.List
 
provides: 
  - LSD.Mixin.Choice
 
...
*/


LSD.Mixin.Choice = new Class({
  options: {
    has: {
      many: {
        items: {
          states: {
            add: Array.object('chosen')
          }
        }
      }
    }
  },
  
  chooseItem: function(item, temp) {
    if (!(item = this.getItem(item)) && this.options.list.force) return false;
    var chosen = this.chosenItem;
    this.setSelectedItem(item, 'chosen');
    this.fireEvent('choose', [item, this.getItemIndex()]);
    if (item.choose() && chosen) chosen.forget();
    return item;
  },
  
  forgetChosenItem: function(item) {
    item = this.getItem(item) || this.chosenItem;
    if (item) item.forget();
    this.unsetSelectedItem(item, 'chosen');
  },
  
  selectChosenItem: function() {
    return this.selectItem(this.chosenItem)
  },

  getChosenItems: function() {
    return this.chosenItem || (this.chosenItems ? this.chosenItems.getLast() : null);
  },
  
  getChosenItems: function(type) {
    return this.chosenItems || (this.chosenItem && [this.chosenItem]);
  }
});


LSD.Behavior.define(':choice', LSD.Mixin.Choice);
/*
---
 
script: Target.js
 
description: Functions to fetch and parse target into action chains
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Mixin

provides: 
  - LSD.Mixin.Target

...
*/

!function() {
  var cache = {};
  LSD.Mixin.Target = new Class({
    options: {
      chain: {
        target: function() {
          if (!this.attributes.target) return;
          return this.parseTargetSelector(this.attributes.target).map(function(chain) {
            if (!chain.action) chain.action = this.getTargetAction(); 
            if (!chain.action) return;
            if (chain.selector) {
              chain.target = function() {
                return this.getElements(chain.selector);
              }.bind(this);
            };
            switch (chain.keyword) {
              case "before":
                chain.priority = 50;
                break;
              case "after":
                chain.priority = -50;
            }
            return chain;
          }.bind(this));
        }
      }
    },
  
    parseTargetSelector: function(selector) {
      return (cache[selector] || (cache[selector] = Parser.exec.apply(Parser, arguments)))
    },

    getTargetAction: function() {
      return this.attributes.interaction || this.captureEvent('getTargetAction', arguments);
    }
  });
  
  
  var Parser = LSD.Mixin.Target.Parser = {
    build: function(expression, start, end, keyword) {      
      var last = expression[end - start - 1];
      if (!last.classes && !last.attributes && last.tag == '*' && !last.id && last.pseudos[0].type == 'class') {
        var actions = last.pseudos
        end--;
      };
      if (keyword) start++;
      var built = (start < end) ? {selector: Parser.slice(expression, start, end)} : {}
      if (actions) return actions.map(function(pseudo, i) {
        var object = Object.append({action: pseudo.key}, built);
        var action = LSD.Action[LSD.toClassName(pseudo.key)];
        var priority = action && action.prototype.options && action.prototype.options.priority;
        if (priority != null) object.priority = priority;
        if (pseudo.value) object.arguments = pseudo.value;
        if (keyword) object.keyword = keyword;
        return object;
      }); else return built;
    },
    
    slice: function(expressions, start, end) {
      return {
        Slick: true,
        expressions: [expressions.slice(start, end)]
      };
    },
    
    exec: function(selector) {
      var parsed = selector.Slick ? selector : Slick.parse(selector), expressions = [];
      for (var i = 0, expression; expression = parsed.expressions[i]; i++) {
        var started = 0;
        var first = expression[0];
        var keyword = Keywords[first.tag] ? first.tag : null; 
        var exp = Parser.build(expression, started, expression.length, keyword);
        expressions.push[exp.push ? 'apply' : 'call'](expressions, exp);
      }
      return expressions;
    }
  };
  
  var Keywords = Parser.Keywords = Array.object('if', 'then', 'else', 'or', 'and', 'before');
}();

LSD.Behavior.define('[target]', LSD.Mixin.Target);
/*
---
 
script: Root.js
 
description: The topmost widget easily accessible.
 
license: Public domain (http://unlicense.org).
 
requires:
  - LSD.Mixin
  - LSD.Behavior
 
provides: 
  - LSD.Mixin.Root
 
...
*/

LSD.Mixin.Root = new Class({
  options: {
    events: {
      _root: {
        nodeInserted: function(node) {
          node.root = this;
          node.fireEvent('setRoot', this);
          node.fireEvent('register', ['root', this]);
          node.fireEvent('relate', [this, 'root']);
        },
        nodeRemoved: function(node) {
          if (node.root == this) {
            node.fireEvent('unsetRoot', this);
            node.fireEvent('unregister', ['root', this]);
            node.fireEvent('unrelate', [this, 'root']);
            delete node.root;
          }
        }
      }
    }
  },
  
  constructors: {
    root: function() {
      this.root = this;
      this.fireEvent('setRoot', this);
      this.fireEvent('relate', [this, 'root']);
      this.fireEvent('register', ['root', this]);
    }
  },
  
  desconstructors: {
    root: function() {
      delete this.root;
      this.fireEvent('unsetRoot', this);
      this.fireEvent('unregister', ['root', this]);
      this.fireEvent('unrelate', [this, 'root']);
    }
  }
});

LSD.Behavior.define(':root', LSD.Mixin.Root);
/*
---
 
script: Sortable.js
 
description: Reorder widgets as you please
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - More/Sortables
  - LSD.Mixin
 
provides:
  - LSD.Mixin.Sortable
 
...
*/

LSD.Mixin.Sortable = new Class({
  options: {
    sortables: {
      clone: true,
      snap: 5,
      constrain: true,
      revert: true
    },
    pseudos: Array.object('activatable'),
    events: {
      self: {
        mousedown: 'onBeforeSortStart'
      }
    }
  },
  
  getSortables: function() {
    if (this.sortables) return this.sortables;
    var options = Object.append({}, this.options.sortables);
    if (options.clone === true) options.clone = function(event, element){
      var widget = element.uid && element.retrieve('widget');
      var clone = element.cloneNode(true);
      document.id(clone).addEvent('mousedown', function(event){
        element.fireEvent('mousedown', event);
      }).addClass('clone').store('origin', widget).setStyles({
        margin: 0,
        position: 'absolute',
        visibility: 'hidden',
        width: element.getStyle('width')
      }).setPosition(element.getPosition(element.getOffsetParent()));
      return clone.inject(this.list);
    };
    delete options.snap;
    this.sortables = new Sortables([], options);
    this.fireEvent('register', ['sortables', this.sortables]);
    this.sortables.addEvents(this.bindEvents({
      start: 'onSortStart',
      complete: 'onSortComplete',
      sort: 'onSort'
    }))
    var self = this;
    this.sortables.insert = function(dragging, element) {
      if (self.onBeforeSort.apply(self, arguments)) {
        (dragging.retrieve('origin') || dragging).fireEvent('beforeMove', element);
        var where = 'inside';
        if (this.lists.contains(element)){
          this.list = element;
          this.drag.droppables = this.getDroppables();
        } else {
          where = this.element.getAllPrevious().contains(element) ? 'before' : 'after';
        };
        (this.element.uid && this.element.retrieve('widget') || this.element).inject(element, where);
        this.fireEvent('sort', [this.element, this.clone]);
      }
    };
    return this.sortables;
  },
  
  onBeforeSort: function(dragging, element) {
    return true;
  },
  
  onBeforeSortStart: function(event) {
    for (var target = event.target, widget; target && target.tagName; target = target.parentNode) {
      if (target == this.element) break;
      widget = target.uid && Element.retrieve(target, 'widget');
      if (widget && widget.pseudos.reorderable) {
        if (widget.getHandle) {
          var handle = widget.getHandle();
          if (!(handle == event.target || handle.contains(event.target))) return;
        }
        var snap = widget.options.snap || this.options.sortables.snap || 0;
        var start = event.page, self = this;
        if (snap > 0) {
          var events = {
            mousemove: function(event) {
              var distance = Math.round(Math.sqrt(Math.pow(event.page.x - start.x, 2) + Math.pow(event.page.y - start.y, 2)));
              if (distance > snap) self.getSortables().start(event, widget.element);
            },
            mouseup: function() {
              document.body.removeEvents(events);
            }
          };
          document.body.addEvents(events);
        } else {
          this.getSortables().start(event, widget.element)
        }
        break;
      }
    };
  },

  onSortStart: function(element) {
    var widget = element.retrieve('widget');
    widget.addClass('moved');
    widget.fireEvent('moveStart');
  },
  
  onSortComplete: function(element) {
    var widget = element.retrieve('widget');
    widget.removeClass('moved');
    widget.fireEvent('moveComplete');
  },
  
  onSort: function(element) {
    var widget = element.retrieve('widget');
    widget.fireEvent('move');
    this.fireEvent('sort', [widget, element]);
  }
  
});

LSD.Behavior.define(':sortable', LSD.Mixin.Sortable);
/*
---
 
script: Invokable.js
 
description: Makes widget submit into another widget 
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Mixin
 
provides:
  - LSD.Mixin.Invokable
 
...
*/


LSD.Mixin.Invokable = new Class({
  options: {
    chain: {
      feedback: function() {
        return {
          action: 'submit',
          target: this.getSubmissionTarget,
          arguments: this.getSubmissionData,
          priority: -5
        }
      }
    },
    states: {
      invoked: {
        enabler: 'invoke',
        disabler: 'revoke'
      }
    },
    events: {
      _invokable: {
        submit: function() {
          this.revoke(true);
        },
        cancel: 'revoke'
      }
    }
  },
  
  constructors: {
    invoker: function() {
      var invoker = this.invoker || this.options.invoker;
      if (invoker) this.invoke(invoker);
    }
  },
  
  invoke: function(invoker) {
    this.invoker = invoker;
    this.fireEvent('invoke', arguments);
    this.fireEvent('register', ['invoker', invoker]);
  },
  
  revoke: function(soft) {
    var invoker = this.invoker;
    if (soft !== true) this.invoker.uncallChain();
    this.fireEvent('revoke', invoker);
    this.fireEvent('unregister', ['invoker', invoker]);
  },
  
  getInvoker: function() {
    return this.invoker;
  },
  
  getSubmissionTarget: function() {
    return this.getInvoker();
  },
  
  getSubmissionData: function() {
    return this.getData ? this.getData() : null;
  }
});

LSD.Behavior.define(':invokable', LSD.Mixin.Invokable);
/*
---
 
script: Selectors.js
 
description: Define a widget associations
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Module
  - Core/Slick.Finder

provides: 
  - LSD.Module.Selectors

...
*/

!function() {

LSD.Module.Selectors = new Class({
  getElements: function(selector, origin) {
    return Slick.search(origin || this.getSelectorOrigin(selector), selector)
  },
  
  getElement: function(selector, origin) {
    return Slick.find(origin || this.getSelectorOrigin(selector), selector)
  },
  
  /*
    We have to figure the document before we do a .search
    to let Slick switch into the right mode and be prepared
  */
    
  getSelectorOrigin: function(selector) {
    if (!selector.Slick) selector = Slick.parse(selector);
    var first = selector.expressions[0][0];
    switch (first.combinator.charAt(0)) {
      case "$":
        return this.element;
      default:
        return this;
    }
  },
  
  getPseudoElementsByName: function(name) {
    return this.captureEvent('getRelated', arguments) || this[name];
  },
  
  match: function(selector) {
    if (typeof selector == 'string') selector = Slick.parse(selector);
    if (selector.expressions) selector = selector.expressions[0][0];
    if (selector.combinator == '::') {
      if (selector.tag && (selector.tag != '*')) {
        var group = this.expectations['!::'];
        if (!group || !(group = group[selector.tag]) || !group.length) return false;
      }
    } else {
      if (selector.tag && (selector.tag != '*') && (this.tagName != selector.tag)) return false;
    }
    if (selector.id && (this.attributes.id != selector.id)) return false;
    if (selector.attributes) for (var i = 0, j; j = selector.attributes[i]; i++) 
      if (j.operator ? !j.test(this.attributes[j.key] && this.attributes[j.key].toString()) : !(j.key in this.attributes)) return false;
    if (selector.classes) for (var i = 0, j; j = selector.classes[i]; i++) if (!this.classes[j.value]) return false;
    if (selector.pseudos) {
      for (var i = 0, j; j = selector.pseudos[i]; i++) {
        var name = j.key;
        if (this.pseudos[name]) continue;
        var pseudo = pseudos[name];
        if (pseudo == null) pseudos[name] = pseudo = Slick.lookupPseudo(name) || false;
        if (pseudo === false || (pseudo && !pseudo.call(this, this, j.value))) return false;
      }
    }
    return true;
  }
});
var pseudos = {};

var Combinators = LSD.Module.Selectors.Combinators = {
  '$': function(node, tag, id, classes, attributes, pseudos, classList) { //this element
    if ((tag == '*') && !id && !classes && !attributes) return this.push(node, null, null, null, null, pseudos);
    else return this['combinator: '](node, tag, id, classes, attributes, pseudos, classList)
  },

  '$$': function(node, tag, id, classes, attributes, pseudos, classList) { //this element document
    if ((tag == '*') && !id && !classes && !attributes) return this.push(this.document.body, null, null, null, null, pseudos);
    else return this['combinator: '](this.document.body, tag, id, classes, attributes, pseudos, classList);
  },
  
  '::': function(node, tag, id, classes, attributes, pseudos) {
    var found = this.found;
    var value = this.getPseudoElementsByName(node, tag, id, classes, attributes, pseudos);
    this.found = found;
    if (value)
      for (var i = 0, element, result = [], ary = (value.length == null) ? [value] : value; element = ary[i]; i++)
        this.push(element, '*', id, classes, attributes);
  }
};

Combinators['&'] = Combinators['$'];
Combinators['&&'] = Combinators['$$'];
for (var combinator in Combinators) 
  if (combinator != '::') Combinators[combinator + '::'] = Combinators['::'];

for (name in Combinators) Slick.defineCombinator(name, Combinators[name]);

LSD.Module.Selectors.Features = {
  brokenStarGEBTN: false,
  starSelectsClosedQSA: false,
  idGetsName: false,
  brokenMixedCaseQSA: false,
  brokenGEBCN: false,
  brokenCheckedQSA: false,
  brokenEmptyAttributeQSA: false,
  isHTMLDocument: false,
  nativeMatchesSelector: false,
  documentSorter: function(a, b) {
    if (!a.sourceIndex || !b.sourceIndex) return 0;
		return a.sourceIndex - b.sourceIndex;
  },
  hasAttribute: function(node, attribute) {
    return (attribute in node.attributes) || ((attribute in node.$states) && (attribute in node.pseudos))
  },
  getAttribute: function(node, attribute) {
    return node.attributes[attribute] || ((attribute in node.$states) || node.pseudos[attribute]);
  },
  getPseudoElementsByName: function(node, name, id, classes, attributes, pseudos) {
    var collection = node.getPseudoElementsByName ? node.getPseudoElementsByName(name, id, classes, attributes, pseudos) : node[name];
    return collection ? (collection.push ? collection : [collection]) : [];
  }
};

}();
/*
---
 
script: Actions.js
 
description: Assign functions asyncronously to any widget
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin

requires:
  - LSD.Module
  - LSD.Action

provides: 
  - LSD.Module.Actions
 
...
*/

LSD.Module.Actions = new Class({
  options: {
    actions: {}
  },
  
  constructors: {
    actions: function() {
      this.actions = {}
    }
  },
  
  addAction: function() {
    this.getAction.apply(this, arguments).attach(this);
  },
  
  removeAction: function() {
    this.getAction.apply(this, arguments).detach(this);
  },
  
  getAction: function(name, action) {
    return this.actions[name] || (this.actions[name] = new (LSD.Action[LSD.capitalize(name)] || LSD.Action)(action, name))
  },
  
  getActionState: function(action, args, state, revert) {
    if (state == null) {
      if (action.options.getState) state = action.options.getState.apply(action, args);
      else state = true; //enable things by default
    }
    return !!((state && state.call ? state.apply(this, args) : state) ^ revert);
  }
});

LSD.Module.Actions.attach = function(doc) {
  LSD.Mixin.each(function(mixin, name) {
    var selector = mixin.prototype.behaviour;
    if (!selector) return;
    var attached = {};
    var watcher = function (widget, state) {
      if (state) {
        if (attached[widget.lsd]) return;
        else attached[widget.lsd] = true;
        widget.mixin(mixin, true);
      } else if (attached[widget.lsd]) {
        delete attached[widget.lsd];
        widget.unmix(mixin, true);
      }
    };
    selector.split(/\s*,\s*/).each(function(bit) {
      doc.watch(bit, watcher)
    })
  });
};

LSD.Options.actions = {
  add: 'addAction',
  remove: 'removeAction',
  iterate: true
};
/*
---
 
script: Chain.js
 
description: A dynamic state machine with a trigger
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin

requires:
  - LSD.Module.Actions

provides: 
  - LSD.Module.Chain
 
...
*/

!function() {

LSD.Module.Chain = new Class({
  constructors: {
    chain: function() {
      this.chains = {};
      this.chainPhase = -1;
      this.chainPhasing = [];
    }
  },
  
  addChain: function(name, chain) {
    if (!chain.name) chains = name;
    this.chains[name] = chain;
  },
  
  removeChain: function(name, chain) {
    if (this.chains[name] == chain) delete this.chains[name];
  },
  
  getActionChain: function() {
    var actions = [];
    for (var name in this.chains) {
      var chain = this.chains[name]
      var action = (chain.indexOf ? this[chain] : chain).apply(this, arguments);
      if (action) actions.push[action.push ? 'apply' : 'call'](actions, action);
    }
    return actions.sort(function(a, b) {
      return (b.priority || 0) - (a.priority || 0);
    });
  },
  
  callChain: function() {
    return this.eachLink('regular', arguments, true)
  },
  
  uncallChain: function() {
    return this.eachLink('regular', arguments, false, true);
  },
  
  eachLink: function(filter, args, ahead, revert, target) {
    if (filter && filter.indexOf) filter = Iterators[filter];
    if (args != null && !args.push) args = LSD.slice(args); 
    
    var chain = this.currentChain || (this.currentChain = this.getActionChain.apply(this, args));
    if (!chain.length) return this.clearChain();
    var index = this.chainPhase;
    if (ahead) index += +ahead;
    if (ahead == 1 && index == chain.length) {
      this.clearChain();
      index = 0;
    }
    var action, phases = revert ? revert.length ? revert : this.chainPhasing : [];
    for (var link; link = chain[index]; index += (revert ? -1 : 1)) {
      action = link.action ? this.getAction(link.action) : null;
      if (filter) {
        var filtered = filter.call(this, link, chain, index);
        if (filtered == null) return phases;
        else if (filtered === false) continue;
      };
      if (action) {
        if (revert) {
          var last = phases.getLast();
          if (last && last.asynchronous && last.index < this.chainPhase) break;
          phases.pop();
          if (!phases.length) revert = true;
        }
        var result = this.execute(link, args, last ? last.state : null, last ? true : revert, index - this.chainPhase);
        if (link.keep === true) args = null;
      } else if (!revert) {
        if (link.arguments != null) args = link.arguments;
        if (link.callback) link.callback.apply(this, args);
      }
      if (!revert) phases.push({index: index, state: result, asynchronous: result == null, action: link.action});
      if (action && result == null) break; //action is asynchronous, stop chain
    }
    if (index >= chain.length) index = chain.length - 1;
    if (index > -1) {
      this.chainPhase = index;
      if (!revert) this.chainPhasing.push.apply(this.chainPhasing, phases);
    } else this.clearChain();
    return phases;
  },
  
  clearChain: function() {
    this.chainPhase = -1;
    this.chainPhasing = [];
    delete this.currentChain;
    return this;
  },
    
  execute: function(command, args, state, revert, ahead) {
    if (command.call && (!(command = command.apply(this, args))));
    else if (command.indexOf) command = {action: command}
    var action = this.getAction(command.action);
    var targets = command.target;
    if (targets && targets.call && (!(targets = targets.call(this)) || (targets.length === 0))) return true;
    if (command.arguments != null) {
      var cargs = command.arguments && command.arguments.call ? command.arguments.call(this) : command.arguments;
      args = [].concat(cargs == null ? [] : cargs, args || []);
    }
    if (state == null && command.state != null) state = command.state;
    var promised = [], succeed = [], failed = [], self = this;
    var perform = function(target) {
      var value = self.getActionState(action, [target].concat(args), state, revert);
      var method = value ? 'commit' : 'revert';
      var result = action[method](target, args);
      if (result && result.callChain && (command.promise !== false)) {
        if (value) var phases = self.eachLink('success', arguments, ahead + 1);
        promised.push(result);
        // waits for completion
        var callback = function(args, state) {
          (state ? succeed : failed).push([target, args]);
          result.removeEvents(events);
          // Try to fork off execution if action lets so 
          if (state && (self != target) && command.fork) {
            if (target.chainPhase == -1) target.callChain.apply(target, args);
            else target.eachLink('optional', args, true);
          };
          if (failed.length + succeed.length != promised.length) return;
          if (failed.length) self.eachLink('alternative', args, true, false, succeed);
          if (self.currentChain && self.chainPhase < self.currentChain.length - 1)
            if (succeed.length) self.eachLink('regular', args, true, false, succeed);
        }
        var events = {
          complete: function() {
            callback(arguments, true);
          },
          cancel: function() {
            self.eachLink('success', arguments, ahead + phases.length - 1, phases || true);
            self.eachLink('failure', arguments, ahead + 1);
            callback(arguments, false);
          }
        }
        // If it may fail, we should not simply wait for completion
        if (result.onFailure) {
          events.failure = events.cancel;
          events.success = events.complete;
          delete events.complete;
        }
        result.addEvents(events);
        return;
      } else if (result === false) return;
      return value;
    };
    action.invoker = this;
    var ret = (targets) ? (targets.map ? targets.map(perform) : perform(targets)) : perform(this);
    delete action.invoker;
    return (ret && ret.push) ? ret[0] : ret;
  }
});

var Iterators = LSD.Module.Chain.Iterators = {
  regular: function(link) {
    if (!link.action) return true;
    switch (link.keyword) {
      case 'or': case 'and': return false;
      default: return true;
    }
  },
  
  optional: function(link) {
    return link.priority == null || link.priority < 0;
  },
  
  success: function(link, chain, index) {
    if (!link.action) return false;
    if (index < chain.length - 1 && link.keyword == 'and') return true;
  },
  
  failure: function(link, chain, index) {
    if (!link.action) return false;
    switch (link.keyword) {
      case 'or': return true;
      case 'and':
        for (var i = index, other; other = chain[--i];) 
          switch (other.keyword) {
            case "or": return true;
            case "and": continue;
            default: break;
          }
        for (var i = index, other; other = chain[++i];) 
          switch (other.keyword) {
            case "or": return false;
            case "and": continue;
            default: break;
          }
    }
  },
  
  alternative: function(link, chain, index) {
    if (!link.action) return false;
    switch (link.keyword) {
      case 'else': return true;
      case 'and': case 'or': case 'then':
        for (var i = index, other; other = chain[++i];)
          switch (other.keyword) {
            case 'else': return true;
            case 'and': case 'or': continue;
            default: return;
          }
    }
  }
}

LSD.Options.chain = {
  add: 'addChain',
  remove: 'removeChain',
  iterate: true
}

}();
/*
---
 
script: Attributes.js
 
description: A mixin that adds support for setting attributes, adding and removing classes and pseudos
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Module
  - LSD.Object
  - Core/Slick.Parser
 
provides: 
  - LSD.Module.Attributes
 
...
*/

LSD.Module.Attributes = new Class({
  constructors: {
    attributes: function() {
      var self = this;
      this.pseudos = (new LSD.Object).addEvent('change', function(name, value, state) {
        self.fireEvent('selectorChange', ['pseudos', name, state]);
        if (self.$states[name]) self.setStateTo(name, state);
      });
      this.classes = (new LSD.Object).addEvent('change', function(name, value, state) {
        self.fireEvent('selectorChange', ['classes', name, state]);
        if (LSD.States.Known[name]) self.setStateTo(name, state);
        if (self.element) self.element[state ? 'addClass' : 'removeClass'](name);
      });
      this.attributes = (new LSD.Object).addEvent('change', function(name, value, state) {
        self.fireEvent('selectorChange', ['attributes', name, state]);
        if (LSD.States.Attributes[name]) self.setStateTo(name, state);
        if (self.element && (name != 'type' || LSD.toLowerCase(self.element.tagName) != 'input')) {
          if (state) self.element.setAttribute(name, value);
          else self.element.removeAttribute(name);
          if (LSD.Attributes.Boolean[name]) self.element[name] = state;
        }
      }).addEvent('beforechange', function(name, value, state) { 
        self.fireEvent('selectorChange', ['attributes', name, state]);
      });
      this.dataset = new LSD.Object;
    }
  },
  
  getAttribute: function(attribute) {
    switch (attribute) {
      case "class":           return this.classes.join(' ');
      case "slick-uniqueid":  return this.lsd;
      default:                return this.attributes[attribute];
    }
  },

  setAttribute: function(name, value) {
    if (!LSD.Attributes.Numeric[name]) {
      var logic = LSD.Attributes.Setter[name];
      if (logic) logic.call(this, value)
    } else value = value.toInt();
    if (name.substr(0, 5) == 'data-') {
      this.dataset.set(name.substring(5), value);
    } else {
      if (this.options && this.options.interpolate)
        value = LSD.Interpolation.attempt(value, this.options.interpolate) || value;
      this.attributes.set(name, value);
    }
    return this;
  },
  
  removeAttribute: function(name) {
    if (name.substr(0, 5) == 'data-') {
      delete this.dataset.unset(name.substring(5));
    } else this.attributes.unset(name)
    return this;
  },
  
  addPseudo: function(name){
    this.pseudos.set(name, true);
    return this;
  },

  removePseudo: function(name) {
    this.pseudos.unset(name);
    return this;
  },
  
  addClass: function(name) {
    this.classes.set(name, true);
    return this;
  },

  removeClass: function(name){
    this.classes.unset(name);
    return this;
  },
  
  hasClass: function(name) {
    return this.classes[name]
  },
  
  setState: function(name) {
    var attribute = LSD.States.Attributes[name];
    if (attribute) this.setAttribute(attribute, attribute)
    else this.addClass(LSD.States.Known[name] ? name : 'is-' + name);
    this.addPseudo(name);
    return this;
  },
  
  unsetState: function(name) {
    var attribute = LSD.States.Attributes[name];
    if (attribute) this.removeAttribute(attribute);
    else this.removeClass(LSD.States.Known[name] ? name : 'is-' + name);
    this.removePseudo(name);
    return this;
  },
  
  getSelector: function(){
    var parent = this.parentNode;
    var selector = (parent && parent.getSelector) ? parent.getSelector() + ' ' : '';
    selector += this.tagName;
    if (this.attributes.id) selector += '#' + this.attributes.id;
    for (var klass in this.classes)  if (this.classes.hasProperty(klass))  selector += '.' + klass;
    for (var pseudo in this.pseudos) if (this.pseudos.hasProperty(pseudo)) selector += ':' + pseudo;
    for (var name in this.attributes) if (this.attributes.hasProperty(name))
      if (name != 'id') selector += '[' + name + '=' + this.attributes[name] + ']';
    return selector;
  },
  
  onStateChange: function(state, value, args) {
    var args = Array.prototype.slice.call(arguments, 0);
    args.slice(1, 2); //state + args
    this[value ? 'setState' : 'unsetState'][args && ("length" in args) ? 'apply' : 'call'](this, args);
    this.fireEvent('stateChange', [state, args]);
    return true;
  }
});

LSD.Attributes.Setter = {
  'id': function(id) {
    this.id = id;
  },
  'class': function(value) {
    value.split(' ').each(this.addClass.bind(this));
  },
  'style': function(value) {
    value.split(/\s*;\s*/).each(function(definition) {
      var bits = definition.split(/\s*:\s*/)
      if (!bits[1]) return;
      bits[0] = bits[0].camelCase();
      var integer = bits[1].toInt();
      if (bits[1].indexOf('px') > -1 || (integer == bits[1])) bits[1] = integer
      //this.setStyle.apply(this, bits);
    }, this);
  }
};

Object.append(LSD.Options, {
  attributes: {
    add: 'setAttribute',
    remove: 'removeAttribute',
    iterate: true
  },
  pseudos: {
    add: 'addPseudo',
    remove: 'removePseudo',
    iterate: true
  },
  classes: {
    add: 'addClass',
    remove: 'removeClass',
    iterate: true
  }
});

/*
---
 
script: Events.js
 
description: A mixin that adds support for declarative events assignment
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Module
  - Core/Events
  - Core/Element.Event
  - More/Element.Delegation
  - More/Events.Pseudos
  - Ext/Element.Properties.widget

provides:
  - LSD.Module.Events

...
*/

!function() {
  
LSD.Module.Events = new Class({
  Implements: window.Events
});

var proto = window.Events.prototype;
var Events = Object.append(LSD.Module.Events, {
  bindEvents: function(events, bind, args) {
    var result = {};
    for (var name in events) {
      var value = events[name];
      if (!value || value.call) result[name] = value;
      else if (value.indexOf) result[name] = Events.bindEvent.call(this, value, bind, args);
      else result[name] = Events.bindEvents.call(this, value);
    }
    return result;
  },
  
  bindEvent: function(name, bind, args) {
    if (name.map) {
      var args = name.slice(1);
      name = name[0];
    }
    if (!this.$bound) this.$bound = {};
    if (!this.$bound[name]) this.$bound[name] = Events.bind(name, bind || this, args);
    return this.$bound[name];
  },
  
  setStoredEvents: function(events, state, bind) {
    var target = Events.Targets[name];
    for (var event in events)
      for (var i = 0, fn, group = events[event]; fn = group[i++];)
        Events.setEvent.call(this, event, (fn.indexOf && bind ? bind.bindEvent(fn) : fn), !state);
  },
  
  watchEventTarget: function(name, fn) {
    var target = Events.Targets[name];
    if (target.events) Object.each(target.events, function(state, event) {
      Events.setEvent.call(this, event, function(object) {
        if (target.getter === false) object = this;
        fn.call(this, object, state);
      });
    }, this);
    if (target.condition && target.condition.call(this)) fn.call(this, this, true);
    else if (target.getter && this[target.getter]) fn.call(this, this[target.getter], true);
  },
  
  setEvent: function(name, fn, revert) {
    if (fn.indexOf && this.lsd) fn = this.bindEvent(fn);
    if (fn.call || (fn.indexOf && !this.lsd)) {
      if (!revert) {
        if (!this.$events) this.$events = {};
        var method = 'addEvent';
      } else var method = 'removeEvent'
      var kicker = this[method];
      if (!kicker || kicker.$origin == Events[method]) kicker = proto[method];
      return kicker.call(this, name, fn);
    } else {
      if (name.charAt(0) == '_') {
        for (var event in fn) Events.setEvent.call(this, event, fn[event], revert);
        return this;
      }
      if (!revert && !this.events) this.events = {};
      var events = this.events[name], initial = !events;
      if (!events) events = this.events[name] = {};
      var bound = this.lsd ? this.bindEvents(fn) : fn;
      for (event in bound) {
        var group = (events[event] || (events[event] = []));
        if (revert) {
          var i = group.indexOf(bound[event]);
          if (i > -1) group.slice(i, 1);
        } else group.push(bound[event])
      }
      var target = Events.Targets[name];
      if (target)
        if (target.call) {
          if ((target = target.call(this))) 
            for (var event in bound) Events.setEvent.call(target, event, bound[event], revert);
        } else {
          if (initial && !target.registers) {
            Events.watchEventTarget.call(this, name, function(object, state) {
              Events.setStoredEvents.call(object, events, state, this);
            })
          }
          if (target.getter && this[target.getter]) this[target.getter][revert ? 'removeEvents' : 'addEvents'](bound);
        }
      return this;
    }
  },
  
  setEvents: function(events, revert) {
    for (var type in events) Events.setEvent.call(this, type, events[type], revert);
    return this;
	},
	
  addEvent: function(name, fn) {
    return Events.setEvent.call(this, name, fn);
  },
  
  addEvents: function(events) {
    for (var type in events) Events.setEvent.call(this, type, events[type]);
    return this;
  },
  
  removeEvent: function(name, fn) {
    return Events.setEvent.call(this, name, fn, true);
  },
  
  removeEvents: function(events) {
    for (var type in events) Events.setEvent.call(this, type, events[type], true);
    return this;
  },
  
  setEventsByRegister: function(name, state, events) {
    var register = this.$register;
    if (!register) register = this.$register = {};
    if (register[name] == null) register[name] = 0;
    switch (register[name] += (state ? 1 : -1)) {
      case 1:
        if (events) this.addEvents(events)
        else if (this.events) Events.setStoredEvents.call(this, this.events[name], true);
        return true;
      case 0:
        if (events) this.removeEvents(events)
        else if (this.events) Events.setStoredEvents.call(this, this.events[name], false);
        return false;
    }
  },
  
  fireEvent: function(type, args, delay){
    var events = this.$events[type];
    if (!events) return this;
    for (var i = 0, j = events.length, fn; i < j; i++) {
      if (!(fn = events[i])) continue;
      if (fn.indexOf) fn = this[fn];
      if (!delay) {
        if (!method) var method = Type.isEnumerable(args) ? 'apply' : 'call';
        fn[method](this, args);
      } else fn.delay(delay, this, args);
    }
    return this;
  },
  
  dispatchEvent: function(type, args){
    for (var node = this; node; node = node.parentNode) {
      var events = node.$events[type];
      if (!events) continue;
      if (!method) var method = Type.isEnumerable(args) ? 'apply' : 'call';
      for (var i = 0, j = events.length, fn; i < j; i++)
        if ((fn = events[i])) fn[method](node, args);
    }
    return this;
  },
  
  captureEvent: function(type, args) {
    var events = this.$events[type];
    if (!events) return;
    for (var i = 0, j = events.length, event; i < j; i++) {
      if (!(event = events[i])) continue;
      if (!method) var method = Type.isEnumerable(args) ? 'apply' : 'call';
      var result = event[method](this, args);
      if (result) return result;
    }
  },
  
  bind: function(method, bind, args) {
    return function() {
      if (bind[method]) return bind[method].apply(bind, args || arguments);
    }
  }
});

LSD.Module.Events.addEvents.call(LSD.Module.Events.prototype, {
  register: function(name, object) {
    var events = this.events && this.events[name];
    if (events) Events.setStoredEvents.call(object, events, true, this);
  },
  unregister: function(name, object) {
    var events = this.events && this.events[name];
    if (events) Events.setStoredEvents.call(object, events, false, this);
  }
});

/*
  Inject generic methods into the module prototype
*/
['addEvent',  'addEvents', 'removeEvent', 'removeEvents', 
 'fireEvent', 'captureEvent', 'dispatchEvent',
 'bindEvent', 'bindEvents'].each(function(method) {
  Events.implement(method, Events[method]);
});

/*
  Target system re-routes event groups to various objects.  
  
  Combine them for fun and profit.
  
  | Keyword    |  Object that recieves events       |
  |-------------------------------------------------|
  | *self*     | widget itself (no routing)         |
  | *element*  | widget element (when built)        |
  | *parent*   | parent widget                      |
  | *document* | LSD document                       |
  | *window*   | window element                     |
  
  | State      | Condition                          |
  |-------------------------------------------------|
  | *enabled*  | widget is enabled                  |
  | *disabled* | widget is disabled                 |
  | *focused*  | widget is focused                  |
  | *blured*   | widget is blured                   |
  | *target*   | first focusable parent is focused  |
  
  | Extras     | Description                        |
  |-------------------------------------------------|
  | *expected* | Routes events to widgets, selected |
  |            | by selectors (keys of event group).|
  |            | Provided by Expectations module    |
  | _\w        | An event group which name starts   |
  |            | with underscore is auto-applied    |
  
*/
Events.Targets = {
  self: function() { 
    return this
  },
  window: function() {
    return window;
  },
  mobile: function() {
    return this;
  },
  element: {
    getter: 'element',
    registers: true,
    events: {
      attach: true,
      detach: false
    }
  },
  document: {
    getter: 'document',
    registers: true,
    events: {
      setDocument: true,
      unsetDocument: false
    }
  },
  parent: {
    getter: 'parentNode',
    registers: true,
    events: {
      setParent: true,
      unsetParent: false
    }
  },
  root: {
    getter: 'root',
    registers: true,
    events: {
      setRoot: true,
      unsetRoot: false
    }
  }
};
!function(Known, Positive, Negative) {
  Object.each(Object.append({}, Positive, Negative), function(name, condition) {
    var events = {}, positive = !!Positive[name], state = Known[name];
    events[state[!positive ? 'enabler' : 'disabler']] = true;
    events[state[ positive ? 'enabler' : 'disabler']] = false;
    Events.Targets[condition] = {
      getter: false,
      condition: function() {
        return positive ^ this[state && state.property || name]
      },
      events: events
    }
  });
}(LSD.States.Known, LSD.States.Positive, LSD.States.Negative)


/*
  Defines special *on* pseudo class for events used for
  event delegation. The difference between usual event 
  delegation (which is :relay in mootools) and this, is
  that with :on you can use LSD selectors and it fires 
  callbacks in context of widgets.
  
  element.addEvent('mouseover:on(button)', callback)
*/

Event.definePseudo('on', function(split, fn, args){
  var event = args[0];
  var widget = Element.get(event.target, 'widget');
  if (widget && widget.match(split.value)) {
    fn.call(widget, event, widget, event.target);
    return;        
  }
});

LSD.Options.events = {
  add: 'addEvent',
  remove: 'removeEvent',
  iterate: true
};

Class.Mutators.$events = function(events) {
  var category = this.prototype.$events || (this.prototype.$events = {});
  for (name in events) {
    var type = category[name] || (category[name] = []);
    type.push.apply(type, events[name]);
  }
};

Class.Mutators.events = function(events) {
  var category = this.prototype.events || (this.prototype.events = {});
  for (label in events) {
    var group = events[label];
    var type = category[label] || (category[label] = {});
    for (var name in group) {
      var stored = type[name] || (type[name] = []);
      var value = group[name];
      stored.push.apply(stored, group[name]);
    }
  }
};


}();
/*
---
 
script: Expectations.js
 
description: A trait that allows to wait for related widgets until they are ready
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Module
  - LSD.Module.Events
  - LSD.Module.Attributes

provides: 
  - LSD.Module.Expectations
 
...
*/

!function() {
  
var Expectations = LSD.Module.Expectations = new Class({
  
  constructors: {
    expectations: function() {
      if (!this.expectations) this.expectations = {tag: {}}
    }
  },
  
  getElementsByTagName: function(tag) {
    return (this.expectations.tag && this.expectations.tag[LSD.toLowerCase(tag)]) || [];
  },
  
  /*
    Expect processes a single step in a complex selector.
    
    Each of those bits (e.g. strong.important) consists 
    pieces that can not be cnahged in runtime (tagname)
    and other dynamic parts (classes, pseudos, attributes).
    
    The idea is to split the selector bit to static and dynamic
    parts. The widget that is *expect*ing the selector, groups
    his expectations by tag name. Every node inserted into
    that element or its children will pick up expectations
    related to it, thus matching static part of a selector
    - tag name and combinator. 
    
    It's only a matter of matching a dynamic part then. 
    - classes, pseudos and attributes.
  */
  expect: function(selector, callback, self) {
    if (selector.indexOf) selector = Slick.parse(selector);
    if (selector.expressions) selector = selector.expressions[0][0];
    if (!this.expectations) this.expectations = {};
    var id = selector.id, combinator = selector.combinator;
    switch (combinator) {
      case '&':
        self = true;
        break;
      case '&&':
        return Expectations.setRootExpectation.call(this, selector, callback, true);
    }
    var index = self ? 'self' : (combinator == ' ' && id) ? 'id' : combinator || 'self'; 
    var expectations = this.expectations[index];
    if (!expectations) expectations = this.expectations[index] = {};
    if (selector.combinator && !self) {
      /*
        Given selector has combinator.
        Finds related elements and passes expectations to them.
      */
      if (!selector.structure) {
        var separated = separate(selector);
        selector.structure = { Slick: true, expressions: [[separated.structure]] }
        if (separated.state) selector.state = separated.state;
      }
      var key = (index == 'id') ? id : selector.tag;
      var group = expectations[key];
      if (!group) group = expectations[key] = [];
      group.push([selector, callback]);
      var state = selector.state;
      if (this.document && this.document.documentElement) this.getElements(selector.structure).each(function(widget) {
        if (state) widget.expect(state, callback);
        else callback(widget, true);
      });
    } else {
      /*
        Selector without combinator,
        depends on state of current widget.
      */
      for (var types = ['pseudos', 'classes', 'attributes'], type, i = 0; type = types[i++];) {
        var values = selector[type];
        if (values) values: for (var j = 0, value; (value = values[j++]) && (value = value.key || value.value);) {
          var kind = expectations[type];
          if (!kind) kind = expectations[type] = {};
          var group = kind[value];
          if (!group) group = kind[value] = [];
          for (var k = group.length, expectation; expectation = group[--k];) if (expectation[0] == selector) continue values;
          group.push([selector, callback]);
        }
      }
      if (this.tagName && this.match(selector)) callback(this, true);
    }
  },
  
  unexpect: function(selector, callback, self, iterator) {
    if (selector.indexOf) selector = Slick.parse(selector);
    if (selector.expressions) selector = selector.expressions[0][0];
    if (iterator === true) iterator = function(widget) {
      if (widget.match(selector)) callback(widget, false);
    };
    
    var id = selector.id, combinator = selector.combinator;
    switch (combinator) {
      case '&':
        self = true;
        break;
      case '&&':
        return Expectations.setRootExpectation.call(this, selector, callback, false);
    }
    if (combinator && !self) {
      var id = selector.id;
      var index = (combinator == ' ' && id) ? 'id' : combinator;
      remove(this.expectations[index][index == 'id' ? id : selector.tag], callback);
      if (this.document) this.getElements(selector.structure).each(function(widget) {
        if (selector.state) widget.unexpect(selector.state, callback);
        if (iterator) iterator(widget)
      });
    } else {
      if (iterator) iterator(this);
      for (var types = ['pseudos', 'classes', 'attributes'], type, i = 0; type = types[i++];) {
        var bits = selector[type], group = this.expectations.self[type];
        if (bits) for (var j = 0, bit; bit = bits[j++];) remove(group[bit.key || bit.value], callback);
      }
    }
  },
  
  watch: function(selector, callback, depth) {
    if (selector.indexOf) selector = Slick.parse(selector);
    if (!depth) depth = 0;
    selector.expressions.each(function(expressions) {
      var watcher = function(widget, state) {
        if (expressions[depth + 1]) widget[state ? 'watch' : 'unwatch'](selector, callback, depth + 1)
        else callback(widget, state)
      };
      watcher.callback = callback;
      this.expect(expressions[depth], watcher);
    }, this);
  },
  
  unwatch: function(selector, callback, depth) {
    if (selector.indexOf) selector = Slick.parse(selector);
    if (!depth) depth = 0;
    selector.expressions.each(function(expressions) {
      this.unexpect(expressions[depth], callback, false, function(widget) {
        if (expressions[depth + 1]) widget.unwatch(selector, callback, depth + 1)
        else callback(widget, false)
      });
    }, this);
  },
  
  use: function() {
    var selectors = Array.flatten(arguments);
    var widgets = []
    var callback = selectors.pop();
    var unresolved = selectors.length;
    selectors.each(function(selector, i) {
      var watcher = function(widget, state) {
        if (state) {
          if (!widgets[i]) {
            widgets[i] = widget;
            unresolved--;
            if (!unresolved) callback.apply(this, widgets.concat(state))
          }
        } else {
          if (widgets[i]) {
            if (!unresolved) callback.apply(this, widgets.concat(state))
            delete widgets[i];
            unresolved++;
          }
        }
      }
      this.watch(selector, watcher)
    }, this)
  }
});

Expectations.setRootExpectation = function(exp, callback, state) {
  if (state) {
    var finder = function(widget, state) {
      if (exp.tag == '*' && !exp.classes && !exp.attributes) {
        if (state) widget.expect({combinator: ' ', pseudos: exp.pseudos}, callback, true);
        else widget.unexpect({combinator: ' ', pseudos: exp.pseudos}, callback, true, function(widget) {
          callback(widget, false);
        })
      } else {
        var expression = {combinator: ' ', tag: exp.tag, classes: exp.classes, pseudos: exp.pseudos, attributes: exp.attributes};
        widget[state ? 'expect' : 'unexpect'](expression, callback);
      }
    };
    finder.callback = callback;
    return this.expect('::root', finder);
  } else {
    return this.unexpect('::root', callback);
  }
};

var check = function(type, value, state, target) {
  var expectations = this.expectations
  if (!target) {
    expectations = expectations.self;
    target = this;
  }
  expectations = expectations && expectations[type] && expectations[type][value];
  if (expectations) for (var i = 0, expectation; expectation = expectations[i++];) {
    var selector = expectation[0];
    if (selector.structure && selector.state) {
      if (target.match(selector.structure)) {
        if (!state) {
          if (target.match(selector.state)) {
            target.unexpect(selector.state, expectation[1]);
            expectation[1](target, !!state)
          }
        } else target.expect(selector.state, expectation[1])
      }
    } else if (target.match(selector)) expectation[1](target, !!state)
  }
}

var notify = function(type, tag, state, widget, single) {
  check.call(this, type, tag, state, widget);
  if (!single) check.call(this, type, '*', state, widget);
}

var update = function(widget, tag, state, single) {
  notify.call(this, ' ', tag, state, widget, single);
  var options = widget.options, id = widget.id;
  if (id) check.call(this, 'id', id, state, widget);
  if (this.previousSibling) {
    notify.call(this.previousSibling, '!+', widget.tagName, state, widget, single);
    notify.call(this.previousSibling, '++', widget.tagName, state, widget, single);
    for (var sibling = this; sibling = sibling.previousSibling;) {
      notify.call(sibling, '!~', tag, state, widget, single);
      notify.call(sibling, '~~', tag, state, widget, single);
    }
  }
  if (this.nextSibling) {
    notify.call(this.nextSibling, '+',  tag, state, widget, single);
    notify.call(this.nextSibling, '++', tag, state, widget, single);
    for (var sibling = this; sibling = sibling.nextSibling;) {
      notify.call(sibling, '~',  tag, state, widget, single);
      notify.call(sibling, '~~', tag, state, widget, single);
    }
  }
  if (widget.parentNode == this) notify.call(this, '>', widget.tagName, state, widget, single);
}

var remove = function(array, callback) {
  if (array) for (var i = array.length; i--;) {
    var fn = array[i][1]; 
    if (fn == callback || fn.callback == callback) {
      array.splice(i, 1);
      break;
    }
  }
}

var separate = function(selector) {
  if (selector.state || selector.structure) return selector
  var separated = {};
  for (var criteria in selector) {
    switch (criteria) {
      case 'tag': case 'combinator': case 'id':
        var type = 'structure';
        break;
      default:
        var type = 'state';
    }
    var group = separated[type];
    if (!group) group = separated[type] = {};
    group[criteria] = selector[criteria]
  };
  return separated;
};

Expectations.events = {
  nodeInserted: function(widget) {
    var expectations = this.expectations, type = expectations.tag, tag = widget.tagName;
    if (!type) type = expectations.tag = {};
    var group = type[tag];
    if (!group) group = type[tag] = [];
    group.push(widget);
    group = type['*'];
    if (!group) group = type['*'] = [];
    group.push(widget);
    update.call(this, widget, tag, true);
  },
  nodeRemoved: function(widget) {
    var expectations = this.expectations, type = expectations.tag, tag = widget.tagName;
    if (tag) type[tag].erase(widget);
    type['*'].erase(widget);
    update.call(this, widget, tag, false);
  },
  nodeTagChanged: function(widget, tag, old) {
    var expectations = this.expectations, type = expectations.tag;
    var index = type[old].indexOf(widget);
    if (index == -1) return;
    type[old].splice(index, 1);
    update.call(this, widget, old, false);
    if (!tag) return;
    var group = type[tag];
    if (!group) group = type[tag] = [];
    group.push(widget);
    update.call(this, widget, tag, true);
  },
  relate: function(widget, tag) {
    var expectations = widget.expectations, type = expectations['!::'];
    if (!type) type = expectations['!::'] = {};
    var group = type[tag];
    if (!group) group = type[tag] = [];
    group.push(this);
    notify.call(this, '::', tag, true, widget);
  },
  unrelate: function(widget, tag) {
    notify.call(this, '::', tag, false, widget);
    widget.expectations['!::'][tag].erase(this);
  },
  setParent: function(parent) {
    notify.call(this, '!>', parent.tagName, true, parent);
    for (; parent; parent = parent.parentNode) notify.call(this, '!', parent.tagName, true, parent);
  },
  unsetParent: function(parent) {
    notify.call(this, '!>', parent.tagName, false, parent);
    for (; parent; parent = parent.parentNode) notify.call(this, '!', parent.tagName, false, parent);
  },
  selectorChange: check,
  tagChanged: function(tag, old) {
    check.call(this, 'tag', old, false);
    if (tag) check.call(this, 'tag', tag, true);
    if (old && this.parentNode && !this.removed) this.parentNode.dispatchEvent('nodeTagChanged', [this, tag, old]);
  }
};

LSD.Module.Events.addEvents.call(Expectations.prototype, Expectations.events);

LSD.Module.Events.Targets.expected = function() {
  var self = this, Targets = LSD.Module.Events.Targets;
  return {
    addEvent: function(key, value) {
      if (!self.watchers) self.watchers = {};
      self.watchers[key] = function(widget, state) {
        value = Object.append({}, value)
        for (var name in value) {
          if (typeof value[name] == 'object') continue;
          widget.addEvent(name, value[name]);
          delete value[name];
        }
        for (var name in value) {
          target = (Targets[name] || Targets.expected).call(widget);
          target[state ? 'addEvents' : 'removeEvents'](value);
          break;
        }
      };
      self.watch(key, self.watchers[key]);
    },
    removeEvent: function(key, event) {
      self.unwatch(key, self.watchers[key]);
    }
  }
};

LSD.Options.expects = {
  add: function(selector, callback) {
    this.expect(selector, callback, true);
  },
  remove: function(callback) {
    this.unexpect(selector, callback, true);
  },
  iterate: true,
  process: 'bindEvents'
};

LSD.Options.watches = Object.append({}, LSD.Options.expects, {
  add: function(selector, callback) {
    this.watch(selector, callback);
  },
  remove: function(callback) {
    this.watch(selector, callback);
  }
});

}();
/*
---
 
script: Command.js
 
description: A command getter that watches attributes to redefine command
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires: 
  - LSD.Module.Expectations
  - LSD.Command
  
provides: 
  - LSD.Mixin.Command
 
...
*/

/*
  Usually a widget that does something interactive defines command
  automatically. 
  
  The default type is 'command', but there are possible values of 
  'radio' and 'checkbox'.
  
  Type type can be changed via *options.command.type* 
  (equals to 'command-type' attribute).
  
  You can specify a command id in *command* attribute
  to link a widget to already initialized command.
*/

LSD.Mixin.Command = new Class({
  options: {
    chain: {
      commandaction: function() {
        var action = this.getCommandAction.apply(this, arguments);
        if (action) return {action: action, priority: 10}
      }
    },
    events: {
      _command: {
        'setDocument': 'getCommand'
      }
    }
  },
  
  getCommand: function() {
    if (this.command) return this.command;
    var options = Object.append(this.getCommandOptions(), this.options.command || {});
    this.command = new LSD.Command(this.document, options).attach(this);
    return this.command;
  },
  
  click: function() {
    if (this.disabled) return false;
    this.fireEvent('click', arguments);
    this.getCommand().click();
    this.callChain.apply(this, arguments);
  },
  
  setCommandType: function(type) {
    this.getCommand().setType(type);
    this.commandType = type;
  },
  
  unsetCommandType: function(type) {
    this.getCommand().unsetType(type);
    delete this.commandType
  },
  
  getCommandType: function() {
    return this.commandType || (this.pseudos.checkbox && 'checkbox') || (this.pseudos.radio && 'radio') || 'command';
  },
  
  getCommandAction: function() {
    return this.attributes.commandaction || this.options.commandAction || this.captureEvent('getCommandAction', arguments);
  },
  
  getCommandOptions: function() {
    return {id: this.lsd, name: this.attributes.name, radiogroup: this.getCommandRadioGroup(), type: this.getCommandType()};
  },
  
  getCommandRadioGroup: function() {
    return this.attributes.radiogroup || this.attributes.name || this.options.radiogroup || this.captureEvent('getCommandRadioGroup');
  }
  
});

LSD.Options.commandType = {
  add: 'setCommandType',
  remove: 'unsetCommandType'
};

LSD.Behavior.define(':command, :radio, :checkbox, [accesskey]', LSD.Mixin.Command);
/*
---
 
script: Mutations.js
 
description: Mutate elements into structures in one pass
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Module.Expectations

provides: 
  - LSD.Module.Mutations
 
...
*/

LSD.Module.Mutations = new Class({
  constructors: {
    mutations: function() {
      this.mutations = {};
    }
  },
  
  mutate: function(selector, callback, object) {
    if (selector.indexOf) selector = Slick.parse(selector);
    if (selector.expressions) selector = selector.expressions[0][0];
    if (!object) object = this.mutations;
    if (!object) object = this.mutations = {};
    var mutations = this.mutations[selector.combinator];
    if (!mutations) mutations = this.mutations[selector.combinator] = {};
    var group = mutations[selector.tag];
    if (!group) group = mutations[selector.tag] = [];
    group.push([selector, callback]);
  },
  
  unmutate: function(selector, callback, iterator) {
    if (selector.indexOf) selector = Slick.parse(selector);
    if (selector.expressions) selector = selector.expressions[0][0];
    if (iterator === true) iterator = function(widget) {
      if (widget.match(selector)) callback(widget, false);
    };
    var group = this.mutations[selector.combinator][selector.tag];
    for (var i = group.length; i--;) {
      var fn = group[i][1]; 
      if (fn == callback || fn.callback == callback) {
        group.splice(i, 1);
        break;
      }
    };
    group.push([selector, callback]);
  },
  
  addMutation: function(selector, callback) {
    if (selector.indexOf) selector = Slick.parse(selector);
    if (this.document && !this.document.building) Slick.search(this.element, selector).each(function(node) {
      var parent = LSD.Module.DOM.find(node);
      var mutated = new LSD.Widget(node, callback.indexOf ? LSD.Layout.parse(callback) : callback);
      if (parent) parent.appendChild(mutated, false)
      mutated.setDocument(this.document);
    }, this);
    selector.expressions.each(function(expressions) {
      var expression = expressions[1];
      if (expression) {
        var watcher = function(widget, state, depth) {
          if (!depth) depth = 0;
          var expression = expressions[depth + 1];
          if (expression) {
            var obj = {};
            obj[expression.tag] = [[expression, function() {
              return expressions[depth + 2] ? watcher(selector, callback, depth + 1) : callback;
            }]];
            return [expression.combinator, obj]
          } else return callback;
          watcher.callback = callback;
        };
      }
      this.mutate(expressions[0], watcher || callback);
    }, this);
  },
  
  removeMutation: function(selector, callback, depth) {
    if (selector.indexOf) selector = Slick.parse(selector);
    if (!depth) depth = 0;
    selector.expressions.each(function(expressions) {
      this.unmutate(expressions[depth], callback, function(widget) {
        if (expressions[depth + 1]) widget.unwatch(selector, callback, depth + 1)
        else callback(widget, false)
      });
    }, this);
  }
})

LSD.Options.mutations = {
  add: 'addMutation',
  remove: 'removeMutation',
  iterate: true
};
/*
---
 
script: Relation.js
 
description: An unsettable relation that dispatches options to specific widgets
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD
  - LSD.Module.Events

provides: 
  - LSD.Relation
 
...
*/

!function() {
  
LSD.Relation = function(name, origin, options) {
  this.name = name;
  this.origin = origin;
  if (this.$events) this.$events = Object.clone(this.$events);
  this.onChange = this.onChange.bind(this);
  this.options = {};
  this.$options = [];
  this.memo = {};
  this.widgets = [];
  this.target = origin;
  origin.relations[name] = this;
  if (options) this.setOptions(options);
}

LSD.Relation.prototype = Object.append({
  
  setOptions: function(options, unset) {
    this.$options[unset ? 'erase' : 'include'](options);
    var opts = Object.merge.apply(Object, [{}].concat(this.$options));
    this.lastOptions = this.options;
    this.options = opts;
    if (options.target) {
      this.target = null;
      this.memo.target = Options.target.call(this, options.target, true);
    }
    for (name in options) {
      var setter = Options[name], value = options[name];
      if (!setter || !setter.call) 
        for (var i = 0, widget; widget = this.widgets[i++];) 
          this.applyOption(widget, name, value, unset, setter);
      else this.memo[name] = setter.call(this, value, !unset, this.memo[name]);
    }
    return this;
  },
  
  applyOption: function(widget, name, value, unset, setter) {
    if (setter) {
      if (!setter.call && setter !== true) {
        if (setter.process) {
          if (setter.process.call) value = setter.process.call(this, value);
          else value = widget[setter.process](value);
        }
        var method = setter[unset ? 'remove' : 'add'];
        if (setter.iterate) {
          var length = value.length;
          if (length != null) for (var i = 0, j = value.length; i < j; i++) method.call(this, widget, value[i]);
          else for (var i in value) method.call(this, widget, i, value[i])
        } else method.call(this, widget, value);
      }
    } else {
      widget.setOption(name, value, unset);
    }
  },
  
  applyOptions: function(widget, unset) {
    for (var name in this.options)
      this.applyOption(widget, name, this.options[name], unset, Options[name]);
  },
  
  onChange: function(widget, state) {
    return this[state ? 'onFind' : 'onLose'](widget);
  },
  
  onFind: function(widget) {
    if (widget == this) return;
    this.add(widget);
    this.applyOptions(widget);
    this.fireEvent('add', widget);
    this.origin.fireEvent('relate', [widget, this.name]);
  },
  
  onLose: function(widget) {
    if (widget == this) return;
    this.origin.fireEvent('unrelate', [widget, this.name]);
    if (this.remove(widget) === false) return;
    this.fireEvent('remove', widget);
    this.applyOptions(widget, true);
  },
  
  add: function(widget) {
    if (this.options.multiple) {
      if (this.widgets.include(widget) > 1) return; 
    } else {
      this.widget = widget;
      this.widgets = [widget];
      this.origin[this.name] = widget;
    }
    delete this.empty;
    this.fireEvent('fill');
  },
  
  remove: function(widget) {
    if (this.options.multiple) {
      var index = this.widgets.indexOf(widget);
      if (index == -1) return false;
      this.widgets.splice(index, 1);
      if (this.widgets.length) return;
    } else {
      if (this.widget != widget) return false;
      delete this.widget;
      delete this.origin[this.name];
      this.widgets.splice(0, 1);
    }
    this.empty = true;
    this.fireEvent('empty');
  },
  
  proxy: function(widget) {
    if (this.widget) return this.widget.appendChild(widget);
    if (!this.proxied) {
      this.proxied = [];
      this.addEvent('fill:once', function() {
        for (var proxied; proxied = this.proxied.shift();) this.widget.appendChild(proxied);
      });
    }
    (this.proxied || (this.proxied = [])).push(widget);
  },
  
  getSource: function() {
    return this.options.source;
  }
}, Events.prototype);

var Options = LSD.Relation.Options = {
  selector: function(selector, state, memo, a) {
    if (memo) memo[0].unwatch(memo[1], this.onChange);
    if (state && this.target) {
      if (selector.call) selector = selector.call(this.origin);
      this.target.watch(selector, this.onChange);
      return [this.target, selector];
    }
  },
  
  expectation: function(expectation, state, memo) {
    if (memo) memo[0].unexpect(memo[1], this.onChange);
    if (expectation.target && (state ? !this.target : this.targeted == expectation.target))
      Options.target.call(this, expectation.target, state, this.memo.target);
    if (state && this.target) {
      if (expectation.call && !(expectation = expectation.call(this.origin))) return;
      this.target.expect(expectation, this.onChange);
      return [this.target, expectation];
    }
  },
  
  target: function(target, state, memo) {
    if (target.call) target = target.call(this.origin);
    if (this.targeted == target) return;
    this.targeted = target;
    if (memo) this.origin.removeEvents(memo);
    var setting = Targets[target];
    if (setting) {
      var relation = this, events = Object.map(setting.events, function(value, event) {
        return function(object) {
          if (value) {
            relation.target = object.nodeType == 9 ? object.body : object;
            var selector = relation.options.selector, expectation = relation.options.expectation;
            if (selector) Options.selector.call(relation, selector, true, relation.memo.selector, 1);
            if (expectation) Options.expectation.call(relation, expectation, true, relation.memo.expectation);
          }
        }
      })
      this.origin.addEvents(events);
      if (setting.getter && !this.target)
        if ((this.target = this.origin[setting.getter])) events[Object.keyOf(setting, true)](this.target);
      return events;
    } else {
      if (this.origin[target]) this.target = this.origin[target];
    }
  },
  
  mutation: function(mutation, state, memo) {
    if (memo) this.origin.removeMutation(mutation, memo);
    if (state) {
      this.origin.addMutation(mutation, this.getSource());
      return this.options.source;
    }
  },
  
  proxy: function(condition, state, memo) {
    if (state) {
      var proxy = memo || {container: this.proxy.bind(this)};
      proxy.condition = condition;
      if (!memo) this.origin.addProxy(this.name, proxy);
      return proxy;
    } else {
      this.origin.removeProxy(this.name, memo);
    }
  },

  relay: function(events, state, memo) {
    if (state) {
      var origin = this.origin, relation = this, relay = Object.map(events, function(callback, event) {
        return function(event) {
          for (var widget = Element.get(event.target, 'widget'); widget; widget = widget.parentNode) {
            if (relation.widgets.indexOf(widget) > -1) {
              callback.apply(widget, arguments);
              break;
            }
          }
        };
      });
      var fillers = {
        fill: function() { 
          origin.addEvent('element', relay)
        },
        empty: function() {
          origin.removeEvent('element', relay)
        }
      };
      this.addEvents(fillers);
      if (!this.empty) fillers.fill();
      return fillers;
    } else {
      this.removeEvents(memo);
      if (!this.empty) memo.empty();
    }
  },
  
  multiple: function(multiple, state, memo) {
    if (multiple) {
      this.origin[this.name] = this.widgets
    } else {
      delete this.origin[this.name];
    }
  },
  
  callbacks: function(events, state) {
    for (var name in events) {
      var event = events[name];
      event = event.indexOf ? this.origin.bindEvent(event) : event.bind(this.origin);
      this[state ? 'addEvent' : 'removeEvent'](name, event);
    }
  },
  
  through: function(name, state, memo) {
    return LSD.Relation.Options.selector.call(this, '::' + name + '::' + (this.options.as || this.name), state, memo)
  },
  
  traits: function(traits, state, memo) {
    Object.each(traits, function(value, key) {
      var name = key || value;  
      var trait = LSD.Relation.Traits[name];
      if (!trait) LSD.warn('Can not find LSD.Relation.Traits.' + name)
      else this.setOptions(trait, !state);
    }, this);
  },
  
  origin: function(options) {
    this.origin.setOptions(options, !state)
  },
  
  scope: function(name, state, memo) {
    if (memo) {
      for (var i = 0, widget; widget = this.widgets[i++];) memo.callbacks.remove.call(this, widget);
      this.origin.removeRelation(name, memo);
    }
    if (state) {
      var self = this, relation = this.origin.relations[name], filter;
      memo = {
        callbacks: {
          add: function(widget) {
            widget.expect((filter = self.options.filter), self.onChange, true)
          },
          remove: function(widget) {
            widget.unexpect(filter, self.onChange, true, true);
          }
        }
      };
      if (relation) for (var i = 0, widget; widget = relation.widgets[i++];) memo.callbacks.add.call(this, widget);
      this.origin.addRelation(name, memo);
      return memo;
    }
  },
  
  scopes: function(scopes, state, memo) {
    for (var scope in scopes) {
      var name = LSD.Relation.getScopeName(this.name, scope), relation = scopes[scope];
      this.origin[state ? 'addRelation' : 'removeRelation'](name, relation);
      var options = {};
      if (!relation.scope) options.scope = this.name;
      if (this.options.multiple) options.multiple = true;
      this.origin[state ? 'addRelation' : 'removeRelation'](name, options);
    }
  },
  
  states: {
    add: function(widget, states) {
      var get = states.get, set = states.set, add = states.add, lnk = states.link, use = states.use;
      if (get) for (var from in get) widget.linkState(this.origin, from, (get[from] === true) ? from : get[from]);
      if (set) for (var to in set) this.origin.linkState(widget, to, (set[to] === true) ? to : set[to]);
      if (use) for (var to in use) this.origin.addState(widget, to, (use[to] === true) ? to : use[to]);
      if (add) for (var index in add) widget.addState(index, add[index]);
      if (lnk) for (var to in lnk) widget.linkState(widget, to, (lnk[to] === true) ? to : lnk[to]);
    },
    remove: function(widget, states) {
      var get = states.get, set = states.set, add = states.add, lnk = states.link, use = states.use;
      if (get) for (var from in get) widget.unlinkState(this.origin, from, (get[from] === true) ? from : get[from]);
      if (set) for (var to in set) this.origin.unlinkState(widget, to, (set[to] === true) ? to : set[to]);
      if (use) for (var to in use) this.origin.removeState(widget, to, (use[to] === true) ? to : use[to]);
      if (add) for (var index in add) widget.removeState(index, add[index]);
      if (lnk) for (var to in lnk) widget.unlinkState(widget, to, (lnk[to] === true) ? to : lnk[to]);
    }
  },
  
  as: {
    add: function(widget, name) {
      if (!widget[name]) widget[name] = this.origin;
    },
    remove: function(widget, name) {
      if (widget[name] == this.origin) delete widget[name];
    }
  },
  
  collection: {
    add: function(widget, name) {
      (widget[name] || (widget[name] = [])).push(this.origin);
    },
    remove: function(widget, name) {
      widget[name].erase(this.origin);
    }
  },
  
  events: {
    add: function(widget, events) {
      widget.addEvents(events);
    },
    remove: function(widget, events) {
      widget.removeEvents(events);
    },
    process: function(events) {
      return this.origin.bindEvents(events);
    }
  },
  
  relations: {
    add: function(widget, name, relation) {
      widget.addRelation(name, relation);
    },
    remove: function(widget, name, relation) {
      widget.removeRelation(name, relation);
    },
    iterate: true
  },
  
  options: {
    add: function(widget, options) {
      widget.setOptions(options.call ? options.call(this.origin) : options);
    },
    remove: function(widget, options) {
      widget.setOptions(options.call ? options.call(this.origin) : options, true);
    }
  },
  
  filter: true
};

LSD.Relation.getScopeName = function(scoped) {
  return function(relation, scope, multiple) {
    var key = Array.prototype.join.call(arguments);
    return (scoped[key] || (scoped[key] = (scope + LSD.capitalize(relation))))
  }
}({});

Options.has = Object.append({
  process: function(has) {
    var one = has.one, many = has.many, relations = {};
    if (one) for (var name in one) relations[name] = one[name];
    if (many) for (var name in many) relations[name] = Object.append(many[name], {multiple: true});
    return relations;
  }
}, Options.relations);

var Traits = LSD.Relation.Traits = {};
var Targets = LSD.Module.Events.Targets;
}();
/*
---
 
script: Relations.js
 
description: Define a widget associations
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Module
  - LSD.Relation

provides: 
  - LSD.Module.Relations

...
*/

LSD.Module.Relations = new Class({
  constructors: {
    relations: function() {
      this.relations = {};
      this.related = {};
    }
  },
  
  addRelation: function(name, options) {
    if (!this.relations[name]) new LSD.Relation(name, this);
    return this.relations[name].setOptions(options);
  },
  
  removeRelation: function(name, options) {
    this.relations[name].setOptions(options, true);
    /*
      A deleted scope can remove its parent relation before relation gets to the 
      deletion of itself. No need to clean then, it's already clean 
    */
    if (this.relations[name] && !this.relations[name].$options.length) delete this.relations[name];
  }
});

LSD.Options.relations = {
  add: 'addRelation',
  remove: 'removeRelation',
  iterate: true
};

LSD.Options.has = Object.append({
  process: function(has) {
    var one = has.one, many = has.many, relations = {};
    if (one) for (var name in one) relations[name] = one[name];
    if (many) for (var name in many) relations[name] = Object.append(many[name], {multiple: true});
    return relations;
  }
}, LSD.Options.relations);

LSD.Relation.Traits = {
  selectable: {
    scopes: {
      selected: {
        filter: ':selected',
        callbacks: {
          add: function(widget) {
            if (this.setValue) this.setValue(widget);
            this.fireEvent('set', widget);
          },
          remove: function(widget) {
            if (widget.getCommandType() != 'checkbox') return;
            if (this.setValue) this.setValue(widget, true);
            this.fireEvent('unset', widget);
          }
        }
      }
    }
  },
  
  contextmenu: {
    as: 'initiator',
    tag: 'menu',
    attributes: {
      type: 'context'
    },
    proxy: function(widget) {
      return widget.pseudos.item;
    },
    states: {
      use: Array.object('collapsed'),
      set: {
        collapsed: 'hidden'
      },
      get: {
        hidden: 'collapsed'
      }
    }
  }
};

/*
---
 
script: Allocations.js
 
description: Spares a few temporal widgets or elements
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Module
  - LSD.Module.Events

provides:
  - LSD.Module.Allocations
 
...
*/

LSD.Module.Allocations = new Class({
  constructors: {
    allocations: function() {
      this.allocations = {};
    }
  },
  
  allocate: function() {
    var args = Array.prototype.slice.call(arguments);
    var last = args[args.length - 1];
    if (last == args[0] && last.type) args = [last.type, last.kind, (last = last.options)];
    if (last && !last.indexOf && !last.push) var options = args.pop();
    var type = args[0], kind = args[1];
    var allocation = LSD.Allocations[type];
    if (!allocation) return;
    var allocations = this.allocations, object;
    var opts = this.options.allocations && this.options.allocations[type];
    if (allocation.multiple) {
      var group = allocations[type] || (allocations[type] = {});
      if (kind) {
        var index = type + '-' + kind;
        var customized = LSD.Allocations[index];
        if (group[kind]) return group[kind];
      } else {
        for (var id = kind; allocations[++id];);
      }
    } else {
      if (allocations[type]) return allocations[type];
    }
    if (allocation.call) {
      allocation = allocation.apply(this, [options].concat(args));
      if (allocation.nodeType) object = allocation;
    } else {
      if (allocation.options)
        var generated = allocation.options.call ? allocation.options.call(this, options, kind) : allocation.options;
    }
    if (!object) {
      options = Object.merge({}, allocation, generated, customized, opts, options);
      delete options.multiple;
      delete options.options;
      if (options.source && options.source.call) options.source = options.source.call(this, kind, options);
      options.invoker = this;
      var parent = options.parent ? (options.parent.call ? options.parent.call(this) : option.parent) : this;
      delete options.parent;
      if (!parent.lsd) parent = [this, parent];
      object = this.buildLayout(options.source || options.tag, parent, options);
    };
    (group || allocations)[kind || id] = object;
    return object;
  },
  
  release: function(type, name, widget) {
    var allocations = this.allocations, group = allocations[type];
    if (group) {
      if (!name) name = 1;
      if (group[name]) {
        group[name].dispose();
        delete group[name];
      }
    }
  }
  
});

LSD.Module.Events.addEvents.call(LSD.Module.Allocations.prototype, {
  getRelated: function(type, id, classes, attributes, pseudos) {
    if (!LSD.Allocations[type]) return;
    var allocation = LSD.Module.Allocations.prepare(type, classes, attributes, pseudos);
    return this.allocate(allocation);
  }
});

LSD.Module.Allocations.prepare = function(type, classes, attributes, pseudos) {
  var name, kind;
  if (attributes)
    for (var i = 0, attribute; attribute = attributes[i++];) 
      (options.attributes || (options.attributes = {}))[attribute.name] = attribute.value;
  if (pseudos)
    for (var i = 0, pseudo; pseudo = pseudos[i++];) 
      switch (pseudo.key) {
        case "of-kind": case "of-type":
          kind = pseudo.value;
          break;
        case "of-name":
          name = pseudo.value;
          break;
        default:
          (options.pseudos || (options.pseudos = {}))[pseudo.key] = pseudo.value || true;
      }
  return {type: type, name: name, kind: kind}
}

LSD.Allocations = {
  
  lightbox: {
    source: 'body-lightbox',
    parent: function() {
      return document.body;
    }
  },
  
  dialog: {
    multiple: true,
    options: function(options, kind) {
      return Object.merge(
        {
          tag: 'body',
          attributes: {
            type: 'dialog'
          }
        },
        kind ? {attributes: {kind: kind}} : null,
        options
      )
    },
    parent: function() {
      return document.body;
    }
  },
  
  menu: {
    source: 'menu-context'
  },
  
  scrollbar: {
    source: 'scrollbar'
  },
  
  editor: function(options, type, name) {
    return Object.merge(
      {source: type == 'area' ? 'textarea' : ('input' + (type ? '-' + type : ''))}, 
      name ? {attributes: {name: name}} : null,
      options
    );
  },
  
  input: function(options, type, name) {
    return new Element('input', Object.merge({
      type: type || 'text',
      name: name
    }, options));
  },
  
  submit: function(options) {
    return new Element('input', Object.merge({
      type: 'submit',
      styles: {
        width: 1,
        height: 0,
        display: 'block',
        border: 0,
        padding: 0,
        overflow: 'hidden',
        position: 'absolute'
      },
      events: {
        click: function(e) {
          e.preventDefault()
        }
      }
    }, options));
  }
};
/*
---
 
script: DOM.js
 
description: Provides DOM-compliant interface to play around with other widgets
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin

requires:
  - LSD.Module
  - LSD.Module.Events

provides:
  - LSD.Module.DOM
  - LSD.Module.DOM.findDocument

...
*/

!function() {

LSD.Module.DOM = new Class({
  options: {
    nodeType: 1,
  },
  
  constructors: {
    dom: function(options) {
      this.childNodes = [];
    }
  },
  
  contains: function(element) {
    while (element = element.parentNode) if (element == this) return true;
    return false;
  },
  
  getChildren: function() {
    return this.childNodes;
  },

  getRoot: function() {
    var widget = this;
    while (widget.parentNode) widget = widget.parentNode;
    return widget;
  },
  
  moveTo: function(widget) {
    if (widget == this.parentNode) {
      unset.call(this, widget);
    } else {
      if (this.parentNode) this.dispose();
      return true;
    }
  },
  
  setParent: function(widget, index){
    if (!widget.lsd) widget = LSD.Module.DOM.find(widget);
    if (!widget) return;
    if (this.moveTo(widget)) {
      this.parentNode = widget;
      this.fireEvent('setParent', [widget, widget.document])
      var changed = true;
    }
    set.call(this, widget, index);
    if (changed) {
      this.fireEvent('register', ['parent', widget]);
      widget.fireEvent('adopt', [this]);
    }
    var previous = this.previousSibling;
    var start = previous ? (previous.sourceLastIndex || previous.sourceIndex) : widget.sourceIndex || (widget.sourceIndex = 1);
    var sourceIndex = start;
    LSD.Module.DOM.walk(this, function(node) {
      node.sourceIndex = ++sourceIndex;
      if (node.sourceLastIndex) node.sourceLastIndex += start;
      for (var parent = widget; parent; parent = parent.parentNode) {
        parent.sourceLastIndex = (parent.sourceLastIndex || parent.sourceIndex) ;
        if (!changed) continue;
        var events = parent.$events.nodeInserted;
        if (!events) continue;
        for (var i = 0, j = events.length, fn; i < j; i++)
          if ((fn = events[i])) fn.call(parent, node);
      }
    }, this);
  },
  
  unsetParent: function(widget, index) {
    if (!widget) widget = this.parentNode;
    LSD.Module.DOM.walk(this, function(node) {
      widget.dispatchEvent('nodeRemoved', node);
    });
    this.fireEvent('unregister', ['parent', widget]);
    this.removed = true;
    unset.call(this, widget, index); 
    delete this.parentNode;
    delete this.removed;
  },
  
  appendChild: function(widget, override) {
    widget.parentNode = this;
    if (!widget.quiet && (override !== false) && this.toElement()) (override || function() {
      this.element.appendChild(widget.toElement());
    }).apply(this, arguments);
    delete widget.parentNode;
    widget.setParent(this, this.childNodes.push(widget) - 1);
    delete widget.quiet;
    return true;
  },
  
  removeChild: function(child) {
    var index = this.childNodes.indexOf(child);
    if (index == -1) return false;
    child.unsetParent(this, index);
    this.childNodes.splice(index, 1);
    if (child.element && child.element.parentNode) child.element.dispose();
  },
  
  replaceChild: function(insertion, child) {
    var index = this.childNodes.indexOf(child);
    if (index == -1) return;
    this.removeChild(child);
    this.childNodes.splice(index, 0, insertion);
    insertion.setParent(this, index);
  },
  
  insertBefore: function(insertion, child) {
    var widget = LSD.Module.DOM.findNext(child);
    var index = widget && widget != this ? this.childNodes.indexOf(widget) : this.childNodes.length;
    if (index == -1) return;
    this.childNodes.splice(index, 0, insertion);
    if (!child) {
      if (index) insertion.toElement().inject(this.childNodes[index - 1].toElement(), 'after')
      else this.toElement().appendChild(insertion.toElement())
    } else this.toElement().insertBefore(insertion.toElement(), child.element || child);
    insertion.setParent(this, index);
    return this;
  },

  cloneNode: function(children, options) {
    var clone = this.context.create(this.element.cloneNode(children), Object.merge({
      source: this.source,
      tag: this.tagName,
      pseudos: this.pseudos.toObject(),
      traverse: !!children
    }, options));
    return clone;
  },
  
  setDocument: function(document, revert) {
    LSD.Module.DOM.walk(this, function(child) {
      if (revert) {
        delete child.ownerDocument;
        delete child.document;
      } else child.ownerDocument = child.document = document;
      child.fireEvent(revert ? 'unregister' : 'register', ['document', document]);
      child.fireEvent(revert ? 'unsetDocument' : 'setDocument', document);
    });
    return this;
  },
  
  unsetDocument: function(document) {
    return this.setDocument(document, true);
  },
  
  inject: function(widget, where, quiet) {
    if (!widget.lsd) {
      var instance = LSD.Module.DOM.find(widget, true)
      if (instance) widget = instance;
    }
    if (!this.pseudos.root) {
      this.quiet = quiet || (widget.documentElement && this.element && this.element.parentNode);
      if (where === false) widget.appendChild(this, false)
      else if (!inserters[where || 'bottom'](widget.lsd ? this : this.toElement(), widget) && !quiet) return false;
    }
    if (where == 'after' || where == 'before') widget = this.parentNode;
    if (quiet !== true || widget.document) this.setDocument(widget.document || LSD.document);
    if (!this.pseudos.root) this.fireEvent('inject', this.parentNode);
    return this;
  },

  grab: function(el, where){
    inserters[where || 'bottom'](document.id(el, true), this);
    return this;
  },
  
  /*
    Wrapper is where content nodes get appended. 
    Defaults to this.element, but can be redefined
    in other Modules or Traits (as seen in Container
    module)
  */
  
  getWrapper: function() {
    return this.toElement();
  },
  
  write: function(content, hard) {
    if (!content || !(content = content.toString())) return;
    var wrapper = this.getWrapper();
    if (hard && this.written) for (var node; node = this.written.shift();) Element.dispose(node);
    var fragment = document.createFragment(content);
    var written = LSD.slice(fragment.childNodes);
    if (!hard && this.written) this.written.push.apply(this.written, written);
    else this.written = written;
    wrapper.appendChild(fragment);
    this.fireEvent('write', [written, hard])
    this.innerText = wrapper.get('text').trim();
    return written;
  },

  replaces: function(el){
    this.inject(el, 'after');
    el.dispose();
    return this;
  },
  
  watchInjection: function(callback) {
    this.addEvent('setDocument', callback);
    if (this.document) callback.call(this, this.document.element)
  },
  
  unwatchInjection: function(callback) { 
    this.removeEvent('setDocument', callback);
  },
  
  onElementDispose: function() {
    if (this.parentNode) this.dispose();
  },

  dispose: function() {
    var parent = this.parentNode;
    if (!parent) return;
    this.fireEvent('beforeDispose', parent);
    parent.removeChild(this);
    this.fireEvent('dispose', parent);
    return this;
  }
});

var set = function(widget, index) {
  var siblings = widget.childNodes, length = siblings.length;
  if (siblings[0] == this) widget.firstChild = this;
  if (siblings[siblings.length - 1] == this) widget.lastChild = this;
  if (index == null) index = length - 1;
  var previous = siblings[index - 1], next = siblings[index + 1];
  if (previous) {
    previous.nextSibling = this;
    this.previousSibling = previous;
  }
  if (next) {
    next.previousSibling = this;
    this.nextSibling = next;
  }
};

var unset = function(widget, index) {
  var parent = this.parentNode, siblings = widget.childNodes;
  if (index == null) index = siblings.indexOf(this);
  var previous = siblings[index - 1], next = siblings[index + 1];
  if (previous && previous.nextSibling == this) {
    previous.nextSibling = next;
    if (this.previousSibling == previous) delete this.previousSibling;
  }
  if (next && next.previousSibling == this) {
    next.previousSibling = previous;
    if (this.nextSibling == next) delete this.nextSibling;
  }
  if (parent.firstChild == this) parent.firstChild = next;
  if (parent.lastChild == this) parent.lastChild = previous;
};

var inserters = {

  before: function(context, element){
    var parent = element.parentNode;
    if (parent) return parent.insertBefore(context, element);
  },

  after: function(context, element){
    var parent = element.parentNode;
    if (parent) return parent.insertBefore(context, element.nextSibling);
  },

  bottom: function(context, element){
    return element.appendChild(context);
  },

  top: function(context, element){
    return element.insertBefore(context, element.firstChild);
  }

};

LSD.Module.Events.addEvents.call(LSD.Module.DOM.prototype, {
  destroy: function() {
    if (this.parentNode) this.dispose();
  },
  
  element: {
    /*
      When dispose event comes from the element, 
      it is is already removed from dom
    */
    dispose: 'onElementDispose'
  }
});

Object.append(LSD.Module.DOM, {
  walk: function(element, callback, bind, memo) {
    var widget = element.lsd ? element : LSD.Module.DOM.find(element, true);
    if (widget) {
      var result = callback.call(bind || this, widget, memo);
      if (result) (memo || (memo = [])).push(widget);
    }
    for (var nodes = element.childNodes, node, i = 0; node = nodes[i]; i++) 
      if (node.nodeType == 1) LSD.Module.DOM.walk(node, callback, bind, memo); 
    return memo;
  },
  
  find: function(target, lazy) {
    return target.lsd ? target : ((!lazy || target.uid) && Element[lazy ? 'retrieve' : 'get'](target, 'widget'));
  },
  
  findNext: function(target) {
    var widget = target;
    if (widget && !widget.lsd)
      if (!target.uid || !(widget = target.retrieve('widget')))
        for (var item = target, stack = [item.nextSibling]; item = stack.pop();)
          if (item.uid && (widget = item.retrieve('widget'))) {
            break;
          } else {
            if ((widget = item.nextSibling)) stack.push(widget);
            else stack.push(item.parentNode);
          }
    return widget;
  },
  
  getID: function(target) {
    if (target.lsd) {
      return target.attributes.itemid;
    } else {
      return target.getAttribute('itemid');
    }
  }
});

}();

LSD.Options.document = {
  add: 'setDocument',
  remove: 'unsetDocument'
};
/*
---
 
script: Container.js
 
description: Makes widget use container - wrapper around content setting
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Module.DOM

provides:
  - LSD.Module.Container
 
...
*/

LSD.Module.Container = new Class({
  options: {
    container: {
      enabled: false,
      position: null,
      inline: true,
      attributes: {
        'class': 'container'
      }
    },
    
    proxies: {
      container: {
        container: function() {
          return document.id(this.getContainer()) //creates container, once condition is true
        },
        condition: function() {         //turned off by default
          return this.options.container.enabled; 
        },      
        priority: -1,                   //lowest priority
        rewrite: false                  //does not rewrite parent
      }
    }
  },
  
  getContainer: Macro.getter('container', function() {
    var options = this.options.container;
    if (!options.enabled) return;
    var tag = options.tag || (options.inline ? 'span' : 'div');
    return new Element(tag, options.attributes).inject(this.element, options.position);
  }),
  
  getWrapper: function() {
    return this.getContainer() || this.toElement();
  }
});
/*
---

script: Proxies.js

description: Dont adopt children, pass them to some other widget

license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Module.DOM

provides: 
  - LSD.Module.Proxies

...
*/
  
LSD.Module.Proxies = new Class({
  constructors: {
    proxies: function() {
      this.proxies = [];
    }
  },
  
  addProxy: function(name, proxy) {
    for (var i = 0, other; (other = this.proxies[i]) && ((proxy.priority || 0) < (other.priority || 0)); i++);
    this.proxies.splice(i, 0, proxy);
  },
  
  removeProxy: function(name, proxy) {
    this.proxies.erase(proxy);
  },
  
  proxyChild: function(child) {
    for (var i = 0, proxy; proxy = this.proxies[i++];) {
      if (!proxy.condition.call(this, child)) continue;
      var self = this;
      var reinject = function(target) {
        var where = proxy.where && proxy.where.call ? proxy.where.call(self, child) : proxy.where;
        if (proxy.rewrite === false) {
          self.appendChild(child, function() {
            target.grab(child, where);
          }, true);
        } else {
          child.inject(target, where);
        }
      };
      var container = proxy.container;
      if (container.call) {
        if ((container = container.call(this, reinject))) reinject(container);
      } else {
        this.use(container, reinject)
      }
      return true;
    }
  },
  
  appendChild: function(widget, adoption, proxy) {
    var element = widget.element || widget;
    var parent = element.parentNode;
    if (proxy !== true && !this.canAppendChild(widget)) {
      if (element == parent) {
        if (widget.parentNode) widget.dispose();
        else if (widget.element.parentNode) widget.element.dispose();
      }
      return false;
    };
    return LSD.Module.DOM.prototype.appendChild.call(this, widget, adoption);
  },
  
  canAppendChild: function(child) {
    return !this.proxyChild(child);
  }
  
});

LSD.Options.proxies = {
  add: 'addProxy',
  remove: 'removeProxy',
  iterate: true
};
/*
---
 
script: Render.js
 
description: A module that provides rendering workflow
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Module.DOM
  - LSD.Module.Events

provides: 
  - LSD.Module.Render

...
*/



LSD.Module.Render = new Class({
  options: {
    render: null
  },
  
  constructors: {
    render: function() {
      this.redraws = 0;
      this.dirty = true;
    }
  },
  
  render: function() {
    if (!this.built) this.build();
    delete this.halted;
    this.redraws++;
    this.fireEvent('render', arguments)
    this.childNodes.each(function(child){
      if (child.render) child.render();
    });
  },
  
  /*
    Update marks widget as willing to render. That
    can be followed by a call to *render* to trigger
    redrawing mechanism. Otherwise, the widget stay 
    marked and can be rendered together with ascendant 
    widget.
  */
  
  update: function(recursive) {
    if (recursive) LSD.Module.DOM.walk(this, function(widget) {
      widget.update();
    });
  },
  
  /*
    Refresh updates and renders widget (or a widget tree 
    if optional argument is true). It is a reliable way
    to have all elements redrawn, but a costly too.
    
    Should be avoided when possible to let internals 
    handle the rendering and avoid some unnecessary 
    calculations.
  */

  refresh: function(recursive) {
    this.update(recursive);
    return this.render();
  },
  

  /*
    Halt marks widget as failed to render.
    
    Possible use cases:
    
    - Dimensions depend on child widgets that are not
      rendered yet
    - Dont let the widget render when it is not in DOM
  */ 
  halt: function() {
    if (this.halted) return false;
    this.halted = true;
    return true;
  }
});

LSD.Module.Events.addEvents.call(LSD.Module.Render.prototype, {
  stateChange: function() {
    if (this.redraws > 0) this.refresh(true);
  }
});
/*
---
 
script: Shortcuts.js
 
description: Add command key listeners to the widget
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - Ext/Shortcuts
  - LSD.Module
  - LSD.Module.Events
  
provides: 
  - LSD.Module.Shortcuts

...
*/
LSD.Module.Shortcuts = new Class({
  Implements: Shortcuts,
  
  addShortcut: function() {
    LSD.Module.Events.setEventsByRegister.call(this, 'shortcuts', LSD.Module.Shortcuts.events);
    return Shortcuts.prototype.addShortcut.apply(this, arguments);
  },
  
  removeShortcut: function() {
    LSD.Module.Events.setEventsByRegister.call(this, 'shortcuts', LSD.Module.Shortcuts.events);
    return Shortcuts.prototype.removeShortcut.apply(this, arguments);
  }
});

LSD.Module.Events.addEvents.call(LSD.Module.Shortcuts.prototype, {
  focus: 'enableShortcuts',
  blur: 'disableShortcuts'
});

LSD.Options.shortcuts = {
  add: 'addShortcut',
  remove: 'removeShortcut',
  //process: 'bindEvents',
  iterate: true
};
/*
---
 
script: Element.js
 
description: Attach and detach a widget to/from element
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Module
  - LSD.Module.Events

provides: 
  - LSD.Module.Element
 
...
*/

LSD.Module.Element = new Class({
  options: {
    key: 'node',
    reusable: true,
    inline: null
  },
  
  constructors: {
    element: function() {
      LSD.uid(this);
    }
  },
  
  /*
    Attaches widget to a DOM element. If a widget was
    attached to some other element, it deattaches that first
  */
  
  attach: function(element) {
    if (element) {
      if (this.element) {
        if (this.built && this.element != element) this[this.options.reusable ? 'detach' : 'destroy']();
      } else this.element = document.id(element);
    }
    if (!this.built) this.build();
    this.fireEvent('register', ['element', this.element]);
    if (this.options.key) this.element.store(this.options.key, this).fireEvent('attach', this);
    return this.element;
  },

  detach: function(element) {
    this.fireEvent('unregister', ['element', this.element]);
    if (this.options.key) this.element.eliminate(this.options.key, this).fireEvent('detach', this)
    delete this.element;
  },
  
  toElement: function(){
    if (!this.built) this.build(this.origin);
    return this.element;
  },
  
  build: function(query) {
    if (query) {
      if (query.localName) {
        var element = query; 
        query = {};
      }
    } else query = {};
    element = query.element = element || this.element;
    var options = this.options;
    this.fireEvent('beforeBuild', query);
    if (this.parentNode) this.parentNode.dispatchEvent('beforeNodeBuild', [query, this]);
    var build = query.build;
    delete query.element, delete query.build;
    var attrs = {}
    for (var attribute in this.attributes) 
      if (this.attributes.hasProperty(attribute)) 
        attrs[attribute] = this.attributes[attribute];
    Object.merge(attrs, options.element, query.attributes);
    var tag = query.tag || attrs.tag || this.getElementTag();
    delete attrs.tag; delete query.tag;
    if (query.attributes || query.classes || query.pseudos) this.setOptions(query);
    if (!element || build) {
      this.element = new Element(tag, attrs);
    } else {
      var element = this.element = document.id(element);
      for (var name in attrs) 
        if (name != 'type' || tag != 'input') 
          element.setAttribute(name, attrs[name] === true ? name : attrs[name]);
    }
    var classes = [];
    if (this.tagName != tag) classes.push('lsd', this.tagName)
    for (var klass in this.classes) 
      if (this.classes.hasProperty(klass)) classes.include(klass)
    if (classes.length) this.element.className = classes.join(' ');

    if (this.style) for (var property in this.style.element) this.element.setStyle(property, this.style.element[property]);
    return this.element;
  },
  
  getElementTag: function(soft) {
    if (this.element) return LSD.toLowerCase(this.element.tagName);
    var options = this.options, element = options.element;
    if (element && element.tag) return element.tag;
    if (!soft) switch (options.inline) {
      case null:
        return this.tagName;
      case true:
        return "span";
      case false:
        return "div"
      default:
        return options.inline;
    }
  },
  
  destroy: function() {
    this.fireEvent('beforeDestroy');
    this.element.destroy();
    return this;
  },
  
  $family: function() {
    return this.options.key || 'widget';
  }
});

/* 
  Extracts options from a DOM element.
*/
LSD.Module.Element.extract = function(element, widget) {
  var options = {
    attributes: {},
    tag: LSD.toLowerCase(element.tagName)
  }, attrs = options.attributes;
  for (var i = 0, attribute, name; attribute = element.attributes[i++];) {
    name = attribute.name;
    attrs[name] = LSD.Attributes.Boolean[name] || attribute.value || "";
  }
  var klass = attrs['class'];
  if (klass) {
    options.classes = klass.split(/\s+/).filter(function(name) {
      switch (name.substr(0, 3)) {
        case "is-":
          if (!options.pseudos) options.pseudos = [];
          options.pseudos.push(name.substr(3, name.length - 3));
          break;
        case "id-":
          i++;
          options.attributes.id = name.substr(3, name.length - 3);
          break;
        default:
          return true;
      }
    })
    delete attrs['class'];
    i--;
  }
  if (widget) {
    if (widget.tagName) delete options.tag;
    for (var name in attrs) if (widget.attributes[name]) {
      delete attrs[name];
      i--;
    }
  }
  if (i == 1) delete options.attributes;
  return options;
}

LSD.Module.Element.events = {
  /*
    A lazy widget will not attach to element until it's built or attached
  */
  prepare: function(options, element) {
    if (options.lazy) this.origin = element;
    else if (element) this.build(element);
  },
  /*
    If a the widget was built before it was attached, attach it after the build
  */
  build: function() {
    this.attach.apply(this, arguments);
  },
  /*
    Detaches element when it's destroyed
  */
  destroy: function() {
    this.detach.apply(this, arguments);
  },
  /*
    Extracts and sets layout options from attached element
  */
  attach: function(element) {
    if (!this.extracted && this.options.extract !== false && (!this.built || this.origin)) {
      this.extracted = LSD.Module.Element.extract(element, this);
      this.setOptions(this.extracted);
    }
  },
  /*
    Unsets options previously extracted from the detached element
  */
  detach: function() {
    if (!this.extracted) return;
    this.unsetOptions(this.extracted);
    delete this.extracted, delete this.origin;
  },
  /*
    Extract options off from widget and makes it rebuild element if it doesnt fit.
  */
  beforeBuild: function(query) {
    if (!query.element) return;
    if (this.options.extract !== false || this.options.clone) {
      this.extracted = LSD.Module.Element.extract(query.element, this);
      this.setOptions(this.extracted);
      Object.merge(query, this.extracted);
    }
    var tag = this.getElementTag(true);
    if (this.options.clone || (tag && LSD.toLowerCase(query.element.tagName) != tag)) {
      this.origin = query.element;
      query.tag = tag;
      query.build = true;
    }
  }
};

LSD.Options.origin = {
  add: function(object) {
    if (object.localName) {
      if (this.built) this.attach(object);
      else this.origin = object;
    }
  },
  remove: function(object) {
    if (object.localName) {
      if (this.origin == object) {
        delete this.origin;
        if (this.attached) this.detach(object);
      }
    }
  }
};

LSD.Module.Events.addEvents.call(LSD.Module.Element.prototype, LSD.Module.Element.events);
/*
---
 
script: Dimensions.js
 
description: Get and set dimensions of widget
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Module

provides: 
  - LSD.Module.Dimensions
 
...
*/


LSD.Module.Dimensions = new Class({
  constructors: {
    dimensions: function() {
      this.size = {}
    }
  },
  
  setSize: function(size) {
    if (this.size) var old = Object.append({}, this.size)
    if (!size || !(size.height || size.width)) size = {height: this.getStyle('height'), width: this.getStyle('width')}
    if (!(this.setHeight(size.height, true) + this.setWidth(size.width, true))) return false;
    this.fireEvent('resize', [this.size, old]);
    var element = this.element, padding = this.offset.padding;
    if (size.height && this.style.expressed.height) element.style.height = size.height - padding.top - padding.bottom + 'px'
    if (size.width && this.style.expressed.width) element.style.width = size.width - padding.left - padding.right + 'px';
    return true;
  },
  
  setHeight: function(value, light) {
    value = Math.min(this.style.current.maxHeight || 1500, Math.max(this.style.current.minHeight || 0, value));
    if (this.size.height == value) return false;
    this.size.height = value;
    if (!light) this.setStyle('height', value);
    return value;
  },
    
  setWidth: function(value, light) {
    value = Math.min(this.style.current.maxWidth || 3500, Math.max(this.style.current.minWidth || 0, value));
    if (this.size.width == value) return false;
    this.size.width = value;
    if (!light) this.setStyle('width', value);
    return value;
  },
  
  getClientHeight: function() {
    var style = this.style.current, height = style.height, offset = this.offset, padding = offset.padding;
    if (!height || (height == "auto")) {
      height = this.element.clientHeight;
      var inner = offset.inner || padding;
      if (height > 0 && inner) height -= inner.top + inner.bottom;
    }
    if (height != 'auto' && padding) height += padding.top + padding.bottom;
    return height;
  },
  
  getClientWidth: function() {
    var style = this.style.current, offset = this.offset, padding = offset.padding, width = style.width;
    if (typeof width != 'number') { //auto, inherit, undefined
      var inside = offset.inside, outside = offset.outside, shape = offset.shape;
      width = this.element.clientWidth;
      if (width > 0) {
        if (shape) width -= shape.left + shape.right;
        if (inside) width -= inside.left + inside.right;
        if (outside) width -= outside.left + outside.right;
      }
    }
    if (style.display != 'block' && padding && inside) width += padding.left + padding.right;
    return width;
  },
  
  getOffsetHeight: function(height) {
    var style = this.style.current, inside = this.offset.inside, bottom = style.borderBottomWidth, top = style.borderTopWidth;
    if (!height) height =  this.getClientHeight();
    if (inside)  height += inside.top + inside.bottom;
    if (top)     height += top;
    if (bottom)  height += bottom;
    return height;
  },
  
  getOffsetWidth: function(width) {
    var style = this.style.current, inside = this.offset.inside, left = style.borderLeftWidth, right = style.borderRightWidth;
    if (!width) width =  this.getClientWidth();
    if (inside) width += inside.left + inside.right;
    if (left)   width += left;
    if (right)  width += right
    return width;
  },
  
  getLayoutHeight: function(height) {
    height = this.getOffsetHeight(height);
    if (this.offset.margin)  height += this.offset.margin.top + this.offset.margin.bottom;
    if (this.offset.outside) height += this.offset.outside.top + this.offset.outside.bottom;
    return height;
  },

  getLayoutWidth: function(width) {
    var width = this.getOffsetWidth(width), offset = this.offset, margin = offset.margin, outside = offset.outside
    if (margin)  width += margin.right + margin.left;
    if (outside) width += outside.right + outside.left;
    return width;
  }
  
});
/*
---
 
script: Options.js
 
description: A module that sets and unsets various options stuff
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Module
  
provides:
  - LSD.Module.Options

...
*/

LSD.Module.Options = new Class({
  Implements: [Options],
  
  setOptions: function(options) {
    for (var name in options) LSD.Module.Options.setOption.call(this, name, options[name]);
    return this;
  },
  
  unsetOptions: function(options) {
    for (var name in options) LSD.Module.Options.setOption.call(this, name, options[name], true);
    return this;
  },
  
  construct: function(object) {
    if (!object) object = this;
    var initialized = object.$initialized = [];
    /*
      Run module constructors and keep returned values
    */
    for (var name in object.constructors) {
      var initializer = object.constructors[name];
      if (initializer) {
        var result = initializer.call(this, object.options);
        if (result) initialized.push(result);
      }
    }
    /*
      Set options returned from constructors
    */
    for (var i = 0, value; value = initialized[i++];) this.setOptions(value);
    return object.options;
  },
  
  destruct: function(object) {
    if (!object) object = this;
    var initialized = object.$initialized;
    if (initialized)
      for (var i = 0, value; value = initialized[i++];) this.unsetOptions(value);
    return object.options;
  }
});

LSD.Module.Options.setOption = function(name, value, unset, context) {
  setter = (context || LSD.Options)[name];
  if (!setter) {
    Object.merge(this.options, name, value);
    return this;
  };
  if (setter.process) {
    value = (setter.process.charAt ? this[setter.process] : setter.process).call(this, value);
  }
  if (setter.events) LSD.Module.Events.setEventsByRegister.call(this, name, !unset, setter.events);
  var mode = unset ? 'remove' : 'add', method = setter[mode];
  if (method.charAt) method = this[method];
  if (setter.iterate) {
    if (value.each) {
      var length = value.length;
      if (length != null) for (var i = 0, j = value.length; i < j; i++) method.call(this, value[i]);
      else value.each(method, this);
    } else for (var i in value) method.call(this, i, value[i])
  } else method.call(this, value);
  return this;
};

LSD.Module.Options.implement('setOption', LSD.Module.Options.setOption);

LSD.Module.Options.initialize = function(element, options) {
  // Swap arguments if they are in the wrong order
  if ((element && !element.localName) || (options && options.localName)) 
    options = [element, element = options][0];
  
  // Merge given options object into this.options
  if (options) Object.merge(this.options, options);
  
  // Collection options off constructors
  options = this.construct();
  
  // Call parent class initializer (if set)
  if (Class.hasParent(this)) this.parent(element, options);
  
  // Run callbacks for all the options set
  this.setOptions(options);
  
  // Indicate readiness to start
  this.fireEvent('boot', [options, element]);
  
  // Attach to a given element
  this.fireEvent('prepare', [options, element]);
  
  // And we're all set!
  this.fireEvent('initialize', [options, this.element]);
};
/*
---
 
script: Element.js
 
description: Turns generic widget into specific by mixing in the tag class
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Module
  - LSD.Module.Options
  - LSD.Module.Events

provides: 
  - LSD.Module.Tag
 
...
*/

LSD.Module.Tag = new Class({
  options: {
    context: 'element',
    namespace: 'LSD'
  },
  
  constructors: {
    tag: function(options) {
      if (options.context) this.setContext(options.context)
      this.nodeType = options.nodeType;
    }
  },
  
  getSource: function(raw) {
    var source = this.options.source;
    if (source) return source;
    source = LSD.Layout.getSource(this.attributes, this.tagName);
    return raw || !source.join ? source : source.join('-');
  },
  
  setSource: function(source) {
    if (!source) source = this.getSource(true);
    if (this.source != (source && source.join ? source.join('-') : source)) {
      if (source.length) {
        var role = this.context.find(source);
        if (role && role != this.role) {
          var kind = this.attributes.kind
          if (kind) role = role[LSD.toClassName(kind)] || role;
          if (this.role) this.unmix(this.role);
          this.role = role;
          this.mixin(role);
          if ((this.sourced = this.captureEvent('setRole', role))) this.setOptions(this.sourced);
        }
      }
      this.source = source && source.length ? (source.join ? source.join('-') : source) : false; 
    }
    return this;
  },
  
  unsetSource: function(source) {
    if (source != this.source) return;
    if (this.role) this.unmix(this.role);
    if (this.sourced) this.unsetOptions(this.sourced);
    delete this.source;
    delete this.role;
    return this;
  },
  
  setContext: function(name) {
    name = LSD.toClassName(name);
    if (this.context && this.context.name == name) return;
    if (this.source) {
      var source = this.source;
      this.unsetSource();
    }
    this.context = window[this.options.namespace][LSD.toClassName(name)];
    if (source) this.setSource(source);
    return this;
  },
  
  setTag: function(tag) {
    var old = this.tagName;
    if (old) {
      if (old == tag) return;
      this.unsetTag(old, true);
    }
    this.nodeName = this.tagName = tag;
    this.fireEvent('tagChanged', [this.tagName, old]);
  },
  
  unsetTag: function(tag, light) {
    if (tag ? !this.tagName : this.tagName != tag) return;
    delete this.tagName;
    if (!light) this.fireEvent('tagChanged', [null, this.tagName]);
    this.unsetSource();
    delete this.nodeName;
  },

  mixin: function(mixin, light) {
    if (typeof mixin == 'string') mixin = LSD.Mixin[LSD.capitalize(mixin)];
    Class.mixin(this, mixin, light);
    this.setOptions(this.construct(mixin.prototype));
    return this;
  },

  unmix: function(mixin, light) {
    if (typeof mixin == 'string') mixin = LSD.Mixin[LSD.capitalize(mixin)];
    this.unsetOptions(this.destruct(mixin.prototype));
    Class.unmix(this, mixin, light);
    return this;
  }
  
});

LSD.Module.Events.addEvents.call(LSD.Module.Tag.prototype, {
  tagChanged: function(tag) {
    if (tag) this.setSource();
    else this.unsetSource();
  },
  initialize: function() {
    this.setSource();
  },
  beforeBuild: function() {
    if (this.source == null) this.setSource();
  }
});

Object.append(LSD.Options, {
  tag: {
    add: 'setTag',
    remove: 'unsetTag'
  },
  
  context: {
    add: 'setContext',
    remove: 'unsetContext'
  },
  
  source: {
    add: 'setSource',
    remove: 'unsetSource'
  }
});
/*
---
 
script: States.js
 
description: Define class states and methods metaprogrammatically
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - Ext/States
  - LSD.Module
  
provides: 
  - LSD.Module.States

...
*/

LSD.Module.States = States;

LSD.Options.states = {
  add: 'addState',
  remove: 'removeState',
  iterate: true
};
/*
---
 
script: Shape.js
 
description: Draw a widget with any SVG path you want
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires: 
  - LSD.Trait
  - ART/ART.Shape
  
provides: 
  - LSD.Module.Shape
 
...
*/

LSD.Module.Shape = new Class({
  options: {
    shape: 'rectangle'
  },
  
  getShape: Macro.getter('shape', function(name) {
    return this.setShape(name);
  }),
  
  setShape: function(name) {    
    if (!name) name = this.options.shape;
    var shape = new ART.Shape[name.camelCase().capitalize()];
    shape.name = name;
    shape.widget = this;
    if (!this.shape) this.addEvents(LSD.Module.Shape.events);
    this.shape = shape;
    return shape;
  },
  
  getCanvas: Macro.getter('canvas', function() {
    var art = new ART;
    art.toElement().inject(this.toElement(), 'top');
    return art;
  })
  
});

LSD.Module.Shape.events = {
  'render': function() {
    if (this.setSize()) this.resized = true;
  },
  'update': function() {
    delete this.resized;
  }
};
/*
---
 
script: Slider.js
 
description: Because sometimes slider is the answer
 
license: Public domain (http://unlicense.org).
 
requires:
  - LSD.Trait
  - More/Slider
  - Ext/Slider.prototype.update
  - Ext/Class.hasParent

provides: 
  - LSD.Trait.Slider
 
...
*/

LSD.Trait.Slider = new Class({
  
  options: {
    actions: {
      slider: {
        enable: function() {
          if (!this.slider) this.getSlider();
          else this.slider.attach();
        },

        disable: function() {
          if (this.slider) this.slider.detach()
        }
      }
    },
    events: {
      parent: {
        resize: 'onParentResize'
      },
      slider: {}
    },
    slider: {},
    value: 0,
    mode: 'horizontal',
  },
  
  onParentResize: function(current, old) {
    if (this.slider) this.slider.update();
  },
  
  getSlider: Macro.getter('slider', function (update) {
    var slider = new Slider(document.id(this.getTrack()), document.id(this.getTrackThumb()), Object.merge(this.options.slider, {
      mode: this.options.mode
    })).set(parseFloat(this.options.value));
    slider.addEvent('change', this.onSet.bind(this));
    this.fireEvent('register', ['slider', slider]);
    return slider;
  }),
  
  onSet: Macro.defaults(function() {
    return true;
  }),
  
  getTrack: Macro.defaults(function() {
    return this
  }),
  
  getTrackThumb: Macro.defaults(function() {
    return this.thumb;
  }),
  
  increment: function() {
    this.slider.set((this.slider.step || 0) + 10)
  },
  
  decrement: function() {
    this.slider.set((this.slider.step || 0) - 10)
  }
  
});

Slider = new Class({
  Extends: Slider,
  
  initialize: function() {
    (this.Binds.push ? this.Binds : [this.Binds]).each(function(name){
      var original = this[name];
      if (original) this[name] = original.bind(this);
    }, this);
    return this.parent.apply(this, arguments);
  }
})
/*
---
 
script: Date.js
 
description: Work with dates like a boss
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Trait
  - More/Date

provides:
  - LSD.Trait.Date
 
...
*/

LSD.Trait.Date = new Class({
  options: {
    date: {
      interval: 'month',
      format: '%b-%d-%Y'
    }
  },
  
  setDate: function(date) {
    this.date = date;
    if (date) this.fireEvent('setDate', date)
  },
  
  formatDate: function(date) {
    return date.format(this.options.date.format)
  },
  
  getDate: function() {
    if (this.date) return this.date;
    if (this.getRawDate) {
      var raw = this.getRawDate();
      if (raw) return this.parseDate(raw);
    }
    return this.getDefaultDate();
  },
  
  getDefaultDate: function() {
    return new Date;
  },
  
  parseDate: function(date) {
    return Date.parse(date);
  },
  
  increment: function(number) {
    number = number.toInt ? number.toInt() : 1;
    this.setDate(this.getDate().increment(this.options.date.interval, number))
  },

  decrement: function(number) {
    number = number.toInt ? number.toInt() : 1;
    this.setDate(this.getDate().decrement(this.options.date.interval, number))
  }
  
});
/*
---
name : sg-regex-tools
description : A few super-handy tools for messing around with RegExp

authors   : Thomas Aylott
copyright : © 2010 Thomas Aylott
license   : MIT

provides : [combineRegExp]
...
*/
;(function(exports){

exports.combineRegExp = function(regex, group){
	if (regex.source) regex = [regex]
	
	var names = [], i, source = '', this_source
	
	for (i = 0; i < regex.length; ++i){ if (!regex[i]) continue
		this_source = regex[i].source || ''+regex[i]
		if (this_source == '|') source += '|'
		else {
			source += (group?'(':'') + this_source.replace(/\s/g,'') + (group?')':'')
			if (group) names.push(group)
		}
		if (regex[i].names)	names = names.concat(regex[i].names)
	}
	try {
		regex = new RegExp(source,'gm')
	}
	catch (e){
		throw new SyntaxError('Invalid Syntax: ' + source +'; '+ e)
	}
	// [key] → 1
	for (i = -1; i < names.length; ++i) names[names[i]] = i + 1
	// [1] → key
	regex.names = names
	return regex
}

}(typeof exports != 'undefined' ? exports : this))

/*
---
name    : SheetParser.CSS

authors   : Thomas Aylott
copyright : © 2010 Thomas Aylott
license   : MIT

provides : SheetParser.CSS
requires : combineRegExp
...
*/
;(function(exports){
	

/*<depend>*/
var UNDEF = {undefined:1}
if (!exports.SheetParser) exports.SheetParser = {}

/*<CommonJS>*/
var combineRegExp = (UNDEF[typeof module] || !module.exports)
	?	exports.combineRegExp
	:	require('./sg-regex-tools').combineRegExp
var SheetParser = exports.SheetParser
/*</CommonJS>*/

/*<debug>*/;if (UNDEF[typeof combineRegExp]) throw new Error('Missing required function: "combineRegExp"');/*</debug>*/
/*</depend>*/


var CSS = SheetParser.CSS = {version: '1.0.2 dev'}

CSS.trim = trim
function trim(str){
	// http://blog.stevenlevithan.com/archives/faster-trim-javascript
	var	str = (''+str).replace(/^\s\s*/, ''),
		ws = /\s/,
		i = str.length;
	while (ws.test(str.charAt(--i)));
	return str.slice(0, i + 1);
}

CSS.camelCase = function(string){
	return ('' + string).replace(camelCaseSearch, camelCaseReplace)
}
var camelCaseSearch = /-\D/g
function camelCaseReplace(match){
	return match.charAt(1).toUpperCase()
}

CSS.parse = function(cssText){
	var	found
	,	rule
	,	rules = {length:0}
	,	keyIndex = -1
	,	regex = this.parser
	,	names = CSS.parser.names
	,	i,r,l
	,	ruleCount
	
	rules.cssText = cssText = trim(cssText)
	
	// strip comments
	cssText = cssText.replace(CSS.comment, '');
	
	regex.lastIndex = 0
	while ((found = regex.exec(cssText))){
		// avoid an infinite loop on zero-length keys
		if (regex.lastIndex == found.index) ++ regex.lastIndex
		
		// key:value
		if (found[names._key]){
			rules[rules.length ++] = found[names._key]
			rules[found[names._key]] = found[names._value]
			rules[CSS.camelCase(found[names._key])] = found[names._value]
			continue
		}
		
		rules[rules.length++] = rule = {}
		for (i = 0, l = names.length; i < l; ++i){
			if (!(names[i-1] && found[i])) continue
			rule[names[i-1]] = trim(found[i])
		}
	}
	
	var atKey, atRule, atList, atI
	for (i = 0, l = rules.length; i < l; ++i){
		if (!rules[i]) continue
		
		if (rules[i]._style_cssText){
			rules[i].style = CSS.parse(rules[i]._style_cssText)
			delete rules[i]._style_cssText
		}
		
		// _atKey/_atValue
		if (atKey = rules[i]._atKey){
			atKey = CSS.camelCase(atKey)
			atRule = {length:0}
			rules[i][atKey] = atRule
			atRule["_source"] =
			atRule[atKey + "Text"] = rules[i]._atValue
			atList = ('' + rules[i]._atValue).split(/,\s*/)
			for (atI = 0; atI < atList.length; ++atI){
				atRule[atRule.length ++] = atList[atI]
			}
			rules[i].length = 1
			rules[i][0] = atKey
			delete rules[i]._atKey
			delete rules[i]._atValue
		}
		
		if (rules[i].style)
		for (ruleCount = -1, r = -1, rule; rule = rules[i].style[++r];){
			if (typeof rule == 'string') continue
			rules[i][r] = (rules[i].cssRules || (rules[i].cssRules = {}))[++ ruleCount]  = rule
			rules[i].cssRules.length = ruleCount + 1
			rules[i].rules = rules[i].cssRules
		}
	}
	
	return rules
}

var x = combineRegExp
var OR = '|'

;(CSS.at = x(/\s*@([-a-zA-Z0-9]+)\s+(([\w-]+)?[^;{]*)/))
.names=[         '_atKey',           '_atValue', 'name']

CSS.atRule = x([CSS.at, ';'])

;(CSS.keyValue_key = x(/([-a-zA-Z0-9]+)/))
.names=[                '_key']

;(CSS.keyValue_value_end = x(/(?:;|(?=\})|$)/))

;(CSS.notString = x(/[^"']+/))
;(CSS.stringSingle = x(/"(?:[^"]|\\")*"/))
;(CSS.stringDouble = x(/'(?:[^']|\\')*'/))
;(CSS.string = x(['(?:',CSS.stringSingle ,OR, CSS.stringDouble,')']))
;(CSS.propertyValue = x([/[^;}]+/, CSS.keyValue_value_end]))

var rRound = "(?:[^()]|\\((?:[^()]|\\((?:[^()]|\\((?:[^()]|\\([^()]*\\))*\\))*\\))*\\))"

;(CSS.keyValue_value = x(
[
	x(['((?:'
	,	CSS.stringSingle
	,	OR
	,	CSS.stringDouble
	,	OR
	,	"\\("+rRound+"*\\)"
	,	OR
	,	/[^;}()]/ // not a keyValue_value terminator
	,	')*)'
	])
,	CSS.keyValue_value_end
])).names = ['_value']

;(CSS.keyValue = x([CSS.keyValue_key ,/\s*:\s*/, CSS.keyValue_value]))

;(CSS.comment = x(/\/\*\s*((?:[^*]|\*(?!\/))*)\s*\*\//))
.names=[                   'comment']

;(CSS.selector = x(['(',/\s*(\d+%)\s*/,OR,'(?:',/[^{}'"()]|\([^)]*\)|\[[^\]]*\]/,')+',')']))
.names=[    'selectorText','keyText']

var rCurly = "(?:[^{}]|\\{(?:[^{}]|\\{(?:[^{}]|\\{(?:[^{}]|\\{[^{}]*\\})*\\})*\\})*\\})"
var rCurlyRound = "(?:[^{}()]+|\\{(?:[^{}()]+|\\{(?:[^{}()]+|\\{(?:[^{}()]+|\\{[^{}()]*\\})*\\})*\\})*\\})"

;(CSS.block = x("\\{\\s*((?:"+"\\("+rRound+"*\\)|"+rCurly+")*)\\s*\\}"))
.names=[              '_style_cssText']

CSS.selectorBlock = x([CSS.selector, CSS.block])

CSS.atBlock = x([CSS.at, CSS.block])

CSS.parser = x
(
	[	x(CSS.comment)
	,	OR
	,	x(CSS.atBlock)
	,	OR
	,	x(CSS.atRule)
	,	OR
	,	x(CSS.selectorBlock)
	,	OR
	,	x(CSS.keyValue)
	]
,	'cssText'
);


})(typeof exports != 'undefined' ? exports : this);

/*
---
name    : SheetParser.Value

authors   : Yaroslaff Fedin

license   : MIT

requires : SheetParser.CSS

provides : SheetParser.Value
...
*/


(function(exports) {
  /*<CommonJS>*/
  var combineRegExp = (typeof module === 'undefined' || !module.exports)
    ?  exports.combineRegExp
    :  require('./sg-regex-tools').combineRegExp
  var SheetParser = exports.SheetParser
  /*</CommonJS>*/
  
  var Value = SheetParser.Value = {version: '1.2.2 dev'};
  
  Value.translate = function(value, expression) {
    var found, result = [], matched = [], scope = result
    var regex = Value.tokenize, names = regex.names;
    var chr, unit, number, func, text, operator;
    while (found = regex.exec(value)) matched.push(found);
    for (var i = 0; found = matched[i++];) {
      if ((text = found[names._arguments])) {
        var translated = Value.translate(text, true), func = found[names['function']];
        for (var j = 0, bit; bit = translated[j]; j++) if (bit && bit.length == 1) translated[j] = bit[0];
        if (func && ((operator = operators[func]) == null)) {
          var obj = {};
          obj[func] = translated;
          scope.push(obj);
        } else {
          if (isFinite(translated)) {
            scope.push((operator ? 1 : -1) * translated)
          } else {
            if (operator != null) scope.push(func);
            scope.push(translated);
          }
        }
      } else if ((text = (found[names.number]))) {
        number = parseFloat(text), unit = found[names.unit];
        if (expression && scope.length) {
          chr = text.charAt(0);
          if ((operator = operators[chr]) != null) {
            var last = scope[scope.length - 1];
            if (!last || !last.match || !last.match(Value.operator)) {
              scope.push(chr);
              if (!operator) number = - number;
            }
          };
        }
        scope.push(unit ? {number: number, unit: unit} : number);
      } else if (found[names.comma]) {
        if (!result[0].push) result = [result];
        result.push(scope = []);
      } else if (found[names.whitespace]) {
        var length = !expression && scope.length;
        if (length && (scope == result) && !scope[length - 1].push) scope = scope[length - 1] = [scope[length - 1]];
      } else if (text = (found[names.dstring] || found[names.sstring] || found[names.token])) {
        scope.push(text);
      } else if (text = (found[names.operator])) {
        expression = true;
        scope.push(text);
      }
    } 
    return result.length == 1 ? result[0] : result;
  };
  var operators = {'-': false, '+': true};
  var x = combineRegExp
  var OR = '|'
  var rRound = "(?:[^()]|\\((?:[^()]|\\((?:[^()]|\\((?:[^()]|\\([^()]*\\))*\\))*\\))*\\))";

  ;(Value['function'] = x("([-_a-zA-Z0-9]*)\\((" + rRound + "*)\\)"))
  .names = [               'function',       '_arguments']
  
  ;(Value.integer = x(/[-+]?\d+/))
  ;(Value['float'] = x(/[-+]?(?:\d+\.\d*|\d*\.\d+)/))
  ;(Value.length = x(['(', Value['float'],  OR, Value['integer'], ')', '(em|px|pt|%|fr|deg|(?=$|[^a-zA-Z0-9.]))']))
  .names = [           'number',                                        'unit'];
  
  ;(Value.comma = x(/\s*,\s*/, 'comma'))
  ;(Value.whitespace = x(/\s+/, 'whitespace'))
  ;(Value.operator = x(/[-+]|[\/%^~=><*\^]+/, 'operator'))

  ;(Value.stringDouble = x(/"((?:[^"]|\\")*)"/)).names = ['dstring']
  ;(Value.stringSingle = x(/'((?:[^']|\\')*)'/)).names = ['sstring']
  ;(Value.string = x([Value.stringSingle, OR, Value.stringDouble]))
  ;(Value.token = x(/[^$,\s\/())]+/, "token"))
  
  Value.tokenize = x
  (
    [ x(Value['function']),
    , OR
    , x(Value.comma)
    , OR
    , x(Value.whitespace)
    , OR
    , x(Value.string)
    , OR
    , x(Value.length)
    , OR
    , x(Value.operator)
    , OR
    , x(Value.token)
    ]
  )
})(typeof exports != 'undefined' ? exports : this);
/*
---
 
script: Interpolation.js
 
description: Variable piece of html that can be asynchronously replaced with content 
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD
  - Sheet/SheetParser.Value
  
provides:
  - LSD.Interpolation
  
...
*/

!function() {
  LSD.Interpolation = function(input, output, source) {
    this.input = input;
    this.output = output;
    this.source = source;
  };
  
  LSD.Interpolation.Function = function(input, output, source, name) {
    this.input = input;
    this.output = output;
    this.source = source;
    this.name = name;
    this.args = Array.prototype.slice.call(input, 0);
  };
  
  LSD.Interpolation.Selector = function(input, output, source) {
    this.input = input;
    this.output = output;
    this.source = source;
    this.input = input.replace(R_SELECTOR_CONTEXT, function(whole, match) {
      switch (match) {
        case "$": 
          this.element = this.source.toElement();
          return '';
        case "$$":
          this.element = this.source.toElement().ownerDocument.body;
          return '';
      }
    }.bind(this));
    this.collection = [];
    if (!source || !source.lsd) throw "Selector should be applied on widgets";
  };
  
  LSD.Interpolation.prototype = {
    interpolation: true,
    
    set: function(value) {
      this.value = this.process ? this.process(value) : value;
      this.onSet(this.value);
    },
    
    onSet: function(value) {
      if (value == null && this.placeholder) value = this.placeholder;
      if (this.output) this.update(value);
      if (this.parent) this.parent.set();
    },
    
    attach: function() {
      return this.fetch(true);
    },
    
    detach: function() {
      return this.fetch(false);
    },
    
    fetch: function(state) {
      if (!this.setter) this.setter = this.set.bind(this);
      (this.source.call ? this.source : this.request).call(this, this.input, this.setter, this.source, state);
      return this;
    },
    
    request: function(input, callback, source, state) {
      return this.source[state ? 'addInterpolation' : 'removeInterpolation'](input, callback);
    },
    
    update: function(value) {
      var output = this.output;
      if (!output) return;
      if (output.branch) {
        output.set(value);
      } else if (output.call) {
        output(value !== null);
      } else {
        if (value == null) value = '';
        switch (output.nodeType) {
          case 1:
            if (output.lsd) output.write(value)
            else output.innerHTML = value;
            break;
          case 3:
            output.nodeValue = value;
            break;
          case 8:
        }
      } 
    }     
  };
  
  LSD.Interpolation.Function.prototype = Object.append({}, LSD.Interpolation.prototype, {
    fetch: function(state) {
      for (var i = 0, j = this.args.length, arg; i < j; i++) {
        if ((arg = this.args[i]) == null) continue;
        if (!arg.interpolation) {
          arg = LSD.Interpolation.compile(this.args[i], null, this.source);
          if (!arg.parent) {
            arg.parent = this;
            if (arg.value == null) var stop = true;
          }
        }
        this.args[i] = arg;
        if (arg.interpolation) arg.fetch(state);
      }
      if (!stop) this.set();
      return this;
    },
    
    execute: function() {
      for (var i = 0, args = [], j = this.args.length, arg; i < j; i++)
        if ((arg = this.args[i]) && arg.interpolation && arg.value == null) return null;
        else args[i] = (arg && typeof arg.value != 'undefined') ? arg.value : arg;
        if (this.args[0].type == 'selector') debugger
        if (this.name) {
        return functions[this.name].apply(functions, args)
      } else {
        return args[0];
      }
    },
    
    process: function() {
      return this.execute();
    }
  });
  
  LSD.Interpolation.Selector.prototype = Object.append({}, LSD.Interpolation.prototype, {
    request: function(input, callback, state) {
      return (this.element || this.source)[state ? 'watch' : 'unwatch'](input, callback);
    },
    
    set: function(node, state) {
      if (this.filter && !this.filter(node)) return;
      if (state) {
        this.collection.push(node);
      } else {
        var index = this.collection.indexOf(node);
        if (index > -1) this.collection.splice(index, 1);
      }
      this.value = this.collection.length ? this.collection : 0;
      this.onSet(this.value);
    }
  });
  
  // Set up helpers
  var functions = LSD.Interpolation.Functions = {
    count: function(elements) {
      return elements.push ? elements.length : +!!elements
    },
    
    pluralize: function(count, singular, plural) {
      var value = (count == 1) ? singular : (plural || (singular.pluralize()));
      var index = value.indexOf('%');
      if (index > -1) {
        return value.substr(0, index) + count + value.substr(index + 1, value.length - index - 1);
      } else {
        return count + ' ' + value;
      }
    }
  };
  
  // Import all string prototype methods as helpers (first argument is translates to string)
  for (var name in String.prototype)
    if (!functions[name] && String.prototype[name].call && name.charAt(0) != '$') 
      functions[name] = (function(name) {
        return function(a, b) {
          return String(a)[name](b);
        }
      })(name);
      
  // Import all number prototype methods as helpers (first argument is translates to number)
  for (var name in Number.prototype) 
    if (!functions[name] && Number.prototype[name].call && name.charAt(0) != '$')
      functions[name] = (function(name) {
        return function(a, b) {
          return Number(a)[name](b);
        }
      })(name);
  
  var operators = {
    '*': 1,
    '/': 1,
    '+': 2,
    '-': 2,
    '>': 4,
    '<': 4,
    '^': 4,
    '&': 4,
    '|': 4,
    '>=': 4,
    '<=': 4,
    '==': 4,
    '!=': 4,
    '===': 4,
    '!==': 4,
    '&&': 5,
    '||': 5
  };
  for (var operator in operators)
    functions[operator] = new Function('left', 'right', 'return left ' + operator + ' right');
  
  var R_TRANSLATE = SheetParser.Value.tokenize;
  var R_FIND = /\\?\{([^{}]+)\}/g;
  var R_VARIABLE = /^[a-z0-9][a-z_\-0-9.\[\]]*$/ig;
  var R_SELECTOR_CONTEXT = /^\s*([$]+)\s*/
  var parsed = {};
  var combinators = Array.object('+', '>', '!+', '++', '!~', '~~', '&', '&&', '$', '$$');
  
  Object.append(LSD.Interpolation, {
    translate: function(value) {
      var cached = parsed[name];
      if (cached) return cached;
      var found, result = [], matched = [], scope = result, text, stack = [], operator, selector;
      var names = R_TRANSLATE.names;
      while (found = R_TRANSLATE.exec(value)) matched.push(found);
      for (var i = 0, last = matched.length - 1; found = matched[i]; i++) {
        if ((text = found[names._arguments])) {
          var args = LSD.Interpolation.translate(text);
          for (var j = 0, bit; bit = args[j]; j++) if (bit && bit.length == 1) args[j] = bit[0];
          if ((text = found[names['function']])) {
            scope.push({type: 'function', name: text, value: args.push ? args : [args]});
          } else {
            scope.push(args);
          }
        } else if ((text = (found[names.dstring] || found[names.sstring]))) {
          scope.push(text);
        } else if ((text = (found[names.number]))) {
          scope.push(parseFloat(text));
        } else if ((text = found[names.operator])) {
          if (!selector) {
            previous = stack[stack.length - 1];
            if (left) left = null;
            if (previous) {
              operator = {type: 'function', name: text, index: i, scope: scope, precedence: operators[text]};
              stack.push(operator);
              if (previous.precedence > operator.precedence) {
                scope = previous.scope;
                var left = scope[scope.length - 1];
                if (left.value) {
                  if (left.value[1] != null) {
                    scope = operator.value = [left.value[1]];
                    left.value[1] = operator;
                  }
                } else throw "Right part is missing for " + left.name + " operator";
              }
            } 
            if (!left) {
              var left = scope.pop();
              if (left == null) {
                if (combinators[text]) {
                  selector = {type: 'selector', value: text};
                  scope.push(selector);
                } else throw "Left part is missing for " + text + " operator";
              } else {
                var operator = {type: 'function', name: text, index: i, scope: scope, precedence: operators[text]};
                operator.value = [left];
                stack.push(operator);
                scope.push(operator);
                scope = operator.value;
              }
            }
          } else {
            selector.value += ' ' + text;
            text = null;
          }
        } else if ((text = found[names.token])) {
          if (!selector && text.match(R_VARIABLE)) {
            scope.push({type: 'token', name: text});
          } else {
            if (!selector) {
              selector = {type: 'selector', value: text};
              scope.push(selector);
            } else {
              selector.value += ' ' + text;
              text = null;
            }
          }
        }
        if (!operator && text && stack.length) {
          var pop = stack[stack.length - 1]
          if (pop && pop.scope) scope = pop.scope;
        }
        operator = null;
      };
      return (parsed[value] = (result.length == 1 ? result[0] : result));
    },
    
    compile: function(object, output, source, translate) {
      if (translate) object = LSD.Interpolation.translate(object);
      switch (object.type) {
        case 'token':
          var Klass = LSD.Interpolation;
          var value = object.name;
          break;
        case 'function':
          var Klass = LSD.Interpolation.Function;
          var name = object.name;
          var value = object.value;
          break;
        case 'selector':
          var Klass = LSD.Interpolation.Selector;
          var value = object.value;
          break;
        default:
          if (object.push) {
            var Klass = LSD.Interpolation.Function
            var value = object;
          } else {
            return object;
          }
      }
      return new Klass(value, output, source, name);
    },
    
    textnode: function(textnode, widget, callback) {
      var node = textnode, content = node.textContent, finder, length = content.length;
      for (var match, index, last, next, compiled; match = R_FIND.exec(content);) {
        last = index || 0
        var index = match.index + match[0].length;
        expression = node;
        var cut = index - last;
        if (cut < node.textContent.length) node = node.splitText(index - last);
        if ((cut = (match.index - last))) expression = expression.splitText(cut);
        if (!callback || callback === true) callback = widget;
        compiled = LSD.Interpolation.compile(match[1], expression, callback, true);
        compiled.placeholder = match[0];
        compiled.attach();
        Element.store(expression, 'interpolation', compiled);
        last = index;
      }
    }
  })
  
}();
/*
---
 
script: Interpolations.js
 
description: Retrieves meta data from widgets and runs expressions with it
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Module
  - LSD.Module.Events
  - LSD.Interpolation

provides: 
  - LSD.Module.Interpolations
 
...
*/

LSD.Module.Interpolations = new Class

Object.append(LSD.Module.Interpolations, {
  addInterpolation: function(token, callback) {
    var index = token.indexOf('.');
    if (index > -1) {
      var string = token.substr(0, index), saved;
      var finder = function(value) {
        var key = token.substring(index + 1);
        if (value == null) {
          saved.unwatch(key, callback);
          delete saved;
        } else if (typeof value == 'object' && value && !value.push && !value.indexOf) {  
          saved = value;
          value.watch(key, callback);
        } else {
          callback(value);
        }
      };
      finder.callback = callback;
      LSD.Module.Interpolations.addInterpolation.call(this, string, finder);
    } else {
      for (var node = this, length, interpolators, interpolations, group; node; node = node.parentNode) {
        if (!(interpolations = node.interpolations)) interpolations = node.interpolations = {};
        if (!(group = node.interpolations[token])) group = node.interpolations[token] = [];
        group.push(callback);
        if ((interpolators = node.interpolators) && (interpolators = interpolators[token])) {
          if (length = interpolators.length) {
            var value = interpolators[length - 1];
            if (value.call) value = value.call(node, token, callback, true);
            if (value != null) callback(value);
            break;
          }
        }
      }
    }
  },
  
  removeInterpolation: function(token, callback) {
    var index = token.indexOf('.');
    if (index > -1) {
      var string = index.substr(shift || 0, index);
      LSD.Module.Interpolations.removeInterpolation.call(this, string, callback);
    } else {
      for (var node = this; node; node = node.parentNode) {
        var group = node.interpolations[token];
        var index = group.indexOf(callback);
        if (index > -1) group.splice(index, 1);
      }
    }
  },
  
  getInterpolationCallback: function() {
    return (this.interpolationCallback || (this.interpolationCallback = function(name, value, state) {
      this[state ? 'addInterpolator' : 'removeInterpolator'](name, value);
    }.bind(this)));
  },
  
  findParentInterpolator: function(name) {
    for (var node = this, group; node = node.parentNode;)
      if ((group = node.interpolators) && (group = group[name]) && group.length)
        return group[group.length - 1];
  },
  
  addInterpolator: function(name, value) {
    if (name.toObject) {
      var callback = LSD.Module.Interpolations.getInterpolationCallback.call(this);
      name.addEvent('change', callback).addEvent('beforechange', callback);
      for (var property in name) if (name.hasProperty(property)) 
        LSD.Module.Interpolations.addInterpolator.call(this, property, name[property]);
    } else if (name.call) {

    } else if (!name.indexOf) {
      for (var property in name)
        LSD.Module.Interpolations.addInterpolator.call(this, property, name[property]);
    } else {
      var interpolators = this.interpolators;
      if (!interpolators) interpolators = this.interpolators = {};
      var group = interpolators[name];
      if (!group) group = interpolators[name] = [];
      group.push(value);
      var interpolations = this.interpolations;
      if (interpolations) {
        var fns = interpolations[name];
        if (fns) for (var i = 0, fn, lazy = true; fn = fns[i++];) {
          if (value.call && lazy && !(lazy = false)) value = value.call(this, name, value);
          fn(value);
        }
      }
    }
  },
  
  removeInterpolator: function(name, value) {
    if (name.toObject) {
      var callback = LSD.Module.Interpolations.getInterpolationCallback.call(this);
      name.removeEvent('change', callback).removeEvent('beforechange', callback);
      for (var property in name) if (name.hasProperty(property)) this.removeInterpolator(property, name[property])
    } else if (name.call) {

    } else if (!name.indexOf) {
      for (var property in name)
        LSD.Module.Interpolations.removeInterpolator.call(this, property, name[property]);
    } else {
      var group = this.interpolators[name];
      var index = group.indexOf(value);
      if (index > -1) {
        group.splice(index, 1);
        var length = group.length;
        if (index == length) {
          if (!length) delete this.interpolators[name];
          var interpolations = this.interpolations;
          if (interpolations) {
            var fns = interpolations[name];
            var replacement = length ? group[length - 1] : LSD.Module.Interpolations.findParentInterpolator.call(this, name);
            if (fns) for (var i = 0, fn; fn = fns[i++];) fn(replacement);
          }
        }
      }
    }
  }
});

['addInterpolator', 'removeInterpolator', 'addInterpolation', 'removeInterpolation'].each(function(method) {
  LSD.Module.Interpolations.implement(method, LSD.Module.Interpolations[method]);
});
/*
---
 
script: Layout.js
 
description: A logic to render (and nest) widgets out of the key-value hash or dom tree
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD
  - LSD.Interpolation
  - LSD.Helpers
  - LSD.Microdata
  - More/Object.Extras

provides: 
  - LSD.Layout
 
...
*/

/* 
  Layout takes any tree-like structure and tries
  to build layout that representats that structure.
  
  The structure can be an objects with keys as selectors
  and values with other objects, arrays and strings.
  
  You can also build a widget tree from DOM. Layout will
  extract attributes and classes from elements. 
*/

LSD.Layout = function(widget, layout, options) {
  this.origin = widget;
  this.setOptions(options);
  this.context = LSD[this.options.context.capitalize()];
  if (widget) if (!layout && !widget.lsd) {
    layout = widget;
    widget = null;
  } else if (!widget.lsd) widget = this.convert(widget);
  if (layout) this.render(layout, widget);
};

LSD.Layout.prototype = Object.append(new Options, {
  
  options: {
    clone: false,
    context: 'element',
    interpolate: null
  },
  
  $family: Function.from('layout'),
  
  render: function(layout, parent, opts, memo) {
    if (layout.getLayout) layout = layout.getLayout();
    var type = (layout.push) ? 'array' : (layout.item && ('length' in layout)) ? 'children' : 
      layout.nodeType ? LSD.Layout.NodeTypes[layout.nodeType] : layout.indexOf ? 'string' : 'object';
    var result = this[type](layout, parent, opts, memo);
    if (!this.result) this.result = result;
    return result;
  },
  
  // type handlers
  
  array: function(array, parent, opts, memo) {
    for (var i = 0, result = [], length = array.length; i < length; i++) 
      result[i] = this.render(array[i], parent, opts, memo)
    return result;
  },
  
  element: function(element, parent, opts, memo) {
    // Prepare options and run walker (once per element tree)
    if (!opts || !opts.lazy) return this.walk(element, parent, opts, memo);
    /*
      Match all selectors in the stack and find a right mutation
    */
    var stack = memo.stack, index = stack.length;
    if (index) {
      var mutation, advanced, tagName = LSD.toLowerCase(element.tagName);
      for (var i = index, item, result, ary = ['*', tagName]; item = stack[--i];)
        for (var j = 0, value = item[1] || item, tag; tag = ary[j++];)
          if ((group = value[tag]))
            for (var k = 0, possibility, sel; possibility = group[k++];) {
              var result = possibility[1];
              if ((!mutation || (result && !result.indexOf)) && (sel = possibility[0])) {
                if ((!sel.id && !sel.classes && !sel.attributes && !sel.pseudos) ? (tagName == sel.tag || j == 0) :
                  (Slick.matchSelector(element, sel.tag, sel.id, sel.classes, sel.attributes, sel.pseudos)))
                  if (!result || !result.call || (result = result(element)))
                    if (!result || !result.push) {
                      mutation = result || true;
                    } else (advanced || (advanced = [])).push(result);
              }
            }
      if (advanced) memo.advanced = advanced;
    }
    var converted = element.uid && Element.retrieve(element, 'widget');
    var cloning = (opts && opts.clone) || this.options.clone, group;
    var ascendant = parent[0] || parent, container = parent[1] || parent.toElement();
    // Create, clone or reuse a widget.
    if (!converted) {
      if (mutation) {
        var options = Object.append({}, opts, mutation.indexOf ? LSD.Layout.parse(mutation) : mutation);
        var widget = this.context.create(element, options);
      } else {
        var widget = this.context.convert(element, opts);
      }
    } else {
      var widget = cloning ? converted.cloneNode(false, opts) : converted;
    }
    // Append widget into parent widget without moving elements
    if (widget) {
      if (!widget.parentNode) {
        var override = function() {
          if (widget.toElement().parentNode == container) return;
          if (cloning)
            this.appendChild(container, widget.element)
          else if (widget.origin == element && element.parentNode && element.parentNode == container)
            element.parentNode.replaceChild(widget.element, element);
        }.bind(this);
        this.appendChild(ascendant, widget, memo, override)
      }
    } else {
      if (cloning) var clone = element.cloneNode(false);
      if (cloning || (ascendant.origin ? (ascendant.origin == element.parentNode) : (!element.parentNode || element.parentNode.nodeType == 11))) 
        this.appendChild(container, clone || element, memo);
    }
    return widget || clone || element;
  },
  
  children: function(children, parent, opts, memo) {
    if (!memo) memo = {};
    var stack = memo.stack = this.pushMutations(parent, memo.stack);
    for (var j = children.length - 1, child; j > -1 && (child = children[j]) && child.nodeType != 1; j--);
    var args = [null, parent, opts, memo];
    for (var i = 0, child, previous, result = []; child = children[i]; i++) {
      /*
        Pick up selectors targetting on a node's next siblings
      */
      if (previous && i) {
        if ((group = previous.mutations['~'])) stack.push(['~', group]);
        if ((group = previous.mutations['+'])) stack.push(['+', group]);
      }
      memo.last = (i == j);
      memo.first = (i == 0);
      args[0] = child;
      /*
        If the child is element, walk it again and render it there, otherwise render it right away
      */
      previous = (child.nodeType == 1 ? this.walk : this.render).apply(this, args);
      if (!previous.lsd) previous = null;
    }
    
    delete memo.last; delete memo.first;
    this.popMutations(parent, stack)
    return children;
  },
  
  textnode: function(element, parent, opts) {
    var cloning = (opts && opts.clone || this.options.clone);
    if (cloning) var clone = element.cloneNode();
    this.appendChild(parent, clone || element);
    LSD.Interpolation.textnode(clone || element, this.options.interpolate, parent[0] || parent);
    return clone || element;
  },
  
  comment: function(comment, parent, opts, memo) {
    var keyword = Element.retrieve(comment, 'keyword');
    this.appendChild(parent, comment, memo);
    if (keyword) return keyword === true ? comment : keyword;
    else keyword = this.keyword(comment.nodeValue, parent, opts, memo, comment);
    if (keyword) {
      Element.store(comment, 'keyword', keyword);
      if (keyword !== true) (memo.branches || (memo.branches = [])).push(keyword);
      return keyword;
    } else return comment;
  },
  
  fragment: function(element, parent, opts) {
    return this.children(element.childNodes, parent, opts);
  },
  
  string: function(string, parent, opts) {
    var element = parent[1] || parent.toElement();
    var textnode = element.ownerDocument.createTextNode(string);
    this.appendChild(element, textnode);
    LSD.Interpolation.textnode(textnode, this.options.interpolate, parent[0] || parent);
    return textnode;
  },
  
  object: function(object, parent, opts, memo) {
    var result = {}, layout, branch;
    for (var selector in object) {
      layout = object[selector] === true ? null : object[selector];
      if (!memo) memo = {};
      if ((branch = this.keyword(selector, parent, opts, memo))) {
        (memo.branches || (memo.branches = [])).push(branch);
        branch.setLayout(layout);
        result[selector] = [branch, layout];
      } else {
        if (branch && memo && memo.branches && memo.branches[memo.branches.length - 1] == branch) memo.branches.pop();
        var rendered = this.selector(selector, parent, opts);
        result[selector] = [rendered, !layout || this.render(layout, rendered.lsd ? rendered : [parent[0] || parent, rendered], null, opts)];
      }
    }
    return result;
  },
  
  selector: function(string, parent, opts) {
    var options = Object.append({context: this.options.context}, opts, LSD.Layout.parse(string, parent[0] || parent));
    if (!options.tag || (options.tag != '*' && (options.source || this.context.find(options.tag) || !LSD.Layout.NodeNames[options.tag]))) {
      var allocation = options.allocation;
      if (allocation) var widget = (parent[0] || parent).allocate(allocation.type, allocation.kind, allocation.options);
      else var widget = this.context.create(options), self = this;
      if (widget.element && widget.element.childNodes.length) var nodes = LSD.slice(widget.element.childNodes);
      this.appendChild(parent, widget, opts, function() {
        self.appendChild(parent, widget.toElement());
      });
      options = {};
      for (var option in opts) if (LSD.Layout.Inheritable[option]) options[option] = opts[option];
      opts = options;
      if (nodes && nodes.length) this.children(nodes, [widget, widget.element], opts);
    } else {  
      var props = {}, tag = (options.tag == '*') ? 'div' : options.tag;
      if (options.id) props.id = options.id;
      var attributes = options.attributes;
      if (attributes) for (var attr, i = 0, l = attributes.length; i < l; i++){
        attr = attributes[i];
        if (props[attr.key] != null) continue;
        if (attr.value != null && attr.operator == '=') props[attr.key] = attr.value;
        else if (!attr.value && !attr.operator) props[attr.key] = props[attr.key];
      }
      var element = document.createElement(tag);
      for (var name in props) element.setAttribute(name, props[name]);
      if (options.classes) element.className = options.classes.join(' ');
      if (parent) this.appendChild(parent, element);
    }
    return widget || element;
  },
  
  keyword: function(text, parent, opts, memo, element) {
    var parsed = LSD.Layout.extractKeyword(text);
    if (!parsed) return;
    var keyword = LSD.Layout.Keyword[parsed.keyword];
    if (!keyword) return;
    var options = keyword(parsed.expression);
    var parentbranch = memo.branches && memo.branches[memo.branches.length - 1];
    if (options.ends || options.link) {
      if (!(options.superbranch = (memo.branches && memo.branches.pop()))) 
        throw "Alternative branch is missing its original branch";
      var node = options.superbranch.options.element;
      if (node) {
        for (var layout = []; (node = node.nextSibling) != element;) layout.push(node);
        options.superbranch.setLayout(layout);
      }
      if (element && options.superbranch.options.clean) {
        element.parentNode.removeChild(element);
        element = options.superbranch.options.element;
        if (element) element.parentNode.removeChild(element);
      }
      if (options.ends) return true;
    }
    if (options.branch) {
      options.keyword = parsed.keyword;
      options.parent = parentbranch;
      options.widget = parent[0] || parent;
      options.element = element;
      options.options = opts;
      return new LSD.Layout.Branch(options);
    } else {
      if (options.layout) {
        return this.render(options.layout);
      }
    }
  },
  
  /* 
    Remove rendered content from DOM. It only argument from DOM, keeping
    all of its contents untouched. 
  */
  remove: function(layout, parent, memo) {
    return this.set(layout, parent, memo, false)
  },

  /*
    Re-add once rendered content that was removed
  */
  add: function(layout, parent, memo) {
    return this.set(layout, parent, memo, true)
  },

  set: function(layout, parent, memo, state) {
    var method = state ? 'appendChild' : 'removeChild', value;
    switch (typeOf(layout)) {
      case "array": case "collection":
        for (var i = 0, j = layout.length; i < j; i++)
          if ((value = layout[i])) {
            this[method](parent, value, memo);
            if (value.nodeType == 8) {
              var keyword = Element.retrieve(value, 'keyword');
              if (keyword && keyword !== true) keyword[state ? 'attach' : 'detach']();
            }
          }
        break;
      case "object":
        for (var key in layout)
          if ((value = layout[key])) {
            value = value[0]
            if (!value) return;
            this[method](parent, value, memo);
            if (value.nodeType == 8) {
              var keyword = Element.retrieve(value, 'keyword');
              if (keyword && keyword !== true) keyword[state ? 'attach' : 'detach']();
            }
          }
        break;
      case "widget": case "string":
        this[method](parent, layout);
    }
    return layout;
  },
  
  appendChild: function(parent, child, memo, override) {
    if (parent.push) parent = parent[child.lsd ? 0 : 1] || parent;
    if (!child.lsd && parent.lsd) parent = parent.toElement();
    if (child.parentNode == parent) return;
    if (memo && memo.before) {
      var before = memo.before;
      if (!parent.lsd) {
        if (before.lsd) before = before.toElement();
        parent = before.parentNode;
      };
      parent.insertBefore(child, before, override);
    } else {
      parent.appendChild(child, override);
    }
    if (child.lsd) {
      var doc = parent.document;
      if (child.document != doc) child.setDocument(doc);
    }
    return true;
  },
  
  removeChild: function(parent, child, override) {
    if (parent.push) parent = parent[child.lsd ? 0 : 1] || parent;
    if (!child.lsd && parent.lsd) parent = parent.toElement();
    if (child.parentNode != parent) return;
    parent.removeChild(child, override);
    return true;
  },
  
  inheritOptions: function(opts) {
    var options = {};
    for (var option in opts) if (LSD.Layout.Inheritable[option]) options[option] = opts[option];
    return options;
  },

  prepareOptions: function(opts) {
    opts = Object.append({lazy: true}, opts);
    if (this.options.context && LSD.Widget.prototype.options.context != this.options.context)
      opts.context = this.options.context;
    if (this.options.interpolation) opts.interpolation = this.options.interpolation;
    return opts;
  },
  
  pushMutations: function(parent, stack) {
    if (stack && parent[1] && parent[1] != parent[0].element) return stack;
    var widget = parent[0] || parent;
    var group;
    if (stack) {
      /* 
        Collect mutations from a widget
      */
      if (widget) {
        if ((group = widget.mutations[' '])) stack.push([' ', group]);
        if ((group = widget.mutations['>'])) stack.push(['>', group]);
      }
    } else {  
      stack = [];
      if (widget) {
        if ((group = widget.mutations['>'])) stack.push(group);
        for (var node = widget, group; node; node = node.parentNode)
          if ((group = node.mutations[' '])) stack.push(group);
        //for (var node = ascendant; node; node = node.previousSibling) {
        //  if ((group = node.mutations['+'])) stack.push(group);
        //  if ((group = node.mutations['-'])) stack.push(group);
        //}
      }
    }
    return stack;
  },
  
  popMutations: function(parent, stack) {
    if (parent[1] && parent[1] != parent[0].element) return stack;
    var widget = parent[0] || parent;
    if (!widget) debugger
    var group;
    if (widget && stack) {
      if ((group = widget.mutations[' '])) 
        for (var j = stack.length; --j > -1;)
          if (stack[j][1] == group) {
            stack.splice(j, 1)
            break;
          }
      if ((group = widget.mutations['>'])) 
        for (var j = stack.length; --j > -1;)
          if (stack[j][1] == group) {
            stack.splice(j, 1)
            break;
          }
    }
  },
  
  walk: function(element, parent, opts, memo) {
  
    if (!opts || !opts.lazy) var prepared = opts = this.prepareOptions(opts);
  
    var ascendant = parent[0] || parent;
    /*
      Retrieve the stack if the render was not triggered from the root of the layout
    */
    if (!memo) memo = {};
    var stack = memo.stack;
    if (!stack) stack = memo.stack = this.pushMutations(parent, memo.stack);
    /* 
      Render the given element
    */
    var children = LSD.slice(element.childNodes);
    var ret = this.element(element, parent, opts, memo);
    if (ret.lsd) var widget = ret;
    else if (ret.branch) {
      (memo.branches || (memo.branches = [])).push(ret);
    } else if (opts.clone) var clone = ret;
    /* 
      Put away selectors in the stack that should not be matched against widget children
    */
    var group, direct, following;
    for (var i = stack.length; group = stack[--i];) {
      switch (group[0]) {
        case '+':
          stack.pop();
          break;
        case '~':
          (following || (following = [])).push(stack.pop());
          break;
        case '>':
          (direct || (direct = [])).push(stack.pop());
      }
    }
    /*
      Collect mutations that advanced with this element AND are looking for children
    */
    var advanced = memo.advanced;
    if (advanced) {
      for (var i = 0, group; group = advanced[i]; i++) {
        switch (group[0]) {
          case ' ': case '>':
            advanced.splice(i--, 1);
            stack.push(group);
            break;
        }
      }
      delete memo.advanced;
    }
    /* 
      Put away reversed direction option, since it does not affect child nodes
    */
    var before = memo.before;
    if (before) delete memo.before;
    /*
      Scan element for microdata
    */
    var itempath = memo.itempath;
    var scope = LSD.Microdata.element(element, widget || ascendant, itempath && itempath[itempath.length - 1]);
    if (scope) (itempath || (itempath = memo.itempath = [])).push(scope);
    if (widget && itempath) widget.itempath = itempath;
    /*
      Prepare parent array - first item is a nearest parent widget and second is a direct parent element
    */
    var newParent = [widget || ascendant, clone || (widget && widget.element) || element];
    var ascendant = parent[0] || parent;
    /*
      Put away prepared options and leave only the inheritable ones
    */
    if (prepared) opts = this.inheritOptions(opts);
    /*
      Iterate children
    */
    var first = memo.first, last = memo.last;
    if (children.length) this.children(children, newParent, opts, memo);
    /*
      Restore reversed insertion direction
    */
    if (before) memo.before = before;
    /* 
      Put advanced selectors back to the stack
    */
    if (advanced) for (var i = 0; group = advanced[i++];)
      if (group[0] != '+' || !last) stack.push(group);
    /*
      Put back selectors for next siblings
    */
    if (!last) {
      if (following) for (var i = 0; group = following[i++];) stack.push(group);
      if (direct) for (var i = 0; group = direct[i++];) stack.push(group);
    }
    /*
      Reduce the microdata path
    */
    if (scope) itempath.pop();
    return ret;
  }
});
LSD.Layout.Branch = function(options) {
  this.options = options;
  this.id = ++LSD.Layout.Branch.UID;
  this.$events = Object.clone(this.$events);
  if (options.superbranch) {
    options.superbranch.addEvents({
      check: this.unmatch.bind(this),
      uncheck: this.match.bind(this)
    });
    if (!options.superbranch.checked ^ this.options.invert) this.match();
  } else if (options.expression || options.show) {
    this.match();
  } else if (options.template) {
    LSD.Template[options.template] = this;
  }
};
LSD.Layout.Branch.UID = 0;
LSD.Template = {};

LSD.Layout.Branch.prototype = Object.append({
  branch: true,
  getInterpolation: function() {
    if (this.interpolation) return this.interpolation;
    this.interpolation = LSD.Interpolation.compile(this.options.expression, this, this.options.widget, true);
    return this.interpolation;
  },
  match: function() {
    if (this.options.expression) {
      var value = this.getInterpolation().attach().value;
      if ((value == null) ^ this.options.invert) return;
    }
    this.check();
  },
  unmatch: function(lazy) {
    if (this.options.expression) {
      var value = this.interpolation.value;
      this.interpolation.detach()
      if ((value == null) ^ this.options.invert) return;
    }
    this.uncheck(lazy);
  },
  check: function(lazy) {
    if (!this.checked) {
      this.checked = true;
      this.show();
      if (!lazy) this.fireEvent('check', arguments);
    }
  },
  uncheck: function(lazy) {
    if (this.checked || this.checked == null) {
      this.checked = false;
      this.hide();
      if (!lazy) this.fireEvent('uncheck', arguments);
    }  
  },
  set: function(value) {
    this[((value != false && value != null) ^ this.options.invert) ? 'check' : 'uncheck']();
  },
  show: function() {
    var layout = this.layout;
    if (!layout) return;
    if (layout.length) for (var i = 0, child, keyword, depth = 0; child = layout[i]; i++) {
      if (child.call) {
        if (layout === this.layout) layout = layout.slice(0);
        var result = child.call(this);
        if (result) {
          for (var branch = this; branch; branch = branch.options.parent) branch.dirty = true;
          if (result.length) layout.splice.apply(layout, [i, 1].concat(result))
          else layout[i] = result;
        }
      }
    }
    var before = this.options.element && this.options.element.nextSibling;
    var rendered = this.options.widget.addLayout(this.id, layout, this.options.widget, this.options.options, {before: before});
    if (result) this.validate(rendered)
    if (rendered) this.layout = rendered;
  },
  hide: function() {
    var layout = this.layout;
    if (!layout) return;
    this.options.widget.removeLayout(this.id, layout, this.options.widget, this.options.options);
  },
  splice: function(branch, layout, baseline) {
    var offset = 0;
    if (branch.layout) {
      if (!layout) layout = this.layout;
      for (var i = 0, child, keyword; child = branch.layout[i]; i++) {
        var index = layout.indexOf(child);
        if (index > -1) {
          var keyword = Element.retrieve(child, 'keyword');
          if (keyword && keyword !== true) {
            offset += this.splice(keyword, layout);
          }
          layout.splice(index, 1);
          i--;
        }
      }
    }
    return offset;
  },
  validate: function(layout) {
    var validate = true;
    for (var index, child, i = 0; child = layout[i]; i++) {
      switch ((child = layout[i]).nodeType) {
        case 8:
          if (validate)
            if (index != null) validate = index = null;
            else index = i;
          var keyword = Element.retrieve(child, 'keyword');
          if (keyword && keyword !== true) i += this.splice(keyword, layout, i)
          break;
        case 3:
          if (validate && child.textContent.match(LSD.Layout.rWhitespace)) break;
        default:  
          index = validate = null;
      }
    }
    if (index != null) {  
      var comment = layout[index];
      layout[index] = function() {
        return LSD.slice(document.createFragment(this.expand(comment.nodeValue)).childNodes);
      };
      comment.parentNode.removeChild(comment);
      if (this.options.clean) layout = layout[index];
    }
    return layout;
  },
  setLayout: function(layout) {
    this.layout = layout.push ? this.validate(layout) : layout;
    if (this.checked) {
      this.show();
    } else this.hide();
  },
  getLayout: function(layout) {
    return this.layout;
  },
  attach: function() {
    if ((this.options.expression && !this.options.link) || !this.options.superbranch.checked) this.match(true);
    //this.show();
  },
  detach: function() {
    if (this.options.expression && !this.options.link) this.unmatch(true);
    this.hide()
  },
  expand: function(text) {
    var depth = 0;
    text = text.replace(LSD.Layout.rComment, function(whole, start, end) {
      depth += (start ? 1 : -1);
      if (depth == !!start) return start ? '<!--' : '-->'
      return whole;
    });
    if (depth) throw "The lazy branch is unbalanced"
    return text;
  }
}, Events.prototype);

LSD.Layout.rComment = /(\<\!-)|(-\>)/g
LSD.Layout.rWhitespace = /^\s*$/;

LSD.Layout.NodeTypes = {1: 'element', 3: 'textnode', 8: 'comment', 11: 'fragment'};
LSD.Layout.NodeNames = Array.object('!doctype', 'a', 'abbr', 'acronym', 'address', 'applet', 'area', 
'article', 'aside', 'audio', 'b', 'base', 'bdo', 'big', 'blockquote', 'body', 'br', 'button', 'canvas', 
'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'command', 'datalist', 'dd', 'del', 'details',
'dfn', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'frame',
'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 
'img', 'input', 'ins', 'keygen', 'kbd', 'label', 'legend', 'li', 'link', 'map', 'mark', 'menu', 'meta', 
'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'pre', 'progress', 
'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strike', 
'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 
'time', 'title', 'tr', 'ul', 'var', 'video', 'wbr');
LSD.Layout.Inheritable = Array.object('context', 'interpolation', 'clone', 'lazy');

LSD.Layout.Keyword = {
  'if': function(expression) {
    return {branch: true, expression: expression};
  },
  'unless': function(expression) {
    return {branch: true, expression: expression, invert: true};
  },
  'elsif': function(expression) {
    return {branch: true, expression: expression, link: true};
  },
  'else': function() {
    return {branch: true, link: true};
  },
  'build': function(expression) {
    var options = {layout: {}};
    options.layout[parsed.expression] = true;
    return options;
  },
  'template': function(expression) {
    return {branch: true, template: expression, clean: true}
  },
  'end': function(expression) {
    return {ends: true}
  }
};

LSD.Layout.rExpression = /^\s*([a-z]+)(?:\s(.*?))?\s*$/;
Object.append(LSD.Layout, {
  extractKeyword: function(input) {
    var match = input.match(LSD.Layout.rExpression);
    if (match && LSD.Layout.Keyword[match[1]])
      return {keyword: match[1], expression: match[2]};
  },
  
  /* 
    Parsers selector and generates options for layout 
  */
  parse: function(selector, parent) {
    var options = {};
    var expressions = (selector.Slick ? selector : Slick.parse(selector)).expressions[0];
    var parsed = expressions[0];
    if (parsed.combinator != ' ') {
      if (parsed.combinator == '::') {
        if (LSD.Allocations[parsed.tag]) {
          options.allocation = LSD.Module.Allocations.prepare(parsed.tag, parsed.classes, parsed.attributes, parsed.pseudos);
        } else {
          var relation = (parent[0] || parent).relations[parsed.tag];
          if (!relation) throw "Unknown pseudo element ::" + parsed.tag;
          var source = relation.getSource();
          if (source) Object.append(options, LSD.Layout.parse(source, parent[0] || parent));
        }
      } else options.combinator = parsed.combinator;
    } 
    if (parsed.id) (options.attributes || (options.attributes = {})).id = parsed.id
    if (parsed.attributes) for (var all = parsed.attributes, attribute, i = 0; attribute = all[i++];) {
      var value = attribute.value || LSD.Attributes.Boolean[attribute.key] || "";
      (options.attributes || (options.attributes = {}))[attribute.key] = value;
    }
    if (parsed.tag != '*' && parsed.combinator != '::')
      if (parsed.tag.indexOf('-') > -1) 
        options.source = parsed.tag.split('-');
      else {
        options.tag = parsed.tag;
        var source = LSD.Layout.getSource(options, options.tag);
        if (source.push) options.source = source;
      }
    if (parsed.classes) options.classes = parsed.classes.map(Macro.map('value'));
    if (parsed.pseudos) for (var all = parsed.pseudos, pseudo, i = 0; pseudo = all[i++];) 
      (options.pseudos || (options.pseudos = [])).push(pseudo.key);
    return options;
  },
  
  getSource: function(options, tagName) {
    if (options && options.localName) {
      var source = LSD.toLowerCase(options.tagName);
      var type = options.getAttribute('type');
      if (type) (source.push ? source : [source]).push(type);
    } else {
      var source;
      if (tagName) (source ? (source.push ? source : (source = [source])).push(tagName) : (source = tagName));
      if (options) {
        var type = options.type;
        if (type) (source ? (source.push ? source : (source = [source])).push(type) : (source = type));
        var kind = options.kind;
        if (kind) (source ? (source.push ? source : (source = [source])).push(kind) : (source = kind));
      }
    }
    return source;
  }
});
/*
---
 
script: Expression.js
 
description: Adds layout capabilities to widget (parse and render widget trees from objects)
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Module
  - LSD.Module.Events
  - LSD.Layout

provides: 
  - LSD.Module.Layout
 
...
*/
  
LSD.Module.Layout = new Class({
  /*
  options: {
    traverse: true,
    extract: true
  },
  */
  
  constructors: {
    layout: function(options) {
      this.rendered = {};
    }
  },
  
  setLayout: function(layout) {
    if (typeOf(layout) == 'layout') this.layout = this;
    else this.options.layout = layout;
  },
  
  unsetLayout: function(layout) {
    if (this.layout == layout) delete this.layout;
    else delete this.options.layout;
  },
  
  getLayout: Macro.getter('layout', function() {
    var options = {};
    if (this.options.clone) options.clone = true;
    if (this.options.interpolate) options.interpolate = this.options.interpolate.bind(this)
    if (this.options.context) options.context = this.options.context;
    return new LSD.Layout(this, null, options);
  }),
  
  addLayout: function(name, layout, parent, opts, memo) {
    var old = this.rendered[name];
    if (old) {
      this.layout.add(old, parent, memo)
    } else {
      var first = layout.push && layout.length && layout[0];
      var method = (first && first.nodeType && ((first.nodeType != 1) || (!first.lsd))) ? 'children' : 'render';
      this.rendered[name] = this.layout[method](layout, parent, opts, memo);
    }
    return this.rendered[name];
  },
  
  removeLayout: function(name, layout, parent, opts, memo) {
    return this.layout.remove(this.rendered[name] || layout, parent, memo);
  },
  
  buildLayout: function(layout, parent) {
    var method = layout.charAt ? 'selector' : 'render';
    var instance = this.getLayout();
    if (!parent && parent !== false) {
      var args = Array.prototype.slice.call(arguments, 0);
      args[1] = this;
    }
    return instance[method].apply(instance, args || arguments);
  }
});

LSD.Module.Layout.events = {
  /*
    Builds children after element is built
  */
  build: function() {
    this.getLayout();
    if (!this.options.lazy && this.layout.origin == this && this.options.traverse !== false) {
      if (this.origin && !this.options.clone) this.element.replaces(this.origin);
      var nodes = LSD.slice((this.origin || this.element).childNodes);
      if (nodes.length) this.addLayout('children', nodes, [this, this.getWrapper()], this.options.clone ? {clone: true} : null);
    }
    if (this.options.layout) this.addLayout('options', this.options.layout, [this, this.getWrapper()]);
  },
  /* 
    Destroys the built layout with the widget 
  */
  destroy: function() {
    if (this.rendered.children) this.removeLayout('children');
    if (this.rendered.options) this.removeLayout('options');
  },  
  /*
    Augments all parsed HTML that goes through standart .write() interface
  */
  write: function(node) {
    this.addLayout('written', node, [this, this.getWrapper()]);
  },
  /*
    Augments all inserted nodes that come from partial html updates
  */
  DOMNodeInserted: function(node) {
    this.buildLayout(node, [this, this.getWrapper()]);
  },
  
  DOMNodeInsertedBefore: function(node, target) {
    this.buildLayout(node, [this, this.getWrapper()], null, {before: target});
  }
};

LSD.Module.Events.addEvents.call(LSD.Module.Layout.prototype, LSD.Module.Layout.events);

Object.append(LSD.Options, {
  layout: {
    add: 'setLayout',
    remove: 'unsetLayout'
  }
});
/*
---

script: Ambient.js

description: When it needs to know what's going on around 

license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Module.DOM
  - LSD.Module.Layout
  - LSD.Module.Expectations
  - LSD.Module.Mutations
  - LSD.Module.Allocations
  - LSD.Module.Relations
  - LSD.Module.Proxies
  - LSD.Module.Container
  - LSD.Module.Interpolations

provides: 
  - LSD.Module.Ambient

...
*/

LSD.Module.Ambient = new Class({
  Implements: [
    LSD.Module.DOM, 
    LSD.Module.Layout,
    LSD.Module.Expectations,
    LSD.Module.Mutations,
    LSD.Module.Allocations,
    LSD.Module.Relations,
    LSD.Module.Proxies,
    LSD.Module.Container,
    LSD.Module.Interpolations
  ]
});
/*
---
name    : SheetParser.Property

authors   : Yaroslaff Fedin

license   : MIT

requires : SheetParser.CSS

provides : SheetParser.Property
...
*/


(function(exports) {
  /*<CommonJS>*/
  var combineRegExp = (typeof module === 'undefined' || !module.exports)
    ?  exports.combineRegExp
    :  require('./sg-regex-tools').combineRegExp
  var SheetParser = exports.SheetParser
  /*</CommonJS>*/
  
  var Property = SheetParser.Property = {version: '0.2 dev'};
  
  /*
    Finds optional groups in expressions and builds keyword
    indecies for them. Keyword index is an object that has
    keywords as keys and values as property names.
    
    Index only holds keywords that can be uniquely identified
    as one of the properties in group.
  */
  
  Property.index = function(properties, context) {
    var index = {};
    for (var i = 0, property; property = properties[i]; i++) {
      if (property.push) {
        var group = index[i] = {};
        for (var j = 0, prop; prop = property[j]; j++) {
          var keys = context[prop].keywords;
          if (keys) for (var key in keys) {
            if (group[key] == null) group[key] = prop;
            else group[key] = false;
          }
        }
        for (var keyword in group) if (!group[keyword]) delete group[keyword];
      }
    }
    return index;
  };
  
  /*
    Simple value 
  */

  Property.simple = function(types, keywords) {
    return function(value) {
      if (keywords && keywords[value]) return true;
      if (types) for (var i = 0, type; type = types[i++];) if (Type[type](value)) return true;
      return false;
    }
  };
  
  /*
    Links list of inambigous arguments with corresponding properties keeping
    the order.
  */
  
  Property.shorthand = function(properties, keywords, context) {
    var index, r = 0;
    for (var i = 0, property; property = properties[i++];) if (!property.push) r++;
    return function() {
      var result = [], used = {}, start = 0, group, k = 0, l = arguments.length;
      for (var i = 0, argument; argument = arguments[i]; i++) {
        var property = properties[k];
        if (!property) return false;
        if ((group = (property.push && property))) property = properties[k + 1];
        if (property) {
          if (context[property](argument)) k++
          else property = false
        }
        if (group) {
          if (!property) {
            if (!index) index = Property.index(properties, context)
            if (property = index[k][argument])
              if (used[property]) return false;
              else used[property] = 1;
          }
          if ((property && !used[property]) || (i == l - 1)) {
            if (i - start > group.length) return false;
            for (var j = start; j < (i + +!property); j++) 
              if (!result[j])
                for (var m = 0, optional; optional = group[m++];) {
                  if (!used[optional] && context[optional](arguments[j])) {
                    result[j] = optional;
                    used[optional] = true
                    break;
                  }
                }
            start = i;
            k++;
          }
        }
        if (result[i] == null) result[i] = property;
      }
      if (i < r) return false
      for (var i = 0, j = arguments.length, object = {}; i < j; i++) {
        var value = result[i];
        if (!value) return false;
        object[value] = arguments[i];
      }
      return object;
    };
  }

  /*
    A shorthand that operates on collection of properties. When given values
    are not enough (less than properties in collection), the value sequence
    is repeated until all properties are filled.     
  */

  Property.collection = function(properties, keywords, context) {
    var first = context[properties[0]];
    if (first.type != 'simple') 
      return function(arg) {
        var args = (!arg || !arg.push) ? [Array.prototype.slice.call(arguments)] : arguments;
        var length = args.length;
        var result = {};
        for (var i = 0, property; property = properties[i]; i++) {
          var values = context[property].apply(1, args[i] || args[i % 2] || args[0]);
          if (!values) return false;
          for (var prop in values) result[prop] = values[prop];
        }
        return result;
      }
    else
      return function() {
        var length = arguments.length;
        var result = {};
        for (var i = 0, property; property = properties[i]; i++) {
          var values = arguments[i] || arguments[i % 2] || arguments[0];
          if (!context[property].call(1, values)) return false;
          result[property] = values;
        }
        return result;
      }
  };
  
  /* 
    Multiple value property accepts arrays as arguments
    as well as regular stuff
  */
  
  Property.multiple = function(arg) {
    //if (arg.push)
  }
  
  Property.compile = function(definition, context) {
    var properties, keywords, types;
    for (var i = 0, bit; bit = definition[i++];) {
      if (bit.push) properties = bit;
      else if (bit.indexOf) {
        if (!Type[bit]) {
          if (!keywords) keywords = {};
          keywords[bit] = 1;
        } else types ? types.push(bit) : (types = [bit]);
      } else options = bit;
    }
    var type = properties ? (keywords && keywords.collection ? "collection" : "shorthand") : 'simple'
    var property = Property[type](properties || types, keywords, context);
    if (keywords) property.keywords = keywords;
    if (properties) {
      var props = [];
      for (var i = 0, prop; prop = properties[i++];) prop.push ? props.push.apply(props, prop) : props.push(prop);
      property.properties = props;
    }
    property.type = type;
    return property;
  };
  
  
  var Type = Property.Type = {
    length: function(obj) {
      return typeof obj == 'number' || (!obj.indexOf && ('number' in obj) && obj.unit && (obj.unit != '%'))
    },
  
    color: function(obj) {
      return obj.match? obj.match(/^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/) : (obj.isColor || obj.rgba || obj.rgb || obj.hsb)
    },
    
    number: function(obj) {
      return typeof obj == 'number'
    },
    
    integer: function(obj) {
      return obj % 1 == 0 && ((0 + obj).toString() == obj)
    },
  
    keyword: function(keywords) {
      var storage;
      for (var i = 0, keyword; keyword = keywords[i++];) storage[keyword] = 1;
      return function(keyword) {
        return !!storage[keyword]
      }
    },
    
    strings: function(obj) {
      return !!obj.indexOf
    },
    
    url: function(obj) {
      return !obj.match && ("url" in obj);
    },
    
    position: function(obj) {        
      var positions = Type.position.positions;
      if (!positions) positions = Type.position.positions = {left: 1, top: 1, bottom: 1, right: 1, center: 1}
      return positions[obj]
    },
    
    percentage: function(obj) {
      return obj.unit == '%'
    }
  };
  
})(typeof exports != 'undefined' ? exports : this);
/*
---
name    : SheetParser.Styles

authors   : Yaroslaff Fedin

license   : MIT

requires : SheetParser.Property

provides : SheetParser.Styles
...
*/

(function() {
   
var SheetParser = (typeof exports == 'undefined') ? window.SheetParser : exports.SheetParser;
var CSS = SheetParser.Properties = {
  background:           [[['backgroundColor', 'backgroundImage', 'backgroundRepeat', 
                          'backgroundAttachment', 'backgroundPositionX', 'backgroundPositionY']], 'multiple'],
  backgroundColor:      ['color', 'transparent', 'inherit'],
  backgroundImage:      ['url', 'none', 'inherit'],
  backgroundRepeat:     ['repeat', 'no-repeat', 'repeat-x', 'repeat-y', 'inherit', 'space', 'round'],
  backgroundAttachment: ['fixed', 'scroll', 'inherit', 'local', 'fixed'],
  backgroundPosition:   [['backgroundPositionX', 'backgroundPositionY']],
  backgroundPositionX:  ['percentage', 'center', 'left', 'right', 'length', 'inherit'],
  backgroundPositionY:  ['percentage', 'center', 'top', 'bottom', 'length', 'inherit'],
   
  textShadow:           [['textShadowBlur', 'textShadowOffsetX', 'textShadowOffsetY', 'textShadowColor'], 'multiple'],
  textShadowBlur:       ['length'],
  textShadowOffsetX:    ['length'],
  textShadowOffsetY:    ['length'],
  textShadowColor:      ['color'],
                        
  boxShadow:            [['boxShadowBlur', 'boxShadowOffsetX', 'boxShadowOffsetY', 'boxShadowColor'], 'multiple'],
  boxShadowBlur:        ['length'],
  boxShadowOffsetX:     ['length'],
  boxShadowOffsetY:     ['length'],
  boxShadowColor:       ['color'], 
  
  outline:              ['outlineWidth', 'outlineStyle', 'outlineColor'],
  outlineWidth:         ['length'],
  outlineStyle:         ['dotted', 'dashed', 'solid', 'double', 'groove', 'reidge', 'inset', 'outset'],
  outlineColor:         ['color'],
                        
  font:                 [[
                          ['fontStyle', 'fontVariant', 'fontWeight'], 
                          'fontSize', 
                          ['lineHeight'], 
                          'fontFamily'
                        ]],
  fontStyle:            ['normal', 'italic', 'oblique', 'inherit'],
  fontVariant:          ['normal', 'small-caps', 'inherit'],
  fontWeight:           ['normal', 'number', 'bold', 'inherit'],
  fontFamily:           ['strings', 'inherit'],
  fontSize:             ['length', 'percentage', 'inherit', 
                         'xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large', 'smaller', 'larger'],
                        
  color:                ['color'],
  letterSpacing:        ['normal', 'length', 'inherit'],
  textDecoration:       ['none', 'capitalize', 'uppercase', 'lowercase'],
  textAlign:            ['left', 'right', 'center', 'justify'],
  textIdent:            ['length', 'percentage'],                 
  lineHeight:           ['normal', 'length', 'number', 'percentage'],
  
  height:               ['length', 'auto'],
  maxHeight:            ['length', 'auto'],
  minHeight:            ['length', 'auto'],
  width:                ['length', 'auto'],
  maxWidth:             ['length', 'auto'],
  minWidth:             ['length', 'auto'],
                        
  display:              ['inline', 'block', 'list-item', 'run-in', 'inline-block', 'table', 'inline-table', 'none', 
                         'table-row-group', 'table-header-group', 'table-footer-group', 'table-row', 
                         'table-column-group', 'table-column', 'table-cell', 'table-caption'],
  visibility:           ['visible', 'hidden'],
  'float':              ['none', 'left', 'right'],
  clear:                ['none', 'left', 'right', 'both', 'inherit'],
  overflow:             ['visible', 'hidden', 'scroll', 'auto'],
  position:             ['static', 'relative', 'absolute', 'fixed'],
  top:                  ['length', 'auto'],
  left:                 ['length', 'auto'],
  right:                ['length', 'auto'],
  bottom:               ['length', 'auto'],
  zIndex:               ['integer'],
  cursor:               ['auto', 'crosshair', 'default', 'hand', 'move', 'e-resize', 'ne-resize', 'nw-resize', 
                         'n-resize', 'se-resize', 'sw-resize', 's-resize', 'w-resize', 'text', 'wait', 'help']
};

var expanded = ['borderWidth', 'borderColor', 'borderStyle', 'padding', 'margin', 'border'];
for (var side, sides = ['Top', 'Right', 'Bottom', 'Left'], i = 0; side = sides[i++];) {
  CSS['border' + side]           = [['border' + side + 'Width', 'border' + side + 'Style', 'border' + side + 'Color']];
  
  CSS['border' + side + 'Width'] = ['length', 'thin', 'thick', 'medium'];
  CSS['border' + side + 'Style'] = ['none', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset', 'inherit', 'none'];
  CSS['border' + side + 'Color'] = ['color'];
  
  CSS['margin' + side]           = ['length', 'percentage', 'auto'];
  CSS['padding' + side]          = ['length', 'percentage', 'auto'];

  for (var j = 0, prop; prop = expanded[j++];) {
    if (!CSS[prop]) CSS[prop] = [[]];
    CSS[prop][0].push(prop.replace(/^([a-z]*)/, '$1' + side));
    if (i == 4) CSS[prop].push('collection')
  }

  if (i % 2 == 0) 
    for (var j = 1, adj; adj = sides[j+=2];) 
      CSS['borderRadius' + side + adj] = ['length', 'none'];
};

var Styles = SheetParser.Styles = {}
for (var property in CSS) Styles[property] = SheetParser.Property.compile(CSS[property], Styles);

})();
/*
---
 
script: Styles.js
 
description: Set, get and render different kind of styles on widget
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Module
  - LSD.Module.Events
  - Core/Element.Style
  - Ext/Object.Array
  - Sheet/SheetParser.Styles

provides: 
  - LSD.Module.Styles

...
*/

!function() {
  
var CSS = SheetParser.Styles, Paint = LSD.Styles;
var setStyle = function(element, property, value, type) {
  delete this.style.expressed[property];
  delete this.style.calculated[property];
  if (value === false) {
    if (element && this.element) delete this.element.style[property];
    delete this.style[element ? 'element' : 'paint'][property], delete this.style.current[property];
    if (type) delete this.style[type][property];
  } else {
    if (element && this.element) this.element.style[property] = (typeof value == 'number') ? value + 'px' : value;
    this.style[element ? 'element' : 'paint'][property] = this.style.current[property] = value;
    if (type) this.style[type][property] = value;
  }
}

LSD.Module.Styles = new Class({
  constructors: {
    style: function() {
      this.rules = [];
      this.style = {    // Styles that...
        current: {},    // ... widget currently has
        found: {},      // ... were found in stylesheets
        given: {},      // ... were manually assigned

        changed: {},    // ... came from stylesheet since last render
        calculated: {}, // ... are calculated in runtime
        computed: {},   // ... are already getStyled
        expressed: {},  // ... are expressed through function
        implied: {},    // ... are assigned by environment

        element: {},    // ... are currently assigned to element
        paint: {}       // ... are currently used to paint
      };
    }
  },

  setStyle: function(property, value) {
    var paint, css;
    if (!(paint = Paint[property]) && !(css = CSS[property])) return false;
    var length = arguments.length;
    if (length > 2) {
      var last = arguments[length - 1];
      if (this.style[last || 'given']) {
        var type = last;
        length--;
      }
      if (length > 2) value = Array.prototype.splice.call(arguments, 1, length);
    }
    if (value.call) {
      var expression = value;
      value = value.call(this, property);
    }
    var result = (css || paint)[value.push ? 'apply' : 'call'](this, value);
    if (result === true || result === false) setStyle.call(this, css, property, value, type);
    else for (var prop in result) setStyle.call(this, css, prop, result[prop], type);
    if (expression) {
      this.style.expressed[property] = expression
      this.style.computed[property] = value
    }
    return result;
  },

  setStyles: function(style, type) {
    for (var key in style) this.setStyle(key, style[key], type)
  },

  getStyle: function(property) {
    if (this.style.computed[property]) return this.style.computed[property];
    var value;
    var definition = Paint[property] || CSS[property];
    if (!definition) return;
    if (definition.properties) return definition.properties.map(this.getStyle.bind(this));
    var expression = this.style.expressed[property];    
    if (expression) {
      value = this.style.current[property] = this.calculateStyle(property, expression);
    } else {  
      value = this.style.current[property];
      if (property == 'height') {
        if (typeof value !== 'number') value = this.getClientHeight();
      } else if (property == 'width') {
        if (typeof value !== 'number') value = this.getClientWidth();
      } else {
        if (value == "inherit") value = this.inheritStyle(property);
        if (value == "auto") value = this.calculateStyle(property);
      }
    }
    this.style.computed[property] = value;
    return value;
  },

  getStyles: function(properties) {
    var result = {};
    for (var i = 0, property, args = arguments; property = args[i++];) result[property] = this.getStyle(property);
    return result;
  },
  
  renderStyles: function(styles) {
    var style = this.style, 
        current = style.current,
        paint = style.paint, 
        element = style.element,  
        found = style.found,
        implied = style.implied,
        calculated = style.calculated,
        given = Object.append(style.given, styles),
        changed = style.changed;
    this.setStyles(given, 'given')
    for (var property in found) if ((property in changed) && !(property in given)) this.setStyle(property, found[property]);
    Object.append(style.current, style.implied);
    for (var property in element)  {
      if (!(property in given) && !(property in found) && !(property in calculated) && !(property in implied)) {
        this.element.style[property] = '';
        delete element[property]
      }
    }
    for (var property in current)  {
      if (!(property in given) && !(property in found) && !(property in calculated) && !(property in implied)) {
        delete current[property];
        delete paint[property];
      }
    }
  },
  
  combineRules: function(rule) {
    var rules = this.rules, style = this.style, found = style.found = {}, implied = style.implied = {}, changed = style.changed;
    for (var j = rules.length, other; other = rules[--j];) {
      var setting = other.style, implying = other.implied, self = (rule == other);
      if (setting) for (var property in setting) if (!(property in found)) {
        if (self) changed[property] = setting[property];
        found[property] = setting[property];
      }
      if (implying) for (var property in implying) if (!(property in implied)) implied[property] = implying[property];
    }
  },
  
  addRule: function(rule) {
    var rules = this.rules;
    if (rules.indexOf(rule) > -1) return
    for (var i = 0, other;  other = rules[i++];) {
      if ((other.specificity > rule.specificity) || (other.specificity == rule.specificity)) 
        if (other.index > rule.index) break;
    }
    rules.splice(--i, 0, rule);
    this.combineRules(rule);
  },
  
  removeRule: function(rule) {
    var rules = this.rules, index = rules.indexOf(rule)
    if (index == -1) return
    rules.splice(index, 1);
    this.combineRules();
    var style = this.style, found = style.found, changed = style.changed, setting = rule.style;
    for (var property in setting) if (!Object.equals(found[property], setting[property])) changed[property] = found[property];
 },
  
  inheritStyle: function(property) {
    var node = this;
    var style = node.style.current[property];
    while ((style == 'inherit' || !style) && (node = node.parentNode)) style = node.style.current[property];
    return style;
  },
  
  calculateStyle: function(property, expression) {
    if (this.style.calculated[property]) return this.style.calculated[property];
    var value;
    if (expression) {
      value = expression.call(this, property);
    } else {
      switch (property) {
        case "height":
          value = this.getClientHeight();
        case "width":
          value = this.inheritStyle(property);
          if (value == "auto") value = this.getClientWidth();
        case "height": case "width":  
          //if dimension size is zero, then the widget is not in DOM yet
          //so we wait until the root widget is injected, and then try to repeat
          if (value == 0 && (this.redraws == 0)) this.halt();
      }
    }
    this.style.calculated[property] = value;
    return value;
  },
  
  render: function(style) {
    this.renderStyles(style);
    this.parent.apply(this, arguments);
  }
});

LSD.Module.Styles.events = {
  update: function() {
    this.style.calculated = {};
    this.style.computed = {};
  }
};

LSD.Module.Events.addEvents.call(LSD.Module.Styles.prototype, LSD.Module.Styles.events);

LSD.Options.styles = {
  add: 'setStyles',
  remove: 'unsetStyles'
};
}();
/*
---

script: Accessories.js

description: Things that change the widget in one module

license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Module.Options
  - LSD.Module.States
  - LSD.Module.Attributes
  - LSD.Module.Events
  - LSD.Module.Dimensions
  - LSD.Module.Styles
  - LSD.Module.Shortcuts
  - LSD.Module.Element
  - LSD.Module.Selectors
  - LSD.Module.Tag
  - LSD.Module.Chain
  - LSD.Module.Actions
  
provides: 
  - LSD.Module.Accessories

...
*/

LSD.Module.Accessories = new Class({
  Implements: [
    LSD.Module.Options,
    LSD.Module.States,
    LSD.Module.Attributes,
    LSD.Module.Events,
    LSD.Module.Dimensions,
    LSD.Module.Styles,
    LSD.Module.Shortcuts,
    LSD.Module.Tag,
    LSD.Module.Element,
    LSD.Module.Selectors,
    LSD.Module.Chain,
    LSD.Module.Actions
  ]
});
/*
---
 
script: Layer.js
 
description: Adds a piece of SVG that can be drawn with widget styles
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - ART/ART.Shape
  - LSD.Module.Styles
  - Sheet/SheetParser.Styles
 
provides: 
  - LSD.Layer
  - LSD.Layer.Shaped
 
...
*/

!function() {
  
LSD.Layer = function(name, styles, painters) {
  this.name = name;
  this.styles = styles;
  this.painters = painters;
}

LSD.Layer.prototype = {
  render: function(widget, commands) {
    var canvas = widget.getCanvas();
    var shape = commands.shape;
    if (shape == 'none') return;
    if (!shape) shape = widget.getStyle('shape') || 'rectangle';
    var layer = widget.shapes[this.name];
    if (shape.glyph) {
      var glyph = ART.Glyphs[shape.glyph];
      if (!glyph) return;    
      var path = new ART.Path(glyph);
      var box = path.measure();
      if (!layer) layer = new ART.Shape(path, box.width, box.height);
      if (commands.size && !Object.equals(previous ? previous.size : box, commands.size))
        layer.resizeTo(commands.size.width, commands.size.height)
        
    } else if (!shape.indexOf){
      for (var name in shape) {
        var values = shape[name];
        if (!values.push) values = [values];
        shape = name;
      }
    }
    if (!layer) {
      var path = ART.Shape[shape.capitalize()];
      if (!path) return;
      var layer = new path;
      layer.render(commands)
    } else {
      var previous = layer.commands;
      if (layer.draw && layer.render) layer.render(commands)
    }
    layer.commands = commands;
    widget.shapes[this.name] = layer;
    for (command in commands) {
      var value = commands[command];
      if (layer[command] && command != 'move') {
        if (!value || !previous || !Object.equals(previous[command], value)) layer[command][value && value.push ? 'apply' : 'call'](layer, value);
      }
    }
    var translate = commands.translate = {x: 0, y: 0}
    if (commands.inside) {
      translate.x += commands.inside.left
      translate.y += commands.inside.top;
    };
    //if (commands.outside) {
    //  top += commands.outside.top;
    //  left += commands.outside.left
    //};
    if (commands.move) {
      translate.x += commands.move.x;
      translate.y += commands.move.y;
    }
    if (!previous || !Object.equals(previous.translate, translate)) layer.moveTo(translate.x, translate.y)
  },
  
  draw: function(widget, context, previous) {
    context = Object.append({size: widget.size, style: widget.style.current}, context || {});
    if (context.style.cornerRadiusTopLeft !== null) {
      context.radius = widget.getStyle('cornerRadius')
    }
    var inherited = {}, overwritten = {};
    for (var painter, i = 0; painter = this.painters[i++];) {
      var commands = painter.paint.apply(context, painter.keys.map(function(prop) { return widget.getStyle(prop)}));
      for (var name in commands) {
        var value = commands[name];
        if (Inherit[name]) {;
          inherited[name] = merge(value, context[name])
        } else {
          if (!Accumulate[name]) overwritten[name] = context[name]
          context[name] = (Accumulate[name] || Merge[name]) ? merge(value, context[name]) : value;
        }
      }
      //for (var command in value) this[command](command[value]);
    }    
    this.render(widget, context);
    return Object.append(context, overwritten, inherited);;
  }
}

var merge = function(value, old) {
  if (typeof value == "object") {
    if (value.push) {
      for (var j = 0, k = value.length; j < k; j++) {
        var item = value[j] || 0;
        if (old) old[j] = (old[j] || 0) + item;
        else old = [item]
      }
      return old;
    } else if (!value.indexOf) {
      for (var prop in value) {
        var item = value[prop] || 0;
        if (!old) old = {}
        old[prop] = (old[prop] || 0) + item;
      }
      return old;
    }
  }  
  return value;
}

var Accumulate = LSD.Layer.accumulated = new Object.Array('translate', 'radius');
var Inherit = LSD.Layer.inherited = new Object.Array('inside', 'outside')
var Merge = LSD.Layer.merged = new Object.Array('size')

var Property = SheetParser.Property;
var Styles = LSD.Styles;
var Map = LSD.Layer.Map = {};
var Cache = LSD.Layer.Cache = {};

//LSD.Layer.getProperty = function(property, properties)
 
LSD.Layer.generate = function(name, layers) {
  if (arguments.length > 2) layers = Array.prototype.splice.call(arguments, 1);
  var painters = [];
  var styles = LSD.Layer.prepare(name, layers, function(painter) {
    painters.push(painter)
  })
  return new LSD.Layer(name, styles, painters);
};

LSD.Layer.prepare = function(name, layers, callback) {
  var properties = [], styles = {};
  for (var i = 0, layer; layer = layers[i++];) {
    var definition = LSD.Layer[layer.capitalize()];
    if (!definition ) continue;
    var properties = definition.properties && Object.clone(definition.properties);
    if (!properties) continue;
    definition = Object.append({styles: {}, keys: []}, definition);
    var prefix = definition.prefix;
    if (prefix === false || layer == name) prefix = name;
    else if (!prefix) prefix = name + layer.capitalize();
    var length = 0;
    for (var property in properties) length++
    var simple = (length == 1);
    Object.each(properties, function(value, property) {
      if (property == layer) {
        if (simple) var style = prefix
        else return;
      } else var style = prefix + property.capitalize()
      definition.styles[style] = styles[style] = Property.compile(value, properties);
      definition.keys.push(style);
    });
    var shorthand = properties[layer];
    if (shorthand && !simple) {
      var style = (layer == name) ? name : name + layer.capitalize();
      if (length) {
        for (var j = 0, k = 0, l = 0, prop; prop = shorthand[j]; j++) {
          if (!prop.push) { 
            if (properties[prop]) {
              shorthand[j] = prefix + prop.capitalize();
              k++
            }
          } else for (var m = 0, sub; sub = prop[m]; m++) {
            if (properties[sub]) {
              prop[m] = prefix + sub.capitalize();
              l++;
            }
          }
        }
      }
      definition.styles[style] = styles[style] = Property.compile(((l > 0 && (k > 0 || j == 1)) ) ? [shorthand] : shorthand, styles);
      definition.shorthand = style;
    }
    if (definition.onCompile) definition.onCompile(name);
    if (callback) callback(definition);
  }
  for (var property in styles) {
    Styles[property] = styles[property];
    Map[property] = name;
  }
  return styles;
}

LSD.Layer.get = function(name) {
  var key = name//Array.flatten(arguments).join('');
  if (Cache[key]) return Cache[key];
  else return (Cache[key] = LSD.Layer.generate.apply(LSD.Layer, arguments))
}

}();
/*
---
 
script: Color.js
 
description: Fills shape with color
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
- LSD.Layer
 
provides: [LSD.Layer.Color, LSD.Layer.Fill]
 
...
*/

LSD.Layer.Color = {
  properties: {
    color: ['color', 'gradient', 'none']
  },
  
  paint: function(color) {
    if (color) var radial = color['radial-gradient'], gradient = color['gradient'] || color ['linear-gradient'];
    if (gradient) {
      return {fillLinear: [gradient]}
    } else if (!radial) {
      return {fill: (!color || color == 'none') ? null : color} 
    }
  }
};

LSD.Layer.Fill = {
  properties: {
    color: ['color']
  },
  
  prefix: 'fill',
  
  paint: LSD.Layer.Color.paint
};
/*
---
 
script: Stroke.js
 
description: Fills shape with color and strokes with a stroke
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Layer
  - LSD.Layer.Color
 
provides: 
  - LSD.Layer.Stroke
 
...
*/

LSD.Layer.Stroke = {
  
  properties: {
    stroke:    ['width', ['cap', 'join', 'dash'], 'color'], 
    color:     ['gradient', 'color'],
    width:     ['length'],
    cap:       ['butt', 'round', 'square'],
    join:      ['butt', 'round', 'square'],
    dash:      ['tokens']
  },
  
  paint: function(color, width, cap, join, dash) {
    if (!width) width = 0;
    var gradient = color && (color['gradient'] || color['linear-gradient']);
    var result = {    
      dash: dash,
      size: {
        width: width,
        height: width
      },
      move: {
        x: width / 2,
        y: width / 2
      },
      inside: {
        left: width,
        top: width,
        right: width,
        bottom: width
      },
      stroke: [!gradient && color || null, width, cap, join]
    };
    if (this.radius != null) {
      var radius = result.radius = []
          for (var i = 0; i < 4; i++) radius[i] = (this.radius[i] > 0) ? width / 1.5 : 0;
    }
    if (gradient) result.strokeLinear = [gradient]
    return result;
  }
}
/*
---
 
script: Offset.js
 
description: Positions layer around the canvas
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
- LSD.Layer
 
provides: [LSD.Layer.Offset]
 
...
*/

LSD.Layer.Offset = {
  properties: {  
    offset:    [['top', 'right', 'bottom', 'left']],
    top:       ['length', 'percentage'],
    left:      ['length', 'percentage'],
    bottom:    ['length', 'percentage'],
    right:     ['length', 'percentage'],
  },

  paint: function(top, right, bottom, left) {
    return {
      move: {
        x: left == null && right != null ? (this.size.width - (right || 0)) : (left || 0), 
        y: top == null && bottom != null ? (this.size.height - (bottom || 0)) : (top || 0)
      }
    }
  }
};
/*
---
 
script: Position.js
 
description: Positions layer in the box
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Layer
 
provides: 
  - LSD.Layer.Position
 
...
*/

LSD.Layer.Position = {
  properties: {
    position: [['x', 'y']],
    x:        ['length', 'percentage', 'left', 'right', 'center'],
    y:        ['length', 'percentage', 'top', 'bottom', 'center']
  },
  
  
  paint: function(x, y) {
    if (!x && !y) return;
    return {
      move: LSD.position(this.box, this.size, x || 'center', y || 'center')
    }
  }
}
/*
---
 
script: Radius.js
 
description: Rounds shapes corners
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Layer
 
provides: 
  - LSD.Layer.Radius
 
...
*/

LSD.Layer.Radius = {
  properties: {
    radius:      [['topLeft', 'bottomLeft', 'topRight', 'bottomRight'], 'collection'],
    topLeft:     ['percentage', 'length'],
    bottomLeft:  ['percentage', 'length'],
    topRight:    ['percentage', 'length'],
    bottomRight: ['percentage', 'length'],
  },
  
  paint: function() {
    return {
      radius: Array.prototype.splice.call(arguments, 0).map(function(r) { return r || 0})
    }
  }
}



LSD.Layer.prepare('corner', ['radius'], false);
/*
---
 
script: Shadow.js
 
description: Drops outer shadow with offsets. Like a box shadow!
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
- LSD.Layer
- Ext/Element.Properties.boxShadow
- Ext/Element.Properties.borderRadius
 
provides: [LSD.Layer.Shadow, LSD.Layer.Shadow.Layer]
 
...
*/

                              //only gecko & webkit nightlies                                       AppleWebKit/534.1+ (KHTML, ... plus means nightly
Browser.Features.SVGFilters = Browser.firefox || (Browser.webkit && navigator.userAgent.indexOf("+ (KHTML") > -1) 

LSD.Layer.Shadow = {
  
  properties: {
    shadow:    ['blur', ['offsetX', 'offsetY'], 'color'],
    blur:      ['length', 'number'],
    offsetX:   ['length', 'number'],
    offsetY:   ['length', 'number'],
    color:     ['color']
  },
  
  paint: function(color, blur, x, y, stroke, method) {
    //if (!method) {
    //  if (this.method) method = method
    //  if (blur < 4) method = 'onion';
    //  else if (Browser.Features.boxShadow && this.base.name == 'rectangle') method = 'native';
    //  else if (Browser.Features.SVGFilters) method = 'blur';
    //  else method = 'onion'
    //}
    //if (this.method && method != this.method) this.eject();
    //return this.setMethod(method).paint.apply(this, arguments);
  }
}

/*
---
 
script: Shadow.Blur.js
 
description: SVG Filter powered shadow
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
- LSD.Layer.Shadow
 
provides: [LSD.Layer.Shadow.Blur]
 
...
*/

LSD.Layer.Shadow.Blur = new Class({
  //Extends: LSD.Layer.Shadow,

  paint: function(color, blur, x, y, stroke) {
    this.produce(stroke);
    this.shape.fill.apply(this.shape, color ? $splat(color) : null);
    if (blur > 0) this.shape.blur(blur);
    else this.shape.unblur();
    return {
      move: {
        x: x + blur, 
        y: y + blur
      },
      outside: {
        left: Math.max(blur - x, 0),
        top: Math.max(blur - y, 0),
        right: Math.max(blur + x, 0),
        bottom: Math.max(blur + y, 0)
      }
    }
  }
})
/*
---
 
script: InnerShadow.js
 
description: Drops inner shadow 
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Layer.Shadow
 
provides: 
  - LSD.Layer.Shadow.Inset
 
...
*/

LSD.Layer.InnerShadow = new Class({
  //Extends: LSD.Layer.Shadow,
  
  properties: {
    required: ['innerShadowColor'],
    numerical: ['innerShadowBlur', 'innerShadowOffsetX', 'innerShadowOffsetY']
  },

  paint: function(color, blur, x, y) {
    var fill = new Color(color);
    fill.base = fill.alpha;
    var transition = function(p){
      return 1 - Math.sin((1 - p) * Math.PI / 2);
    };
    var offset = Math.max(Math.abs(x), Math.abs(y));
    blur += offset;
    for (var i = 0; i < blur; i++) {
      if (blur == 0) {
        fill.alpha = Math.min(fill.base * 2, 1)
      } else {
        fill.alpha = fill.base * transition((blur - i) / blur)
      }
      var layer = this.layers[i];
      if (!layer) layer = this.layers[i] = LSD.Layer.InnerShadow.Layer.getInstance(this);
      layer.layer = this;
      layer.base = this.base;
      layer.blur = blur
      layer.dy = y - x
      layer.y = Math.max(Math.min(layer.dy, 0) + i, 0);
      layer.dx = x - y;
      layer.x = Math.max(Math.min(layer.dx, 0) + i, 0);
      layer.produce([
        Math.min(((layer.x > 0) ? ((layer.dx - i < 0) ? 1 : 0.5) * - layer.x  - 0.25 : 0), 0),
        Math.min(((layer.y > 0) ? (layer.dy + i < 0 ? 1 : 0.5) * - layer.y  - 0.25: 0), 0)
      ]);
      layer.stroke(fill, 1);
    }
    var length = this.layers.length;
    for (var i = blur; i < length; i++) if (this.layers[i]) LSD.Layer.InnerShadow.Layer.release(this.layers[i]);
    this.layers.splice(blur, length);
  },
  
  translate: function(x, y) {
    this.parent.apply(this, arguments);
    for (var i = 0, j = this.layers.length; i < j; i++) {
      var layer = this.layers[i];
      if (layer) layer.translate(x + layer.x, y + layer.y);
    }
  },
  
  eject: function() {
    for (var i = 0, j = this.layers.length; i < j; i++) {
      var layer = this.layers[i];
      if (!layer) continue;
      LSD.Layer.InnerShadow.Layer.release(layer)
      if (layer.shape.element.parentNode) layer.shape.element.parentNode.removeChild(layer.shape.element);
    }
  },

  inject: function(node) {
    this.parent.apply(this, arguments);
    this.update.apply(this, arguments);
  },
  
  update: function() {
    for (var i = 0, j = this.layers.length; i < j; i++) if (this.layers[i]) this.layers[i].inject.apply(this.layers[i], arguments);
  }
});
LSD.Layer.InnerShadow.Layer = new Class({
  Extends: LSD.Layer
});
LSD.Layer.InnerShadow.Layer.stack = [];
LSD.Layer.InnerShadow.Layer.getInstance = function() {
  return LSD.Layer.InnerShadow.Layer.stack.pop() || (new LSD.Layer.InnerShadow.Layer);
}
LSD.Layer.InnerShadow.Layer.release = function(layer) {
  layer.element.parentNode.removeChild(layer.element);
  LSD.Layer.InnerShadow.Layer.stack.push(layer);
};

/*
---
 
script: Shadow.Native.js
 
description: CSS powered shadow
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
- LSD.Layer.Shadow
 
provides: [LSD.Layer.Shadow.Native]
 
...
*/

LSD.Layer.Shadow.Native = new Class({
  //Extends: LSD.Layer,

  paint: function(color, blur, x, y, stroke) {
    var widget = this.base.widget;
    var element = widget.toElement();
    element.set('borderRadius', widget.getStyle('cornerRadius'));
    element.set('boxShadow', {color: color, blur: blur, x: x, y: y})
  },
  
  eject: function() {
    var widget = this.base.widget;
    var element = widget.element;
    element.set('boxShadow', false)
  }
})
/*
---
 
script: Shadow.Onion.js
 
description: Draws shadow with layers stack upon each others
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
- LSD.Layer.Shadow
 
provides: [LSD.Layer.Shadow.Onion]
 
...
*/

LSD.Layer.Shadow.Onion = new Class({
  //Extends: LSD.Layer.Shadow,
  
  paint: function(color, blur, x, y, stroke) {
    var fill = new Color(color);
    fill.base = fill.alpha;
    //var node = this.element.parentNode;
    var layers = Math.max(blur, 1);
    for (var i = 0; i < layers; i++) {
      if (blur == 0) {
        fill.alpha = Math.min(fill.base * 2, 1)
      } else {
        fill.alpha = fill.base / 2 * (i == blur ? .29 : (.2 - blur * 0.017) + Math.sqrt(i / 100));
      }
      var rectangle = this.layers[i];
      if (!rectangle) rectangle = this.layers[i] = LSD.Layer.Shadow.Layer.getInstance(this);
      rectangle.base = this.base;
      rectangle.shadow = this;
      rectangle.produce(stroke / 2 + blur / 2 - i);
      rectangle.fill(fill);
    }
    var length = this.layers.length;
    for (var i = layers; i < length; i++) if (this.layers[i]) LSD.Layer.Shadow.Layer.release(this.layers[i]);
    this.layers.splice(layers, length);
    return {
      move: {
        x: x * 1.5, //multiplying by 1.5 is unreliable. I need a better algorithm altogether
        y: y * 1.5
      },
      outside: {
        left: Math.max(blur - x, 0),
        top: Math.max(blur - y, 0),
        right: Math.max(blur + x, 0),
        bottom: Math.max(blur + y, 0)
      }
    }
  },

  inject: function(node) {
    this.parent.apply(this, arguments);
    this.update.apply(this, arguments);
  },
  
  update: function() {
    for (var i = 0, j = this.layers.length; i < j; i++) if (this.layers[i]) this.layers[i].inject.apply(this.layers[i], arguments);
  },
  
  eject: function() {
    for (var i = 0, j = this.layers.length; i < j; i++) {
      var layer = this.layers[i];
      if (!layer) continue;
      LSD.Layer.Shadow.Layer.release(layer)
      if (layer.shape.element.parentNode) layer.shape.element.parentNode.removeChild(layer.shape.element);
    }
  },

  translate: function(x, y) {
    this.parent.apply(this, arguments);
    for (var i = 0, j = this.layers.length; i < j; i++) 
      if (this.layers[i]) this.layers[i].translate(x + i + j / 2, y + i + j / 2)
  }
});

LSD.Layer.Shadow.Layer = new Class({
  Extends: LSD.Layer,
  
  
  inject: function(container){
    this.eject();
    if (container instanceof ART.SVG.Group) container.children.push(this);
    this.container = container;
    var first = container.element.firstChild;
    if (first) container.element.insertBefore(this.shape.element, first);
    else container.element.appendChild(this.shape.element);
    return this;
  }
});
LSD.Layer.Shadow.Layer.stack = [];
LSD.Layer.Shadow.Layer.getInstance = function() {
  return LSD.Layer.Shadow.Layer.stack.pop() || (new LSD.Layer.Shadow.Layer);
};
LSD.Layer.Shadow.Layer.release = function(layer) {
  var shape = layer.shape;
  if (shape) shape.element.parentNode.removeChild(shape.element);
  LSD.Layer.Shadow.Layer.stack.push(layer);
};

/*
---
 
script: Shape.js
 
description: Base layer that provides shape
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Layer
  - ART/ART.Shape
 
provides: 
  - LSD.Layer.Shape
 
...
*/

LSD.Layer.Styles = {}
LSD.Layer.Shape = {
  properties: {
    shape:      ['url', 'shape', 'glyph']
  },
  
  paint: function(shape) {
    return {
      shape: shape
    }
  },
  
  onCompile: function(name) {
    for (var shape in ART.Shape) {
      var klass = ART.Shape[shape];
      if (!klass || !klass.prototype || !klass.prototype.properties) continue;
      var properties = klass.prototype.properties;
      LSD.Layer.Styles[name + shape] = properties.map(function(prop) { return name + prop.capitalize()});
    }
  }
}

Object.append(SheetParser.Property.Type, {
  shape: function(value) {
    if (value.indexOf) var name = value
    else for (var key in value) { var name = key; break};
    return !!ART.Shape[name.capitalize()]
  },
  
  glyph: function(value) {
    return value.glyph
  }
});

LSD.Styles.shape = SheetParser.Property.compile(LSD.Layer.Shape.properties.shape)
/*
---
 
script: Size.js
 
description: Base layer that provides shape
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Layer
 
provides: 
  - LSD.Layer.Size
 
...
*/

LSD.Layer.Size = {
  properties: {
    size:       [['height', 'width'], 'collection'],
    height:     ['length', 'percentage'],
    width:      ['length', 'percentage']
  },
  
  prefix: false,
  
  paint: function(height, width) {
    if (height !== null && width !== null) return {
      size: {
        height: this.size.height ? (height - this.size.height) : height,
        width: this.size.width ? (width - this.size.width) : width
      }
    }
  }
}
/*
---
 
script: Scale.js
 
description: Adds a way to set scale level to the layer
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Layer
 
provides: 
  - LSD.Layer.Scale
 
...
*/

LSD.Layer.Scale = {
  properties: {
    scale: [['x', 'y'], 'collection'],
    x:     ['number', 'percentage'],
    y:     ['number', 'percentage']
  },
  
  paint: function(x, y) {
    if (x != null || y != null) return {
      size: {
        width: - this.size.width * (1 - x),
        height: - this.size.height * (1 - y)
      }
    }
  }
}
/*
---
 
script: Layers.js
 
description: Make widget use layers for all the SVG
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Trait
  - LSD.Layer
  - LSD.Module.Styles

provides: 
  - LSD.Module.Layers
 
...
*/


!function() {

LSD.Module.Layers = new Class({
  constructors: {
    layers: function() {
      this.offset = {
        inside: {},
        outside: {},
        padding: {}
      };
      this.shapes = {};
      this.style.layers = {};
      this.layers = {}
    }
  },

  addLayer: function(name, value) {
    var slots = this.style.layers || (this.style.layers = {});
    var layer = this.layers[name] = LSD.Layer.get(name, Array.concat(value));
    for (var i = 0, painter; painter = layer.painters[i++];) {
      for (var group = painter.keys, j = 0, property; property = group[j++];) {
        if (!slots[property]) slots[property] = [];
        slots[property].push(name);
      }
    }
  },
  
  removeLayer: function(name, value) {
    var slots = this.style.layers || (this.style.layers = {});
    var layer = this.layers[name] = LSD.Layer.get(name, Array.concat(value));
    for (var i = 0, painter; painter = layer.painters[i++];) {
      for (var group = painter.keys, j = 0, property; property = group[j++];) {
        if (slots[property]) slots[property].erase(name);
      }
    }
  },
  
  renderLayers: function(dirty) {
    var updated = new Object.Array, style = this.style, layers = style.layers, offset = this.offset;
    for (var property in dirty) if (layers[property]) updated.push.apply(updated, layers[property]);
    
    var result = {};
    for (var name in this.layers) {
      if (!updated[name]) continue;
      var layer = this.layers[name];
      var sizes = Object.append({box: this.size}, {size: Object.append({}, this.size)});
      result = layer.draw(this, Object.append(result.inside ? {inside: result.inside, outside: result.outside} : {}, sizes))
    }
    var inside  = offset.inside  = Object.append({left: 0, right: 0, top: 0, bottom: 0}, result.inside);
    var outside = offset.outside = Object.append({left: 0, right: 0, top: 0, bottom: 0}, result.outside);
    offset.shape = /*this.shape.getOffset ? this.shape.getOffset(style.current) : */{left: 0, right: 0, top: 0, bottom: 0};
    
    for (var name in this.shapes) {
      var layer = this.shapes[name];
      if (!layer) continue;
      if (!layer.injected) {
        for (var layers = Object.keys(this.layers), i = layers.indexOf(layer.name), key, next; key = layers[++i];) {
          if ((next = this.layers[key]) && next.injected && next.shape) {
            layer.inject(next.shape, 'before');
            break;
          }
        }
        if (!layer.injected) layer.inject(this.getCanvas());
        layer.injected = true;
      }
    }
  },
  
  render: function() {
    var style = this.style, last = style.last, old = style.size, paint = style.paint, changed = style.changed;
    this.parent.apply(this, arguments);
    this.setSize(this.getStyles('height', 'width'));
    var size = this.size;
    if (size && (!old || (old.width != size.width || old.height != size.height))) {
      this.fireEvent('resize', [size, old]);
      changed = paint;
    }
    if (Object.getLength(changed) > 0) this.renderLayers(changed);
    style.changed = {};
    style.last = Object.append({}, paint);
    style.size = Object.append({}, size);
    this.renderOffsets();
  },
  
  renderStyles: function() {
    this.parent.apply(this, arguments);
    var style = this.style, current = style.current;
    Object.append(this.offset, {
      padding: {left: current.paddingLeft || 0, right: current.paddingRight || 0, top: current.paddingTop || 0, bottom: current.paddingBottom || 0},
      margin: {left: current.marginLeft || 0, right: current.marginRight || 0, top: current.marginTop || 0, bottom: current.marginBottom || 0}
    });
  },
  
  renderOffsets: function() {
    var element = this.element,
        current = this.style.current, 
        offset  = this.offset,         // Offset that is provided by:
        inside  = offset.inside,       // layers, inside the widget
        outside = offset.outside,      // layers, outside of the widget
        shape   = offset.shape,        // shape
        padding = offset.padding,      // padding style declarations
        margin  = offset.margin,       // margin style declarations
        inner   = {},                  // all inside offsets above, converted to padding
        outer   = {};                  // all outside offsets above, converted to margin
        
    for (var property in inside) {
      var cc = property.capitalize();
      if (offset.inner) var last = offset.inner[property];
      inner[property] = padding[property] + inside[property] + shape[property] + outside[property];
      if (last != null ? last != inner[property] : inner[property]) element.style['padding' + cc] = inner[property] + 'px';
      if (offset.outer) last = offset.outer[property];
      outer[property] = margin[property] - outside[property];
      if (last != null ? last != outer[property] : outer[property]) element.style['margin' + cc] = outer[property] + 'px';
    }
    if (inside) Object.append(offset, {inner: inner, outer: outer});
  }
});

/*
  Default layer set 
*/

if (!LSD.Layers) LSD.Layers =  {
  shadow:     ['size', 'radius', 'shape', 'shadow'],
  stroke:     [        'radius', 'stroke', 'shape', 'fill'],
  background: ['size', 'radius', 'stroke', 'offset', 'shape', 'color'],
  foreground: ['size', 'radius', 'stroke', 'offset', 'shape', 'color'],
  reflection: ['size', 'radius', 'stroke', 'offset', 'shape', 'color'],
  icon:       ['size', 'scale', 'color', 'stroke', 'offset', 'shape', 'position','shadow'],
  glyph:      ['size', 'scale', 'color', 'stroke', 'offset', 'shape', 'position', 'shadow']
};

/*
  Pre-generate CSS grammar for layers.
  
  It is not required for rendering process itself, because
  this action is taken automatically when the first
  widget gets rendered. Declaring layer css styles upfront
  lets us use it in other parts of the framework
  (e.g. in stylesheets to validate styles)
*/

for (var layer in LSD.Layers) LSD.Layer.get(layer, LSD.Layers[layer]);

LSD.Options.layers = {
  add: 'addLayer',
  remove: 'removeLayer',
  iterate: true,
  process: function(value) {
    return (value === true) ? LSD.Layers : value;
  }
};

}();

/*
---

script: Proxies.js

description: All visual rendering aspects under one umbrella

license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Module.Layers
  - LSD.Module.Render
  - LSD.Module.Shape

provides: 
  - LSD.Module.Graphics

...
*/


LSD.Module.Graphics = new Class({
  Implements: [
    LSD.Module.Layers, 
    LSD.Module.Render, 
    LSD.Module.Shape
  ]
});
/*
---
 
script: Widget.js
 
description: Base widget with all modules included
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Type
  - LSD.Module.Accessories
  - LSD.Module.Ambient
  - LSD.Module.Graphics
  - LSD.Mixin.Value

provides: 
  - LSD.Widget
 
...
*/

LSD.Widget = new Class({
  
  Implements: [
    LSD.Module.Accessories,
    LSD.Module.Ambient,
    LSD.Module.Graphics
  ],
  
  options: {
    /*
      The key in element storage that widget will use to store itself.
      When set to false, widget is not written into element storage.
    */
    key: 'widget',
    /*
      When set to true, layers option will enforce the default layer set.
    */
    layers: true
  },
  
  initialize: LSD.Module.Options.initialize
});

LSD.Module.Events.addEvents.call(LSD.Widget.prototype, {
  initialize: function() {
    this.addPseudo(this.pseudos.writable ? 'read-write' : 'read-only');
  }
});

LSD.Widget.prototype.addStates('disabled', 'hidden', 'built', 'attached');

LSD.Behavior.attach(LSD.Widget);

new LSD.Type('Widget');

LSD.Element.pool.push(LSD.Widget);
/*
---
 
script: Progress.js
 
description: Progress bar of html5
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD/LSD.Widget

provides:   
  - LSD.Widget.Progress
 
...
*/

LSD.Widget.Progress = new Class({
  options: {
    tag: 'progress',
    inline: null,
    pseudos: Array.object('value'),
    events: {
      _initial: {
        self: {
          build: function() {
            if (!('value' in this.attributes)) this.setAttribute('value', 0)
          }
        }
      }
    }
  },
  
  getBar: Macro.getter('bar', function() {
    return new Element('span').inject(this.toElement());
  }),
  
  set: function(value) {
    this.setAttribute('value', value);
    this.getBar().setStyle('width', Math.round(value) + '%')
  }
});
/*
---
 
script: Button.js
 
description: A button widget. You click it, it fires the event
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD/LSD.Widget
  - LSD/LSD.Mixin.Touchable
  - LSD/LSD.Mixin.Command

provides: 
  - LSD.Widget.Button
 
...
*/

LSD.Widget.Button = new Class({  
  options: {
    tag: 'button',
    inline: true,
    pseudos: Array.object('touchable', 'clickable', 'command')
  },
  
  write: function(content) {
    this.setState('text');
    return this.parent.apply(this, arguments);
  }
});
/*
---
 
script: Scrollbar.js
 
description: Scrollbars for everything
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
- LSD/LSD.Widget
- LSD.Widget.Button
- LSD/LSD.Trait.Slider

provides: [LSD.Widget.Scrollbar]
 
...
*/

LSD.Widget.Scrollbar = new Class({
  Implements: LSD.Trait.Slider,
  
  options: {
    tag: 'scrollbar',
    events: {
      expected: {
        '#incrementor': {
          click: 'increment'
        },
        '#decrementor': {
          click: 'decrement'
        }
      }
    },
    layout: {
      '^track#track': {
        'scrollbar-thumb#thumb': {},
      },
      '^button#decrementor': {},
      '^button#incrementor': {}
    },
    slider: {
      wheel: true
    }
  },
  
  initialize: function() {
    this.parent.apply(this, arguments);
    this.setState(this.options.mode);
  },
  
  onParentResize: function(size, old){
    if (!size || $chk(size.height)) size = this.parentNode.size;
    var isVertical = (this.options.mode == 'vertical');
    var other = isVertical ? 'horizontal' : 'vertical';
    var prop = isVertical ? 'height' : 'width';
    var Prop = prop.capitalize();
    var setter = 'set' + Prop;
    var getter = 'getClient' + Prop;
    var value = size[prop];
    if (isNaN(value) || !value) return;
    var invert = this.parentNode[other];
    var scrolled = this.getScrolled();
    $(scrolled).setStyle(prop, size[prop])
    var ratio = size[prop] / $(scrolled)['scroll' + Prop]
    var delta = (!invert || !invert.parentNode ? 0 : invert.getStyle(prop));
    this[setter](size[prop] - delta);
    var offset = 0;
    if (this.track.offset.inner) {
      if (isVertical) {
        offset += this.track.offset.inner.top + this.track.offset.inner.bottom
      } else {
        offset += this.track.offset.inner.left + this.track.offset.inner.right
      }
    }
    var track = size[prop] - this.incrementor[getter]() - this.decrementor[getter]() - delta - ((this.style.current.strokeWidth || 0) * 2) - offset * 2
    this.track[setter](track);
    this.track.thumb[setter](Math.ceil(track * ratio))
    this.refresh(true);
    this.parent.apply(this, arguments);
  },
  
  inject: function(widget) {
    var result = this.parent.apply(this, arguments);
    this.options.actions.slider.enable.call(this);
    return result
  },
  
  onSet: function(value) {
    var prop = (this.options.mode == 'vertical') ? 'height' : 'width';
    var direction = (this.options.mode == 'vertical') ? 'top' : 'left';
    var element = $(this.getScrolled());
    var result = (value / 100) * (element['scroll' + prop.capitalize()] - element['offset' + prop.capitalize()]);
    element['scroll' + direction.capitalize()] = result;
    this.now = value;
  },
  
  getScrolled: Macro.getter('scrolled', function() {
    var parent = this;
    while ((parent = parent.parentNode) && !parent.getScrolled);
    return parent.getScrolled ? parent.getScrolled() : this.parentNode.element;
  }),
  
  getTrack: function() {
    return $(this.track)
  },
  
  getTrackThumb: function() {
    return $(this.track.thumb);
  }
})

LSD.Widget.Scrollbar.Track = new Class({
  Extends: LSD.Widget,
  
  options: {
    tag: 'track'
  }
});

LSD.Widget.Scrollbar.Thumb = new Class({
  Extends: LSD.Widget.Button,
  
  options: {
    tag: 'thumb'
  }
});

LSD.Widget.Scrollbar.Button = LSD.Widget.Button;
/*
---
 
script: Scrollable.js
 
description: For all the scrollbars you always wanted
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Mixin
  - LSD.Behavior
  - Widgets/LSD.Widget.Scrollbar

provides: 
  - LSD.Mixin.Scrollable
 
...
*/

LSD.Mixin.Scrollable = new Class({
  options: {
    events: {
      self: {
        resize: 'showScrollbars'
      },
      element: {
        mousewheel: 'onMousewheel'
      }
    }
  },
  
  onMousewheel: function(event) {
    var scrollbar = this.vertical || this.horizontal;
    if (scrollbar) scrollbar.track.element.fireEvent('mousewheel', event  );
  },
  
  showScrollbars: function(size) {
    if (!size) size = this.size;
    var scrolled = document.id(this.getScrolled());
    scrolled.setStyles(size)
    scrolled.setStyle('overflow', 'hidden');
    if (size.width < scrolled.scrollWidth) {
      if (this.getHorizontalScrollbar().parentNode != this) this.horizontal.inject(this);
      this.horizontal.slider.set(this.horizontal.now)
    } else if (this.horizontal) this.horizontal.dispose();
    
    if (size.height < scrolled.scrollHeight) {
      if (this.getVerticalScrollbar().parentNode != this) this.vertical.inject(this);
        this.vertical.slider.set(this.vertical.now)
    } else if (this.vertical) this.vertical.dispose();
  },
  
  getVerticalScrollbar: function() {
    return (this.vertical || (this.vertical = this.buildLayout('scrollbar[mode=vertical]')))
  },
  
  getHorizontalScrollbar: function() {
    return (this.horizontal || (this.horizontal = this.buildLayout('scrollbar[mode=horizontal]')))
  },
  
  getScrolled: Macro.defaults(function() {
    return this.getWrapper();
  })
});

LSD.Behavior.define('[scrollable]', LSD.Mixin.Scrollable);
/*
---
 
script: Uploader.js
 
description: Add your widget have a real form value.
 
license: Public domain (http://unlicense.org).
 
requires:
  - LSD.Mixin
  - Widgets/LSD.Widget.Button
  - Widgets/LSD.Widget.Progress
  - Uploader/*
  - LSD.Mixin.List
  - Core/JSON
  
provides: 
  - LSD.Mixin.Uploader
 
...
*/

LSD.Mixin.Uploader = new Class({
  options: {
    actions: {
      uploader: {
        enable: function() {
          if (this.attributes.multiple) this.options.uploader.multiple = true;
          this.fireEvent('register', ['uploader', this.getUploader()]);
          var target = this.getUploaderTarget();
          if (target) this.getUploader().attach(target);
          this.getStoredBlobs().each(this.addFile, this);
        },
        disable: function() {
          this.getUploader().removeEvents(this.events.uploader);
          this.getUploader().detach(this.getUploaderTarget())
          this.fireEvent('unregister', ['uploader', this.getUploader()]);
        }
      }
    },
    events: {
      uploader: {
        fileComplete: 'onFileComplete',
        fileRemove: 'onFileRemove',
        fileProgress: 'onFileProgress',
        fileProgress: 'onFileProgress',
        beforeSelect: 'onBeforeFileSelect'
      }
    },
    has: {
      many: {
        targets: {
          selector: ':uploading',
          as: 'uploader',
          relay: {
            mouseover: function() {
              this.uploader.getUploader().attach(this.toElement());
            }
          }
        }
      }
    },
    states: Array.object('empty'),
    filelist: false,
    uploader: {
      instantStart: true,
      timeLimit: 36000,
      queued: false,
      multiple: false
    }
  },
  
  constructors: {
    uploader: function() {
      this.blobs = {};
    }
  },
  
  getUploader: function() {
    if (this.uploader) return this.uploader;
    var options = Object.append({}, this.options.uploader);
    if (!options.fileClass) options.fileClass = this.getUploaderFileClass(Uploader.getAdapter());
    this.uploader = new Uploader(options);
    this.uploader.widget = this;
    return this.uploader;
  },
  
  onBeforeFileSelect: function() {
    this.lastUploaderTarget =  this.getUploader().target;
  },
  
  getUploaderTarget: function() {
    var target = this.options.uploader.target;
    if (target) {
      return target;
    } else if (target !== false) {
      return this.element
    }
  },

  getUploaderFileClass: function(adapter) {
    if (!adapter) adapter = Uploader.getAdapter();
    if (adapter.indexOf) adapter = Uploader[LSD.toClassName(adapter)];
    if (!adapter.File.Widget) {
      var Klass = new Class({
        Implements: [adapter.File, this.getUploaderFileClassBase()]
      });
      adapter.File.Widget = function() {
        return new LSD.Widget().mixin(Klass, true);
      }
    }
    return adapter.File.Widget;
  },
  
  getUploaderFileClassBase: function() {
    return LSD.Widget.Filelist.File
  },
  
  onFileComplete: function(file) {
    var blob = this.processStoredBlob(file.response.text);
    if (blob && !blob.errors) {
      this.onFileSuccess(file, blob);
    } else {
      this.onFileFailure(file, blob || response);
    }
  },
  
  processValue: function(file) {
    return file.id || file.uid;
  },
  
  onFileSuccess: function(file, blob) {
    this.addBlob(file, blob);
    file.fireEvent('success', blob);
  },
  
  onFileFailure: function(file, blob) {
    file.fireEvent('failure', blob);
  },
  
  onFileRemove: function(file) {
    this.removeBlob(file);
  },
  
  getBlob: function(file) {
    return this.blobs[file.id];
  },
  
  addBlob: function(file, blob) {
    this.setValue(blob);
    this.blobs[file.id] = blob;
  },
  
  removeBlob: function(file) {
    this.setValue(this.blobs[file.id], true);
    delete this.blobs[file.id];    
  },
  
  retrieveStoredBlobs: function() {
    var attrs = this.attributes;
    return attrs.file || attrs.files || attrs.blobs || attrs.blob;
  },

  processStoredBlob: function(response) {
    if (response.indexOf) response = JSON.decode(response);
    if (response && Object.getLength(response) == 1) response = response[Object.keys(response)[0]];
    return response;
  },
  
  getStoredBlobs: function() {
    var files = this.retrieveStoredBlobs();
    return files ? Array.from(JSON.decode(files)).map(this.processStoredBlob.bind(this)) : [];
  },
  
  addFile: function(blob) {
    var widget = new (this.getUploaderFileClass());
    widget.widget = this;
    widget.setState('complete');
    widget.build();
    widget.setBase(this.getUploader());
    widget.setFile(blob);
    this.addBlob(widget, blob);
  }
});

LSD.Mixin.Upload = new Class({
  options: {
    has: {
      one: {
        progress: {
          source: 'progress',
          selector: 'progress'
        }
      }
    },
    events: {
      setBase: function() {
        if (this.target) this.targetWidget = this.target.retrieve('widget');
        this.build();
      },
      build: function() {
        this.inject(this.getWidget());
      },
      progress: function(progress) {
        if (this.progress) this.progress.set(progress.percentLoaded);
      },
      start: function() {
        this.setState('started');
      },
      complete: function() {
        if (this.progress) this.progress.set(100);
        this.unsetState('started');
        this.setState('complete');
      },
      stop: function() {
        this.unsetState('started');
      },
      remove: 'dispose'
    }
  },
  
  getParentWidget: function(widget) {
    return widget;
  },
  
  getWidget: function() {
    return (this.widget || this.base.widget);
  }
});

LSD.Widget.Filelist = new Class({
  options: {
    tag: 'filelist',
    inline: 'ul',
    pseudos: Array.from(':items'),
    has: {
      many: {
        items: {
          selector: 'file',
          source: 'filelist-file'
        }
      }
    }
  }
});

LSD.Widget.Filelist.File = new Class({
  options: {
    tag: 'file',
    inline: 'li',
    layout: {
      '::canceller': 'Cancel',
      '::progress': true
    },
    pseudos: Array.object('upload'),
    events: {
      setFile: function() {
        this.write(this.name);
      }
    },
    has: {
      one: {
        canceller: {
          selector: 'a.cancel',
          source: 'a.cancel',
          events: {
            click: 'cancel'
          }
        }
      }
    }
  }
});

LSD.Behavior.define(':uploader', LSD.Mixin.Uploader);
LSD.Behavior.define(':upload', LSD.Mixin.Upload);
/*
---
 
script: Form.js
 
description: A form widgets. Intended to be submitted.
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD/LSD.Widget
  - LSD/LSD.Mixin.Submittable
  - LSD/LSD.Mixin.Fieldset
  - LSD/LSD.Mixin.Command

provides: 
  - LSD.Widget.Form
 
...
*/

LSD.Widget.Form = new Class({
  options: {
    tag: 'form',
    pseudos: Array.object('form', 'fieldset', 'command', 'submittable'),
    events: {
      self: {
        build: function() {
          // novalidate html attribute disables internal form validation 
          // on form submission. Chrome and Safari will block form 
          // submission without any visual clues otherwise.
          if (this.element.get('tag') == 'form') this.element.setProperty('novalidate', true);
        }
      }
    }
  },

  getRequestURL: function() {
    return this.attributes.action || location.pathname;
  }
});

/*
---
 
script: Body.js
 
description: Lightweight document body wrapper
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:  
  - LSD/LSD.Widget
  - LSD/LSD.Mixin.Root
  
provides:
  - LSD.Widget.Body

...
*/

LSD.Widget.Body = new Class({
  options: {
    tag: 'body',
    pseudos: Array.object('root')
  }
});
/*
---

script: Document.js

description: Provides a virtual root to all the widgets. DOM-Compatible for Slick traversals.

license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin

requires:
  - LSD.Widget
  - Core/DomReady
  - Core/Options
  - Core/Events
  - More/String.QueryString
  - LSD
  - LSD.Module.Attributes
  - LSD.Module.Selectors

provides:
  - LSD.Document

...
*/


/*
  Document is a big disguise proxy class that contains the tree
  of widgets and a link to document element.
  
  It is DOM-compatible (to some degree), so tools that crawl DOM
  tree (we use Slick) can work with the widget tree like it usually
  does with the real DOM so we get selector engine for free.
  
  The document itself is not in the tree, it's a container.
  
  The class contains a few hacks that allows Slick to initialize.
*/


LSD.Document = new Class({
  
  Implements: [Events, Options, LSD.Module.Attributes],
  
  initialize: function(document, options) {
    if (document && !document.documentElement) options = [document, document = options][0];
    if (!document) document = window.document;
    if (!LSD.document) LSD.document = this;
    this.setOptions(options || {});
    this.document = this;
    this.element = document;
    this.sourceIndex = 1;
    LSD.uid(this);
    
    /*
      Trick Slick into thinking that LSD elements tree is an XML node 
      tree (so it won't try speeding up the queries with optimizations)
    */
    this.documentElement = this;
    this.xml = true;
    this.slickFeatures = LSD.Module.Selectors.Features;
    this.nodeType = 9;
    this.attributes = {};
    
    this.params = (location.search.length > 1) ? location.search.substr(1, location.search.length - 1).parseQueryString() : {}
    document.addEvent('domready', function() {
      this.building = true;
      if ("benchmark" in this.params) console.profile();
      this.build();
      if ("benchmark" in this.params) console.profileEnd();
      this.building = false;
    }.bind(this));
    this.element.addEvent('click', this.onClick.bind(this));
    this.element.addEvent('mousedown', this.onMousedown.bind(this));
  },
  
  /* 
    Single relay click listener is put upon document.
    It spies for all clicks on elements and finds out if 
    any links were clicked. If the link is not widget,
    the listener creates a lightweight link class instance and
    calls click on it to trigger commands and interactions.
    
    This way there's no need to preinitialize all link handlers, 
    and only instantiate class when the link was actually clicked.
  */
  onClick: function(event) {
    if (event.target.ownerDocument == document)
    for (var target = event.target, link, widget; target && target.tagName; target = target.parentNode) {
      widget = target.uid && Element.retrieve(target, 'widget');
      var a = (LSD.toLowerCase(target.tagName) == 'a');
      if (a) {
        if (!widget) {
          var parent = LSD.Module.DOM.find(target)
          widget = new LSD.Widget(target, {
            document: this, 
            pseudos: ['clickable', 'command']
          });
          parent.appendChild(widget, false);
        }
        event.preventDefault();
      }
      if (widget && widget.pseudos.clickable) {
        event.stopPropagation();
        widget.click(event);
        break;
      }
    };
  },
  
  onMousedown: function(event) {
    if (event.target.ownerDocument == document)
    for (var target = event.target, widget; target && target.tagName; target = target.parentNode) {
      widget = target.uid && Element.retrieve(target, 'widget');
      if (widget && widget.pseudos.activatable) widget.fireEvent('mousedown', event);
    };
  },
  
  setHead: function(head) {
    for (var i = 0, el, els = head.getElementsByTagName('meta'); el = els[i++];) {
      var type = el.getAttribute('rel');
      if (type) {
        type += 's';
        if (!this[type]) this[type] = {};
        var content = el.getAttribute('content')
        if (content) this[type][el.getAttribute('name')] = (content.charAt(0) =="{") ? JSON.decode(content) : content;
      }
    }
    // Attach stylesheets, if there are stylesheets loaded
    if (LSD.Sheet && LSD.Sheet.stylesheets) for (var i = 0, sheet; sheet = LSD.Sheet.stylesheets[i++];) this.addStylesheet(sheet);
  },
  
  build: function(document) {
    if (!document) document = this.element || window.document;
    this.setHead(document.head);
    var element = this.element = document.body;
    this.setBody(document.body);
  },
  
  setBody: function(element) {
    if (!element) element = this.getBodyElement()
    this.fireEvent('beforeBody', element);
    var options = {
      document: this, 
      events: {
        self: {
          boot: function() {
            this.document.body = this;
          }
        }
      },
      tag: 'body'
    };
    if (this.options.mutations) options.mutations = this.options.mutations;
    if (this.options.context) options.context = this.options.context;
    new LSD.Widget(element, options);
    this.fireEvent('body', [this.body, element]);
    return element;
  },

  getBodyElement: function() {
    return this.document.body;
  },
  
  redirect: function(url) {
    window.location.href = url;
  },
  
  getElements: function() {
    return this.body.getElements.apply(this.body, arguments);
  },
  
  getElement: function() {
    return this.body.getElement.apply(this.body, arguments);
  },
  
  addStylesheet: function(sheet) {
    if (!this.stylesheets) this.stylesheets = [];
    this.stylesheets.include(sheet);
    sheet.attach(this);
  },
  
  removeStylesheet: function(sheet) {
    if (!this.stylesheets) return;
    this.stylesheets.erase(sheet);
    sheet.detach(this);
  },
  
  $family: Function.from('document')
});
/*
---
name    : Sheet

authors   : Thomas Aylott
copyright : © 2010 Thomas Aylott
license   : MIT

provides : Sheet
requires : SheetParser.CSS
...
*/
;(function(exports){


/*<depend>*/
var UNDEF = {undefined:1}

/*<CommonJS>*/
var SheetParser = UNDEF[typeof require]
	?	exports.SheetParser
	:	require('./SheetParser.CSS').SheetParser

exports.Sheet = Sheet
/*</CommonJS>*/

/*<debug>*/;if (!(!UNDEF[typeof SheetParser] && SheetParser.CSS)) throw new Error('Missing required function: "SheetParser.CSS"');/*</debug>*/
/*</depend>*/


Sheet.version = '1.0.2 dev'

function Sheet(cssText){
	if (this instanceof Sheet) this.initialize(cssText)
	else return Sheet.from(cssText)
}

Sheet.from = function(cssText){
	return new Sheet(cssText)
}

Sheet.prototype = {
	
	parser: SheetParser.CSS,
	
	initialize: function(cssText){
		this.cssText = cssText || ''
		this.style = this.rules = this.cssRules = this.parser.parse(this.cssText)
		var self = this
	},
	
	update: function(){
		var cssText = '',
			i = -1,
			rule,
			rules = this.style || this.rules || this.cssRules
		
		while ((rule = rules[++i])){
			if (typeof rule == 'object'){
				// cssRule
				if (this.update) rule.cssText = this.update.call(rule)
				cssText += rule.cssText = rule.selectorText + '{' + rule.cssText + '}'
			} else {
				// style key/value
				cssText += rule + ':'
				cssText += rules[rule] + ';'
			}
		}
		
		if (rules.selectorText)
			return rules.cssText = rules.selectorText + '{' + cssText + '}'
		return rules.cssText = cssText
	}
	
}

Sheet.prototype.toString = Sheet.prototype.update


}(typeof exports != 'undefined' ? exports : this));

/*
---
 
script: Sheet.js
 
description: Code to extract style rule definitions from the stylesheet
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - Core/Element
  - Core/Request
  - Sheet/Sheet
  - Sheet/SheetParser.Value
  - Sheet/SheetParser.Property
  - Sheet/SheetParser.Styles
  - LSD.Module.Element
  - LSD.Module.Options
  
provides:
  - LSD.Sheet
 
...
*/

!function() {
  
LSD.Sheet = new Class({
  Implements: [LSD.Module.Element, LSD.Module.Options],
  
  options: {
    compile: false,
    combine: true //combine rules
  },
  
  initialize: function(element, callback) {
    LSD.Module.Options.initialize.call(this, element);
    this.rules = [];
    this.callback = callback;
    if (this.element) this.fetch();
    else if (callback) callback(this);
    if (!LSD.Sheet.stylesheets) LSD.Sheet.stylesheets = [];
    LSD.Sheet.stylesheets.push(this);
  },
  
  define: function(selectors, style) {
    LSD.Sheet.Rule.fromSelectors(selectors, style).each(this.addRule.bind(this))
  },
  
  addRule: function(rule) {
    this.rules.push(rule)
  },
  
  fetch: function(href) {
    if (!href && this.element) href = this.element.get('href');
    if (!href) return;
    new Request({
      url: href,
      onSuccess: this.apply.bind(this)
    }).get();
  },
  
  apply: function(sheet) {
    if (typeof sheet == 'string') sheet = this.parse(sheet);
    if (this.options.compile) this.compile(sheet);
    for (var selector in sheet) this.define(selector, sheet[selector]);
    if (this.callback) this.callback(this)
  },
  
  parse: function(text) {
    var sheet = new Sheet(text);
    var rules = sheet.cssRules;
    var CSS = SheetParser.Styles, Paint = LSD.Styles;
    var parsed = {};
    for (var i = 0, rule; rule = rules[i++];) {      
      var selector = LSD.Sheet.convertSelector(rule.selectorText)
      if (!selector.length || LSD.Sheet.isElementSelector(selector)) continue;
      if (!parsed[selector]) parsed[selector] = {};
      var styles = parsed[selector];
      for (var style = rule.style, j = 0, name; name = style[j++];) {
        var property = name.replace('-lsd-', '').camelCase();
        var value = SheetParser.Value.translate(style[name]);
        var definition = Paint[property] || CSS[property];
        if (!definition) continue;
        if (definition.type != 'simple') {
          var result = definition[value.push ? 'apply' : 'call'](this, value);
          if (result === false) value = false;
          else if (result !== true) {
            for (prop in result) styles[prop] = Value.compile(result[prop]);
            continue
          }
        }
        styles[property] = Value.compile(value);
      }
    };
    return parsed;
  },
  
  attach: function(node) {
    this.rules.each(function(rule) {
      rule.attach(node)
    });
    LSD.start();
  },
  
  detach: function(node) {
    this.rules.each(function(rule) {
      rule.detach(node)
    });
  },
  
  /* Compile LSD stylesheet to CSS when possible 
     to speed up setting of regular properties
     
     Will create stylesheet node and apply the css
     unless *lightly* parameter was given. 
     
     Unused now, because we decompile css instead */
  compile: function(lightly) {
    var bits = [];
    this.rules.each(function(rule) {
      if (!rule.implied) return;
      bits.push(rule.getCSSSelector() + " {")
      for (var property in rule.implied) {  
        var value = rule.implied[property];
        if (typeof value == 'number') {
          if (property != 'zIndex') value += 'px';
        } else if (value.map) {
          value = value.map(function(bit) { return bit + 'px'}).join(' ');
        }
        bits.push(property.hyphenate() + ': ' + value + ';')
      }
      bits.push("}")
    })
    var text = bits.join("\n");
    if (lightly) return text;
    
    if (window.createStyleSheet) {
      var style = window.createStyleSheet("");
      style.cssText = text;
    } else {
      var style = new Element('style', {type: 'text/css', media: 'screen'}).adopt(document.newTextNode(text)).inject(document.body);
    }
  }
});

Object.append(LSD.Sheet, {
  isElementSelector: function(selector) {
    return selector.match(/svg|v\\?:|:(?:before|after)|\.container/);
  },
  convertSelector: function(selector) {
    return selector.replace(/\.id-/g , '#').replace(/\.is-/g, ':').replace(/\.lsd#/g, '#').
                    replace(/\.lsd\./g, '').replace(/html\sbody\s/g, '');
  },
  isElementStyle: function(cc) {
    return SheetParser.Styles[cc] && !LSD.Styles[cc] && (cc != 'height' && cc != 'width')
  },
  isRawValue: function(value) {
    return (value.indexOf('hsb') > -1) || (value.indexOf('ART') > -1) || (value.indexOf('LSD') > -1) || 
           (value.charAt(0) == '"') || (value == 'false') || (value == parseInt(value)) || (value == parseFloat(value))
  }
});

LSD.Sheet.Rule = function(selector, style) {
  this.selector = selector;
  this.index = LSD.Sheet.Rule.index ++;
  this.expressions = selector.expressions[0];
  this.specificity = this.getSpecificity();
  for (property in style) {
    var cc = property.camelCase();
    var type = (LSD.Sheet.Rule.separate && LSD.Sheet.isElementStyle(cc)) ? 'implied' : 'style';
    if (!this[type]) this[type] = {}; 
    this[type][cc] = style[property];
  }
}
LSD.Sheet.Rule.index = 0;

LSD.Sheet.Rule.separate = true;

Object.append(LSD.Sheet.Rule.prototype, {  
  attach: function(node) {
    if (!this.watcher) this.watcher = this.watch.bind(this);
    node.watch(this.selector, this.watcher)
  },
  
  detach: function(node) {
    node.unwatch(this.selector, this.watcher);
  },
  
  watch: function(node, state) {
    node[state ? 'addRule' : 'removeRule'](this)
  },
  
  getCSSSelector: function() {
    return this.expressions.map(function(parsed){
      var classes = ['', 'lsd'];
      if (parsed.tag) classes.push(parsed.tag);
      if (parsed.id) classes.push('id-' + parsed.id);
      if (parsed.pseudos) {
        parsed.pseudos.each(function(pseudo) {
          classes.push(pseudo.key);
        });
      };
      return classes.join('.');
    }).join(' ');
  },
  
  getSpecificity: function(selector) {
    specificity = 0;
    this.expressions.each(function(chunk){
      if (chunk.tag && chunk.tag != '*') specificity++;
      if (chunk.id) specificity += 100;
      for (var i in chunk.attributes) specificity++;
      specificity += (chunk.pseudos || []).length;
      specificity += (chunk.classes || []).length * 10;
    });
    return specificity;
  }
});

var Value = LSD.Sheet.Value = {
  px: function(value) {
    return value;
  },
  deg: function(value) {
    return value;
  },
  em: function(value) {
    return function() {
      return value * (this.baseline || 16)
    }
  },
  "%": function(value) {
    return function(property) {
      var resolved = Value['%'].resolve(property);
      if (resolved.call) resolved = resolved.call(this);
      return resolved / 100 * value;
    }
  },
  url: function(value) {
    return value
  },
  src: function(value) {
    return value
  },
  rgb: function() {
    return window.rgb.apply(window, arguments)
  },
  rgba: function(value) {
    return window.rgb.apply(window, arguments)
  },
  hsb: function() {
    return window.hsb.apply(window, arguments)
  },
  hex: function(value) {
    return new Color(value)
  },
  calc: function(value) {
    var bits = value.map(function(bit, i) {
      if (bit.call) {
        return 'value[' + i + '].call(this, property)'
      } else {
        return bit;
      }
    })
    return new Function('property', 'return ' + bits.join(' '));
  },
  min: function() {
    return Math.min.apply(Math, arguments)
  },
  max: function() {
    return Math.max.apply(Math, arguments)
  }
};


var resolved = {};
var dimensions = {
  height: /[hH]eight|[tT]op|[bB]ottom|[a-z]Y/,
  width: /[wW]idth|[lL]eft|[rR]ight|[a-z]X/
}
Value['%'].resolve = function(property) {
  var result = resolved[property];
  if (result != null) return result;
  for (var side in dimensions) if (property.match(dimensions[side])) {
    result = function() { if (this.parentNode) return this.parentNode.getStyle(side); return 0;}
    break;
  }
  return (resolved[property] = (result || 1));
};

Value.compiled = {};
Value.compile = function(value, context) {
  if (!value || value.call || typeof value == 'number') return value;
  if (!context) context = Value;
  if (value.push) {
    for (var i = 0, j = value.length, result = [], bit; i < j; bit = value[i++]) result[i] = Value.compile(value[i], context);
    return result;
  }
  if (value.unit)  return Object.append(context[value.unit](value.number), value);
  if (value.charAt) {
    if (context.hex && value.charAt(0) == "#" && value.match(/#[a-z0-9]{3,6}/)) return context.hex(value);
  } else for (var name in value) {
    if (context[name]) {
      return context[name](Value.compile(value[name]), context);
    } else {
      value[name] = Value.compile(value[name]);
    }
    break;
  }
  return value;
}

LSD.Sheet.Rule.fromSelectors = function(selectors, style) { //temp solution, split by comma
  return selectors.split(/\s*,\s*/).map(function(selector){
    return new LSD.Sheet.Rule(Slick.parse(selector), style);
  });
};


}();

/*
---
 
script: QFocuser.js
 
description: class for keyboard navigable AJAX widgets for better usability and accessibility
 
license: MIT-style license.
 
provides: [QFocuser]
 
...
*/

var QFocuser = (function() {

        // current safari doesnt support tabindex for elements, but chrome does. 
        // When Safari nightly version become current, this switch will be removed.
        var supportTabIndexOnRegularElements = (function() {
                var webKitFields = RegExp("( AppleWebKit/)([^ ]+)").exec(navigator.userAgent);
                if (!webKitFields || webKitFields.length < 3) return true; // every other browser support it
                var versionString = webKitFields[2],
                    isNightlyBuild = versionString.indexOf("+") != -1;
                if (isNightlyBuild || (/chrome/i).test(navigator.userAgent)) return true;
        })();

        return (supportTabIndexOnRegularElements ? function(widget, options) {

                var isIE = document.attachEvent && !document.addEventListener,
                        focused,
                        previousFocused,
                        lastState,
                        widgetState,
                        widgetFocusBlurTimer;

                options = (function() {
                        var defaultOptions = {
                                onFocus: function(el, e) { },
                                onBlur: function(el, e) { },
                                onWidgetFocus: function() { },
                                onWidgetBlur: function() { },
                                tabIndex: 0, // add tabindex to your widget to be attainable by tab key
                                doNotShowBrowserFocusDottedBorder: true
                        };
                        for (var option in options) defaultOptions[option] = options[option];
                        return defaultOptions;
                })();

                init();

                // something to make IE happy
                if (isIE) {
                        window.attachEvent('onunload', function() {
                                window.detachEvent('onunload', arguments.callee);
                                widget.clearAttributes();
                        });
                }

                function init() {
                        setTabIndex(widget, options.tabIndex);
                        // IE remembers focus after page reload but don't fire focus
                        if (isIE && widget == widget.ownerDocument.activeElement) widget.blur();
                        toggleEvents(true);
                };

                function hasTabIndex(el) {
                        var attr = el.getAttributeNode('tabindex');
                        return attr && attr.specified;
                };

                function setTabIndex(el, number) {
                        var test = document.createElement('div');
                        test.setAttribute('tabindex', 123);
                        var prop = hasTabIndex(test) ? 'tabindex' : 'tabIndex';
                        (setTabIndex = function(el, number) {
                                el.setAttribute(prop, '' + number);
                                if (options.doNotShowBrowserFocusDottedBorder) hideFocusBorder(el);
                        })(el, number);
                };

                function getTabIndex(el) {
                        return hasTabIndex(el) && el.tabIndex;
                };

                function hideFocusBorder(el) {
                        if (isIE) el.hideFocus = true;
                        else el.style.outline = 0;
                };

                function toggleEvents(register) {
                        var method = register ? isIE ? 'attachEvent' : 'addEventListener' : isIE ? 'detachEvent' : 'removeEventListener';
                        if (isIE) {
                                widget[method]('onfocusin', onFocusBlur);
                                widget[method]('onfocusout', onFocusBlur);
                        }
                        else {
                                widget[method]('focus', onFocusBlur, true);
                                widget[method]('blur', onFocusBlur, true);
                        }
                };

                function onFocusBlur(e) {
                        e = e || widget.ownerDocument.parentWindow.event;
                        var target = e.target || e.srcElement;
                        lastState = { focusin: 'Focus', focus: 'Focus', focusout: 'Blur', blur: 'Blur'}[e.type];
                        // filter bubling focus and blur events, only these which come from elements setted by focus method are accepted                
                        if (target == focused || target == previousFocused) {
                                options['on' + lastState](target, e);
                        }
                        clearTimeout(widgetFocusBlurTimer);
                        widgetFocusBlurTimer = setTimeout(onWidgetFocusBlur, 10);
                };

                function onWidgetFocusBlur() {
                        if (widgetState == lastState) return;
                        widgetState = lastState;
                        options['onWidget' + widgetState]();
                };

                // call this method only for mousedown, in case of mouse is involved (keys are ok)
                function focus(el) {
                        if (focused) {
                                setTabIndex(focused, -1); // to disable tab walking in widget
                                previousFocused = focused;
                        }
                        else setTabIndex(widget, -1);
                        focused = el;
                        setTabIndex(focused, 0);
                        focused.focus();
                };

                // call this method after updating widget content, to be sure that tab will be attainable by tag key
                function refresh() {
                        var setIndex = getTabIndex(widget) == -1,
                                deleteFocused = true,
                                els = widget.getElementsByTagName('*');
                        for (var i = els.length; i--; ) {
                                var idx = getTabIndex(els[i]);
                                if (idx !== false && idx >= 0) setIndex = true;
                                if (els[i] === focused) deleteFocused = false;
                        }
                        if (setIndex) setTabIndex(widget, 0);
                        if (deleteFocused) focused = null;
                };

                function getFocused() {
                        return focused;
                };

                // return element on which you should register key listeners
                function getKeyListener() {
                        return widget;
                };

                function destroy() {
                        toggleEvents();
                };

                return {
                        focus: focus,
                        getFocused: getFocused,
                        getKeyListener: getKeyListener,
                        refresh: refresh,
                        destroy: destroy
                }
        } :

        // version for Safari, it mimics focus blur behaviour
        function(widget, options) {

                var focuser,
                        lastState,
                        widgetState = 'Blur',
                        widgetFocusBlurTimer,
                        focused;

                options = (function() {
                        var defaultOptions = {
                                onFocus: function(el, e) { },
                                onBlur: function(el, e) { },
                                onWidgetFocus: function() { },
                                onWidgetBlur: function() { },
                                tabIndex: 0, // add tabindex to your widget to be attainable by tab key
                                doNotShowBrowserFocusDottedBorder: true
                        };
                        for (var option in options) defaultOptions[option] = options[option];
                        return defaultOptions;
                })();

                init();

                function init() {
                        focuser = widget.ownerDocument.createElement('input');
                        var wrapper = widget.ownerDocument.createElement('span');
                        wrapper.style.cssText = 'position: absolute; overflow: hidden; width: 0; height: 0';
                        wrapper.appendChild(focuser);
                        // it's placed in to widget, to mimics tabindex zero behaviour, where element document order matter 
                        widget.insertBefore(wrapper, widget.firstChild);
                        toggleEvent(true);
                };

                function toggleEvent(register) {
                        var method = register ? 'addEventListener' : 'removeEventListener';
                        focuser[method]('focus', onFocusBlur);
                        focuser[method]('blur', onFocusBlur);
                        window[method]('blur', onWindowBlur);
                        //widget[method]('mousedown', onWidgetMousedown);
                };

                // set active simulation
                function onWidgetMousedown(e) {
                        if (widgetState == 'Blur') {
                                setTimeout(function() {
                                        focuser.focus();
                                }, 1);
                        }
                };

                function onFocusBlur(e) {
                        lastState = e.type.charAt(0).toUpperCase() + e.type.substring(1);
                        if (focused) options['on' + lastState](focused, e);
                        clearTimeout(widgetFocusBlurTimer);
                        widgetFocusBlurTimer = setTimeout(onWidgetFocusBlur, 10);
                };

                function onWidgetFocusBlur() {
                        if (widgetState == lastState) return;
                        widgetState = lastState;
                        options['onWidget' + widgetState]();
                };

                // safari is so stupid.. doesn't fire blur event when another browser tab is switched
                function onWindowBlur() {
                        focuser.blur();
                };

                function focus(el) {
                        setTimeout(function() {
                                focuser.blur();
                                setTimeout(function() {
                                        focused = el;
                                        focuser.focus();
                                }, 1);
                        }, 1);
                };

                function refresh() {
                        var deleteFocused = true,
                                els = widget.getElementsByTagName('*');
                        for (var i = els.length; i--; ) {
                                if (els[i] === focused) deleteFocused = false;
                        }
                        if (deleteFocused) focused = null;
                };

                function getFocused() {
                        return focused;
                };

                function getKeyListener() {
                        return focuser;
                };

                function destroy() {
                        toggleEvents();
                };

                return {
                        focus: focus,
                        getFocused: getFocused,
                        getKeyListener: getKeyListener,
                        refresh: refresh,
                        destroy: destroy
                }

        });

})();
/*
---
 
script: Focus.js
 
description: A mixin to make widget take focus like a regular input (even in Safari)
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Mixin
  - QFocuser/QFocuser
 
provides:
  - LSD.Mixin.Focusable
  - LSD.Mixin.Focusable.Propagation
 
...
*/
  
LSD.Mixin.Focusable = new Class({
  options: {
    pseudos: Array.object('activatable'),
    actions: {
      focusable: {
        target: false,
        enable: function(target) {
          if (target.attributes.tabindex == -1) return;
          if (!this.isNativelyFocusable()) target.getFocuser();
          target.addEvents(LSD.Mixin.Focusable.events);
        },
        
        disable: function(target) {
          if (target.focused) target.blur();
          if (target.focuser) target.focuser.destroy();
          if (target.attributes.tabindex == -1) return;
          target.removeEvents(LSD.Mixin.Focusable.events);
          target.setAttribute('tabindex', target.tabindex);
        }
      }
    },
    states: Array.object('focused')
  },
  
  getFocuser: function() {
    if (!this.focuser) this.focuser = new QFocuser(this.toElement(), {
      onWidgetFocus: this.onFocus.bind(this),
      onWidgetBlur: this.onBlur.bind(this),
      tabIndex: this.attributes.tabindex
    });
    return this.focuser;
  },
  
  focus: function(element) {
    if (element !== false) {
      if (this.focuser) this.focuser.focus(element.localName ? element : this.element);
      else this.element.focus();
      this.document.activeElement = this;
    }
    if (this.focused) return;
    this.focused = true;
    LSD.Mixin.Focusable.Propagation.focus(this);
  },
  
  blur: function(propagated) {
    if (!this.focused) return;
    this.focused = false;
    if (!this.focuser) this.element.blur();
    if (!propagated) LSD.Mixin.Focusable.Propagation.blur.delay(10, this, this);
  },
  
  onFocus: function() {
    this.focus(false);
    this.document.activeElement = this;
  },
  
  onBlur: function() {
    var active = this.document.activeElement;
      console.error('onBlur', active, active == this, this.tagName);
    if (active == this) delete this.document.activeElement;
    while (active && (active = active.parentNode)) if (active == this) return;
    this.blur();
  },
  
  getKeyListener: function() {
    return this.getFocuser().getKeyListener()
  },
  
  isNativelyFocusable: function() {
    return this.getElementTag() == 'input';
  }
});

LSD.Mixin.Focusable.events = {
  mousedown: 'focus'
};

LSD.Mixin.Focusable.Propagation = {
  focus: function(parent) {
    while (parent = parent.parentNode) if (parent.getFocuser) parent.focus(false);
  },
  
  blur: function(parent) {
    var active = parent.document.activeElement;
    var hierarchy = [];
    if (active) {
      for (var widget = active; widget.parentNode && hierarchy.push(widget); widget = widget.parentNode);
    }
    while (parent = parent.parentNode) {
      if (active && hierarchy.contains(parent)) break;
      if (parent.options && (parent.attributes.tabindex != null) && parent.blur) parent.blur(true);
    }
  }
};

LSD.Behavior.define('[tabindex][tabindex!=-1], :focusable', LSD.Mixin.Focusable);
/*
---
 
script: Menu.js
 
description: Menu widget base class
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD/LSD.Widget
  - LSD/LSD.Mixin.Focusable
  - LSD/LSD.Mixin.List
  

provides: 
  - LSD.Widget.Menu
 
...
*/

LSD.Widget.Menu = new Class({
  options: {
    tag: 'menu',
    inline: null,
    pseudos: Array.object('list')
  }
});

LSD.Widget.Menu.Command = new Class({
  options: {
    tag: 'command',
    inline: null,
    pseudos: Array.object('item')
  }
});
/*
---
 
script: Context.js
 
description: Menu widget to be used as a drop down
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Widget.Menu

provides:
  - LSD.Widget.Menu.Context
  - LSD.Widget.Menu.Context.Button
  - LSD.Widget.Menu.Context.Command
  - LSD.Widget.Menu.Context.Command.Command
  - LSD.Widget.Menu.Context.Command.Checkbox
  - LSD.Widget.Menu.Context.Command.Radio
 
...
*/

LSD.Widget.Menu.Context = new Class({
  Extends: LSD.Widget.Menu,

  options: { 
    attributes: {
      type: 'context',
      tabindex: 0
    }
  }
});

LSD.Widget.Menu.Context.Command = new Class({
  Extends: LSD.Widget.Menu.Command
});
/*
---
 
script: Menu.js
 
description: Dropdowns should be easy to use.
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Trait
  - Widgets/LSD.Widget.Menu.Context

provides:
  - LSD.Trait.Menu
 
...
*/


/*
---
 
script: Input.js
 
description: Make it easy to use regular native input for the widget
 
license: Public domain (http://unlicense.org).
 
requires:
  - LSD.Trait
  - LSD.Mixin.Focusable

provides: 
  - LSD.Trait.Input
  
...
*/

LSD.Trait.Input = new Class({
  options: {
    input: {},
  },
  
  constructors: {
    input: function() {
      return {
        events: {
          self: {
            build: function() {
              this.getInput().inject(this.element);
            },
            focus: function() {
              this.document.activeElement = this;
              if (LSD.Mixin.Focusable) LSD.Mixin.Focusable.Propagation.focus(this);
            },
            blur: function() {
                if (this.document.activeElement == this) delete this.document.activeElement;
             //   if (LSD.Mixin.Focusable) LSD.Mixin.Focusable.Propagation.blur.delay(10, this, this);
            }
          },
          input: {
            focus: 'onFocus',
            blur: 'onBlur'
          },
        }
      }
    }
  },
  
  onFocus: function() {
    this.document.activeElement = this;
    this.focus();
  },
  
  getInput: Macro.getter('input', function() {
    var input = new Element('input', Object.append({'type': 'text'}, this.options.input));
    this.fireEvent('register', ['input', input]);
    return input;
  }),
  
  getValueInput: function() {
    return this.input;
  }
});
/*
---
 
script: Input.js
 
description: A base class for all kinds of form controls
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD/LSD.Widget
  - LSD/LSD.Trait.Input
  - LSD/LSD.Mixin.Focusable

provides: 
  - LSD.Widget.Input
 
...
*/

LSD.Widget.Input = new Class({
  Extends: LSD.Trait.Input,
  
  options: {
    tag: 'input',
    attributes: {
      type: 'text'
    },
    pseudos: Array.object('form-associated', 'value'),
    events: {
      _input: {
        focus: function() {
          this.input.focus();
        },
        blur: function() {
          this.input.blur();
        }
      }
    },
    states: Array.object('focused')
  },
  
  retain: function() {
    this.focus(false);
    return false;
  },
  
  applyValue: function(item) {
    this.input.set('value', item);
  },

  getRawValue: function() {
    return ('value' in this.attributes) && this.element.get('value');
  },

  focus: function() {
    this.element.focus();
  }

});

/*
---
 
script: HTML.js
 
description: Wysiwyg for people
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Widget.Input
  - LSD/LSD.Mixin.ContentEditable

provides: 
  - LSD.Widget.Input.HTML
  - LSD.Widget.Input.Html
  
...
*/


LSD.Widget.Input.Html = LSD.Widget.Input.HTML = new Class({
  options: {
    tag: 'input',
    pseudos: Array.object('form-associated', 'value'),
    attributes: {
      contenteditable: 'editor',
      tabindex: 0
    },
    states: Array.object('editing'),
    events: {
      self: {
        focus: 'edit',
        edit: function() {
          this.openEditor();
        },
        finish: 'closeEditor'
      }
    }
  },
  
  getValue: function() {
    if (this.editing && this.editor) return this.editor.getData();
    return this.element.get('html');
  },
  
  writeValue: function(value) {
    if (this.editing && this.editor) return this.editor.setData(value);
    return this.element.set('html', value);
  }
  
})
/*
---
 
script: Edit.js
 
description: Turn element into editable mode
 
license: Public domain (http://unlicense.org).

authors: Yaroslaff Fedin
 
requires:
  - LSD.Action
  - Widgets/LSD.Widget.Body
  - Widgets/LSD.Widget.Form
  - Widgets/LSD.Widget.Input.HTML
  - LSD.Mixin.Fieldset
  - LSD.Mixin.Resource

provides:
  - LSD.Action.Edit

...
*/

LSD.Action.Edit = LSD.Action.build({
  enable: function(target, content) {
    var session = this.retrieve(target);
    if (!session) {
      $ss = session = new LSD.Widget(target.element || target, {source: 'form-edit'});
      this.store(target, session);
    }
    session.edit(content);
  },
  
  disable: function(target) {
    var session = this.retrieve(target);
    if (session) session.hide();
  }
});

LSD.Widget.Form.Edit = new Class({
  options: {
    key: null,
    layout: {
      'aside.buttons': {
        '::canceller': 'Cancel',
        '::submitter': 'Save'
      }
    },
    events: {
      self: {
        'cancel': 'finish'
      }
    },
    states: Array.object('editing', 'hidden'),
    pseudos: Array.object('form', 'fieldset', 'resource', 'command'),
    has: {
      one: {
        submitter: {
          selector: '[type=submit]',
          source: 'button[type=submit]'
        },
        canceller: {
          selector: 'button.cancel',
          events: {
            click: 'cancel'
          }
        }
      }
    }
  },
  
  constructors: {
    session: function() {
      this.objects = [];
    }
  },
  
  edit: function(values) {
    Element.Item.walk.call(this, this.element, function(node, prop, scope, prefix) {
      var editable = node.getProperty('editable');
      if (editable) {
        if (prefix) prop = prefix.concat(prop).map(function(item, i) {
          return i == 0 ? item : '[' + item + ']'
        }).join('');
        this.convert(node, prop, editable);
      }
      return prefix;
    }, null, true);
    if (this.controls) this.controls.each(function(child) {
      this.element.appendChild(child.element);
    }, this);
  },

  finish: function() {
    //console.log('revert', [].concat(this.objects))
    for (var object; object = this.objects.shift();) this.revert(object);
    this.submitter.dispose();
    this.canceller.dispose();
  },
  
  convert: function(element, name, type) {
    this.objects.push(element)
    return this.getReplacement(element, name, type).replaces(element);
  },
  
  revert: function(element) {
    element.replaces(Element.retrieve(element, 'widget:edit'));
  },
  
  cancel: function() {
    this.fireEvent('cancel', arguments)
  },
  
  submit: function() {
    if (this.getResource) {
      var Resource = this.getResource();
      new Resource(Object.append(this.getParams(), {id: this.attributes.itemid})).save(function(html) {
        this.execute({action: 'replace', target: this.element}, html);
      }.bind(this));
    }
  },
  
  getReplacement: function(element, name, type) {
    var widget = Element.retrieve(element, 'widget:edit');
    if (!widget) {
      var options = {attributes: {name: name, type: type}};
      widget = this.getLayout().selector('input', this, options);
      
      Element.store(element, 'widget:edit', widget);
    }
    //widget.setValue(Element.get(element, 'itemvalue'));
    return widget;
  }
});

LSD.Widget.Input.Area = LSD.Widget.Input.HTML;