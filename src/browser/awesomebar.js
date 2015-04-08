/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const MAX_RESULTS = 6;

  const {DOM} = require('react')
  const {Record} = require('typed-immutable/record');
  const {List} = require('typed-immutable/list');
  const Component = require('omniscient');
  const ClassSet = require('common/class-set');

  // Suggestion model
  const Suggestion = Record({type: String, href: String, text: String});

  const SearchSuggestion = result => Suggestion({
    type: 'search',
    text: result,
    href: `https://duckduckgo.com/?q=${encodeURIComponent(result)}`
  });

  const HistorySuggestion = result => Suggestion({
    type: 'history',
    text: result,
    href: `http://${result}`
  });

  // Awesomebar state model.
  const Suggestions = Record({
    selected: Number(-1),
    entries: List(Suggestion)
  });

  const Awesomebar = Component(function Awesomebar({suggestions, input, theme},
                                             {onOpen}) {

    const {selected, entries} = suggestions;

    return DOM.div({
      className: ClassSet({
        suggestionscontainer: true,
        isActive: entries.count() > 0 && input.get('isFocused')
      }),
      key: 'suggestionscontainer',
      style: theme.awesomebarSuggestions
    }, [
      DOM.div({
        className: 'suggestions',
        key: 'suggestions',
      }, entries.map((entry, index) => {
        return DOM.p({
          className: `suggestion ${entry.type} ${index == selected ? 'selected':''}`,
          key: 'suggestion' + index,
          onMouseDown: e => onOpen(entry.href)
        }, entry.text);
      }))
    ])
  });


  let xhrSearch;
  let xhrHistory;

  const computeSuggestions = (textInput, submit) => {

    if (xhrSearch) xhrSearch.abort();
    if (xhrHistory) xhrHistory.abort();

    textInput = textInput.trim();

    if (!textInput) {
      submit(resetSuggestions);
      return;
    }

    xhrSearch = new XMLHttpRequest({mozSystem: true});
    xhrSearch.open('GET', `https://ac.duckduckgo.com/ac/?q=${textInput}&type=list`, true);
    xhrSearch.responseType = 'json';
    xhrSearch.send();
    xhrSearch.onload = () =>
      submit(updateSearchSuggestions(xhrSearch.response[1]));

    xhrHistory = new XMLHttpRequest();
    xhrHistory.open('GET', 'src/alexa.json', true);
    xhrHistory.responseType = 'json';
    xhrHistory.send();
    xhrHistory.onload = () => {
      const history = xhrHistory.response.filter(e => e.startsWith(textInput));
      submit(updateHistorySuggestions(history));
    };
  }

  const isntSearch = entry => entry.type !== 'search';
  const isntHistory = entry => entry.type !== 'history';

  const updateSearchSuggestions = search => suggestions =>
    suggestions.update('entries', entries => {
      const other = entries.filter(isntSearch);
      const count = Math.min(search.length, MAX_RESULTS - Math.min(MAX_RESULTS / 2, other.count()));
      return other.slice(0, MAX_RESULT - count).
				  .concat(search.slice(0, count).map(SearchSuggestion));
    });

  const updateHistorySuggestions = history => suggestions =>
    suggestions.update('entries', entries => {
      const other = entries.filter(isntHistory);
      const count = Math.min(history.length, MAX_RESULTS - Math.min(MAX_RESULTS / 2, other.count()));
      return entries.constructor(history.slice(0, count).map(HistorySuggestion))
					.concat(other)
                    .slice(0, MAX_RESULTS);
    });



  const resetSuggestions = suggestions => {
    if (xhrSearch) xhrSearch.abort();
    if (xhrHistory) xhrHistory.abort();
    return suggestions.clear();
  }

  exports.Awesomebar = Awesomebar;
  exports.Suggestions = Suggestions;
  exports.computeSuggestions = computeSuggestions;
  exports.resetSuggestions = resetSuggestions;

});
