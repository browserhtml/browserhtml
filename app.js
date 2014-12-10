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
  BuildCurvedTabs,
  Keybindings,
  Navbar,
  OS,
  Tab,
  Url_helper) {
"use strict";

Commands.createNewTab("http://medium.com");

function onDocumentLoaded() {
  if (document.readyState == "complete") {
    document.removeEventListener("readystatechange", onDocumentLoaded);
    BuildCurvedTabs();
  }
}

if (document.readyState == "complete") {
  BuildCurvedTabs();
} else {
  document.addEventListener("readystatechange", onDocumentLoaded);
}

})
