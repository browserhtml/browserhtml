/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const platform = require('os').platform();
  const {DOM} = require('react')
  const Component = require('omniscient');
  const {InputField, select} = require('./editable');
  const {Element} = require('./element');
  const {activate, blur, focus, sendEventToChrome} = require('./actions');
  const {KeyBindings} = require('./keyboard');
  const url = require('./util/url');
  const {ProgressBar} = require('./progressbar');
  const ClassSet = require('./util/class-set');
  const {throttle, compose, arity, curry} = require('lang/functional');
  let {computeSuggestions, resetSuggestions} = require('./awesomebar');

  computeSuggestions = throttle(computeSuggestions, 200);

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

  // Clears selection in the suggestions
  const unselect = suggestions =>
    suggestions.set('selectedIndex', -1);

  // Selects suggestion `n` items away relative to currently seleceted suggestion.
  // Selection over suggestion entries is moved in a loop although there is extra
  // "no selection" entry between last and first suggestions. Given `n` can be negative
  // or positive in order to select suggestion before or after the current one.
  const selectRelative = curry((n, suggestions) =>
    suggestions.update('selectedIndex', from => {
      const first = 0;
      const last = suggestions.get('list').count() - 1;
      const to = from + n;

      return to > last ? -1 :
             to < first ? -1 :
             to;
    }));

  // Selects next / previous suggestion.
  const selectPrevious = selectRelative(-1);
  const selectNext = selectRelative(1);

  // Returns currently selected suggestion or void if there's none.
  const selected = suggestions => {
    const index = suggestions.get('selectedIndex');
    return index >= 0 ? suggestions.getIn(['list', index, 'text']) : void(0);
  }

  // Bindings for navigation suggestions.
  const onSuggetionNavigation = KeyBindings({
    'up': selectPrevious,
    'control p': selectPrevious,
    'down': selectNext,
    'control n': selectNext,
    'enter': unselect
  });

  // General input keybindings.
  const onInputNavigation = KeyBindings({
    'escape': (inputCursor, webViewerCursor) => {
      focus(webViewerCursor);
      // TODO: This should not be necessary but since in case of dashboard focus
      // is passed to a hidden iframe DOM ignores that and we end up with focus
      // still in `inputCursor`. As a workaround for now we manually `blur` input.
      blur(inputCursor);
    },
    'accel l': arity(1, select)
  });

  const NavigationControls = Component('NavigationControls', ({inputCursor, tabStrip,
                                         webViewerCursor, suggestionsCursor, theme},
                                       {onNavigate, editTabStrip}) => {
    return DOM.div({
      className: 'locationbar',
      style: theme.locationBar,
      onMouseEnter: event => editTabStrip(activate)
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
        value: selected(suggestionsCursor) ||
               webViewerCursor.get('userInput'),
        type: 'text',
        submitKey: 'Enter',
        isFocused: inputCursor.get('isFocused'),
        selection: inputCursor.get('selection'),
        onFocus: event => {
          computeSuggestions(event.target.value, suggestionsCursor);
          inputCursor.set('isFocused', true);
        },
        onBlur: event => {
          resetSuggestions(suggestionsCursor);
          inputCursor.set('isFocused', false);
        },
        onSelect: event => {
          inputCursor.set('selection', {
            start: event.target.selectionStart,
            end: event.target.selectionEnd,
            direction: event.target.selectionDirection
          });
        },
        onChange: event => {
          // Reset suggestions & compute new ones from the changed input value.
          unselect(suggestionsCursor);
          computeSuggestions(event.target.value, suggestionsCursor);
          // Also reflect changed value onto webViewers useInput.
          webViewerCursor.set('userInput', event.target.value);
        },
        onSubmit: event => {
          resetSuggestions(suggestionsCursor);
          onNavigate(event.target.value);
        },
        onKeyDown: compose(onInputNavigation(inputCursor, webViewerCursor),
                           onSuggetionNavigation(suggestionsCursor))
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

  const NavigationPanel = Component('NavigationPanel', ({key, inputCursor, tabStrip,
                                     webViewerCursor, suggestionsCursor, title, rfaCursor, theme},
                                     handlers) => {
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
      NavigationControls({key: 'navigation', inputCursor, tabStrip,
                          webViewerCursor, suggestionsCursor, title, theme},
                          handlers),
      ProgressBar({key: 'progressbar', rfaCursor, webViewerCursor, theme}),
      DOM.div({key: 'spacer', className: 'freeendspacer'})
    ])
  });

  // Exports:

  exports.WindowControls = WindowControls;
  exports.NavigationControls = NavigationControls;
  exports.NavigationPanel = NavigationPanel;

});
