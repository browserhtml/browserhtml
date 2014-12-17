/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * keybindings.js
 *
 * Keyboard shortcuts definitions. Use methods exposed
 * in commands.js.
 *
 */

define(function() {

  'use strict';

  let allKeyBindings = [];

  function RegisterKeyBindings(...bindings) {
    for (let b of bindings) {
      let mods = b[0];
      let key = b[1];
      let func = b[2];

      let e = {
        ctrlKey: false,
        shiftKey: false,
        metaKey: false,
        altKey: false
      }

      if (mods.indexOf('Ctrl') > -1) e.ctrlKey = true;
      if (mods.indexOf('Shift') > -1) e.shiftKey = true;
      if (mods.indexOf('Alt') > -1) e.altKey = true;
      if (mods.indexOf('Cmd') > -1) e.metaKey = true;

      if (key.indexOf('code:') > -1) {
        e.keyCode = key.split(':')[1];
      } else {
        e.key = key;
      }
      allKeyBindings.push({event:e,func:func});
    }
  }

  window.addEventListener('keypress', e => {
    for (let oneKeyBinding of allKeyBindings) {
      let matches = true;
      for (let prop in oneKeyBinding.event) {
        if (e[prop] != oneKeyBinding.event[prop]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        oneKeyBinding.func.apply(null);
      }
    }
  });

  return RegisterKeyBindings;

});
