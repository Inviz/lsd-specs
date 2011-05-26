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
		  'Styles'
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
		files: ["../qfocuser/Source/QFocuser",
    "../mootools-core/Source/Slick/Slick.Parser",
    "../mootools-core/Source/Core/Core",
    "../mootools-speedups/Source/Core/Core.Speedups",
    "../mootools-core/Source/Types/Array",
    "../mootools-color/Source/Color",
    "../mootools-core/Source/Types/Function",
    "../mootools-core/Source/Types/Number",
    "../mootools-core/Source/Types/String",
    "../mootools-core/Source/Class/Class",
    "../mootools-speedups/Source/Core/Class.Speedups",
    "../art/Source/ART",
    "../lsd/Source/ART/ART.Element",
    "../art/Source/ART.Path",
    "../art/Source/ART.SVG",
    "../lsd/Source/ART/ART.SVG",
    "../art/Source/ART.VML",
    "../art/Source/ART.Base",
    "../lsd/Source/ART/ART.Shape.Star",
    "../lsd/Source/ART/ART.Shape.Flower",
    "../lsd/Source/ART/ART.Shape.Rectangle",
    "../lsd/Source/ART/ART.Shape.Ellipse",
    "../lsd/Source/ART/ART.Shape.Arrow",
    "../lsd/Source/ART/ART.Glyphs",
    "../mootools-ext/Source/Types/FastArray",
    "../mootools-ext/Source/Core/Class.Mixin",
    "../mootools-core/Source/Class/Class.Extras",
    "../mootools-speedups/Source/Core/Class.Extras.Speedups",
    "../mootools-ext/Source/Core/Class.States",
    "../mootools-ext/Source/Core/Class.Includes",
    "../mootools-core/Source/Fx/Fx",
    "../mootools-ext/Source/Core/Class.Macros",
    "../mootools-core/Source/Utilities/JSON",
    "../mootools-core/Source/Browser/Browser",
    "../mootools-ext/Source/Core/Class.Shortcuts",
    "../lsd/Source/ART/ART",
    "../mootools-mobile/Source/Browser/Features.Touch",
    "../mootools-string-inflections/Source/String.Inflections",
    "../mootools-more/Source/More/More",
    "../mootools-more/Source/Types/String.QueryString",
    "../mootools-more/Source/Class/Events.Pseudos",
    "../mootools-more/Source/Class/Class.Binds",
    "../mootools-ext/Source/Core/Class.Binds.Remover",
    "../mootools-core/Source/Types/Object",
    "../mootools-speedups/Source/Types/Object",
    "../mootools-more/Source/Types/Object.Extras",
    "../mootools-more/Source/Locale/Locale",
    "../mootools-more/Source/Locale/Locale.en-US.Date",
    "../mootools-more/Source/Types/Date",
    "../mootools-core/Source/Types/Event",
    "../lsd/Source/LSD",
    "../lsd/Source/Relation",
    "../lsd/Source/Action",
    "../lsd/Source/Action/Create",
    "../lsd/Source/Action/Display",
    "../lsd/Source/Action/Value",
    "../lsd/Source/Action/Set",
    "../lsd/Source/Action/Replace",
    "../lsd/Source/Action/Clone",
    "../lsd/Source/Action/Append",
    "../lsd/Source/Action/Delete",
    "../lsd/Source/Action/Send",
    "../lsd/Source/Action/State",
    "../lsd/Source/Action/Check",
    "../lsd/Source/Action/Update",
    "../lsd/Source/Action/History",
    "../lsd/Source/Action/Dialog",
    "../lsd/Source/Command/Command",
    "../lsd/Source/Command/Checkbox",
    "../lsd/Source/Command/Radio",
    "../slick/Source/Slick.Parser",
    "../lsd/Source/Behavior",
    "../lsd/Source/Type",
    "../lsd/Source/Mixin/Fieldset",
    "../lsd/Source/Module/Accessories/Options",
    "../lsd/Source/Module/Accessories/Tag",
    "../lsd/Source/Module/Ambient/Relations",
    "../lsd/Source/Module/Ambient/Allocations",
    "../lsd/Source/Module/Behavior/Target",
    "../lsd/Source/Module/Behavior/Actions",
    "../lsd/Source/Module/Behavior/Chain",
    "../lsd/Source/Module/Accessories/Shortcuts",
    "../lsd/Source/Mixin/Dialog",
    "../lsd/Source/Mixin/Value",
    "../lsd/Source/Module/Accessories/Attributes",
    "../lsd/Source/Module/Accessories/Element",
    "../lsd/Source/Mixin/Placeholder",
    "../lsd/Source/Module/Graphics/Shape",
    "../lsd/Source/Mixin/Validity",
    "../lsd/Source/Trait/Date",
    "../lsd/Source/Mixin/ContentEditable",
    "../lsd/Source/Module/Accessories/Dimensions",
    "../lsd/Source/Module/Accessories/States",
    "../lsd/Source/Mixin/Focus",
    "../lsd/Source/Trait/Input",
    "../lsd/Source/Mixin/Form",
    "../slick/Source/Slick.Finder",
    "../mootools-core/Source/Element/Element",
    "../mootools-ext/Source/Element/Element.onDispose",
    "../mootools-ext/Source/Element/Element.from",
    "../mootools-ext/Source/Element/Properties/BorderRadius",
    "../mootools-ext/Source/Element/Properties/Item",
    "../lsd/Source/Mixin/List",
    "../lsd/Source/Mixin/Choice",
    "../mootools-more/Source/Types/URI",
    "../mootools-ext/Source/Element/Properties/BoxShadow",
    "../mootools-core/Source/Element/Element.Style",
    "../mootools-core/Source/Element/Element.Dimensions",
    "../mootools-more/Source/Element/Element.Measure",
    "../mootools-core/Source/Fx/Fx.CSS",
    "../mootools-core/Source/Fx/Fx.Tween",
    "../lsd/Source/Mixin/Animation",
    "../mootools-core/Source/Request/Request",
    "../mootools-ext/Source/Request/Request.Statuses",
    "../mootools-ext/Source/Request/Request.Headers",
    "../mootools-core/Source/Request/Request.JSON",
    "../mootools-core/Source/Request/Request.HTML",
    "../mootools-ext/Source/Request/Request.Auto",
    "../mootools-resource/Source/Resource",
    "../mootools-resource/Source/Resource.Model",
    "../mootools-resource/Source/Resource.Model.Actions",
    "../mootools-resource/Source/Resource.Collection",
    "../mootools-resource/Source/Resource.Parser",
    "../mootools-resource/Source/Resource.Parser.JSON",
    "../mootools-resource/Source/Resource.Parser.HTML",
    "../mootools-resource/Source/Resource.Parser.XML",
    "../lsd/Source/Mixin/Resource",
    "../mootools-ext/Source/Request/Request.Form",
    "../lsd/Source/Mixin/Request",
    "../mootools-core/Source/Utilities/Swiff",
    "../mootools-core/Source/Element/Element.Event",
    "../mootools-more/Source/Drag/Drag",
    "../lsd/Source/Mixin/Draggable",
    "../mootools-ext/Source/Drag/Drag.Limits",
    "../lsd/Source/Mixin/Resizable",
    "../mootools-more/Source/Drag/Slider",
    "../mootools-ext/Source/Drag/Slider",
    "../lsd/Source/Trait/Slider",
    "../mootools-custom-event/Source/Element.defineCustomEvent",
    "../mootools-mobile/Source/Touch/Touch",
    "../mootools-mobile/Source/Touch/Click",
    "../mootools-mobile/Source/Desktop/Mouse",
    "../lsd/Source/Mixin/Touchable",
    "../mootools-core/Source/Utilities/DOMReady",
    "../mootools-more/Source/Element/Element.Event.Pseudos",
    "../mootools-more/Source/Element/Element.Delegation",
    "../lsd/Source/Module/Ambient/DOM",
    "../lsd/Source/Module/Ambient/Proxies",
    "../lsd/Source/Module/Graphics/Render",
    "../lsd/Source/Module/Ambient/Container",
    "../mootools-uploader/Source/Uploader",
    "../mootools-uploader/Source/Uploader.Iframe",
    "../mootools-uploader/Source/Uploader.Request",
    "../mootools-uploader/Source/Uploader.Swiff",
    "../mootools-ext/Source/Element/Properties/Widget",
    "../lsd/Source/Module/Accessories/Events",
    "../lsd/Source/Module/Ambient/Expectations",
    "../lsd/Source/Module/Behavior/Command",
    "../lsd/Source/Module/Behavior",
    "../lsd/Source/Module/Ambient/Selectors",
    "../Sheet.js/Source/sg-regex-tools",
    "../Sheet.js/Source/SheetParser.CSS",
    "../Sheet.js/Source/SheetParser.Property",
    "../Sheet.js/Source/SheetParser.Styles",
    "../lsd/Source/Module/Accessories/Styles",
    "../lsd/Source/Layer",
    "../lsd/Source/Layer/Position",
    "../lsd/Source/Layer/Shape",
    "../lsd/Source/Layer/Shadow",
    "../lsd/Source/Layer/Shadow.Inset",
    "../lsd/Source/Layer/Shadow.Native",
    "../lsd/Source/Layer/Shadow.Onion",
    "../lsd/Source/Layer/Shadow.Blur",
    "../lsd/Source/Layer/Scale",
    "../lsd/Source/Layer/Offset",
    "../lsd/Source/Layer/Radius",
    "../lsd/Source/Layer/Color",
    "../lsd/Source/Layer/Stroke",
    "../lsd/Source/Layer/Size",
    "../lsd/Source/Module/Graphics/Layers",
    "../lsd/Source/Module/Graphics",
    "../lsd/Source/Module/Accessories",
    "../Sheet.js/Source/Sheet",
    "../Sheet.js/Source/SheetParser.Value",
    "../lsd/Source/Sheet",
    "../lsd/Source/Interpolation",
    "../lsd/Source/Layout",
    "../lsd/Source/Module/Ambient/Layout",
    "../lsd/Source/Module/Ambient",
    "../lsd/Source/Widget",
    "../lsd-widgets/Source/Menu",
    "../lsd-widgets/Source/Menu/Context",
    "../lsd/Source/Trait/Menu",
    "../lsd-widgets/Source/Button",
    "../lsd-widgets/Source/Scrollbar",
    "../lsd/Source/Mixin/Scrollable",
    "../lsd/Source/Mixin/Uploader",
    "../lsd/Source/Document",
    "../lsd-widgets/Source/Form",
    "../lsd-widgets/Source/Body",
    "../lsd/Source/Action/Edit"
]
	}

};

})(typeof exports != 'undefined' ? exports : this);
