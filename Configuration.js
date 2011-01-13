(function(context){

var Configuration = context.Configuration = {};

Configuration.name = 'Lovely SVG Drawings projects';

Configuration.presets = {
  'lsd-base': {
  	sets: ['lsd-base'],
  	source: ['lsd-base']
  },
	'lsd': {
		sets: ['lsd'],
		source: ['lsd-base']
	},
	'full': {
		sets: ['lsd', 'lsd-base'],
		source: ['lsd', 'lsd-base']
	}
};

Configuration.defaultPresets = {
	browser: 'full',
	nodejs: 'full',
	jstd: 'full'
};

Configuration.sets = {

	'lsd': {
		path: 'lsd/',
		files: [
//			'Trait/Layers',
      'Trait/Dimensions',
		//	'Layer/InnerShadow'
		]
	},

	'lsd-base': {
		path: 'lsd-base/',
		files: [
		  'Base',
			'Trait/Focus'
		]
	}
};


Configuration.source = {

	'lsd': {
		path: '../Source/',
		files: [
		]
	},

	'lsd-base': {
		path: '../lsd-examples/',
		files: [
    "../mootools-core/Source/Slick/Slick.Parser",
    "../mootools-core/Source/Slick/Slick.Finder",
    "../cssparser/Source/CSSParser",
    "../qfocuser/Source/QFocuser",
    "../mootools-core/Source/Core/Core",
    "../mootools-more/Source/Core/More",
    "../mootools-core/Source/Types/Object",
    "../mootools-core/Source/Types/String",
    "../mootools-core/Source/Types/Number",
    "../mootools-core/Source/Types/Function",
    "../mootools-core/Source/Types/Array",
    "../mootools-color/Source/Color",
    "../mootools-core/Source/Browser/Browser",
    "../mootools-mobile/Source/Browser/Features.Touch",
    "../mootools-core/Source/Types/Event",
    "../mootools-ext/Source/Types/Event",
    "../mootools-core/Source/Element/Element",
    "../mootools-ext/Source/Element/Properties/BorderRadius",
    "../mootools-ext/Source/Element/Properties/UserSelect",
    "../mootools-ext/Source/Element/Properties/BoxShadow",
    "../mootools-ext/Source/Element/Properties/Item",
    "../mootools-core/Source/Element/Element.Event",
    "../mootools-ext/Source/Element/Events/Keypress",
    "../mootools-custom-event/Source/Element.defineCustomEvent",
    "../mootools-mobile/Source/Desktop/Mouse",
    "../mootools-mobile/Source/Touch/Touch",
    "../mootools-mobile/Source/Touch/Click",
    "../mootools-core/Source/Utilities/DOMReady",
    "../mootools-core/Source/Element/Element.Style",
    "../mootools-core/Source/Element/Element.Dimensions",
    "../mootools-more/Source/Element/Element.Measure",
    "../mootools-core/Source/Class/Class",
    "../mootools-core/Source/Class/Class.Extras",
    "../mootools-ext/Source/Core/Class.Macros",
    "../mootools-ext/Source/Core/Class.Includes",
    "../mootools-ext/Source/Core/Class.States",
    "../mootools-more/Source/Drag/Drag",
    "../mootools-ext/Source/Drag/Drag.Limits",
    "../mootools-core/Source/Request/Request",
    "../mootools-core/Source/Fx/Fx",
    "../mootools-core/Source/Fx/Fx.CSS",
    "../mootools-core/Source/Fx/Fx.Tween",
    "../mootools-ext/Source/Utilities/Observer",
    "../art/Source/LSD",
    "../../Source/LSD/LSD.Element",
    "../art/Source/ART.Path",
    "../art/Source/LSD.VML",
    "../art/Source/LSD.SVG",
    "../../Source/LSD/LSD.SVG",
    "../art/Source/LSD.Base",
    "../../Source/LSD",
    "../../Source/Container",
    "../../Source/Glyphs",
    "../../Source/Expression",
    "../mootools-ext/Source/Types/FastArray",
    "../lsd-base/Source/Widget/Base",
    "../lsd-base/Source/Trait/Accessibility",
    "../lsd-base/Source/Trait/Focus",
    "../lsd-base/Source/Trait/Input",
    "../lsd-base/Source/Trait/List",
    "../lsd-base/Source/Trait/Choice",
    "../lsd-base/Source/Trait/Animation",
    "../lsd-base/Source/Trait/Value",
    "../lsd-base/Source/Trait/Observer",
    "../lsd-base/Source/Trait/Touchable",
    "../lsd-base/Source/Trait/Item",
    "../../Source/Widget/Base",
    "../../Source/Trait/Dimensions",
    "../../Source/Trait/Draggable",
    "../../Source/Trait/Resizable",
    "../../Source/Module/DOM",
    "../../Source/Document",
    "../../Source/Module/Position",
    "../../Source/Module/Styles",
    "../../Source/Shape",
    "../../Source/Shape/Star",
    "../../Source/Layer",
    "../../Source/Layer/Glyph",
    "../../Source/Layer/Shadow",
    "../../Source/Layer/InnerShadow",
    "../../Source/Layer/Icon",
    "../../Source/Layer/Fill",
    "../../Source/Layer/Stroke",
    "../../Source/Trait/Layers",
    "../../Source/Shape/Rectangle",
    "../../Source/Shape/Ellipse",
    "../../Source/Shape/Arrow",
    "../../Source/Shape/Flower",
    "../../Source/Trait/Shape",
    "../../Source/Sheet",
    "../../Source/Layout",
    "../../Source/Module/Layout",
    "../../Source/Trait/Expectations",
    "../../Source/Trait/Proxies",
    "../../Source/Module/Container",
    "../lsd-base/Source/Module/Attributes",
    "../lsd-base/Source/Module/Events",
    "../lsd-base/Source/Widget/Widget",
    "../../Source/Widget/Widget",
    "../../Source/Widget/Element",
    "../../Source/Widget/Label",
    "../../Source/Widget/Container",
    "../../Source/Widget/Paint",
    "../../Source/Widget/Window",
    "Source/Application/Application",
    "../../Source/Widget/Panel",
    "../../Source/Widget/Button",
    "../../Source/Widget/Input",
    "../../Source/Widget/Input/Checkbox",
    "../../Source/Widget/Input/Radio",
    "../../Source/Widget/Section",
    "../../Source/Widget/Nav",
    "../../Source/Widget/Footer",
    "../../Source/Widget/Header",
    "../../Source/Widget/Glyph",
    "../../Source/Widget/Form",
    "../../Source/Widget/Menu",
    "../../Source/Widget/Menu/Context",
    "../../Source/Trait/Menu",
    "../../Source/Widget/Input/Search",
    "../../Source/Widget/Select",
    "../../Source/Widget/Menu/List",
    "../../Source/Widget/Menu/Toolbar",
    "../../Source/Widget/Menu/Toolbar.Menu",
    "../lsd-base/Source/Trait/Shy",
    "../mootools-more/Source/Class/Class.Binds",
    "../mootools-ext/Source/Core/Class.Binds.Remover",
    "../mootools-more/Source/Drag/Slider",
    "../mootools-ext/Source/Drag/Slider",
    "../lsd-base/Source/Trait/Slider",
    "../../Source/Widget/Scrollbar",
    "../../Source/Trait/Scrollable",
    "Source/Application/Browser",
    "../../Source/Widget/Input/Range",
    "Source/Application/Desktop",
    "Source/Application/Preferences",
    "Source/Application/Network"
    ]
	},

	'core-1.3-client': {
		path: '../Source/',
		files: [
		]
	}

};

})(typeof exports != 'undefined' ? exports : this);
