/* @flow */

import {version} from "../../package.json";
import {Effects, html, forward} from "reflex";

import * as PerspectiveUI from "./perspective-ui";
import * as Shell from "./shell";
import * as Input from "./input";
import * as Assistant from "./assistant";

// import * as Updater from "./updater"
// import * as Devtools from "./devtools"
// import * as WebViews from "./web-views"

import {asFor} from "../common/prelude";
import * as Focusable from "../common/focusable";

import {identity} from "../lang/functional";

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

export const step/*:type.step*/ = (model, message) =>
  [PerspectiveUI.update(model, message), Effects.none];

export const view/*:type.view*/ = (model, address) =>
  html.div({
    key: 'root',
    tabIndex: 1,
    onBlur: onWindow(forward(address, Focusable.asBlur), identity),
    onFocus: onWindow(forward(address, Focusable.asFocus), identity),
    // onUnload: () => address(Session.SaveSession),
  });
