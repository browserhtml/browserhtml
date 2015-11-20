/* @flow */

import {version} from "../../package.json";
import {Effects, html, forward, thunk} from "reflex";

import * as Shell from "./shell";
import * as Input from "./input";
import * as Assistant from "./assistant";
import * as WindowControls from "./window-controls";

// import * as Updater from "./updater"
// import * as Devtools from "./devtools"
import * as WebViews from "./web-views";
import * as WebView from "./web-view";

import {asFor, merge, always} from "../common/prelude";
import * as Focusable from "../common/focusable";
import * as OS from '../common/os';
import * as Keyboard from '../common/keyboard';
import {Style, StyleSheet} from '../common/style';

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
    webViews: WebViews.initial,
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

const asByInput = asFor('input');
const asByWebViews = asFor('webViews');
const asByActiveWebView = action => asByWebViews(WebViews.asByActive(action));

const modifier = OS.platform() == 'linux' ? 'alt' : 'accel';

const FocusInput = asByInput(Focusable.Focus);

export const CreateWebView = ({type: 'Browser.CreateWebView'});
export const asOpenWebView = uri => asByWebViews(WebViews.asOpen({uri}));

const keyDown = Keyboard.bindings({
  'accel l': always(asByInput(Focusable.Focus)),
  'accel t': always(CreateWebView),
  'accel 0': always(asByActiveWebView(WebView.RequestZoomReset)),
  'accel -': always(asByActiveWebView(WebView.RequestZoomOut)),
  'accel =': always(asByActiveWebView(WebView.RequestZoomIn)),
  'accel shift =': always(asByActiveWebView(WebView.RequestZoomIn)),
  'accel w': always(asByActiveWebView(WebView.Close)),
  'accel shift ]': always(asByWebViews(WebViews.SelectNext)),
  'accel shift [': always(asByWebViews(WebViews.SelectPrevious)),
  'control tab': always(asByWebViews(WebViews.SelectNext)),
  'control shift tab': always(asByWebViews(WebViews.SelectPrevious)),
  // 'accel shift backspace': _ => Session.ResetSession(),
  // 'accel shift s': _ => Session.SaveSession(),
  'accel r': always(asByActiveWebView(WebView.RequestReload)),
  'escape': always(asByActiveWebView(WebView.RequestStop)),
  [`${modifier} left`]: always(asByActiveWebView(WebView.RequestGoBack)),
  [`${modifier} right`]: always(asByActiveWebView(WebView.RequestGoForward)),

  // TODO: `meta alt i` generates `accel alt i` on OSX we need to look
  // more closely into this but so declaring both shortcuts should do it.
  // 'accel alt i': _ => DevtoolsHUD.ToggleDevtoolsHUD(),
  // 'accel alt ˆ': _ => DevtoolsHUD.ToggleDevtoolsHUD(),
  // 'F12': _ => DevtoolsHUD.ToggleDevtoolsHUD()
});

const keyUp = Keyboard.bindings({
  'control': always(asByWebViews(WebViews.ActivateSelected)),
  'accel': always(asByWebViews(WebViews.ActivateSelected))
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
  else if (target === 'input') {
    if (action.type === 'Input.Submit') {
      const [input, inputFx] = Input.step(model.input, action);

      const navigate = WebViews.asNavigateTo(model.input.value);
      const [webViews, viewFx] = WebViews.step(model.webViews, navigate);
      // more things need to happen here.
      return [
        merge(model, {input, webViews}),
        Effects.batch([
          inputFx.map(asFor('input')),
          viewFx.map(asFor('webViews'))
        ])
      ]
    } else {
      const [input, fx] = Input.step(model.input, action);
      return [merge(model, {input}), fx.map(asFor('input'))];
    }
  }
  else if (target === 'shell') {
    const [shell, fx] = Shell.step(model.shell, action);
    return [merge(model, {shell}), fx.map(asFor('shell'))];
  }
  else if (target === 'webViews') {
    const [webViews, fx] = WebViews.step(model.webViews, action);
    return [merge(model, {webViews}), fx.map(asFor('webViews'))];
  }
  else {
    return [model, Effects.none];
  }
}

export const step/*:type.step*/ = (model, action) =>
  action.type === 'For' ?
    stepFor(action.target, model, action.action) :
    [model, Effects.none];

const style = StyleSheet.create({
  root: {
    background: '#24303D',
    perspective: '1000px',
    // These styles prevent scrolling with the arrow keys in the root window
    // when elements move outside of viewport.
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    position: 'absolute'
  }
});

export const view/*:type.view*/ = (model, address, children) =>
  html.div({
    className: 'root',
    style: style.root,
    tabIndex: 1,
    onKeyDown: onWindow(forward(address, asFor("Browser.KeyDown")), keyDown),
    onKeyUp: onWindow(forward(address, asFor("Browser.KeyUp")), keyUp),
    onBlur: onWindow(forward(address, asFor("shell")), Focusable.asBlur),
    onFocus: onWindow(forward(address, asFor("shell")), Focusable.asFocus),
    // onUnload: () => address(Session.SaveSession),
  }, [
    ...children,
    thunk('controls',
      WindowControls.view,
      model.shell,
      forward(address, asFor("shell")))
  ]);
