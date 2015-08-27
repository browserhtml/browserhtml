/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
  'use strict';
  const {Element, BubbledEvent, ChromeEvent, VirtualAttribute} = require('../common/element');

  const getOwnerWindow = node => node.ownerDocument.defaultView;

  // TODO: All of these events can be expressed using external services which is
  // probably what we should do.

  // Define custom `main` element with a custom `scrollGrab` attribute
  // that maps to same named proprety.
  const Main = Element('div', {
    windowTitle: new VirtualAttribute((node, current, past) => {
      node.ownerDocument.title = current;
      return node;
    }),
    scrollGrab: new VirtualAttribute((node, current, past) => {
      node.scrollgrab = current;
      return node;
    }),
    onWindowFocus: new BubbledEvent('focus', getOwnerWindow),
    onWindowBlur: new BubbledEvent('blur', getOwnerWindow),
    onKeyDown: new BubbledEvent('keydown', getOwnerWindow),
    onKeyUp: new BubbledEvent('keyup', getOwnerWindow),
    onUnload: new BubbledEvent('unload', getOwnerWindow),
    onOpenWindow: new ChromeEvent('mozbrowseropenwindow')
  });

  exports.Main = Main;
