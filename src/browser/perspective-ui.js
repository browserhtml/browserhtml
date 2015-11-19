/* @flow */

import {version} from "../../package.json";
import {Effects, html, forward, thunk} from "reflex";

import * as Shell from "./shell";
import * as Input from "./input";
import * as Assistant from "./assistant";
import * as WindowControls from "./window-controls";
import * as Sidebar from "./sidebar";


const initialize/*:type.initialize*/ = () => {
  const [browser, fx] = Browser.initialize()
  return [asCreateWebView(browser), fx];
};


const isAbort = action
  => action.type === 'For'
  && action.target === 'input'
  && action.action.type === 'Input.Abort';

const isSubmit = action
  => action.type === 'For'
  && action.target === 'input'
  && action.action.type === 'Input.Submit';

const isFocusInput = action
  => action.type === 'For'
  && action.target === 'input'
  && (action.action.type === 'Focusable.Focus' ||
      action.action.type === 'Focusable.RequestFocus';

const isCreateTab = action
  => action.type === 'Browser.CreateWebView';

const isShowTabs = action
  => action.type === 'Browser.ShowTabs';

const isEscape = action
  => action.type === 'Browser.Escape';

const isSelectNext = action
  => action.type === 'WebViews.SelectNext';

const isSelectPrevious = action
  => action.type === 'WebViews.SelectPrevious';

const isActivateSelected = action
  => action.type === 'For'
  && action.target === 'webViews'
  && action.action.type === 'WebViews.ActivateSelected';

const isWebViewAction = action
  => action.type === 'For'
  && action.target === 'webViews'
  && (action.action.type === 'WebViews.ByActive' ||
      action.action.type === 'WebViews.ByID');

const isFocusAction = action
  => action.type === 'Focusable.Focus'
  || action.type === 'Focusable.RequestFocus';

const isFocusWebView = action
  => isWebViewAction(action)
  && isFocusAction(action.action.action);

const isActivateWebView = action
  => isWebViewAction(action)
  && action.action.action.type === 'WebView.Activate';

const asCreateWebView = browser =>
  ({mode: 'create-web-view', browser});

const asShowWebView = browser =>
  ({mode: 'show-web-view', browser});

const asEditWebView = browser =>
  ({mode: 'edit-web-view', browser});

const asShowTabs = browser =>
  ({mode: 'show-tabs', browser});

const asSelectWebView = browser =>
  ({mode: 'select-web-view', browser});

const step = (model, action) => {
  if (model.mode === 'create-web-view') {
    if (isAbort(action)) {
      const [browser, fx] = Browser.step(model.browser, action);
      // Only switch to show-web-view mode if there is a web view
      // to show. Otherwise remain in 'create-web-view' just let the
      // escape key clear the input or whatever it is that it is supposed
      // to do.
      if (model.browser.webViews.entries.length > 0) {
        return [asShowWebView(browser), fx];
      }
    }
    else if (isSubmit(action)) {
      const [browser, fx] = Browser.step(model.browser, action);
      return [asShowWebView(browser), fx];
    }
    // @TODO: Probably we should prevent input field from loosing a focus
    // by sendig in FocusRequest on Blur. Also we may want to ignore tab
    // switching events in this mode or respond by switching to
    // `select-web-view`.
  }
  else if (model.mode === 'edit-web-view') {
    if (isAbort(action) || isSubmit(action)) {
      const [browser, fx] = Browser.step(model.browser, action);
      return [asShowWebView(browser), fx];
    }
  }
  else if (model.mode === 'show-web-view') {
    if (isFocusInput(action)) {
      const [browser, fx] = Browser.step(model.browser, action);
      return [asEditWebView(browser), fx];
    }
    else if (isCreateTab(action)) {
      const [browser, fx] = Browser.step(model.browser, action);
      return [asCreateWebView(browser), fx];
    }
    else if (isShowTabs(action) || isEscape(action)) {
      const [browser, fx] = Browser.step(model.browser, action);
      return [asShowTabs(browser), fx];
    }
    else if (isSelectNext(action) || isSelectPrevious(action)) {
      const [browser, fx] = Browser.step(model.browser, action);
      return [asSelectWebView(browser), fx];
    }
  }
  else if (model.mode === 'show-tabs') {
    if (isEscape(action) ||
        isFocusWebView(action) ||
        isActivateWebView(action))
    {
      const [browser, fx] = Browser.step(model.browser, action);
      return [asShowWebView(browser), fx];
    }
    else if (isCreateTab(action)) {
      const [browser, fx] = Browser.step(model.browser, action);
      return [asCreateWebView(browser), fx];
    }
    // @TODO: Find out if we should handle this as it's not in the control
    // flow diagram, but presumably `meta l` should still trigger this.
    else if (isFocusInput(action)) {
      const [browser, fx] = Browser.step(model.browser, action);
      return [asEditWebView(browser), fx];
    }
  }
  else if (model.mode === 'select-web-view') {
    if (isActivateSelected(action)) {
      const [browser, fx] = Browser.step(model.browser, action);
      return [asShowWebView(browser), fx];
    }
  }

  // If we reached this then action
  const [browser, fx] = Browser.step(model.browser, action);
  return [merge(model, {browser}), action];
}
