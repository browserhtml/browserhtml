/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const {DOM} = require('react');
  const {Map} = require('immutable');
  const {isFocused} = require('./focusable');
  const {Element, BeforeAppendAttribute, Field, Event} = require('./element');
  const Component = require('omniscient');
  const {Deck} = require('./deck');
  const {open} = require('./web-viewer/actions');
  const {remove, append} = require('./deck/actions');
  const {getHardcodedColors} = require('./theme');

  const IFrame = Element('iframe', {
    isFocused: isFocused,
    isRemote: new BeforeAppendAttribute('remote'),
    isBrowser: new BeforeAppendAttribute('mozbrowser'),
    allowFullScreen: new BeforeAppendAttribute('mozallowfullscreen'),
    src: Field((node, current, past) => {
      if (current != past) {
        if (node.setVisible) {
          node.src = current;
        } else {
          node.src = `data:text/html,${current}`
        }
      }
    }),
    isVisible: Field((node, current, past) => {
      if (current != past) {
        if (node.setVisible) {
          node.setVisible(current);
        }
      }
    }),
    zoom: Field((node, current, past) => {
      if (current != past) {
        if (node.zoom) {
          node.zoom(current);
        }
      }
    }),
    readyState: Field((node, current, past) => {
      if (current == 'reload') {
        if (node.reload) {
          node.reload();
        }
      }

      if (current == 'stop') {
        if (node.stop) {
          node.stop();
        }
      }

      if (current == 'goBack') {
        if (node.goBack) {
          node.goBack();
        }
      }

      if (current == 'goForward') {
        if (node.goForward) {
          node.goForward();
        }
      }

      // Note that goBack / goForward won't trigger load events so we need
      // to re request canGoBack / canGoForward over on each state change.
      if (node.getCanGoBack) {
        node.getCanGoBack().onsuccess = IFrame.onCanGoBackChange(node)
      }
      if (node.getCanGoForward) {
        node.getCanGoForward().onsuccess = IFrame.onCanGoForwardChange(node)
      }
    }),
    onAsyncScroll: Event('mozbrowserasyncscroll'),
    onClose: Event('mozbrowserclose'),
    onOpenWindow: Event('mozbrowseropenwindow'),
    onContextMenu: Event('mozbrowsercontextmenu'),
    onError: Event('mozbrowsererror'),
    onLoadStart: Event('mozbrowserloadstart'),
    onLoadEnd: Event('mozbrowserloadend'),
    onIconChange: Event('mozbrowsericonchange'),
    onUserActivityDone: Event('mozbrowseractivitydone'),
    onVisibilityChange: Event('mozbrowservisibilitychange'),
    onMetaChange: Event('mozbrowsermetachange'),
    onLocationChange: Event('mozbrowserlocationchange'),
    onSecurityChange: Event('mozbrowsersecuritychange'),
    onTitleChange: Event('mozbrowsertitlechange'),
    onPrompt: Event('mozbrowsershowmodalprompt'),
    onAuthentificate: Event('mozbrowserusernameandpasswordrequired'),
    onCanGoBackChange: Event('mozbrowsercangobackchange'),
    onCanGoForwardChange: Event('mozbrowsercangoforwardchange'),
    onScrollAreaChange: Event('mozbrowserscrollareachanged')
  });

  IFrame.onCanGoBackChange = node => request => {
    node.dispatchEvent(new CustomEvent('mozbrowsercangobackchange', {
      detail: request.target.result
    }));
  }

  IFrame.onCanGoForwardChange = node => request => {
    node.dispatchEvent(new CustomEvent('mozbrowsercangoforwardchange', {
      detail: request.target.result
    }));
  }


  const WebViewer = Component(({item: webViewerCursor,
                                items: webViewersCursor }) => {

    // Do not render anything unless viewer has any `uri`
    if (!webViewerCursor.get('uri')) return null;
    return IFrame({
      className: 'frame flex-1 webviewer' +
                  (webViewerCursor.get('contentOverflows') ? ' contentoverflows' : ''),
      key: `frame-${webViewerCursor.get('id')}`,
      isBrowser: true,
      isRemote: true,
      allowFullScreen: true,

      isVisible: webViewerCursor.get('isSelected'),
      hidden: !webViewerCursor.get('isSelected'),
      zoom: webViewerCursor.get('zoom'),
      isFocused: webViewerCursor.get('isFocused'),
      src: webViewerCursor.get('uri'),
      readyState: webViewerCursor.get('readyState'),

      onCanGoBackChange: WebViewer.onCanGoBackChange(webViewerCursor),
      onCanGoForwardChange: WebViewer.onCanGoForwardChange(webViewerCursor),
      onBlur: WebViewer.onBlur(webViewerCursor),
      onFocus: WebViewer.onFocus(webViewerCursor),
      // onAsyncScroll: WebViewer.onUnhandled,
      onClose: event => remove(webViewersCursor, x => x.equals(webViewerCursor)),
      onOpenWindow: WebViewer.onOpenWindow(webViewersCursor),
      onContextMenu: WebViewer.onUnhandled,
      onError: event => console.error(event),
      onLoadStart: WebViewer.onLoadStart(webViewerCursor),
      onLoadEnd: WebViewer.onLoadEnd(webViewerCursor),
      onMetaChange: WebViewer.onMetaChange(webViewerCursor),
      onIconChange: WebViewer.onIconChange(webViewerCursor),
      onLocationChange: WebViewer.onLocationChange(webViewerCursor),
      onSecurityChange: WebViewer.onSecurityChange(webViewerCursor),
      onTitleChange: WebViewer.onTitleChange(webViewerCursor),
      onPrompt: WebViewer.onPrompt(webViewerCursor),
      onAuthentificate: WebViewer.onAuthentificate(webViewerCursor),
      onScrollAreaChange: WebViewer.onScrollAreaChange(webViewerCursor)
    })
  });

  WebViewer.onUnhandled = event => console.log(event)
  WebViewer.onBlur = webViewerCursor => event => webViewerCursor.set('isFocused', false);

  WebViewer.onFocus = webViewerCursor => event => webViewerCursor.set('isFocused', true);

  WebViewer.onLoadStart = webViewerCursor => event => webViewerCursor.merge({
    readywebViewerCursor: 'loading',
    isLoading: true,
    icons: null,
    title: null,
    location: null,
    securitywebViewerCursor: 'insecure',
    securityExtendedValidation: false,
    canGoBack: false,
    canGoForward: false
  });

  WebViewer.onLoadEnd = webViewerCursor => event => webViewerCursor.merge({
    readywebViewerCursor: 'loaded',
    isLoading: false
  });

  WebViewer.onOpenWindow = webViewersCursor => event => webViewersCursor.update(
    webViewersCursor => append(webViewersCursor, open({uri: event.detail.url})));

  WebViewer.onTitleChange = webViewerCursor => event => webViewerCursor.set('title', event.detail);

  WebViewer.onLocationChange = webViewerCursor => event => webViewerCursor.merge(
    Object.assign({location: event.detail}, getHardcodedColors(event.detail)));

  WebViewer.onIconChange = webViewerCursor => event =>
    webViewerCursor.set(['icons', event.detail.href], event.detail);

  WebViewer.onMetaChange = webViewerCursor => event =>
    webViewerCursor.set('metadata', event.detail);

  WebViewer.onCanGoBackChange = webViewerCursor => event =>
    webViewerCursor.set('canGoBack', event.detail);

  WebViewer.onCanGoForwardChange = webViewerCursor => event =>
    webViewerCursor.set('canGoForward', event.detail);

  WebViewer.onPrompt = webViewerCursor => event => console.log(event);

  WebViewer.onAuthentificate = webViewerCursor => event => console.log(event);
  WebViewer.onScrollAreaChange = webViewerCursor => event =>
    webViewerCursor.set('contentOverflows',
              event.detail.height > event.target.parentNode.clientHeight);

  WebViewer.onSecurityChange = webViewerCursor => event =>
    webViewerCursor.merge({securitywebViewerCursor: event.detail.webViewerCursor,
                 securityExtendedValidation: event.detail.extendedValidation});

  WebViewer.Deck = Deck(WebViewer);

  // Exports:

  exports.WebViewer = WebViewer;

});
