/*
---
name: Startup
description: Set up jsdom environment for test
extends: ART/ART
provides: Environment
...
*/

test = require('testling');

require("long-stack-traces");


try {
  if (typeof window == 'undefined' || typeof document == 'undefined') {
    jsdom  = require("jsdom").jsdom,
    document    = jsdom("<html><body></body></html>"),
    window = document.createWindow();
    navigator = {
      platform: 'jsdom',
      plugins: {},
      userAgent: 'jsdom'
    }
    Element = document.Element;
  }
  
  XMLHttpRequest = window.XMLHttpRequest;
} catch(e) {}