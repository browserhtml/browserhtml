/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const MAX_RESULTS = 6;

  const {DOM} = require('react')
  const {Record, List} = require('typed-immutable/index');
  const Component = require('omniscient');
  const {mix} = require('common/style');
  const {History} = require('./history');
  const {spawn} = require('lang/task');

  // CSS

  const styleSuggestionsContainer = {
    textAlign: 'center',
    width: '100vw',
    position: 'absolute',
    top: 50,
    zIndex: 43,
    height: 260,
    transition: 'background-color 200ms ease, opacity 200ms ease'
  };

  const styleSuggestionsContainerNotActive = {
    pointerEvents: 'none',
    opacity: 0
  };

  const styleSuggestions = {
    display: 'inline-block',
    textAlign: 'left',
    width: 460
  };

  const styleSuggestionFirstOfType = {
    borderTop: 0
  };

  const styleSuggestion = {
    lineHeight: '40px',
    verticalAlign: 'middle',
    borderTop: '1px solid rgba(0,0,0,0.05)',
    cursor: 'pointer'
  };

  const styleSuggestionSelected = {
    backgroundClip: 'content-box',
    backgroundColor: 'rgba(0,0,0,0.05)'
  };

  const styleDarkSuggestion = {
    borderTopColor: 'rgba(255,255,255,0.15)'
  };

  const styleDarkSuggestionSelected = {
    backgroundColor: 'rgba(255,255,255,0.15)'
  };

  const styleSuggestionPrefix = {
    display: 'inline-block',
    fontSize: '16px',
    fontFamily: 'FontAwesome',
    width: 30,
    textAlign: 'center'
  };

  // Model

  const Suggestion = Record({type: String, href: String, text: String});
  const Entries = List(Suggestion);

  const SearchSuggestion = result => Suggestion({
    type: 'search',
    text: result,
    href: `https://duckduckgo.com/?q=${encodeURIComponent(result)}`
  });

  const HistorySuggestion = site => Suggestion({
    type: 'history',
    text: site.title,
    href: site.uri
  });

  // Awesomebar state model.
  const Suggestions = Record({
    selected: Number(-1),
    entries: Entries
  });


  // Actions

  Suggestions.unselect = suggestions =>
    suggestions.remove('selected')

  // Selects suggestion `n` items away relative to currently seleceted suggestion.
  // Selection over suggestion entries is moved in a loop although there is extra
  // "no selection" entry between last and first suggestions. Given `n` can be negative
  // or positive in order to select suggestion before or after the current one.
  Suggestions.selectRelative = n => suggestions =>
    suggestions.update('selected', from => {
      const first = 0;
      const last = suggestions.entries.count() - 1;
      const to = from + n;

      return to > last ? void(0) :
             to < first ? void(0) :
             to;
    });

  Suggestions.selectPrevious = Suggestions.selectRelative(-1);
  Suggestions.selectNext = Suggestions.selectRelative(1);

  // Returns currently selected suggestion or void if there's none.
  Suggestions.selected = suggestions => {
    const index = suggestions.selected;
    return index >= 0 ? suggestions.entries.get(index).href : void(0);
  };

  const isntSearch = entry => entry.type !== 'search';
  Suggestions.changeSearchSuggestions = (results=[]) => suggestions =>
    suggestions.update('entries', entries => {
      const history = entries.filter(isntSearch);
      const count = Math.min(results.length, MAX_RESULTS - Math.min(MAX_RESULTS / 2, history.count()));
      return history.take(MAX_RESULTS - count)
                    .concat(results.slice(0, count).map(SearchSuggestion));
    });

  const isntHistory = entry => entry.type !== 'history';
  Suggestions.changeHistorySuggestions = results => suggestions => {
    return suggestions.update('entries', entries => {
      const search = entries.filter(isntHistory);
      const count = Math.min(results.length, MAX_RESULTS - Math.min(MAX_RESULTS / 2, search.count()));
      const history = results.slice(0, count).map(HistorySuggestion);
      return search.unshift(...history).take(MAX_RESULTS)
    });
  };

  // View

  Suggestions.render = Component(function SuggestionBar(state, {onOpen}) {
    const {suggestions: {selected, entries}, isLocationBarActive, theme} = state;

    const style = (entries.count() > 0 && isLocationBarActive) ?
      mix(styleSuggestionsContainer,
          theme.awesomebarSuggestions) :
      mix(styleSuggestionsContainer,
          styleSuggestionsContainerNotActive,
          theme.awesomebarSuggestions);

    return DOM.div({
      style: style,
      key: 'suggestionscontainer',
    }, [
      DOM.div({
        key: 'suggestions',
        style: styleSuggestions
      }, entries.map((entry, index) => {

        let style = styleSuggestion;
        if (index == 0)
          style = mix(style, styleSuggestionFirstOfType);
        if (index == selected)
          style = mix(style, styleSuggestionSelected);
        if (theme.isDark)
          style = mix(style, styleDarkSuggestion);
        if (theme.isDark && index == selected)
          style = mix(style, styleDarkSuggestionSelected);

        return DOM.p({
          className: `suggestion ${entry.type} ${index == selected ? 'selected' : ''}`,
          key: 'suggestion' + index,
          onMouseDown: e => onOpen(entry.href),
          style
        }, [
          DOM.span({
            key: 'suggestionprefix',
            style: styleSuggestionPrefix,
          }, entry.type == 'search' ? '\uf002' :
             entry.type == 'history' ? '\uf14e' : ''),
          entry.text
        ]);
      }))
    ])
  });

  // IO.

  let xhrSearch;


  Suggestions.reset = suggestions => {
    if (xhrSearch) xhrSearch.abort();
    return suggestions.clear();
  }

  const dbHistory = new History().stores.sites

  // Calculates the score for use in suggestions from
  // a result array `match` of `RegExp#exec`.
  const score = (pattern, input='', base=0.3, length=0.25) => {
      const index = 1 - base - length
      const text = String(input);
      const count = text.length;
      const match = pattern.exec(text);

      return !match ? 0 :
              base +
              length * Math.sqrt(match[0].length / count) +
              index * (1 - match.index / count);
  }

  const Pattern = (input, flags="i") => {
    try {
      return RegExp(input, flags)
    } catch (error) {
      if (error instanceof SyntaxError) {
        return RegExp(pattern.escape(input), flags)
      }
      throw error
    }
  }
  Pattern.escape = input => input.replace(/[\.\?\*\+\^\$\|\(\)\{\[\]\\]/g, '\\$&')

  const historyService = input => spawn(function*() {
    const {rows} = yield dbHistory.allDocs({include_docs: true});
    const query = Pattern(input)
    return rows.map(row => row.doc)
               .filter(row => row.type === 'Site' && row.title)
               .map(site => {
                  // TODO: Also include `site.visis` into a scoring.
                  site.score = score(query, site.title) +
                               score(query, site.uri, 0.3, 0.5)
                  return site
                })
               .filter(site => site.score > 0)
               .sort((a, b) =>
                  a.score > b.score ? -1 :
                  a.score < b.score ? 1 :
                  0)
               .slice(0, MAX_RESULTS);
  });

  Suggestions.compute = (textInput, submit) => {
    if (xhrSearch) xhrSearch.abort();

    textInput = textInput.trim();

    if (!textInput) {
      return submit(Suggestions.reset);
    }

    xhrSearch = new XMLHttpRequest({mozSystem: true});
    xhrSearch.open('GET', `https://ac.duckduckgo.com/ac/?q=${textInput}&type=list`, true);
    xhrSearch.responseType = 'json';
    xhrSearch.send();
    xhrSearch.onload = () =>
      submit(Suggestions.changeSearchSuggestions(xhrSearch.response[1]));

    historyService(textInput)
      .then(sites => submit(Suggestions.changeHistorySuggestions(sites)));
  }

  exports.Suggestions = Suggestions;

});
