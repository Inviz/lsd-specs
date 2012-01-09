(function(context){

var Configuration = context.Configuration = {};

Configuration.name = 'Lovely Scalable Drawings projects';

Configuration.presets = {
  'full': {
    sets: ['script', 'type', 'lsd'],
    source: ['lsd']
  },
  'type': {
    sets: ['type'],
    source: ['lsd']
  }
};

Configuration.defaultPresets = {
  browser: 'full',
  nodejs: 'full',
  jstd: 'full'
};

Configuration.sets = {
  'script': {
    path: 'lsd/Script/',
    files: [
      'Object',
      'Object.Group',
      'Struct',
      'Array',
      'Expression',
      'Function',
      'Block',
      'Interpolation',
      'Parser'
    ]
  },
  'type': {
    path: 'lsd/Type/',
    files: [
      'Children',
      'States',
      'Matches'
    ]
  },
  'lsd': {
    path: 'lsd/LSD/',
    files: [
      'Widget'
    ]
  }
};


Configuration.source = {

  'lsd': {
    path: '../lsd/',
    files: ['../lsd-specs/Compiled/includes', '../lsd-specs/Helpers/Factory']
  }

};

context.prefix = '../'

})(typeof exports != 'undefined' ? exports : this);
