require.config({
  scriptType: "text/javascript;version=1.8",
  enforceDefine: true,
});

define([
  'js/browser',
  'js/commands',
  'js/curvedTabs',
  'js/keybindings',
  'js/navbar',
  'js/os',
  'js/tab',
  'js/url_helper',
], function(
  Browser,
  Commands,
  CurvedTabs,
  Keybindings,
  Navbar,
  OS,
  Tab,
  Url_helper) {
"use strict";

Commands.createNewTab("http://medium.com");

})
