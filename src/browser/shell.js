/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Effects, Task, forward} from "reflex";
import {merge, always} from "../common/prelude";
import {cursor} from "../common/cursor";
import * as Focusable from "../common/focusable";
import * as Target from "../common/target";
import * as Runtime from "../common/runtime";
import * as Controls from "./shell/controls";
import * as Unknown from "../common/unknown";

/*:: import * as type from "../../type/browser/shell" */

// @TODO: IO stuff should probably live elsewhere.
const fetchFocus = Task.io(deliver => {
  const action
    // @FlowIssue: Flow does not know about `document.hasFocus()`
    = document.hasFocus()
    ? Focus
    : Blur;
  return Task.succeed(action);
});


export const init/*:type.init*/ = () => {
  const [controls, fx] = Controls.init(false, false, false);
  return [
    ( { isFocused: false
      , isMinimized: false
      , isMaximized: false
      , controls: controls
      }
    )
  , Effects.batch(
    [ fx,
      // Check if window is actually focused
      Effects.task(fetchFocus)
    ])
  ]
}

export const Focus/*:type.Focus*/ = {type: "Focus"};
export const Blur/*:type.Blur*/ = {type: "Blur"};
export const Close/*:type.Close*/ = {type: "Close"};
export const Minimize/*:type.Minimize*/ = {type: "Minimize"};
export const ToggleFullscreen/*:type.ToggleFullscreen*/ =
  {type: "ToggleFullscreen"};

export const Closed/*:type.Closed*/ = {type: "Closed"};
export const Minimized/*:type.Minimized*/ = Runtime.Minimized;
export const FullscreenToggled/*:type.FullscreenToggled*/ = Runtime.FullscreenToggled;


const ControlsAction = action =>
    action.type === 'CloseWindow'
  ? Close
  : action.type === 'MinimizeWindow'
  ? Minimize
  : action.type === 'ToggleWindowFullscreen'
  ? ToggleFullscreen
  : {type: "Controls", action};

const updateControls = cursor({
  get: model => model.controls,
  set: (model, controls) => merge(model, {controls}),
  update: Controls.update,
  tag: ControlsAction
});


export const update/*:type.update*/ = (model, action) =>
    action.type === "Focus"
  ? updateControls
    ( merge(model, {isFocused: true, isMinimized: false})
    , Controls.Enable
    )
  : action.type === "Blur"
  ? updateControls(merge(model, {isFocused: false}), Controls.Disable)
  : action.type === "Minimized"
  ? [merge(model, {isMinimized: true}), Effects.none]
  : action.type === "FullscreenToggled"
  ? [merge(model, {isMaximized: !model.isMaximized}), Effects.none]
  : action.type === "Close"
  ? [model, Effects.task(Runtime.quit).map(always(Closed))]
  : action.type === "Minimize"
  ? [model, Effects.task(Runtime.minimize)]
  : action.type === "ToggleFullscreen"
  ? [model, Effects.task(Runtime.toggleFullscreen)]
  : action.type === "Controls"
  ? updateControls(model, action.action)
  : Unknown.update(model, action);

export const view/*:type.view*/ = (model, address) =>
  Controls.view(model.controls, forward(address, ControlsAction));
