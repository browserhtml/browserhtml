/* @noflow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {html, thunk, forward, Effects} from 'reflex';
import {merge, always, batch, tag, tagged} from "../../common/prelude";
import {Style, StyleSheet} from '../../common/style';
import * as Settings from '../../common/settings';
import * as Unknown from '../../common/unknown';
import {focus} from "driver";

export const Change = tag("Change");
export const Submit = tag("Submit");

const Enter = tagged("Enter");
export const Edit = tagged("Edit");
const Abort = tagged("Abort");



export const init = (version, value, isEditing) =>
  [ { value
    , isEditing
    , version
    }
  , Effects.none
  ]

const edit =
  model =>
  [ merge
    ( model
    , { isEditing: true
      }
    )
  , Effects.none
  ];

const change = (model, value) =>
  ( model.value !== value
  ? [ merge
      ( model
      , { value
        , version: model.version + 1
        }
      )
    , Effects.none
    ]
  : [ model, Effects.none ]
  );

const abort = (model, value) =>
  [ merge
    ( model
    , { isEditing: false }
    )
  , Effects.none
  ];

const enter =
  model =>
  [ merge
    ( model
    , { isEditing: false }
    )
  , Effects.receive(Submit(model))
  ]

const decodeChange =
  event =>
  Change(event.target.value);

export const update =
  (model, action) =>
  ( action.type === "Change"
  ? change(model, action.source)
  : action.type === "Edit"
  ? edit(model)
  : action.type === "Abort"
  ? abort(model)
  : action.type === "Enter"
  ? enter(model)
  : Unknown.update(model, action)
  );

const styleSheet = StyleSheet.create
  ( { base:
      { cursor: 'text'
      }
    , entry:
      { fontSize: 'inherit'
      , fontFamily: 'inherit'
      , color: 'inherit'
      , background: 'inherit'
      , border: 'none'
      , display: 'block'
      , lineHeight: 'inherit'
      , width: '100%'
      , resize: 'none'
      , padding: '0px'
      , margin: '0px'
      }
    , display:
      { fontSize: 'inherit'
      , fontFamily: 'inherit'
      , color: 'inherit'
      , background: 'inherit'
      , border: 'none'
      , display: 'block'
      , lineHeight: 'inherit'
      , paddingBottom: '6px'
      }
    , visible:
      {

      }
    , hidden:
      { display: 'none'
      }
    }
  );


const render =
  (model, address) =>
  html.section
  ( { className: 'input'
    , style: styleSheet.base
    , onKeyDown: event =>
      ( event.key === 'Escape'
      ? address(Abort)
      : ( event.key === 'Enter' &&
          event.metaKey
        )
      ? address(Enter)
      : null
      )
    }
  , [ html.textarea
      ( { className: 'entry'
        , style: Style
          ( styleSheet.entry
          , ( model.isEditing
            ? styleSheet.visible
            : styleSheet.hidden
            )
          )
        , rows: model.value.split(/\n/).length + 1
        , focus: focus(model.isEditing)
        , onBlur: forward(address, always(Abort))
        , onKeyUp: forward(address, decodeChange)
        , value: model.value
        }
      )
    , html.output
      ( { className: 'display'
        , style: Style
          ( styleSheet.display
          , ( model.isEditing
            ? styleSheet.hidden
            : styleSheet.visible
            )
          )
        , onClick: forward(address, always(Edit))
        }
      , [model.value]
      )
    ]
  );

export const view =
  (model, address) =>
  thunk('input', render, model, address);
