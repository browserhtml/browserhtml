/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*:: import * as type from "../../type/browser/web-view/progress" */

import {Effects} from 'reflex';
import {merge} from '../../lang/object';

const second = 1000;

export const asStart/*:type.asStart*/ = (time) => ({
  type: "WebView.Progress.Start",
  timeStamp: time,
});

export const asChange/*:type.asChange*/ = (time) => ({
  type: "WebView.Progress.Change",
  timeStamp: time,
});

export const asEnd/*:type.asEnd*/ = (time) => ({
  type: "WebView.Progress.End",
  timeStamp: time,
});

export const asTick/*:type.asTick*/ = (time) => ({
  type: "WebView.Progress.Tick",
  timeStamp: time,
});

// Start a new progress cycle.
export const start/*:type.start*/ = (timeStamp) => [
  {
    loadStart: timeStamp,
    // Predict a 10s load if we don't know.
    loadEnd: timeStamp + (10 * second),
    updateTime: timeStamp
  },
  Effects.tick(asTick)
];

// Invoked on End action and returns model with updated `timeStamp`:
//  [
//    {...model, loadEnd: timeStamp},
//    Effects.none
//  ]
export const end = (timeStamp, model) => [
  merge(model, {loadEnd: timeStamp}),
  Effects.none
];

// Update the progress and request another tick.
// Returns a new model and a tick effect.
export const tick/*:type.tick*/ = (timeStamp, model) => [
  merge(model, {updateTime: timeStamp}),
  Effects.tick(asTick)
];

