(function(context){

var Configuration = context.Configuration = {};

Configuration.name = 'Lovely Scalable Drawings projects';

Configuration.presets = {
  'full': {
		sets: ['accessories', 'behavior', 'ambient'],
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
	    'Expectations'
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
	}
};


Configuration.source = {

	'lsd': {
		path: '../lsd/',
		files: [
"../Sheet.js/Source/sg-regex-tools",
"../Sheet.js/Source/SheetParser.CSS",
"../Sheet.js/Source/Sheet",
"../Sheet.js/Source/SheetParser.Value",
"../Sheet.js/Source/SheetParser.Property",
"../Sheet.js/Source/SheetParser.Styles",
"../slick/Source/Slick.Parser",
"../slick/Source/Slick.Finder",
"../mootools-core/Source/Slick/Slick.Parser",
"../mootools-core/Source/Core/Core",
"../mootools-speedups/Source/Core/Core.Speedups",
"../mootools-core/Source/Types/String",
"../mootools-core/Source/Types/Function",
"../mootools-core/Source/Types/Object",
"../mootools-speedups/Source/Types/Object",
"../mootools-core/Source/Types/Array",
"../mootools-color/Source/Color",
"../mootools-core/Source/Types/Number",
"../mootools-string-inflections/Source/String.Inflections",
"../mootools-core/Source/Class/Class",
"../mootools-speedups/Source/Core/Class.Speedups",
"../mootools-core/Source/Class/Class.Extras",
"../mootools-speedups/Source/Core/Class.Extras.Speedups",
"../mootools-ext/Source/Core/Class.Macros",
"../mootools-ext/Source/Utilities/Observer",
"../mootools-ext/Source/Core/Class.States",
"../mootools-ext/Source/Core/Class.Includes",
"../mootools-core/Source/Fx/Fx",
"../mootools-ext/Source/Core/Class.Mixin",
"../mootools-ext/Source/Types/FastArray",
"../art/Source/ART",
"../lsd/Source/ART/ART.Element",
"../lsd/Source/ART/ART.Glyphs",
"../art/Source/ART.Path",
"../art/Source/ART.VML",
"../art/Source/ART.SVG",
"../lsd/Source/ART/ART.SVG",
"../art/Source/ART.Base",
"../lsd/Source/ART/ART.Shape.Arrow",
"../lsd/Source/ART/ART.Shape.Flower",
"../lsd/Source/ART/ART.Shape.Star",
"../lsd/Source/ART/ART.Shape.Rectangle",
"../lsd/Source/ART/ART.Shape.Ellipse",
"../mootools-core/Source/Utilities/JSON",
"../mootools-core/Source/Browser/Browser",
"../mootools-core/Source/Element/Element",
"../mootools-ext/Source/Element/Element.onDispose",
"../mootools-ext/Source/Element/Properties/BoxShadow",
"../mootools-ext/Source/Element/Properties/BorderRadius",
"../mootools-core/Source/Element/Element.Style",
"../mootools-core/Source/Element/Element.Dimensions",
"../mootools-core/Source/Fx/Fx.CSS",
"../mootools-core/Source/Fx/Fx.Tween",
"../mootools-core/Source/Request/Request",
"../mootools-ext/Source/Request/Request.Headers",
"../mootools-ext/Source/Request/Request.Statuses",
"../mootools-core/Source/Request/Request.JSON",
"../mootools-core/Source/Request/Request.HTML",
"../mootools-ext/Source/Request/Request.Auto",
"../mootools-resource/Source/Resource",
"../mootools-resource/Source/Resource.Parser",
"../mootools-resource/Source/Resource.Parser.JSON",
"../mootools-resource/Source/Resource.Parser.XML",
"../mootools-resource/Source/Resource.Parser.HTML",
"../mootools-resource/Source/Resource.Model",
"../mootools-resource/Source/Resource.Collection",
"../mootools-resource/Source/Resource.Model.Actions",
"../mootools-ext/Source/Element/Properties/Item",
"../mootools-ext/Source/Element/Element.from",
"../mootools-ext/Source/Element/Properties/Widget",
"../mootools-ext/Source/Core/Class.Shortcuts",
"../mootools-mobile/Source/Browser/Features.Touch",
"../lsd/Source/LSD",
"../lsd/Source/Interpolation",
"../lsd/Source/Command/Command",
"../lsd/Source/Command/Checkbox",
"../lsd/Source/Command/Radio",
"../lsd/Source/Action",
"../lsd/Source/Action/Value",
"../lsd/Source/Action/Delete",
"../lsd/Source/Action/Send",
"../lsd/Source/Action/State",
"../lsd/Source/Action/Create",
"../lsd/Source/Action/Dialog",
"../lsd/Source/Action/Append",
"../lsd/Source/Action/Check",
"../lsd/Source/Action/Display",
"../lsd/Source/Action/Clone",
"../lsd/Source/Action/Update",
"../lsd/Source/Action/Replace",
"../lsd/Source/Fx",
"../mootools-core/Source/Types/Event",
"../mootools-core/Source/Element/Element.Event",
"../mootools-core/Source/Utilities/DOMReady",
"../mootools-custom-event/Source/Element.defineCustomEvent",
"../mootools-mobile/Source/Touch/Touch",
"../mootools-mobile/Source/Touch/Click",
"../mootools-mobile/Source/Desktop/Mouse",
"../lsd/Source/ART/ART",
"../mootools-more/Source/More/More",
"../mootools-more/Source/Types/Object.Extras",
"../mootools-more/Source/Locale/Locale",
"../mootools-more/Source/Locale/Locale.en-US.Date",
"../mootools-more/Source/Types/Date",
"../lsd/Source/Type",
"../lsd/Source/Module/Accessories/Dimensions",
"../lsd/Source/Module/Accessories/Options",
"../lsd/Source/Trait/List",
"../lsd/Source/Trait/Choice",
"../lsd/Source/Mixin/Touchable",
"../lsd/Source/Module/Ambient/DOM",
"../lsd/Source/Module/Ambient/Proxies",
"../lsd/Source/Module/Ambient/Container",
"../lsd/Source/Module/Graphics/Render",
"../lsd/Source/Module/Graphics/Shape",
"../lsd/Source/Trait/Animation",
"../lsd/Source/Mixin/Value",
"../lsd/Source/Module/Ambient/Relations",
"../lsd/Source/Module/Behavior/Target",
"../lsd/Source/Module/Accessories/Attributes",
"../lsd/Source/Mixin/Dialog",
"../lsd/Source/Trait/Date",
"../lsd/Source/Module/Accessories/Element",
"../lsd/Source/Sheet",
"../lsd/Source/Module/Behavior/Actions",
"../lsd/Source/Module/Behavior/Chain",
"../lsd/Source/Mixin/Position",
"../lsd/Source/Module/Accessories/Styles",
"../lsd/Source/Layer",
"../lsd/Source/Module/Graphics/Layers",
"../lsd/Source/Module/Graphics",
"../lsd/Source/Layer/Color",
"../lsd/Source/Layer/Stroke",
"../lsd/Source/Layer/Size",
"../lsd/Source/Layer/Scale",
"../lsd/Source/Layer/Shadow",
"../lsd/Source/Layer/Shadow.Inset",
"../lsd/Source/Layer/Shadow.Native",
"../lsd/Source/Layer/Shadow.Blur",
"../lsd/Source/Layer/Shadow.Onion",
"../lsd/Source/Layer/Radius",
"../lsd/Source/Layer/Offset",
"../lsd/Source/Layer/Position",
"../lsd/Source/Layer/Shape",
"../lsd/Source/Mixin/Placeholder",
"../lsd/Source/Module/Accessories/Shortcuts",
"../lsd/Source/Trait/Fieldset",
"../lsd/Source/Module/Ambient/Selectors",
"../lsd/Source/Trait/Observer",
"../lsd/Source/Mixin/Validity",
"../lsd/Source/Module/Accessories/States",
"../lsd/Source/Layout",
"../lsd/Source/Module/Ambient/Layout",
"../mootools-more/Source/Class/Events.Pseudos",
"../mootools-more/Source/Element/Element.Event.Pseudos",
"../mootools-more/Source/Element/Element.Delegation",
"../lsd/Source/Module/Accessories/Events",
"../lsd/Source/Module/Ambient/Expectations",
"../lsd/Source/Module/Ambient",
"../lsd/Source/Module/Behavior/Command",
"../lsd/Source/Module/Behavior",
"../lsd/Source/Module/Accessories",
"../lsd/Source/Widget",
"../lsd/Source/Native",
"../lsd-native/Source/Anchor",
"../lsd/Source/Document",
"../lsd/Source/Document/Commands",
"../lsd/Source/Document/Resizable",
"../lsd-native/Source/Body",
"../lsd-widgets/Source/Button",
"../lsd-widgets/Source/Menu",
"../lsd-widgets/Source/Menu/Context",
"../lsd/Source/Trait/Menu",
"../mootools-more/Source/Types/String.QueryString",
"../mootools-more/Source/Types/URI",
"../lsd/Source/Mixin/Resource",
"../mootools-ext/Source/Request/Request.Form",
"../lsd/Source/Mixin/Request",
"../lsd/Source/Trait/Form",
"../lsd-native/Source/Form",
"../lsd/Source/Action/Edit",
"../lsd/Source/Application",
"../mootools-more/Source/Drag/Drag",
"../lsd/Source/Mixin/Resizable",
"../mootools-ext/Source/Drag/Drag.Limits",
"../lsd/Source/Mixin/Draggable",
"../mootools-more/Source/Class/Class.Binds",
"../mootools-ext/Source/Core/Class.Binds.Remover",
"../mootools-more/Source/Element/Element.Measure",
"../mootools-more/Source/Drag/Slider",
"../mootools-ext/Source/Drag/Slider",
"../lsd/Source/Trait/Slider",
"../lsd-widgets/Source/Scrollbar",
"../lsd/Source/Mixin/Scrollable",
"../qfocuser/Source/QFocuser",
"../lsd/Source/Mixin/Focus",
"../lsd/Source/Trait/Input"
		]
	}

};

})(typeof exports != 'undefined' ? exports : this);
