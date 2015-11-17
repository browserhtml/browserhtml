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

import {asFor, merge, always} from "../common/prelude";
import * as Focusable from "../common/focusable";
import * as OS from '../common/os';
import * as Keyboard from '../common/keyboard';

import {identity} from "../lang/functional";
import {updateIn} from "../lang/object";

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

const FocusInput = asForInput(Focusable.Focus);

const keyDown = Keyboard.bindings({
  'accel l': always(asForInput(Focusable.Focus)),
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

const keyUp = Keyboard.bindings({
  // 'control': _ => SynthesisUI.ShowSelected(),
  // 'accel': _ => SynthesisUI.ShowSelected(),
});

// Unbox For actions and route them to their location.
const stepFor = (target, model, action) => {
  if (target === 'Browser.KeyUp' || target === 'Browser.KeyDown') {
    if (action.type === 'Keyboard.KeyUp' ||
        action.type === 'Keyborad.KeyDown' ||
        action.type === 'Keyboard.KeyPress') {
      return [model, Effects.none];
    } else {
      return step(model, action);
    }
  }
  else if (target === 'Input') {
    if (action.type === 'Input.Submit') {
      const [input, inputFx] = Input.step(model.input, action);
      // more things need to happen here.
      return [merge(model, {input}), inputFx.map(asFor('Input'))];
    } else {
      const [input, fx] = Input.step(model.input, action);
      return [merge(model, {input}), fx.map(asFor('Input'))];
    }
  }
  else if (target === 'Shell') {
    const [shell, fx] = Shell.step(model.shell, action);
    return [merge(model, {shell}), fx.map(asFor('Shell'))];
  }
  else {
    return [model, Effects.none];
  }
}

export const step/*:type.step*/ = (model, action) =>
  action.type === 'For' ?
    stepFor(action.target, model, action.action) :
    [model, Effects.none];

export const view/*:type.view*/ = (model, address) =>
  html.div({
    key: 'root',
    tabIndex: 1,
    onKeyDown: onWindow(forward(address, asFor("Browser.KeyDown")), keyDown),
    onKeyUp: onWindow(forward(address, asFor("Browser.KeyUp")), keyUp),
    onBlur: onWindow(forward(address, asFor("Shell")), Focusable.asBlur),
    onFocus: onWindow(forward(address, asFor("Shell")), Focusable.asFocus),
    // onUnload: () => address(Session.SaveSession),
  }, [
    WindowControls.view(model.shell, forward(address, asFor("Shell"))),
    Input.view(model.input, forward(address, asFor("Input")))
  ]);
