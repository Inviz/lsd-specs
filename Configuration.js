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
		source: ['lsd']
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
			//'Trait/Focus'
		]
	},

	'lsd-base': {
		path: 'lsd-base/',
		files: [
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
      "../qfocuser/Source/QFocuser",
      "../mootools-core/Source/Core/Core",
      "../mootools-core/Source/Types/Object",
      "../mootools-core/Source/Types/Array",
      "../mootools-color/Source/Color",
      "../mootools-more/Source/Core/More",
      "../mootools-core/Source/Types/Function",
      "../mootools-core/Source/Types/Number",
      "../mootools-core/Source/Types/String",
      "../mootools-core/Source/Class/Class",
      "../mootools-ext/Source/Types/FastArray",
      "../mootools-more/Source/Class/Class.Binds",
      "../mootools-ext/Source/Core/Class.Binds.Remover",
      "../mootools-core/Source/Class/Class.Extras",
      "../mootools-ext/Source/Core/Class.Includes",
      "../mootools-ext/Source/Core/Class.States",
      "../mootools-ext/Source/Utilities/Observer",
      "../mootools-ext/Source/Core/Class.Macros",
      "../mootools-core/Source/Fx/Fx",
      "../art/Source/ART",
      "../../Source/ART/ART.Element",
      "../art/Source/ART.Path",
      "../art/Source/ART.VML",
      "../art/Source/ART.SVG",
      "../../Source/ART/ART.SVG",
      "../art/Source/ART.Base",
      "../mootools-ext/Source/Utilities/Logger",
      "../mootools-core/Source/Browser/Browser",
      "../mootools-core/Source/Types/Event",
      "../mootools-ext/Source/Types/Event",
      "../../Source/ART",
      "../../Source/Container",
      "../../Source/Glyphs",
      "../mootools-core/Source/Slick/Slick.Parser",
      "../mootools-core/Source/Slick/Slick.Finder",
      "../mootools-core/Source/Element/Element",
      "../mootools-core/Source/Element/Element.Style",
      "../mootools-core/Source/Element/Element.Dimensions",
      "../mootools-more/Source/Element/Element.Measure",
      "../mootools-core/Source/Fx/Fx.CSS",
      "../mootools-core/Source/Fx/Fx.Tween",
      "../mootools-touch/Source/Touch",
      "../mootools-core/Source/Element/Element.Event",
      "../mootools-more/Source/Drag/Drag",
      "../mootools-ext/Source/Drag/Drag.Limits",
      "../mootools-more/Source/Drag/Slider",
      "../mootools-ext/Source/Element/Events/Keypress",
      "../mootools-core/Source/Utilities/DomReady",
      "../lsd-base/Source/Widget/Base",
      "../lsd-base/Source/Widget/Trait/Animation",
      "../lsd-base/Source/Widget/Trait/Slider",
      "../../Source/Widget/Base",
      "../../Source/Widget/Trait/Dimensions",
      "../../Source/Widget/Module/Position",
      "../../Source/Layout",
      "../../Source/Widget/Module/Layout",
      "../../Source/Widget/Module/DOM",
      "../../Source/Document",
      "../../Source/Widget/Module/Styles",
      "../../Source/Shape",
      "../../Source/Shape/Ellipse",
      "../../Source/Shape/Flower",
      "../../Source/Widget/Trait/Shape",
      "../../Source/Shape/Star",
      "../../Source/Shape/Arrow",
      "../../Source/Shape/Rectangle",
      "../../Source/Layer",
      "../../Source/Widget/Trait/Layers",
      "../../Source/Layer/Fill",
      "../../Source/Layer/Glyph",
      "../../Source/Layer/Shadow",
      "../../Source/Layer/InnerShadow",
      "../../Source/Layer/Stroke",
      "../../Source/Layer/Icon",
      "../../Source/Widget/Module/Container",
      "../../Source/Widget/Trait/Liquid",
      "../../Source/Widget/Trait/Aware",
      "../../Source/Widget/Trait/ProxyChildren",
      "../../Source/Widget/Module/Expression",
      "../../Source/Widget/Trait/Hoverable",
      "../../Source/Widget/Trait/Fitting",
      "../../Source/Widget/Trait/Resizable",
      "../../Source/Widget/Trait/ResizableContainer",
      "../../Source/Widget/Trait/Draggable",
      "../lsd-base/Source/Widget/Trait/Touchable",
      "../lsd-base/Source/Widget/Trait/Item",
      "../lsd-base/Source/Widget/Module/Events",
      "../../Source/Widget/Module/LayoutEvents",
      "../lsd-base/Source/Widget/Trait/Shy",
      "../lsd-base/Source/Widget/Trait/Focus",
      "../lsd-base/Source/Widget/Trait/List",
      "../lsd-base/Source/Widget/Trait/Choice",
      "../lsd-base/Source/Widget/Module/Attributes",
      "../lsd-base/Source/Widget/Widget",
      "../../Source/Widget/Widget",
      "../../Source/Widget/Element",
      "../../Source/Widget/Container",
      "../../Source/Widget/Label",
      "../../Source/Widget/Paint",
      "../../Source/Widget/Window",
      "../../Source/Widget/Glyph",
      "../../Source/Widget/Section",
      "../../Source/Widget/Footer",
      "../../Source/Widget/Nav",
      "../../Source/Widget/Header",
      "../../Source/Widget/Form",
      "../../Source/Widget/Panel",
      "../../Source/Widget/Button",
      "../../Source/Widget/Scrollbar",
      "../../Source/Widget/Trait/Scrollable",
      "../../Source/Widget/Menu",
      "../../Source/Widget/Menu/Toolbar",
      "../../Source/Widget/Menu/Context",
      "../lsd-base/Source/Widget/Trait/Accessibility",
      "../../Source/Widget/Menu/List",
      "../lsd-base/Source/Widget/Trait/Observer",
      "../lsd-base/Source/Widget/Trait/Value",
      "../lsd-base/Source/Widget/Trait/Input",
      "../../Source/Widget/Input",
      "../../Source/Widget/Input/Checkbox",
      "../../Source/Widget/Input/Range",
      "../../Source/Widget/Input/Radio",
      "../lsd-base/Source/Widget/Trait/OuterClick",
      "../../Source/Widget/Trait/Menu",
      "../../Source/Widget/Menu/Toolbar.Menu",
      "../../Source/Widget/Input/Search",
      "../../Source/Widget/Select",
      "../mootools-core/Source/Request/Request",
      "../cssparser/Source/CSSParser",
      "../../Source/Sheet",
      "Source/Application/Application",
      "Source/Application/Browser",
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
