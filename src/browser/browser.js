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
import * as OS from '../common/os';
import {KeyBindings} from '../common/keyboard';

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

const asForInput = asFor('Input');

const modifier = OS.platform() == 'linux' ? 'alt' : 'accel';
const KeyDown = KeyBindings({
  'accel l': _ => asForInput(Focusable.Focus),
  // 'accel t': _ => SynthesisUI.OpenNew(),
  // 'accel 0': _ => WebView.BySelected({action: Shell.ResetZoom()}),
  // 'accel -': _ => WebView.BySelected({action: Shell.ZoomOut()}),
  // 'accel =': _ => WebView.BySelected({action: Shell.ZoomIn()}),
  // 'accel shift =': _ => WebView.BySelected({action: Shell.ZoomIn()}),
  // 'accel w': _ => WebView.BySelected({action: WebView.Close()}),
  // 'accel shift ]': _ => WebView.Preview({action: Selector.Next()}),
  // 'accel shift [': _ => WebView.Preview({action: Selector.Previous()}),
  // 'control tab': _ => WebView.Preview({action: Selector.Next()}),
  // 'control shift tab': _ => WebView.Preview({action: Selector.Previous()}),
  // 'accel shift backspace': _ => Session.ResetSession(),
  // 'accel shift s': _ => Session.SaveSession(),
  // 'accel r': _ => WebView.BySelected({action: Navigation.Reload()}),
  // 'escape': _ => WebView.BySelected({action: Navigation.Stop()}),
  // [`${modifier} left`]: _ => WebView.BySelected({action: Navigation.GoBack()}),
  // [`${modifier} right`]: _ => WebView.BySelected({action: Navigation.GoForward()}),

  // TODO: `meta alt i` generates `accel alt i` on OSX we need to look
  // more closely into this but so declaring both shortcuts should do it.
  // 'accel alt i': _ => DevtoolsHUD.ToggleDevtoolsHUD(),
  // 'accel alt ˆ': _ => DevtoolsHUD.ToggleDevtoolsHUD(),
  // 'F12': _ => DevtoolsHUD.ToggleDevtoolsHUD()
});

const KeyUp = KeyBindings({
  // 'control': _ => SynthesisUI.ShowSelected(),
  // 'accel': _ => SynthesisUI.ShowSelected(),
});

// Unbox For actions and route them to their location.
const stepFor = (model, action) =>
  action.target === 'Input' ?
    [set(model, 'input', Input.update(model.input, action.action)),
     Effects.none] :
  action.target === 'Shell' ?
    [set(model, 'shell', Shell.update(model.shell, action.action)),
     Effects.none] :
  [model, Effects.none];

export const step/*:type.step*/ = (model, action) =>
  action.type === 'For' ?
    stepFor(model, action) :
  // Unbox Keyboard commands
  action.type === 'Keyboard.Command' && action.action.type === 'For' ?
    stepFor(model, action.action) :
  [model, Effects.none];

export const view/*:type.view*/ = (model, address) =>
  html.div({
    key: 'root',
    tabIndex: 1,
    onKeyDown: onWindow(address, KeyDown),
    onKeyUp: onWindow(address, KeyUp),
    onBlur: onWindow(forward(address, asFor("Shell")), Focusable.asBlur),
    onFocus: onWindow(forward(address, asFor("Shell")), Focusable.asFocus),
    // onUnload: () => address(Session.SaveSession),
  }, [
    // @TODO hook up window control hover
    WindowControls.view(
      model.shell.isFocused,
      model.shell.isPointerOver,
      address),
    Input.view(model.input, forward(address, asFor("Input")))
  ]);
