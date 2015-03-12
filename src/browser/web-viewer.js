/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const Component = require('omniscient');
  const {Deck} = require('./deck');
  const {open} = require('./web-viewer/actions');
  const {isActive, isSelected} = require('./deck/actions');
  const {getHardcodedColors} = require('./theme');
  const {IFrame} = require('./iframe');
  const {DOM} = require('react');
  const ClassSet = require('./util/class-set');
  const url = require('./util/url');
  const makeTileURI = input =>
    `/tiles/${url.getDomainName(input)}.png`;



  const WebViewer = Component('WebViewer', ({item: webViewerCursor}, {onOpen, onClose}) => {

    // Do not render anything unless viewer has any `uri`
    if (!webViewerCursor.get('uri')) return null;
    return IFrame({
      className: ClassSet({
        frame: true,
        'flex-1': true,
        webviewer: true,
        contentoverflows: webViewerCursor.get('contentOverflows')
      }),
      key: webViewerCursor.get('id'),
      isBrowser: true,
      isRemote: true,
      allowFullScreen: true,

      isVisible: isActive(webViewerCursor) ||
                 isSelected(webViewerCursor) ||
                 !webViewerCursor.get('thumbnail'),

      hidden: !isActive(webViewerCursor),
      zoom: webViewerCursor.get('zoom'),
      isFocused: webViewerCursor.get('isFocused'),
      src: webViewerCursor.get('uri'),
      readyState: webViewerCursor.get('readyState'),

      onCanGoBackChange: WebViewer.onCanGoBackChange(webViewerCursor),
      onCanGoForwardChange: WebViewer.onCanGoForwardChange(webViewerCursor),
      onBlur: WebViewer.onBlur(webViewerCursor),
      onFocus: WebViewer.onFocus(webViewerCursor),
      // onAsyncScroll: WebViewer.onUnhandled,
      onClose: event => onClose(webViewerCursor),
      onOpenWindow: event => onOpen(open({uri: event.detail.url})),
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
      onScrollAreaChange: WebViewer.onScrollAreaChange(webViewerCursor),
      onLoadProgressChange: WebViewer.onLoadProgressChange(webViewerCursor)
    })
  });

  WebViewer.onUnhandled = event => console.log(event)
  WebViewer.onBlur = webViewerCursor => event =>
    webViewerCursor.set('isFocused', false);

  WebViewer.onFocus = webViewerCursor => event =>
    webViewerCursor.set('isFocused', true);

  WebViewer.onLoadStart = webViewerCursor => event => webViewerCursor.merge({
    readyState: 'loading',
    isLoading: true,
    isConnecting: true,
    startLoadingTime: performance.now(),
    icons: {},
    thumbnail: null,
    title: null,
    location: null,
    securityState: 'insecure',
    securityExtendedValidation: false,
    canGoBack: false,
    canGoForward: false
  });

  WebViewer.onLoadEnd = webViewerCursor => event => {
    // When the progressbar of a viewer is visible,
    // we want to animate the progress to 1 on load. This
    // is handled in the progressbar code. We only set
    // progress to 1 for non selected viewers.
    if (!isSelected(webViewerCursor)) {
      webViewerCursor = webViewerCursor.set('progress', 1);
    }

    // If web viewer has no thumbnail associated with it, then
    // request a screenshot and save it into `thumbnail` field.
    if (!webViewerCursor.get('thumbnail')) {
      fetchScreenshot(event.target).
        then(WebViewer.onThumbnailChanged(webViewerCursor));
    }

    webViewerCursor.merge({
      isConnecting: false,
      endLoadingTime: performance.now(),
      readyState: 'loaded',
      isLoading: false
    });
  };

  WebViewer.onTitleChange = webViewerCursor => event =>
    webViewerCursor.set('title', event.detail);

  const fetchThumbnail = uri => new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('GET', `/tiles/${url.getDomainName(uri)}.png`);
    request.responseType = 'blob';
    request.send();
    request.onload = event => resolve(request.response);
    request.onerror = event => reject()
  });

  WebViewer.onThumbnailChanged = webViewerCursor => blob =>
    webViewerCursor.set('thumbnail', URL.createObjectURL(blob));

  const fetchScreenshot = iframe => new Promise((resolve, reject) => {
    const request = iframe.getScreenshot(100, 62.5, 'image/png');
    request.onsuccess = event => resolve(request.result);
    request.onerror = event => reject(request.error.name);
  });

  WebViewer.onLocationChange = webViewerCursor => event => {
    webViewerCursor.merge({location: event.detail}).
                    merge(getHardcodedColors(event.detail));

    fetchThumbnail(event.detail).
      then(WebViewer.onThumbnailChanged(webViewerCursor));
  }

  WebViewer.onIconChange = webViewerCursor => event =>
    webViewerCursor.setIn(['icons', event.detail.href], event.detail);

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
    webViewerCursor.merge({securityState: event.detail.state,
                           securityExtendedValidation: event.detail.extendedValidation});

  WebViewer.onLoadProgressChange = webViewerCursor => event => {
    if (webViewerCursor.get('isConnecting')) {
      webViewerCursor = webViewerCursor.set('isConnecting', false);
      return webViewerCursor.set('connectedAt', performance.now());
    }
  }

  // WebViewer deck will always inject frames by order of their id. That way
  // no iframes will need to be removed / injected when order of tabs change.
  WebViewer.Deck = Deck(WebViewer);
  // Exports:

  exports.WebViewer = WebViewer;

});
