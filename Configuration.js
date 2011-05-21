(function(context){

var Configuration = context.Configuration = {};

Configuration.name = 'Lovely Scalable Drawings projects';

Configuration.presets = {
  'full': {
		sets: ['accessories', 'behavior', 'ambient', 'type'],
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
	}
};


Configuration.source = {

	'lsd': {
		path: '../lsd/',
		files: [
    "../mootools-core/Source/Core/Core",
    "../mootools-speedups/Source/Core/Core.Speedups",
    "../mootools-core/Source/Types/Object",
    "../mootools-speedups/Source/Types/Object",
    "../mootools-core/Source/Types/String",
    "../mootools-core/Source/Types/Function",
    "../mootools-core/Source/Types/Number",
    "../mootools-string-inflections/Source/String.Inflections",
    "../mootools-core/Source/Types/Array",
    "../mootools-core/Source/Browser/Browser",
    "../mootools-core/Source/Types/Event",
    "../mootools-mobile/Source/Browser/Features.Touch",
    "../mootools-color/Source/Color",
    "../mootools-core/Source/Class/Class",
    "../mootools-speedups/Source/Core/Class.Speedups",
    "../mootools-core/Source/Class/Class.Extras",
    "../mootools-speedups/Source/Core/Class.Extras.Speedups",
    "../mootools-ext/Source/Core/Class.Includes",
    "../mootools-ext/Source/Core/Class.Shortcuts",
    "../mootools-ext/Source/Core/Class.States",
    "../mootools-core/Source/Fx/Fx",
    "../mootools-ext/Source/Core/Class.Macros",
    "../mootools-ext/Source/Utilities/Observer",
    "../mootools-ext/Source/Types/FastArray",
    "../mootools-ext/Source/Core/Class.Mixin",
    "../lsd/Source/LSD",
    "../lsd/Source/Command/Command",
    "../lsd/Source/Command/Checkbox",
    "../lsd/Source/Command/Radio",
    "../lsd/Source/Action",
    "../lsd/Source/Action/Replace",
    "../lsd/Source/Action/Send",
    "../lsd/Source/Action/Set",
    "../lsd/Source/Action/Clone",
    "../lsd/Source/Action/Create",
    "../lsd/Source/Action/Value",
    "../lsd/Source/Action/Display",
    "../lsd/Source/Action/State",
    "../lsd/Source/Action/Delete",
    "../lsd/Source/Action/History",
    "../lsd/Source/Action/Dialog",
    "../lsd/Source/Action/Update",
    "../lsd/Source/Action/Check",
    "../lsd/Source/Action/Append",
    "../art/Source/ART",
    "../lsd/Source/ART/ART.Element",
    "../lsd/Source/ART/ART.Glyphs",
    "../art/Source/ART.Path",
    "../art/Source/ART.VML",
    "../art/Source/ART.SVG",
    "../lsd/Source/ART/ART.SVG",
    "../art/Source/ART.Base",
    "../lsd/Source/ART/ART",
    "../lsd/Source/ART/ART.Shape.Ellipse",
    "../lsd/Source/ART/ART.Shape.Rectangle",
    "../lsd/Source/ART/ART.Shape.Flower",
    "../lsd/Source/ART/ART.Shape.Arrow",
    "../lsd/Source/ART/ART.Shape.Star",
    "../mootools-core/Source/Utilities/JSON",
    "../mootools-more/Source/More/More",
    "../mootools-more/Source/Class/Class.Binds",
    "../mootools-ext/Source/Core/Class.Binds.Remover",
    "../mootools-more/Source/Types/String.QueryString",
    "../mootools-more/Source/Types/Object.Extras",
    "../mootools-more/Source/Locale/Locale",
    "../mootools-more/Source/Locale/Locale.en-US.Date",
    "../mootools-more/Source/Types/Date",
    "../Sheet.js/Source/sg-regex-tools",
    "../Sheet.js/Source/SheetParser.CSS",
    "../Sheet.js/Source/SheetParser.Property",
    "../Sheet.js/Source/SheetParser.Styles",
    "../Sheet.js/Source/Sheet",
    "../Sheet.js/Source/SheetParser.Value",
    "../lsd/Source/Interpolation",
    "../lsd/Source/Layout",
    "../mootools-core/Source/Slick/Slick.Parser",
    "../mootools-more/Source/Class/Events.Pseudos",
    "../slick/Source/Slick.Parser",
    "../slick/Source/Slick.Finder",
    "../mootools-core/Source/Element/Element",
    "../mootools-ext/Source/Element/Element.onDispose",
    "../mootools-core/Source/Element/Element.Style",
    "../mootools-core/Source/Fx/Fx.CSS",
    "../lsd/Source/Fx",
    "../mootools-core/Source/Fx/Fx.Tween",
    "../mootools-core/Source/Element/Element.Dimensions",
    "../mootools-more/Source/Element/Element.Measure",
    "../mootools-core/Source/Utilities/Swiff",
    "../mootools-ext/Source/Element/Properties/Widget",
    "../mootools-more/Source/Types/URI",
    "../mootools-ext/Source/Element/Properties/BorderRadius",
    "../mootools-ext/Source/Element/Element.from",
    "../mootools-ext/Source/Element/Properties/Item",
    "../mootools-core/Source/Request/Request",
    "../mootools-ext/Source/Request/Request.Headers",
    "../mootools-ext/Source/Request/Request.Statuses",
    "../mootools-core/Source/Request/Request.JSON",
    "../mootools-ext/Source/Request/Request.Form",
    "../mootools-core/Source/Request/Request.HTML",
    "../mootools-ext/Source/Request/Request.Auto",
    "../mootools-resource/Source/Resource",
    "../mootools-resource/Source/Resource.Model",
    "../mootools-resource/Source/Resource.Model.Actions",
    "../mootools-resource/Source/Resource.Collection",
    "../mootools-resource/Source/Resource.Parser",
    "../mootools-resource/Source/Resource.Parser.XML",
    "../mootools-resource/Source/Resource.Parser.JSON",
    "../mootools-resource/Source/Resource.Parser.HTML",
    "../mootools-core/Source/Element/Element.Event",
    "../mootools-core/Source/Utilities/DOMReady",
    "../lsd/Source/Application",
    "../mootools-uploader/Source/Uploader",
    "../mootools-uploader/Source/Uploader.Request",
    "../mootools-uploader/Source/Uploader.Swiff",
    "../mootools-uploader/Source/Uploader.Iframe",
    "../mootools-more/Source/Drag/Drag",
    "../mootools-ext/Source/Drag/Drag.Limits",
    "../mootools-more/Source/Drag/Slider",
    "../mootools-ext/Source/Drag/Slider",
    "../mootools-custom-event/Source/Element.defineCustomEvent",
    "../mootools-mobile/Source/Touch/Touch",
    "../mootools-mobile/Source/Touch/Click",
    "../mootools-mobile/Source/Desktop/Mouse",
    "../mootools-more/Source/Element/Element.Event.Pseudos",
    "../mootools-more/Source/Element/Element.Delegation",
    "../mootools-ext/Source/Element/Properties/BoxShadow",
    "../lsd/Source/Behavior",
    "../lsd/Source/Type",
    "../lsd/Source/Module/Ambient/Allocations",
    "../lsd/Source/Module/Accessories/Styles",
    "../lsd/Source/Layer",
    "../lsd/Source/Layer/Position",
    "../lsd/Source/Layer/Shape",
    "../lsd/Source/Layer/Offset",
    "../lsd/Source/Layer/Scale",
    "../lsd/Source/Layer/Radius",
    "../lsd/Source/Module/Graphics/Layers",
    "../lsd/Source/Layer/Color",
    "../lsd/Source/Layer/Stroke",
    "../lsd/Source/Layer/Shadow",
    "../lsd/Source/Layer/Shadow.Blur",
    "../lsd/Source/Layer/Shadow.Native",
    "../lsd/Source/Layer/Shadow.Inset",
    "../lsd/Source/Layer/Shadow.Onion",
    "../lsd/Source/Layer/Size",
    "../lsd/Source/Mixin/List",
    "../lsd/Source/Mixin/Choice",
    "../lsd/Source/Module/Ambient/Relations",
    "../lsd/Source/Module/Behavior/Actions",
    "../lsd/Source/Module/Behavior/Chain",
    "../lsd/Source/Mixin/Draggable",
    "../lsd/Source/Module/Ambient/Layout",
    "../lsd/Source/Module/Accessories/States",
    "../lsd/Source/Trait/Date",
    "../lsd/Source/Mixin/Value",
    "../lsd/Source/Mixin/ContentEditable",
    "../lsd/Source/Module/Behavior/Target",
    "../lsd/Source/Module/Accessories/Options",
    "../lsd/Source/Module/Accessories/Tag",
    "../lsd/Source/Mixin/Resizable",
    "../lsd/Source/Mixin/Placeholder",
    "../lsd/Source/Mixin/Request",
    "../lsd/Source/Trait/Form",
    "../lsd/Source/Module/Accessories/Attributes",
    "../lsd/Source/Module/Ambient/DOM",
    "../lsd/Source/Module/Ambient/Proxies",
    "../lsd/Source/Module/Graphics/Render",
    "../lsd/Source/Module/Ambient/Container",
    "../lsd/Source/Mixin/Dialog",
    "../lsd/Source/Mixin/Touchable",
    "../lsd/Source/Trait/Slider",
    "../lsd/Source/Mixin/Resource",
    "../lsd/Source/Module/Ambient/Selectors",
    "../lsd/Source/Module/Accessories/Shortcuts",
    "../lsd/Source/Module/Graphics/Shape",
    "../lsd/Source/Module/Graphics",
    "../lsd/Source/Trait/Fieldset",
    "../lsd/Source/Mixin/Validity",
    "../lsd/Source/Mixin/Animation",
    "../lsd/Source/Module/Accessories/Events",
    "../lsd/Source/Module/Ambient/Expectations",
    "../lsd/Source/Module/Ambient",
    "../lsd/Source/Module/Behavior/Command",
    "../lsd/Source/Module/Behavior",
    "../lsd/Source/Trait/Observer",
    "../lsd/Source/Module/Accessories/Dimensions",
    "../lsd/Source/Module/Accessories/Element",
    "../lsd/Source/Module/Accessories",
    "../lsd/Source/Widget",
    "../lsd-widgets/Source/Anchor",
    "../lsd-widgets/Source/Button",
    "../lsd/Source/Mixin/Uploader",
    "../lsd-widgets/Source/Scrollbar",
    "../lsd/Source/Mixin/Scrollable",
    "../lsd/Source/Native",
    "../lsd/Source/Document",
    "../lsd/Source/Document/Resizable",
    "../lsd/Source/Document/Commands",
    "../lsd-widgets/Source/Body",
    "../lsd-widgets/Source/Form",
    "../lsd/Source/Action/Edit",
    "../lsd/Source/Sheet",
    "../qfocuser/Source/QFocuser",
    "../lsd/Source/Mixin/Focus",
    "../lsd-widgets/Source/Menu",
    "../lsd-widgets/Source/Menu/Context",
    "../lsd/Source/Trait/Menu",
    "../lsd/Source/Trait/Input"
]
	}

};

})(typeof exports != 'undefined' ? exports : this);
