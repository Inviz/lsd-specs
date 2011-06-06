(function(context){

var Configuration = context.Configuration = {};

Configuration.name = 'Lovely Scalable Drawings projects';

Configuration.presets = {
  'full': {
		sets: ['accessories', 'behavior', 'ambient', 'type', 'relations'],
		source: ['lsd']
	},
	'accessories': {
		sets: ['accessories'],
		source: ['lsd']
	},
	'behavior': {
		sets: ['behavior'],
		source: ['lsd']
	},
	'ambient': {
		sets: ['ambient'],
		source: ['lsd']
	},
	'layout': {
		sets: [/*'layout', */'type'],
		source: ['lsd']
	},
	'type': {
		sets: ['type'],
		source: ['lsd']
	},
	'relations': {
		sets: ['relations'],
		source: ['lsd']
	}
};

Configuration.defaultPresets = {
	browser: 'full',
	nodejs: 'full',
	jstd: 'full'
};

Configuration.sets = {

	'accessories': {
		path: 'lsd/Module/Accessories/',
		files: [
		  'Attributes',
		  'Dimensions',
		  'Element',
		  'Events',
		  'Options',
		  'Shortcuts',
		  'States',
		  'Styles',
		  'Chain'
		]
	},

	'ambient': {
	  path: 'lsd/Module/Ambient/',
	  files: [
	    'Expectations',
	    'DOM'
	  ]
	},

	'behavior': {
	  path: 'lsd/Module/Behavior/',
	  files: [
	    'Target.Parser'
	  ]
	},
	
	'layout': {
	  path: 'lsd/',
	  files: [
	    'Layout'
	  ]
	},
	
	'type': {
	  path: 'lsd/',
	  files: [,
	    'Type', 
	    'Module/Accessories/Tag'
	  ]
	},
	
	'relations': {
	  path: 'lsd/',
	  files: [
	    'Relation', 
	    'Module/Ambient/Relations'
	  ]
	}
	
};


Configuration.source = {

	'lsd': {
		path: '../lsd/',
		files: ["../lsd-specs/Compiled/includes"]
	}

};

context.prefix = '../'

})(typeof exports != 'undefined' ? exports : this);
