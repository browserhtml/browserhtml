/* @flow */

import {version} from "../../package.json";
import {Effects, html, forward} from "reflex";

import * as Shell from "./shell";
import * as Input from "./input";
import * as Assistant from "./assistant";
import * as WindowControls from "./window-controls.js";

// import * as Updater from "./updater"
// import * as Devtools from "./devtools"
// import * as WebViews from "./web-views"

import {asFor} from "../common/prelude";
import * as Focusable from "../common/focusable";

import {identity} from "../lang/functional";
import {set} from "../lang/object";

import {onWindow} from "driver";

/*:: import * as type from "../../type/browser/browser" */

export const initialize/*:type.initialize*/ = () => {
  // const [devtools, devtoolsFx] = Devtools.initialize();
  // const [updates, updaterFx] = Updater.initialize();

  const model = {
    version,
    shell: Shell.initial,
    input: Input.initial,
    suggestions: Assistant.initial,
    // webViews: WebViews.initial,
    // updates: updates,
    // devtools: devtools
  };

  // @TODO hook up effects
  // const fx = Effects.batch([
  //   asFor("Devtools", devtoolsFx),
  //   asFor("Updater", updaterFx)
  // ]);

  return [model, Effects.none];
}

// Unbox For actions and route them to their location.
const stepFor = (model, action) =>
  action.target === 'Shell' ?
    [set(model, 'shell', Shell.update(model.shell, action.action)),
     Effects.none] :
  [model, Effects.none];

export const step/*:type.step*/ = (model, action) =>
  action.type === 'For' ?
    stepFor(model, action) :
  [model, Effects.none];

export const view/*:type.view*/ = (model, address) =>
  html.div({
    key: 'root',
    tabIndex: 1,
    onBlur: onWindow(forward(address, asFor("Shell")), Focusable.asBlur),
    onFocus: onWindow(forward(address, asFor("Shell")), Focusable.asFocus),
    // onUnload: () => address(Session.SaveSession),
  }, [
    // @TODO hook up window control hover
    WindowControls.view(
      model.shell.isFocused,
      model.shell.isPointerOver,
      address)
  ]);
