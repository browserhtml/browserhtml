/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

const {start} = require('reflex');
const Browser = require('./browser');
// const PerspectiveUI = require('./perspective-ui');
// const Session = require('./session');
const version = require('../../package.json').version;
const {Renderer} = require('reflex-virtual-dom-driver');

const application = start({
  initial: Browser.initialize(),
  step: Browser.step,
  view: (model, address) => Browser.view(model, address)
});

application.unload = () => application.address(Runtime.LiveReload());

// If hotswap change address so it points to a new mailbox &
// re-render.
// if (isReload) {
//   window.application.unload();
//   application.render();
// }

const renderer = new Renderer({target: document.body})
application.view.subscribe(renderer.address)

const address = action => {
  // @TODO
}

// @TODO hook up services to address.

window.application = application;