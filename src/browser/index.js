/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {start, Effects} from "reflex";
import * as Browser from "./browser";
import * as Runtime from "../common/runtime";

// import * as Session from "./session";
import {version} from "../../package.json";
import {Renderer} from "driver";


const logger = (step) => (model, action) => {
  const out = step(model, action);
  console.log(action, ...out);
  return out;
}

const isReload = window.application != null;

// If hotswap change address so it points to a new mailbox &r
// re-render.
if (isReload) {
  window.application.address(Runtime.LiveReload);
}

const application = start({
  initial: isReload ?
            window.application.model.value :
            Browser.initialize(),
  step: logger(Browser.step),
  view: Browser.view
});


const renderer = new Renderer({target: document.body});
application.view.subscribe(renderer.address);
application.task.subscribe(Effects.service(application.address));

window.application = application;
