/* @flow */

import {forward, thunk, Effects} from 'reflex';
import * as Input from './input';
import * as Assistant from './assistant';
import * as Sidebar from './sidebar';
import * as Browser from './browser';
import * as WebViews from './web-views';
import * as Overlay from './overlay';
import * as CreateTab from './create-tab';
import {asFor, merge} from '../common/prelude';
import * as URI from '../common/url-helper';
import {Style, StyleSheet} from '../common/style';

export const initialize/*:type.initialize*/ = () => {
  const [browser, fx] = Browser.initialize();
  const model = {
    mode: 'create-web-view',
    browser,
    overlay: Overlay.hidden
  };

  return [model, fx];
};

export const isInputAction = action =>
  action.type === 'For' &&
  action.target === 'input';

export const isWebViewAction = action =>
  action.type === 'For' &&
  action.target === 'webViews' &&
  (
    action.action.type === 'WebViews.ByActive' ||
    action.action.type === 'WebViews.ByID'
  );

export const isFocusAction = action =>
  action.type === 'Focusable.Focus' ||
  action.type === 'Focusable.RequestFocus';

export const isAbort = action =>
  isInputAction(action) &&
  action.action.type === 'Input.Abort';

export const isSubmit = action =>
  isInputAction(action) &&
  action.action.type === 'Input.Submit';

export const isFocusInput = action =>
  isInputAction(action) &&
  isFocusAction(action.action);

export const isKeyDown = action =>
  action.type === 'For' &&
  action.target === 'Browser.KeyDown';

export const isKeyUp = action =>
  action.type === 'For' &&
  action.target === 'Browser.KeyUp';

export const isCreateTab = action =>
  action.type === 'Browser.CreateWebView' ||
  (isKeyDown(action) && action.action.type === 'Browser.CreateWebView');

export const isShowTabs = action =>
  action.type === 'Browser.ShowTabs' ||
  (isWebViewAction(action) && action.action.action.type === 'WebView.RequestShowTabs');

export const isEscape = action =>
  isKeyDown(action) &&
  action.action.type === 'Browser.Escape';

export const isActivateSelected = action =>
  action.type === 'For' &&
  action.target === 'webViews' &&
  action.action.type === 'WebViews.ActivateSelected';

export const isActivateSelectedWebView = action =>
  isActivateSelected(action) ||
  (isKeyUp(action) && isActivateSelected(action.action));


export const isFocusWebView = action =>
  isWebViewAction(action) &&
  isFocusAction(action.action.action);

export const isActivateWebView = action =>
  isWebViewAction(action) &&
  action.action.action.type === 'WebView.Activate';

export const isEditWebview = action =>
  isWebViewAction(action) &&
  action.action.action.type === 'WebView.Edit';

export const isSelectRelativeWebView = action =>
  action.type === 'For' &&
  action.target === 'webViews' &&
  action.action.type === 'WebViews.SelectRelative';

export const isSwitchSelectedWebView = action =>
  isSelectRelativeWebView(action) ||
  (isKeyDown(action) && isSelectRelativeWebView(action.action));


export const asByOverlay = asFor('overlay');

export const step = (model, action) => {
  // @TODO We should stick to the pattern and tag both browser and
  // overlay actions, but at that would mean more refactoring so instead
  // we just treat untagged actions as for browser.
  // @TODO Consider dispatching overlay actions as effects instead of
  // trying to process both actions in the same step.
  if (action.type === 'For' && action.target === 'overlay') {
    const [overlay, fx] = Overlay.step(model.overlay, action.action);
    return [merge(model, {overlay}), fx.map(asByOverlay)];
  }
  else if (model.mode === 'create-web-view') {
    if (isAbort(action)) {
      const [browser, fx] = Browser.step(model.browser, action);
      // Only switch to show-web-view mode if there is a web view
      // to show. Otherwise remain in 'create-web-view' just let the
      // escape key clear the input or whatever it is that it is supposed
      // to do.
      if (model.browser.webViews.entries.length > 0) {
        return [
          merge(model, {browser, mode: 'show-web-view'}),
          fx
        ];
      }
    }
    else if (isSubmit(action)) {
      // @TODO we also normalize in Browser for editing location. In future
      // we should create a single entry point for the URL.
      const open = Browser.asOpenWebView(URI.read(model.browser.input.value));
      const [browser, fx] = Browser.step(model.browser, open);
      return [
        merge(model, {browser, mode: 'show-web-view'}),
        fx
      ];
    }
    // @TODO: Probably we should prevent input field from loosing a focus
    // by sendig in FocusRequest on Blur. Also we may want to ignore tab
    // switching events in this mode or respond by switching to
    // `select-web-view`.
  }
  else if (model.mode === 'edit-web-view') {
    if (isAbort(action) || isSubmit(action) || isEscape(action)) {
      const [browser, fx] = Browser.step(model.browser, action);
      const hide = Overlay.asHide(performance.now());
      const [overlay, overlayFx] = Overlay.step(model.overlay, hide);
      return [
        merge(model, {browser, overlay, mode: 'show-web-view'}),
        Effects.batch([
          fx,
          overlayFx.map(asByOverlay)
        ])
      ];
    }
    else if (isCreateTab(action)) {
      const [browser, fx] = Browser.step(model.browser, action);
      const hide = Overlay.asHide(performance.now());
      const [overlay, overlayFx] = Overlay.step(model.overlay, hide);
      return [
        merge(model, {browser, overlay, mode: 'create-web-view'}),
        Effects.batch([
          fx,
          overlayFx.map(asByOverlay)
        ])
      ];
    }
  }
  else if (model.mode === 'show-web-view') {
    if (isFocusInput(action)) {
      const [browser, fx] = Browser.step(model.browser, action);
      const show = Overlay.asShow(performance.now());
      const [overlay, overlayFx] = Overlay.step(model.overlay, show);

      return [
        merge(model, {browser, overlay, mode: 'edit-web-view'}),
        Effects.batch([
          fx,
          overlayFx.map(asByOverlay)
        ])
      ]
    }
    else if (isCreateTab(action)) {
      const [browser, fx] = Browser.step(model.browser, action);
      return [
        merge(model, {browser, mode: 'create-web-view'}),
        fx
      ];
    }
    // @TODO we should also wire up esc to cancel current webview loading if
    // 1) webview is loading 2) current mode is show webview.
    // When current webview is loading, esc should cancel load. Hitting esc
    // again should transition to show-tabs view.
    // When current webview is not loading, esc should go direct to
    // show-tabs view.
    else if (isShowTabs(action) || isEscape(action)) {
      const [browser, fx] = Browser.step(model.browser, action);
      const fade = Overlay.asFade(performance.now());
      const [overlay, overlayFx] = Overlay.step(model.overlay, fade);
      return [
        merge(model, {browser, overlay, mode: 'show-tabs'}),
        Effects.batch([
          fx,
          overlayFx.map(asByOverlay)
        ])
      ];
    }
    else if (isSwitchSelectedWebView(action)) {
      const [browser, fx] = Browser.step(model.browser, action);
      const fade = Overlay.asFade(performance.now());
      const [overlay, overlayFx] = Overlay.step(model.overlay, fade);

      return [
        merge(model, {browser, overlay, mode: 'select-web-view'}),
        Effects.batch([
          fx,
          overlayFx.map(asByOverlay)
        ])
      ];
    }
    else if (isEditWebview(action)) {
      const [browser, fx] = Browser.step(model.browser, action);
      const show = Overlay.asShow(performance.now());
      const [overlay, overlayFx] = Overlay.step(model.overlay, show);

      return [
        merge(model, {browser, overlay, mode: 'edit-web-view'}),
        Effects.batch([
          fx,
          overlayFx.map(asByOverlay)
        ])
      ];
    }
  }
  else if (model.mode === 'show-tabs') {
    if (isEscape(action) ||
        isFocusWebView(action) ||
        isActivateWebView(action))
    {
      const [browser, fx] = Browser.step(model.browser, action);
      const hide = Overlay.asHide(performance.now());
      const [overlay, overlayFx] = Overlay.step(model.overlay, hide);

      return [
        merge(model, {browser, overlay, mode: 'show-web-view'}),
        Effects.batch([
          fx,
          overlayFx.map(asByOverlay)
        ])
      ];
    }
    else if (isCreateTab(action)) {
      const [browser, fx] = Browser.step(model.browser, action);
      const hide = Overlay.asHide(performance.now());
      const [overlay, overlayFx] = Overlay.step(model.overlay, hide);
      return [
        merge(model, {browser, overlay, mode: 'create-web-view'}),
        Effects.batch([
          fx,
          overlayFx.map(asByOverlay)
        ])
      ];
    }
    // @TODO: Find out if we should handle this as it's not in the control
    // flow diagram, but presumably `meta l` should still trigger this.
    else if (isFocusInput(action)) {
      const [browser, fx] = Browser.step(model.browser, action);
      const show = Overlay.asShow(performance.now());
      const [overlay, overlayFx] = Overlay.step(model.overlay, show);
      return [
        merge(model, {browser, overlay, mode: 'edit-web-view'}),
        Effects.batch([
          fx,
          overlayFx.map(asByOverlay)
        ])
      ];
    }
  }
  else if (model.mode === 'select-web-view') {
    if (isActivateSelectedWebView(action)) {
      const [browser, fx] = Browser.step(model.browser, action);
      const hide = Overlay.asHide(performance.now());
      const [overlay, overlayFx] = Overlay.step(model.overlay, hide);

      return [
        merge(model, {browser, overlay, mode: 'show-web-view'}),
        Effects.batch([
          fx,
          overlayFx.map(asByOverlay)
        ])
      ];
    }
  }

  // If we reached this then action
  const [browser, fx] = Browser.step(model.browser, action);
  return [merge(model, {browser}), fx];
}

const style = StyleSheet.create({
  sidebarVisible: {},
  sidebarHidden: {
    transform: 'translateX(380px)'
  },

  inputVisible: {},
  inputHidden: {
    opacity: 0,
    pointerEvents: 'none'
  },

  webViewZoomedIn: {},
  webViewZoomedOut: {
    transform: 'translate3d(0, 0, -600px) rotateY(10deg)',
    transformOrigin: 'left center',
    pointerEvents: 'none'
  },

  assistantHidden: {
    display: 'none'
  },

  assistantFull: {
    height: '100vh'
  }
});

export const view = (model, address) =>
  model.mode === 'edit-web-view' ?
    viewAsEditWebView(model, address) :
  model.mode === 'show-web-view' ?
    viewAsShowWebView(model, address) :
  model.mode === 'create-web-view' ?
    viewAsCreateWebView(model, address) :
  model.mode === 'select-web-view' ?
    viewAsSelectWebView(model, address) :
  // mode === 'show-tabs' ?
    viewAsShowTabs(model, address);

const viewAsEditWebView = (model, address) =>
  Browser.view(model.browser, address, [
    thunk('web-views',
          WebViews.view,
          model.browser.webViews,
          forward(address, asFor('webViews')),
          style.webViewZoomedIn),
    thunk('overlay',
          Overlay.view,
          model.overlay,
          forward(address, asFor('overlay'))),
    thunk('sidebar',
          Sidebar.view,
          model.browser.webViews,
          forward(address, asFor('webViews')),
          style.sidebarHidden),
    thunk('create-tab',
          CreateTab.render,
          forward(address, asFor('webViews'))),
    thunk('suggestions',
          Assistant.view,
          model.browser.suggestions,
          address),
    thunk('input',
          Input.view,
          model.browser.input,
          forward(address, asFor('input')),
          style.inputVisible)
  ]);

const viewAsShowWebView = (model, address) =>
  Browser.view(model.browser, address, [
    thunk('web-views',
          WebViews.view,
          model.browser.webViews,
          forward(address, asFor('webViews')),
          style.webViewZoomedIn),
    thunk('overlay',
          Overlay.view,
          model.overlay,
          forward(address, asFor('overlay'))),
    thunk('sidebar',
          Sidebar.view,
          model.browser.webViews,
          forward(address, asFor('webViews')),
          style.sidebarHidden),
    thunk('create-tab',
          CreateTab.render,
          forward(address, asFor('webViews'))),
    thunk('suggestions',
          Assistant.view,
          model.browser.suggestions,
          address,
          style.assistantHidden),
    thunk('input',
          Input.view,
          model.browser.input,
          forward(address, asFor('input')),
          style.inputHidden)
  ]);

const viewAsCreateWebView = (model, address) =>
  Browser.view(model.browser, address, [
    thunk('web-views',
          WebViews.view,
          model.browser.webViews,
          forward(address, asFor('webViews')),
          style.webViewZoomedIn),
    thunk('overlay',
          Overlay.view,
          model.overlay,
          forward(address, asFor('overlay'))),
    thunk('sidebar',
          Sidebar.view,
          model.browser.webViews,
          forward(address, asFor('webViews')),
          style.sidebarHidden),
    thunk('create-tab',
          CreateTab.render,
          forward(address, asFor('webViews'))),
    thunk('suggestions',
          Assistant.view,
          model.browser.suggestions,
          address,
          style.assistantFull),
    thunk('input',
          Input.view,
          model.browser.input,
          forward(address, asFor('input')),
          style.inputVisible)
  ]);

const viewAsSelectWebView = (model, address) =>
  Browser.view(model.browser, address, [
    thunk('web-views',
          WebViews.view,
          model.browser.webViews,
          forward(address, asFor('webViews')),
          style.webViewZoomedOut),
    thunk('overlay',
          Overlay.view,
          model.overlay,
          forward(address, asFor('overlay'))),
    thunk('sidebar',
          Sidebar.view,
          model.browser.webViews,
          forward(address, asFor('webViews')),
          style.sidebarVisible),
    thunk('create-tab',
          CreateTab.render,
          forward(address, asFor('webViews'))),
    thunk('suggestions',
          Assistant.view,
          model.browser.suggestions,
          address,
          style.assistantHidden),
    thunk('input',
          Input.view,
          model.browser.input,
          forward(address, asFor('input')),
          style.inputHidden)
  ]);

const viewAsShowTabs = (model, address) =>
  Browser.view(model.browser, address, [
    thunk('web-views',
          WebViews.view,
          model.browser.webViews,
          forward(address, asFor('webViews')),
          style.webViewZoomedOut),
    thunk('overlay',
          Overlay.view,
          model.overlay,
          forward(address, asFor('overlay'))),
    thunk('sidebar',
          Sidebar.view,
          model.browser.webViews,
          forward(address, asFor('webViews')),
          style.sidebarVisible),
    thunk('suggestions',
          Assistant.view,
          model.browser.suggestions,
          address,
          style.assistantHidden),
    thunk('create-tab',
          CreateTab.render,
          forward(address, asFor('webViews'))),
    thunk('input',
          Input.view,
          model.browser.input,
          forward(address, asFor('input')),
          style.inputHidden)
  ]);
