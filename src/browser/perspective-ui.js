/* @noflow */

import {forward, thunk, Effects, Task} from 'reflex';
import * as Input from './input';
import * as Assistant from './assistant';
import * as Browser from './browser';
import * as WebViews from './web-views';
import {merge} from '../common/prelude';
import {cursor} from '../common/cursor';
import * as URI from '../common/url-helper';
import {Style, StyleSheet} from '../common/style';
import {ease, easeOutCubic, float} from 'eased';


export const init/*:type.init*/ = () => {
  const [browser, browserFx] = Browser.init();
  const model = {
    mode: 'create-web-view',
    browser,
  };

  return [
    model,
    Effects.batch([
      browserFx,
      Effects.task(Task.succeed(Browser.CreateWebView))
    ])
  ];
};

const isWindowFocus = action =>
  action.type === "Shell" &&
  action.action.type === "Focus";

const isOverlayClick = action =>
  action.type === "OverlayClicked";

const isInputAction = action =>
  action.type === 'For' &&
  action.target === 'input';

const isWebViewAction = action =>
  action.type === 'For' &&
  action.target === 'webViews' &&
  (
    action.action.type === 'WebViews.ByActive' ||
    action.action.type === 'WebViews.ByID'
  );

const isFocusAction = action =>
  action.type === 'Focusable.Focus' ||
  action.type === 'Focusable.RequestFocus';

const isAbort = action =>
  action.type === 'ExitInput';

const isSubmit = action =>
  action.type === 'SubmitInput';

const isFocusInput = action =>
  isInputAction(action) &&
  isFocusAction(action.action);

const isKeyDown = action =>
  action.type === 'For' &&
  action.target === 'Browser.KeyDown';

const isKeyUp = action =>
  action.type === 'For' &&
  action.target === 'Browser.KeyUp';

const isCreateTab = action =>
  action.type === 'CreateWebView';

const isShowTabs = action =>
  action.type === 'ShowTabs';

const isEscape = action =>
  action.type === 'Escape';

const isActivateSelected = action =>
  action.type === 'For' &&
  action.target === 'webViews' &&
  action.action.type === 'WebViews.ActivateSelected';

const isActivateSelectedWebView = action =>
  isActivateSelected(action) ||
  (isKeyUp(action) && isActivateSelected(action.action));


const isFocusWebView = action =>
  isWebViewAction(action) &&
  isFocusAction(action.action.action);

const isActivateWebView = action =>
  isWebViewAction(action) &&
  action.action.action.type === 'WebView.Activate';

const isEditWebview = action =>
  action.type === 'EditWebView';

const isSelectRelativeWebView = action =>
  action.type === 'For' &&
  action.target === 'webViews' &&
  action.action.type === 'WebViews.SelectRelative';

const isSwitchSelectedWebView = action =>
  isSelectRelativeWebView(action) ||
  (isKeyDown(action) && isSelectRelativeWebView(action.action));


export const update = (model, action) => {
  if (model.mode === 'create-web-view') {
    if (isAbort(action) || isEscape(action)) {
      // Only switch to show-web-view mode if there is a web view
      // to show. Otherwise remain in 'create-web-view' just let the
      // escape key clear the input or whatever it is that it is supposed
      // to do.
      if (model.browser.webViews.order.length > 0) {
        const [browser, fx] = Browser.update(model.browser, Browser.ShowWebView);
        return [
          merge(model, {browser, mode: 'show-web-view'}),
          fx
        ];
      } else {
        return [model, Effects.none];
      }
    }
    else if (isSubmit(action)) {
      const [browser, fx] = Browser.update(model.browser, Browser.OpenWebView);
      return [
        merge(model, {browser, mode: 'show-web-view'}),
        fx
      ];
    }
    // When window get's focus back return focus to the input field.
    else if (isWindowFocus(action)) {
      const [browser, fx] =
        Browser.update(model.browser, action);

      return [ merge(model, {browser}), Effects.receive(Browser.CreateWebView) ];
    }
    // @TODO: Probably we should prevent input field from loosing a focus
    // by sendig in FocusRequest on Blur. Also we may want to ignore tab
    // switching events in this mode or respond by switching to
    // `select-web-view`.
  }
  else if (model.mode === 'edit-web-view') {
    if (isAbort(action) || isEscape(action) || isOverlayClick(action)) {
      const [browser, fx] = Browser.update(model.browser, Browser.ShowWebView);

      return [
        merge(model, {browser, mode: 'show-web-view'}),
        fx
      ];
    }
    else if (isSubmit(action)) {
      const [browser, fx] = Browser.update(model.browser, Browser.SubmitInput);

      return [
        merge(model, {browser, mode: 'show-web-view'}),
        fx
      ];
    }
    else if (isCreateTab(action)) {
      const [browser, fx] = Browser.update(model.browser, Browser.CreateWebView);
      return [
        merge(model, {browser, mode: 'create-web-view'}),
        fx
      ];
    }
  }
  else if (model.mode === 'show-web-view') {
    if (isFocusInput(action)) {
      const [browser, fx] = Browser.update(model.browser, action);

      return [
        merge(model, {browser, mode: 'edit-web-view'}),
        fx
      ]
    }
    else if (isCreateTab(action)) {
      const [browser, fx] = Browser.update(model.browser, Browser.CreateWebView);
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
      const [browser, fx] = Browser.update(model.browser, Browser.ShowTabs);

      return [
        merge(model, {browser, mode: 'show-tabs'}),
        fx
      ];
    }
    else if (isSwitchSelectedWebView(action)) {
      const [browser, fx] = Browser.update(model.browser, action);

      return [
        merge(model, {browser, mode: 'select-web-view'}),
        fx
      ];
    }
    else if (isEditWebview(action)) {
      const [browser, fx] = Browser.update(model.browser, action);

      return [
        merge(model, {browser, mode: 'edit-web-view'}),
        fx
      ];
    }
  }
  else if (model.mode === 'show-tabs') {
    if (isEscape(action) ||
        isFocusWebView(action) ||
        isActivateWebView(action) ||
        isOverlayClick(action))
    {
      const [browser, fx] = Browser.update(model.browser, Browser.ShowWebView);

      return [
        merge(model, {browser, mode: 'show-web-view'}),
        fx
      ];
    }
    else if (isCreateTab(action)) {
      const [browser, fx] = Browser.update(model.browser, action);
      return [
        merge(model, {browser, mode: 'create-web-view'}),
        fx
      ];
    }
    // @TODO: Find out if we should handle this as it's not in the control
    // flow diagram, but presumably `meta l` should still trigger this.
    else if (isFocusInput(action)) {
      const [browser, fx] = Browser.update(model.browser, action);

      return [
        merge(model, {browser, mode: 'edit-web-view'}),
        fx
      ];
    }
  }
  else if (model.mode === 'select-web-view') {
    if (isActivateSelectedWebView(action)) {
      const [browser, fx] = Browser.update(model.browser, action);

      return [
        merge(model, {browser, mode: 'show-web-view'}),
        fx
      ];
    }
  }

  // If we reached this then action
  const [browser, fx] = Browser.update(model.browser, action);
  return [merge(model, {browser}), fx];
}


export const view/*:type.view*/ = (model, address) =>
  Browser.view(model.browser, address);
