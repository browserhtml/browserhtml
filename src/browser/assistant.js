/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {always, batch, merge, take, tag, tagged, move} from "../common/prelude"
import {Effects, html, thunk, forward} from "reflex"
import * as History from "./assistant/history"
import * as Search from "./assistant/search"
import {StyleSheet, Style} from '../common/style';
import {cursor} from '../common/cursor';
import {prettify} from '../common/url-helper';
import * as Unknown from '../common/unknown';

/*:: import * as type from "../../type/browser/assistant" */


export const Open = tagged("Open");
export const Close = tagged("Close");
export const Expand = tagged("Expand");
export const Unselect = tagged("Unselect");
export const Reset = tagged("Reset");
export const SelectNext = tagged("SelectNext");
export const SelectPrevious = tagged("SelectPrevious");
export const Query = tag("Query");

const SearchAction = tag("Search");
const HistoryAction = tag("History");

export const init =
  () => {
    const query = null
    const [search, fx1] = Search.init(query, 5);
    const [history, fx2] = History.init(query, 5);
    const model =
      { query
      , isOpen: false
      , isExpanded: false
      , search
      , history
      , selected: -1
      }

    const fx = Effects.batch
    ( [ fx1.map(SearchAction)
      , fx2.map(HistoryAction)
      ]
    )

    return [model, fx]
  }


const reset =
  model =>
  init();

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

const open =
  model =>
  [ merge
    ( model
    , { isOpen: true
      , isExpanded: false
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

const unselect =
  model =>
  [ merge
    ( model
    , { selected: -1
      }
    )
  , Effects.none
  ];

const query = (model, query) =>
  ( model.query === query
  ? [ model
    , Effects.none
    ]
  : batch
    ( update
    , merge(model, {query})
    , [ SearchAction(Search.Query(query))
      , HistoryAction(History.Query(query))
      ]
    )
  )

const updateSearch =
  cursor
  ( { get: model => model.search
    , set: (model, search) => merge(model, {search})
    , update: Search.update
    , tag: SearchAction
    }
  );

const updateHistory =
  cursor
  ( { get: model => model.history
    , set: (model, history) => merge(model, {history})
    , update: History.update
    , tag: HistoryAction
    }
  );

// TODO: This actually should work across the suggestion
// groups.
const selectNext =
  model =>
  updateSearch(model, Search.SelectNext);

const selectPrevious =
  model =>
  updateSearch(model, Search.SelectPrevious);

export const update/*:type.update*/ =
  (model, action) =>
  ( action.type === "Open"
  ? open(model)
  : action.type === "Close"
  ? close(model)
  : action.type === "Expand"
  ? expand(model)
  : action.type === "Reset"
  ? reset(model)
  : action.type === "Unselect"
  ? unselect(model)
  : action.type === "SelectNext"
  ? selectNext(model)
  : action.type === "SelectPrevious"
  ? selectPrevious(model)
  : action.type === "Query"
  ? query(model, action.source)
  : action.type === "History"
  ? updateHistory(model, action.source)
  : action.type === "Search"
  ? updateSearch(model, action.source)
  : Unknown.update(model, action)
  );

const styleSheet = StyleSheet.create
  ( { base:
      { background: '#fff'
      , left: '0px'
      , position: 'absolute'
      , top: '0px'
      , width: '100%'
      }
    , expanded:
      { height: '100%'
      }
    , shrinked:
      {}

    , open:
      {
      },

      closed:
      { display: 'none'
      }

    , results:
      { listStyle: 'none'
      , margin: '120px auto 0'
      , padding: '0px'
      , width: '460px'
      }
    }
  );

export const view/*:type.view*/ = (model, address) =>
  html.div
  ( { className: 'assistant'
    , style: Style
      ( styleSheet.base
      , ( model.isExpanded
        ? styleSheet.expanded
        : styleSheet.shrinked
        )
      , ( model.isOpen
        ? styleSheet.open
        : styleSheet.closed
        )
      )
    }
  , [ html.ol
      ( { className: 'assistant-results'
        , style: styleSheet.results
        }
      , [ History.view
          ( model.history
          , forward(address, HistoryAction)
          )
        , Search.view
          ( model.search
          , forward(address, SearchAction)
          )
        ]
      )
    ]
  );
