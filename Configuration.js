(function(context){

var Configuration = context.Configuration = {};

Configuration.name = 'Lovely Scalable Drawings projects';

Configuration.presets = {
  'full': {
		sets: ['accessories', 'behavior', 'ambient', 'type', 'layout', 'relations', 'actions', 'interpolation', 'object', 'array', 'script'],
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
		sets: ['layout'],
		source: ['lsd']
	},
	'type': {
		sets: ['type'],
		source: ['lsd']
	},
	'relations': {
		sets: ['relations'],
		source: ['lsd']
	},
	'actions': {
		sets: ['actions'],
		source: ['lsd']
	},
	'interpolation': {
		sets: ['interpolation'],
		source: ['lsd']
	},
	'tools': {
		sets: ['tools'],
		source: ['lsd']
	},
	'object': {
		sets: ['object'],
		source: ['lsd']
	},
	'array': {
		sets: ['array'],
		source: ['lsd']
	},
	'script': {
		sets: ['script'],
		source: ['lsd']
	},
	'mootools': {
		sets: ['mootools'],
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
	},
	
	'actions': {
	  path: 'lsd/',
	  files: [
	    'Action/Counter',
	    'Action/Update'
	  ]
	},
	
	'tools': {
	  path: 'lsd/Tools/',
	  files: [
	    'Position'
	  ]
	},

	'script': {
	  path: 'lsd/Script/',
	  files: [
      'Object',
	    'Array',
	    'Expression',
	    'Function',
	    'Block',
  	  'Interpolation',
  	  'Parser'
	  ]
	},
	
	'mootools': {
	  path: 'mootools/',
	  files: [
	    'Element.Style'
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
