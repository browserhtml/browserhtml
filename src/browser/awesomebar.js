/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const MAX_RESULTS = 6;

  const {DOM} = require('react')
  const {fromJS} = require('immutable');
  const Component = require('omniscient');
  const {Element, Event} = require('./element');

  const Awesomebar = Component('Awesomebar', (
    {suggestionsCursor, theme},
    {onOpen}) => {

    let suggestions = [];

    let search = suggestionsCursor.get('search').toArray();
    let history = suggestionsCursor.get('history').toArray();

    // searchCount + historyCount == 6
    let searchCount = Math.min(search.length,
                               MAX_RESULTS - Math.min(MAX_RESULTS / 2, history.length));
    let historyCount = Math.min(history.length,
                                MAX_RESULTS - Math.min(MAX_RESULTS / 2, search.length));

    for (let i = 0; i < searchCount; i++) {
      let href = search[i].get('href');
      let text = search[i].get('text');
      suggestions.push(DOM.p({
        className: 'suggestion search',
        key: 'suggestionSearch' + i,
        href,
      }, text));
    }

    for (let i = 0; i < historyCount; i++) {
      let href = history[i].get('href');
      let text = history[i].get('text');
      suggestions.push(DOM.p({
        className: 'suggestion history',
        key: 'suggestionHistory' + i,
        href,
      }, text));
    }

    return DOM.div({
      className: 'suggestionscontainer',
      key: 'suggestionscontainer',
      style: {
        backgroundColor: theme.tabstrip.backgroundColor,
        color: theme.titleText.color
      }
    }, [
      DOM.div({
        className: 'suggestions',
        key: 'suggestions',
        onMouseDown: e => onOpen(e.target.getAttribute('href'))
      }, suggestions)
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
      const json = xhrSearch.response;
      suggestionsCursor.set('search', fromJS(
        json[1].slice(0, MAX_RESULTS)
               .map(entry => {
                 return {
                   text: entry,
                   href:`https://duckduckgo.com/?q=${encodeURIComponent(entry)}`
                 }})));
    }

    xhrHistory = new XMLHttpRequest();
    xhrHistory.open('GET', 'src/alexa.json', true);
    xhrHistory.responseType = 'json';
    xhrHistory.send();
    xhrHistory.onload = () => {
      const json = xhrHistory.response;
      suggestionsCursor.set('history', fromJS(
        json.filter(entry => entry.startsWith(textInput))
            .slice(0, MAX_RESULTS)
            .map(entry => {
              return {
                text: entry,
                href: 'http://' + entry
              }
            })));
    }
  }

  const resetSuggestions = (suggestionsCursor) => {
    if (xhrSearch) xhrSearch.abort();
    if (xhrHistory) xhrHistory.abort();
    suggestionsCursor.merge({
      'search': fromJS([]),
      'history': fromJS([]),
    });
  }

  exports.Awesomebar = Awesomebar;
  exports.computeSuggestions = computeSuggestions;
  exports.resetSuggestions = resetSuggestions;

});
