/* @noflow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {always, merge, take, move} from "../common/prelude"
import {Effects, batch, nofx, html, thunk} from "reflex"
import * as History from "../common/history"
import * as Search from "../common/search"
import {StyleSheet, Style} from '../common/style';
import {prettify} from '../common/url-helper';

/*:: import * as type from "../../type/browser/assistant" */


export const Open = {type: "Open"};
export const Close = {type: "Close"};
export const Expand = {type: "Expand"};

export const Unselect/*:type.Unselect*/ =
  { type: "Unselect"
  };

export const Reset/*:type.Reset*/ =
  { type: "Reset"
  };

export const SelectRelative/*:type.asSelectRelative*/ =
  offset =>
  ( { type: "SelectRelative"
    , offset
    }
  );

export const Query/*:type.asQuery*/ =
  input =>
  ( { type: "Query"
    , input
    }
  );

const MAX_RESULTS = 5;

// Counts number of available suggestions in the above defined model instance.
export const countAllSuggestions/*:type.countAllSuggestions*/ =
  ({topHit, search, page}) =>
  (topHit != null ? 1 : 0) +
  Math.min(search.length + page.length, MAX_RESULTS);

export const countSuggestions/*:type.countSuggestions*/ = model => {
  const half = Math.floor(MAX_RESULTS / 2);
  const topHit = model.topHit != null ? 1 : 0;
  const search = Math.min(model.search.length,
                          Math.max(MAX_RESULTS - model.page.length, half));
  const page = MAX_RESULTS - search;
  return {topHit, search, page}
}

// Selects suggestion `n` items away relative to currently selected suggestion.
// Selection over suggestion entries is moved in a loop although there is extra
// "no selection" entry between last and first suggestions. Given `n` can be negative
// or positive in order to select suggestion before or after the current one.
export const selectRelative/*:type.selectRelative*/ = (model, offset) => {
  const none = -1;
  const last = countAllSuggestions(model) - 1;
  const to = model.selected + offset;
  const selected = to > last ?
                      none :
                    to < none ?
                      last :
                      to;

  return [merge(model, {selected}), Effects.none];
};


// Returns entries in the form of a list `[topHit, ...search, ...page]` where
// there can be at most one `topHit` and sum of search and page entries are
// at most MAX_RESULTS also entries per type is split by even when possible.
// @TODO we should limit search results to max 3... history can be more.
const getAllSuggestions/*:type.getAllSuggestions*/ = model => {
  const sizes = countSuggestions(model);
  return (model.topHit == null ? [] : [model.topHit])
    .concat(take(model.search, sizes.search))
    .concat(take(model.page, sizes.page));
};

// FIXME: We end up inlining type signatures because flow currently has a bug
// that prevents external polymorphic type declarations from working properly:
// https://github.com/facebook/flow/issues/1046
// const retainSuggestion/*:type.retainSuggestion*/ = (previous, next, retained, size) => {
const retainSuggestion = /*::<x:type.Suggestion>*/(previous/*:Array<x>*/, next/*:Array<x>*/, retained/*:x*/, size/*:number*/)/*:Array<x>*/ => {
  const nextIndex = next.findIndex(x => x.uri === retained.uri);
  // If retained suggestion is not contained in the next suggestions then
  // check if it's previous index is with in the next suggestions. If so
  // insert retained suggestion under previous index to preserve it's
  // position, otherwise add retained suggestion to the end of the next
  // suggestions. Later case implies that number of displayed suggestion for
  // this group has reduced there for displaying retained suggestion as last
  // in the new suggestions makes most sense.
  if (nextIndex < 0) {
    const previousIndex = previous.indexOf(retained);
    const index = Math.min(previousIndex, size - 1);
    return next.splice(index, 0, retained);
  }
  // If retained suggestion is contaned by the next suggestions. Then check
  // if it is with in the displayed range. If it is just return next as is
  // otherwise move retained suggestion to the last visible position in the
  // list.
  else {
    if (nextIndex < size) {
      return next
    } else {
      return move(next, nextIndex, size - 1)
    }
  }
};

// If updated entries no longer have item that was selected we reset
// a selection. Otherwise we update a selection to have it keep the item
// which was selected.
const retainSelected/*:type.retainSelected*/ = (before, after) => {
  // If there was no selected entry there is nothing to retain so
  // return as is.
  if (before.selected < 0) {
    return after
  } else {
    // Grab entry that we wish to retain and act by it's type. We also need
    const retained = getAllSuggestions(before)[before.selected];

    const next =
      retained.type === "History.TopHit" ?
        merge(after, {topHit: retained}) :
      retained.type === "Search.Match" ?
        merge(after, {
          search: retainSuggestion(before.search,
                                    after.search,
                                    (retained:type.SearchMatch),
                                    countSuggestions(after).search)
        }) :
      retained.type === "History.PageMatch" ?
        merge(after, {
          page: retainSuggestion((before.page:Array<type.PageMatch>),
                                  (after.page:Array<type.PageMatch>),
                                  (retained:type.PageMatch),
                                  countSuggestions(after).page)
        }) :
        after

    return merge(next, {
      selected: getAllSuggestions(next).indexOf(retained)
    })
  }
};

export const query/*:type.query*/ = (input, limit) => Effects.batch([
  History.query(input, limit),
  Search.query(input, limit)
]);

export const init/*:type.init*/ =
  () => {
    const query = ""
    const {topHit, topFX} = TopHit.init(query)
    const {page, pageFX} = Page.init(query)
    const {search, searchFX} = Search.init(query)

    const model =
      { query
      , selected: null
      , isOpen: false
      , isExpanded: false

      , topHit
      , page
      , search
      }

    const fx = Effects.batch
      ( [ topFX.map(TopAction)
        , pageFX.map(PageAction)
        , searchFX.map(SearchAction)
        ]
      )

    return [model, fx];
  };

const reset =
  model =>
  init();

const open =
  model =>
  [ merge
    ( model
    , { isOpen: true
      , isExpanded: true
      }
    )
  , Effects.none
  ];

const close =
  model =>
  [ merge
    ( model
    , { isOpen: false
      , isExpanded: false
      }
    )
  , Effects.none
  ];

const expand =
  model =>
  [ merge
    ( model
    , { isOpen: true
      , isExpanded: true
      }
    )
  , Effects.none
  ];

const unselect =
  model =>
  [ merge
    ( model
    , { selected: -1
      }
    )
  , Effects.none
  ];

const query =
  (model, input) =>
  ( model.query === input
  ? [ model
    , Effects.none
    ]
  : [ merge
      ( model
      , { query: input
        }
      )
    , Effects.batch
      ( [ Effects
          .task(History.query(input))
          .map(HistoryResult)
        , Effects
          .task(Search.query(input))
          .map(SearchResult)
        ]
      )
    ]
  );

const updateHistoryResults =
  (model, topHit, page) =>
  [ retainSelected
    ( model
    , merge
      ( model
      , { topHit
        , page
        }
      )
    )
  , Effects.none
  ];

const updateSearchResults =
  (model, search) =>
  [ retainSelected
    ( model
    , merge
      ( model
      , { search
        }
      )
    )
  , Effects.none
  ];


export const update/*:type.update*/ =
  (model, action) =>
  ( action.type === "Open"
  ? open(model)
  : action.type === "Close")
  ? close(model)
  : action.type === "Expand"
  ? expand(model)
  : action.type === "Reset"
  ? reset(model)
  : action.type === "Unselect"
  ? unselect(model)
  : action.type === "SelectRelative"
  ? selectRelative(model, action.offset)
  : action.type === "Query"
  ? query(model, action.input)
  : action.type === "HistoryResult"
  ? updateHistoryResults(model, action.topHit, action.matches)
  : action.type === "SearchResult"
  ? updateSearchResults(model, action.matches)
  : Unknown.update(model, action)
  );

const styleSheet = StyleSheet.create
  ( { assistant:
      { background: '#fff'
      , left: '0px'
      , position: 'absolute'
      , top: '0px'
      , width: '100%'
      }
    , assistantExpanded:
      { height: '100%'
      }
    , assistantOpen:
      {
      },

      assistantClosed:
      { display: 'none'
      }

    , results:
      { listStyle: 'none'
      , margin: '120px auto 0'
      , padding: '0px'
      , width: '460px'
      }
    , resultUrl:
      { color: '#4A90E2'
      , fontSize: '14px'
      }

    , resultUrlSelected:
      { color: 'rgba(255,255,255,0.7)'
      }

    , resultAdjacentToSelected:
      { borderColor: 'transparent'
      }
    }
  );

// Returns an array of vdom nodes. There's only one top hit, but returning
// an array keeps the return value type consistent with the other 2 result view
// functions.
const viewTopHit = (model, index, selected, address) =>
  html.li({
    classname: 'assistant-result assistant-top-hit',
    style: Style(
      style.result,
      index === selected && style.resultSelected
    )
  }, [
    viewTitle(model, index, selected)
  ]);

// Returns an array of vdom nodes
const viewHistory = (model, index, selected, address) =>
  html.li({
    classname: 'assistant-result assistant-history',
    style: Style(
      style.result,
      index === selected && style.resultSelected,
      index === selected - 1 && style.resultAdjacentToSelected
    )
  }, [
    html.div({
      className: 'assistant-icon',
      style: Style(
        style.icon,
        index === selected && style.iconSelected
      )
    }, ['']),
    viewTitle(model, index, selected),
    html.span({
      className: 'assistant-url',
      style: Style(
        style.resultUrl,
        index === selected && style.resultUrlSelected
      )
    }, [` — ${prettify(model.uri)}`])
  ]);


// Renders a result, picking the view function based on the model type.
const viewResult = (model, index, selected, address) =>
  model.type === 'History.TopHit' ?
    viewTopHit(model, index, selected, address) :
  model.type === 'History.PageMatch' ?
    viewHistory(model, index, selected, address) :
  // model.type === 'Search.Match' ?
    viewSearch(model, index, selected, address);

export const view/*:type.view*/ = (model, address) =>
  html.div({
    className: 'assistant',
    style:
      Style
      ( style.assistant
      , ( model.isExpanded
        ? style.assistantExpanded
        : model.isOpen
        ? style.assistantOpen
        : style.assistantClosed
        )
      )
  }, [
    html.ol({
      className: 'assistant-results',
      style: style.results
    }, getAllSuggestions(model).map((entry, index) =>
      thunk(entry.id, viewResult, entry, index, model.selected, address)))
  ]);
