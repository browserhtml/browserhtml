/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*:: import * as type from "../../type/browser/web-view" */

import {Effects, html} from 'reflex';
import {merge} from '../common/prelude';
import {on, onCanGoBackChange, onCanGoForwardChange} from 'driver';
import {updateIn, stepIn} from '../lang/object';
import * as Shell from './web-view/shell';
import * as Progress from './web-view/progress';
import * as Navigation from './web-view/navigation';
// @TODO navigation
import * as Security from './web-view/security';
import * as Page from './web-view/page';
import {Style, StyleSheet} from '../common/style';
import {prettify} from '../common/url-helper';

export const open/*:type.open*/ = (id, options) => ({
  id: id,
  name: options.name,
  features: options.name,
  isSelected: false,
  isActive: false,
  shell: Shell.initial,
  security: Security.initial,
  navigation: Navigation.initiate(options.uri),
  progress: null,
  page: null
})

const selected = {isSelected: true};
const unselected = {isSelected: false};

export const select/*:type.select*/ = model =>
  model.isSelected ?
    model :
    merge(model, selected);

export const unselect/*:type.unselect*/ = model =>
  model.isSelected ?
    merge(model, unselected) :
    model;

export const activate/*:type.activate*/ = model =>
  model.isActive ?
    model :
    merge(model, {
      isActive: true,
      shell: Shell.focus(model.shell)
    });

export const deactivate/*:type.deactivate*/ = model =>
  model.isActive ?
    merge(model, {
      isActive: false,
      shell: Shell.blur(model.shell)
    }) :
    model;

export const asLoad = Navigation.asLoad;

export const readTitle/*:type.readTitle*/ = (model) =>
  // @TODO clean up URI and remove protocol stuff
  (model.page && model.page.title && model.page.title !== '') ?
    model.page.title :
    prettify(model.navigation.currentURI);

export const step/*:type.step*/ = (model, action) => {
  // Shell actions
  if (action.type === "Focusable.FocusRequest") {
    return [activate(model), Effects.none];
  }
  else if (action.type === "Focusable.Focus") {
    return [activate(model), Effects.none];
  }
  else if (action.type === "Focusable.Blur") {
    const [shell, fx] = Shell.step(model.shell, action);
    return [merge(model, {shell}), fx];
  }
  // Progress actions
  else if (action.type === 'WebView.Progress.Tick')
  {
    const [progress, fx] = Progress.update(model.progress, action);
    return [merge(model, {progress}), fx];
  }
  else if (action.type === 'WebView.Progress.Start'
        || action.type === 'WebView.Progress.End')
  {
    const [progress, progressFx] = Progress.step(model.progress, action);
    const [security, securityFx] = Security.step(model.security, action);
    const [page, pageFx] = Page.step(model.page, action);
    const [navigation, navigationFx] = Navigation.step(model.navigation, action);

    return [
      merge(model, {progress, security, page, navigation}),
      Effects.batch([progressFx, securityFx, pageFx, navigationFx])
    ]
  }
  else if (action.type === 'WebView.Navigation.Load'
        || action.type === 'WebView.Loader.LocationChanged'
        || action.type === 'WebView.Navigation.CanGoBackChanged'
        || action.type === 'WebView.Navigation.CanGoForwardChanged'
        || action.type === 'WebView.Navigation.Stop'
        || action.type === 'WebView.Navigation.Reload'
        || action.type === 'WebView.Navigation.GoBack'
        || action.type === 'WebView.Navigation.GoForward')
  {
    const [navigation, fx] = Navigation.step(model.navigation, action);
    return [merge(model, {navigation}), fx];
  }
  else if (action.type === 'WebView.Security.Changed') {
    const [security, fx] = Security.step(model.security, action);
    return [merge(model, {security}), fx];
  }
  // Page actions
 else if (action.type === 'WebView.Page.ScreenshotUpdate'
        || action.type === 'WebView.Page.CuratedColorUpdate'
        || action.type === 'WebView.Page.ColorScraped'
        || action.type === 'WebView.Page.DocumentFirstPaint'
        || action.type === 'WebView.Page.FirstPaint'
        || action.type === 'WebView.Page.MetaChanged'
        || action.type === 'WebView.Page.TitleChanged'
        || action.type === 'WebView.Page.IconChanged'
        || action.type === 'WebView.Page.OverflowChanged'
        || action.type === 'WebView.Page.Scrolled')
  {
    const [page, fx] = Page.step(model.page, action);
    return [merge(model, {page}), fx];
  }
  else {
    return [model, Effects.none];
  }
}

const topBarHeight = '27px';
const topBarMaxHeight = '66vh';
const comboboxHeight = '21px';
const comboboxWidth = '250px';

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
    opacity: 0,
  },

  iframe: {
    display: 'block', // iframe are inline by default
    position: 'absolute',
    top: topBarHeight,
    left: 0,
    width: '100%',
    height: `calc(100% - ${topBarHeight})`,
    mozUserSelect: 'none', // necessary to pass text drag to iframe's content
    borderWidth: 0,
    backgroundColor: 'white',
  },

  topbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: topBarHeight + 'px',
  },

  topbarBackground: {
    position: 'absolute',
    height: topBarMaxHeight,
    width: '100%',
    top: 0,
    left: 0,
    transform: `translateY(calc(-1 * ${topBarMaxHeight} + ${topBarHeight}))`,
    backgroundColor: 'white', // dynamic
  },

  combobox: {
    position: 'absolute',
    left: '50%',
    top: 0,
    height: comboboxHeight,
    width: comboboxWidth,
    marginTop: `calc(${topBarHeight} / 2 - ${comboboxHeight} / 2)`,
    marginLeft: `calc(${comboboxWidth} / -2)`,
    color: 'rgba(0, 0, 0, 0.8)',
    borderRadius: '5px',
    cursor: 'text',
  },

  titleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    textAlign: 'center',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
});

const viewFrame = ({id, navigation}, address) =>
  html.iframe({
    id: `web-view-${id}`,
    src: navigation.initiatedURI,
    'data-current-uri': navigation.currentURI,
    // opener: opener(loader.opener),
    style: Style(style.iframe),
    attributes: {
      mozbrowser: true,
      remote: true,
      // mozapp: URI.isPrivileged(location) ? URI.getManifestURL().href : void(0),
      mozallowfullscreen: true
    },
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
    // onMozBrowserLoadProgressChange: on(address, decodeProgressChange),
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
    html.div({
      className: 'webview-topbar',
      style: Style(style.topbar)
    }, [
      html.div({
        className: 'webview-topbar-background',
        style: Style(style.topbarBackground)
      }),
      html.div({
        className: 'webview-combobox',
        style: Style(style.combobox)
      }, [
        html.div({
          className: 'webview-title-container',
          style: Style(style.titleContainer)
        }, [
          html.span({className: 'webview-security-icon'}),
          html.span({
            className: 'webview-title'
          }, [
            readTitle(model)
          ])
        ])
      ]),
      html.div({className: 'webview-show-sidebar-button'})
    ])
  ]);
