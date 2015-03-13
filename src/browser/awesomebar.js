/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const MAX_RESULTS = 6;

  const {DOM} = require('react')
  const {fromJS} = require('immutable');
  const Component = require('omniscient');
  const {Element} = require('./element');
  const ClassSet = require('./util/class-set');

  const Awesomebar = Component('Awesomebar', (
    {suggestionsCursor, inputCursor, theme},
    {onOpen}) => {

    const selectedIndex = suggestionsCursor.get('selectedIndex');
    const list = suggestionsCursor.get('list').toJSON();

    return DOM.div({
      className: ClassSet({
        suggestionscontainer: true,
        isActive: list.length > 0 && inputCursor.get('isFocused')
      }),
      key: 'suggestionscontainer',
      style: {
        backgroundColor: theme.tabstrip.backgroundColor,
        color: theme.titleText.color
      }
    }, [
      DOM.div({
        className: 'suggestions',
        key: 'suggestions',
      }, list.map((entry, index) => {
        return DOM.p({
          className: `suggestion ${entry.type} ${index == selectedIndex ? 'selected':''}`,
          key: 'suggestion' + index,
          onMouseDown: e => onOpen(entry.href),
          onMouseEnter: e => suggestionsCursor.set('selectedIndex', index)
        }, entry.text);
      }))
    ])
  });


  let xhrSearch;
  let xhrHistory;

  const computeSuggestions = (textInput, suggestionsCursor) => {

    if (xhrSearch) xhrSearch.abort();
    if (xhrHistory) xhrHistory.abort();

    textInput = textInput.trim();

    if (!textInput) {
      resetSuggestions(suggestionsCursor);
      return;
    }

    xhrSearch = new XMLHttpRequest({mozSystem: true});
    xhrSearch.open('GET', `https://ac.duckduckgo.com/ac/?q=${textInput}&type=list`, true);
    xhrSearch.responseType = 'json';
    xhrSearch.send();
    xhrSearch.onload = () => {
      const search = xhrSearch.response[1];
      const other = suggestionsCursor.get('list').filter(e => e.get('type') != 'search').toJSON();
      const searchCount = Math.min(search.length, MAX_RESULTS - Math.min(MAX_RESULTS / 2, other.length));
      suggestionsCursor = suggestionsCursor.set('list', fromJS([
      ...other,
      ...search.slice(0, searchCount)
            .map(e => { return {
              text: e,
              href: `https://duckduckgo.com/?q=${encodeURIComponent(e)}`,
              type: 'search'
            }})
      ].slice(-MAX_RESULTS)));
    }

    xhrHistory = new XMLHttpRequest();
    xhrHistory.open('GET', 'src/alexa.json', true);
    xhrHistory.responseType = 'json';
    xhrHistory.send();
    xhrHistory.onload = () => {
      const history = xhrHistory.response.filter(e => e.startsWith(textInput));
      const other = suggestionsCursor.get('list').filter(e => e.get('type') != 'history').toJSON();
      const historyCount = Math.min(history.length, MAX_RESULTS - Math.min(MAX_RESULTS / 2, other.length));
      suggestionsCursor = suggestionsCursor.set('list', fromJS([
      ...history.slice(0, historyCount)
            .map(e => { return {
              text: e,
              href: 'http://' + e,
              type: 'history'
            }}),
      ...other
      ].slice(0, MAX_RESULTS)));

    }
  }

  const resetSuggestions = (suggestionsCursor) => {
    if (xhrSearch) xhrSearch.abort();
    if (xhrHistory) xhrHistory.abort();
    suggestionsCursor.merge({
      'selectedIndex': -1,
      'list': fromJS([]),
    });
  }

  exports.Awesomebar = Awesomebar;
  exports.computeSuggestions = computeSuggestions;
  exports.resetSuggestions = resetSuggestions;

});
