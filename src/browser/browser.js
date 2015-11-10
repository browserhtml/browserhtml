/* @flow */

import {version} from "../../package.json"
import {Effects, html, forward} from "reflex"

import * as Shell from "./shell"
import * as Input from "./input"
import * as Assistant from "./assistant"

import * as Updater from "./updater"
// import * as Devtools from "./devtools"
import * as WebViews from "./web-views"

import {asFor} from "../common/prelude"

/*:: import * as type from "../../type/browser/browser" */

export const initialize/*:type.initialize*/ = () => {
  const [devtools, devtoolsFx] = Devtools.initialize();
  const [updates, updaterFx] = Updater.initialize();

  const model = {
    version,
    shell: Shell.initial,
    input: Input.initial,
    suggestions: Assistant.initial,
    webViews: WebViews.initial,

    // updates: updates,
    // devtools: devtools
  };

  const fx = Effects.batch([
    asFor("Devtools", devtoolsFx),
    asFor("Updater", updaterFx)
  ]);

  return [model, fx]
}
//
// export const step/*:type.step*/ = (model, address) => {
//
// }
//
//
// export const view/*:type.view*/ = (model, action) => {
//
// }
