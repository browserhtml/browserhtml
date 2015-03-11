/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const {DOM} = require('react')
  const Component = require('omniscient');
  const {InputVirtualAttribute} = require('./editable');
  const {Element} = require('./element');
  const {navigateTo, showTabStrip, focus} = require('./actions');
  const {KeyBindings} = require('./keyboard');
  const url = require('./util/url');
  const {ProgressBar} = require('./progressbar');
  const ClassSet = require('./util/class-set');
  const {throttle} = require('lang/functional');
  let {computeSuggestions, resetSuggestions} = require('./awesomebar');

  computeSuggestions = throttle(computeSuggestions, 200)

  const WindowControls = Component('WindowControls', ({theme}) =>
    DOM.div({className: 'windowctrls'}, [
      DOM.div({className: 'windowctrl win-close-button',
               style: theme.windowCloseButton,
               title: 'close',
               key: 'close',
               onClick: event => window.close()}),
      DOM.div({className: 'windowctrl win-min-button',
               style: theme.windowMinButton,
               title: 'minimize',
               key: 'minimize',
               onClick: event => window.minimize()}),
      DOM.div({className: 'windowctrl win-max-button',
               style: theme.windowMaxButton,
               title: 'maximize',
               key: 'maximize',
               onClick: event => {
                 if (document.mozFullScreenElement) {
                   document.mozCancelFullScreen();
                 } else {
                   document.body.mozRequestFullScreen();
                 }
               }})
    ]));

  const inputBindings = KeyBindings({'escape': focus});


  const NavigationControls = Component('NavigationControls', ({inputCursor, tabStripCursor,
                                         webViewerCursor, suggestionsCursor, theme}) =>
    DOM.div({
      className: 'locationbar',
      onMouseEnter: event => showTabStrip(tabStripCursor)
    }, [
      DOM.div({className: 'backbutton',
               style: theme.backButton,
               key: 'back',
               onClick: event => webViewerCursor.set('readyState', 'goBack')}),
      InputVirtualAttribute({
        key: 'input',
        className: 'urlinput',
        style: theme.urlInput,
        placeholder: 'Search or enter address',
        value: webViewerCursor.get('userInput'),
        type: 'text',
        submitKey: 'Enter',
        isFocused: inputCursor.get('isFocused'),
        selection: inputCursor.get('isFocused'),
        onFocus: event => {
          computeSuggestions(event.target.value, suggestionsCursor);
          inputCursor.set('isFocused', true);
        },
        onBlur: event => {
          resetSuggestions(suggestionsCursor);
          inputCursor.set('isFocused', false);
        },
        onChange: event => {
          computeSuggestions(event.target.value, suggestionsCursor);
          webViewerCursor.set('userInput', event.target.value);
        },
        onSubmit: event => navigateTo({inputCursor, webViewerCursor: webViewerCursor}, event.target.value, true),
        onKeyUp: inputBindings(webViewerCursor),
      }),
      DOM.p({key: 'page-info',
             className: 'pagesummary',
             style: theme.pageInfoText,
             onClick: event => inputCursor.set('isFocused', true)}, [
        DOM.span({key: 'location',
                  style: theme.locationText,
                  className: 'pageurlsummary'},
                 webViewerCursor.get('location') ? url.getDomainName(webViewerCursor.get('location')) : ''),
        DOM.span({key: 'title',
                  className: 'pagetitle',
                  style: theme.titleText},
                 webViewerCursor.get('title') ? webViewerCursor.get('title') :
                 webViewerCursor.get('isLoading') ? 'Loading...' :
                 webViewerCursor.get('location') ? webViewerCursor.get('location') :
                 'New Tab')
      ]),
      DOM.div({key: 'reload-button',
               className: 'reloadbutton',
               style: theme.reloadButton,
               onClick: event => webViewerCursor.set('readyState', 'reload')}),
      DOM.div({key: 'stop-button',
               className: 'stopbutton',
               style: theme.stopButton,
               onClick: event => webViewerCursor.set('readyState', 'stop')}),
    ]));

  const NavigationPanel = Component('NavigationPanel', ({key, inputCursor, tabStripCursor,
                                     webViewerCursor, suggestionsCursor, title, rfaCursor, theme}) => {
    return DOM.div({
      key,
      style: theme.navigationPanel,
      className: ClassSet({
        navbar: true,
        urledit: inputCursor.get('isFocused'),
        cangoback: webViewerCursor.get('canGoBack'),
        canreload: webViewerCursor.get('location'),
        loading: webViewerCursor.get('isLoading'),
        ssl: webViewerCursor.get('securityState') == 'secure',
        sslv: webViewerCursor.get('securityExtendedValidation')
      })
    }, [
      WindowControls({key: 'controls', theme}),
      NavigationControls({key: 'navigation', inputCursor, tabStripCursor,
                          webViewerCursor, suggestionsCursor, title, theme}),
      ProgressBar({key: 'progressbar', rfaCursor, webViewerCursor, theme}),
      DOM.div({key: 'spacer', className: 'freeendspacer'})
    ])
  });

  // Exports:

  exports.WindowControls = WindowControls;
  exports.NavigationControls = NavigationControls;
  exports.NavigationPanel = NavigationPanel;

});
