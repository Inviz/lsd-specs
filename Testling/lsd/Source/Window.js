/*
---
name: Window
description: Extend jsdom window with mootools native methods
provides: Window
extends: Core/Element.Event
...
*/

Object.append(window, Window.prototype);