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

export const Print = tag("Print");

export const init =
  (version, result) =>
  [ { version
    , result
    }
  , Effects.none
  ];

const print = (model, output) =>
  [ merge
    ( model
    , { version: output.version
      , result: output.result
      }
    )
  , Effects.none
  ];

export const update =
  (model, action) =>
  ( action.type === 'Print'
  ? print(model, action.source)
  : Unknown.update(model, action)
  );

const styleSheet = StyleSheet.create
  ( { base:
      { fontSize: 'inherit'
      , fontFamily: 'inherit'
      , color: 'inherit'
      , background: 'inherit'
      , border: 'none'
      , display: 'block'
      , lineHeight: 'inherit'
      , paddingTop: '8px'
      }
    , ok:
      {
      }
    , error:
      {
      }
    , empty:
      {
      }
    }
  );

const display =
  value =>
  ( value == null
  ? String(value)
  : value.$type === "VirtualText"
  ? value
  : value.$type === "VirtualNode"
  ? value
  : value.$type === "Thunk"
  ? value
  : value.$type === "LazyTree"
  ? value
  : value.toString()
  );


const render =
  (model, address) =>
  html.output
  ( { className: 'output'
    , style: Style
      ( styleSheet.base
      , ( model.result == null
        ? model.empty
        : model.result.isOk
        ? styleSheet.ok
        : styleSheet.error
        )
      )
    }
  , [ ( model.result == null
      ? ''
      : model.result.isError
      ? display(model.result.error)
      : display(model.result.value)
      )
    ]
  );

export const view =
  (model, address) =>
  thunk('output', render, model, address);
