/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

import {start, Effects} from "reflex";
import * as Browser from "./browser";

// import * as Session from "./session";
import {version} from "../../package.json";
import {Renderer} from "driver";

const application = start({
  initial: Browser.initialize(),
  step: Browser.step,
  view: Browser.view
});

// application.unload = () => application.address(Runtime.LiveReload());

// If hotswap change address so it points to a new mailbox &
// re-render.
// if (isReload) {
//   window.application.unload();
//   application.render();
// }

const renderer = new Renderer({target: document.body});
application.view.subscribe(renderer.address);

application.task.subscribe(Effects.service(application.address));

// const address = action => {
//   // @TODO
// }

// @TODO hook up services to address. I think these are described with effects now.

window.application = application;