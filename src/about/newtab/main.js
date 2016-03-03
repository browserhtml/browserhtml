/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {start, Effects} from "reflex";
import * as NewTab from "./newtab";
import {Renderer} from "driver";

const application = start({
  initial: NewTab.init(),
  step: (model, action) => {
    console.log(">>> Action:", action);
    const [state, fx] = NewTab.update(model, action);
    console.log('<<< Model:', state);
    console.log('<<< FX:', fx);
    return [state, fx];
  },
  view: NewTab.view
});

const renderer = new Renderer({target: document.body});
application.view.subscribe(renderer.address);
application.task.subscribe(Effects.service(application.address));

window.application = application;
