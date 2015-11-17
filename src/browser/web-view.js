/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*:: import * as type from "../../type/browser/web-view" */

import {Effects, html} from 'reflex';
import {on, onCanGoBackChange, onCanGoForwardChange} from 'driver';
import {updateIn, stepIn} from '../common/lang/object';
import * as Shell from './web-view/shell';
import * as Progress from './web-view/progress';
// @TODO navigation
import * as Security from './web-view/security';
import * as Page from './web-view/page';
import {Style, StyleSheet} from '../common/style';

export const step/*:type.step*/ (model, action) =>
  // Shell actions
  action.type === "Focusable.FocusRequest" ?
    [updateIn('shell', Shell.update, model, action), Effects.none] :
  action.type === "Focusable.Focus" ?
    [updateIn('shell', Shell.update, model, action), Effects.none] :
  action.type === "Focusable.Blur" ?
    [updateIn('shell', Shell.update, model, action), Effects.none] :
  action.type === "Target.Over" ?
    [updateIn('shell', Shell.update, model, action), Effects.none] :
  action.type === "Target.Out" ?
    [updateIn('shell', Shell.update, model, action), Effects.none] :

  // Progress actions
  action.type === 'WebView.Progress.Start' ?
    stepIn('progress', Progress.update, model, action) :
  action.type === 'WebView.Progress.End' ?
    stepIn('progress', Progress.update, model, action) :
  action.type === 'WebView.Progress.Tick' ?
    stepIn('progress', Progress.update, model, action) :
  // @TODO navigation

  // Security actions
  action.type === 'WebView.Security.Changed' ?
    [updateIn('security', Security.update, model, action), Effects.none] :

  // Page actions
  action.type === 'WebView.Page.ScreenshotUpdate' ?
    stepIn('page', Page.step, model, action) :
  action.type === 'WebView.Page.CuratedColorUpdate' ?
    stepIn('page', Page.step, model, action) :
  action.type === 'WebView.Page.ColorScraped' ?
    stepIn('page', Page.step, model, action) :
  action.type === 'WebView.Page.DocumentFirstPaint' ?
    stepIn('page', Page.step, model, action) :
  action.type === 'WebView.Page.FirstPaint' ?
    stepIn('page', Page.step, model, action) :
  action.type === 'WebView.Page.MetaChanged' ?
    stepIn('page', Page.step, model, action) :
  action.type === 'WebView.Page.TitleChanged' ?
    stepIn('page', Page.step, model, action) :
  action.type === 'WebView.Page.IconChanged' ?
    stepIn('page', Page.step, model, action) :
  action.type === 'WebView.Page.OverflowChanged' ?
    stepIn('page', Page.step, model, action) :
  action.type === 'WebView.Page.Scrolled' ?
    stepIn('page', Page.step, model, action) :

  // Default
  [model, Effects.none];

const style = StyleSheet.create({
  webview: {
    position: 'absolute', // to stack webview on top of each other
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    mozUserSelect: 'none',
    cursor: 'default',
  },

  webViewInactive: {
    pointerEvents: 'none',
    visibility: 'hidden',
    opacity: 0
  },

  iframe: {
    display: 'block', // iframe are inline by default
    position: 'absolute',
    // top: var(--webview-topbar-height),
    left: 0,
    width: '100%',
    // height: calc(100% - var(--webview-topbar-height)),
    mozUserSelect: 'none', // necessary to pass text drag to iframe's content

    borderWidth: 0,
    backgroundColor: 'white',
  }

});

const viewFrame = (model, address) =>
  html.iframe({
    id: `web-view-${loader.id}`,
    src: location,
    'data-uri': loader.uri,
    // opener: opener(loader.opener),
    style: style.iframe,
    mozbrowser: true,
    remote: true,
    // mozapp: URI.isPrivileged(location) ? URI.getManifestURL().href : void(0),
    mozallowfullscreen: true
    // isVisible: visiblity(isSelected || !thumbnail),
    // zoom: zoom(shell.zoom),
    // navigation: navigate(navigation.state),
    // isFocused: focus(shell.isFocused),
    // onBlur: on(address, decodeBlur),
    // onFocus: on(address, decodeFocus),
    // onMozbrowserAsyncScroll: on(address, decodeAsyncScroll),

    // onMozBrowserCanGoBackChange: onCanGoBackChange(address, decodeCanGoBackChange),
    // onMozBrowserCanGoForwardChange: onCanGoForwardChange(address, decodeCanGoForwardChange),

    // onMozBrowserClose: on(address, decodeClose),
    // onMozBrowserOpenWindow: on(address, decodeOpenWindow),
    // onMozBrowserOpenTab: on(address, decodeOpenTab),
    // onMozBrowserContextMenu: on(address, decodeContexMenu),
    // onMozBrowserError: on(address, decodeError),
    // onMozBrowserLoadStart: on(address, decodeLoadStart),
    // onMozBrowserLoadEnd: on(address, decodeLoadEnd),
    // onMozBrowserFirstPaint: on(address, decodeFirstPaint),
    // onMozBrowserDocumentFirstPaint: on(address, decodeDocumentFirstPaint),
    // // onMozBrowserLoadProgressChange: on(address, decodeProgressChange),
    // onMozBrowserLocationChange: on(address, decodeLocationChange),
    // onMozBrowserMetaChange: on(address, decodeMetaChange),
    // onMozBrowserIconChange: on(address, decodeIconChange),
    // onMozBrowserLocationChange: on(address, decodeLocationChange),
    // onMozBrowserSecurityChange: on(address, decodeSecurityChange),
    // onMozBrowserTitleChange: on(address, decodeTitleChange),
    // onMozBrowserShowModalPrompt: on(address, decodeShowModalPrompt),
    // onMozBrowserUserNameAndPasswordRequired: on(address, decodeAuthenticate),
    // onMozBrowserScrollAreaChanged: on(address, decodeScrollAreaChange),
  });

export const view/*:type.view*/ = (model, address) =>
  html.div({
    className: 'webview',
    style: Style(
      style.webview,
      !model.isActive && style.webViewInactive
    )
  }, [
    viewFrame(model, address),
    html.div({className: 'webview-local-overlay'}),
    html.div({className: 'webview-topbar'}, [
      html.div({className: 'webview-topbar-background'}),
      html.div({className: 'webview-combobar'}, [
        html.div({className: 'webview-title-container'}, [
          html.span({className: 'webview-security-icon'}),
          html.span({className: 'webview-title'})
        ])
      ]),
      html.div({className: 'webview-show-sidebar-button'})
    ])
  ]);
