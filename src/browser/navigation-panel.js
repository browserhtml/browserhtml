/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const platform = require('os').platform();
  const {DOM} = require('react')
  const Component = require('omniscient');
  const {InputField} = require('./editable');
  const {Element} = require('./element');
  const {navigateTo, showTabStrip, blur, focus} = require('./actions');
  const {KeyBindings} = require('./keyboard');
  const url = require('./util/url');
  const {ProgressBar} = require('./progressbar');
  const ClassSet = require('./util/class-set');
  const {throttle} = require('lang/functional');
  let {computeSuggestions, resetSuggestions} = require('./awesomebar');

  computeSuggestions = throttle(computeSuggestions, 200);

  const sendEventToChrome = type => dispatchEvent(new CustomEvent('mozContentEvent',
    { bubbles: true, cancelable: false, detail: { type }}))

  const WindowControls = Component('WindowControls', ({theme}) =>
    DOM.div({className: 'windowctrls'}, [
      DOM.div({className: 'windowctrl win-close-button',
               style: theme.windowCloseButton,
               title: 'close',
               key: 'close',
               onClick: event => sendEventToChrome('shutdown-application')
      }),
      DOM.div({className: 'windowctrl win-min-button',
               style: theme.windowMinButton,
               title: 'minimize',
               key: 'minimize',
               onClick: event => sendEventToChrome('minimize-native-window')
      }),
      DOM.div({className: 'windowctrl win-max-button',
               style: theme.windowMaxButton,
               title: 'maximize',
               key: 'maximize',
               onClick: event => sendEventToChrome('toggle-fullscreen-native-window')
      })
    ]));

  const updateSuggestionsSelection = (delta, suggestionsCursor, webViewerCursor) => {
    const size = suggestionsCursor.get('list').size;
    let value = suggestionsCursor.get('selectedIndex') + delta;
    if (value >= size) {
      value = -1;
    }
    value = Math.max(-1, value);
    suggestionsCursor.set('selectedIndex', value);
  }

  const onInputKeyDown = ({event, inputCursor, webViewerCursor, suggestionsCursor}) => {

    switch (event.key) {
      case 'Escape':
        // webViewer might have nothing to focus. So let's blur the input just in case.
        focus(webViewerCursor);
        blur(inputCursor);
        event.preventDefault();
        break;
      case 'ArrowUp':
        updateSuggestionsSelection(-1, suggestionsCursor, webViewerCursor),
        event.preventDefault();
        break;
      case 'ArrowDown':
        updateSuggestionsSelection(+1, suggestionsCursor, webViewerCursor),
        event.preventDefault();
        break;
      case 'Enter':
        resetSuggestions(suggestionsCursor);
        navigateTo({inputCursor, webViewerCursor}, event.target.value, true)
        break;
      case 'l':
        let accel = platform == 'darwin' ? 'metaKey' : 'ctrlKey';
        if (event[accel]) {
          event.target.select();
          break;
        }
      default:
        // When the user starts doing something that is not navigating
        // through the suggestions, if a suggestion was selected, we
        // commit it as a userInput, then the suer can start editing it
        let suggestionSelectedIndex = suggestionsCursor.get('selectedIndex');
        if (suggestionSelectedIndex > -1) {
          webViewerCursor.set('userInput', suggestionsCursor.get('list')
                                                            .get(suggestionSelectedIndex)
                                                            .get('text'));
        }
        suggestionsCursor.set('selectedIndex', -1);
    }
  };


  const NavigationControls = Component('NavigationControls', ({inputCursor, tabStripCursor,
                                         webViewerCursor, suggestionsCursor, theme}) => {

    let inputValue = webViewerCursor.get('userInput');

    let suggestionSelectedIndex = suggestionsCursor.get('selectedIndex');
    if (suggestionSelectedIndex > -1) {
      try {
        inputValue = suggestionsCursor.get('list')
                                      .get(suggestionSelectedIndex)
                                      .get('text');
      } catch(e) {
        // This failed once. Wondering how it can happen.
        console.error(e, suggestionsCursor.toJSON());
      }
    }

    return DOM.div({
      className: 'locationbar',
      onMouseEnter: event => showTabStrip(tabStripCursor)
    }, [
      DOM.div({className: 'backbutton',
               style: theme.backButton,
               key: 'back',
               onClick: event => webViewerCursor.set('readyState', 'goBack')}),
      InputField({
        key: 'input',
        className: 'urlinput',
        style: theme.urlInput,
        placeholder: 'Search or enter address',
        value: inputValue,
        type: 'text',
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
        onKeyDown: event => onInputKeyDown({
          event,
          inputCursor,
          webViewerCursor,
          suggestionsCursor
        })
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
    ])});

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
