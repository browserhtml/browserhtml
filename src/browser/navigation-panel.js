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
  const {navigateTo, showTabStrip, blur, focus, select} = require('./actions');
  const {KeyBindings} = require('./keyboard');
  const url = require('./util/url');
  const {ProgressBar} = require('./progressbar');
  const ClassSet = require('./util/class-set');
  const {throttle, compose, arity} = require('lang/functional');
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

  // Clears selection in the suggestions
  const unselect = suggestions =>
    suggestions.set('selectedIndex', -1);

  // Moves selecetion from current index with give `delta`.
  const move = delta => suggestions =>
    suggestions.update('selectedIndex', currentIndex => {
      const first = 0;
      const last = suggestions.get('list').count() - 1;
      const index = currentIndex + delta;
      return index > last ? first :
             index < first ? last :
             index;
    });

  // Selects next / previous suggestion.
  const previous = move(-1);
  const next = move(1);

  // Returns currently selected suggestion.
  const selected = suggestions => {
    // When the user starts doing something that is not navigating
    // through the suggestions, if a suggestion was selected, we
    // commit it as a userInput, then the suer can start editing it
    const index = suggestions.get('selectedIndex');
    if (index > -1) {
      try {
        return suggestions.getIn(['list', index, 'text']);
      } catch(e) {
        // This failed once. Wondering how it can happen.
        console.error(e, suggestions.toJSON());
      }
    }
  }

  // Activates current selection (if there is any) by moving it to a
  // webViewer's userInput.
  const activate = (suggestions, webViewer) =>
    webViewer.update('userInput', input => selected(suggestions) || input);

  // Activates next suggestion.
  const activateNext = (suggestionsCursor, webViewerCursor) =>
    activate(next(suggestionsCursor), webViewerCursor);

  // Activates netx suggestion.
  const activatePrevious = (suggestionsCursor, webViewerCursor) =>
    activate(previous(suggestionsCursor), webViewerCursor);

  // Bindings for navigation suggestions.
  const onSuggetionNavigation = KeyBindings({
    'up': activatePrevious,
    'control p': activatePrevious,
    'down': activateNext,
    'control n': activateNext,
    'enter': arity(1, unselect)
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

  const NavigationControls = Component('NavigationControls', ({inputCursor, tabStripCursor,
                                         webViewerCursor, suggestionsCursor, theme}) => {
    return DOM.div({
      className: 'locationbar',
      onMouseEnter: event => showTabStrip(tabStripCursor),
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
        value: webViewerCursor.get('userInput'),
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
        onChange: event => {
          // Reset suggestions & compute new ones from the changed input value.
          unselect(suggestionsCursor);
          computeSuggestions(event.target.value, suggestionsCursor);
          // Also reflect changed value onto webViewers useInput.
          webViewerCursor.set('userInput', event.target.value);
        },
        onSubmit: event => {
          resetSuggestions(suggestionsCursor);
          navigateTo({inputCursor, webViewerCursor}, event.target.value, true);
        },
        onKeyDown: compose(onInputNavigation(inputCursor, webViewerCursor),
                           onSuggetionNavigation(suggestionsCursor, webViewerCursor))
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
