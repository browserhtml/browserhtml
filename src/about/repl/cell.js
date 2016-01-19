/* @noflow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {html, thunk, forward, Effects} from 'reflex';
import {merge, batch, tag, tagged} from "../../common/prelude";
import {Style, StyleSheet} from '../../common/style';
import * as Unknown from '../../common/unknown';
import {cursor} from '../../common/cursor';
import * as Input from './input';
import * as Output from './output';

export const Submit = Input.Submit;
export const Remove = tagged("Remove");
export const Print = Output.Print;

export const InputAction =
  action =>
  ( action.type === 'Submit'
  ? action
  : tagged("Input", action)
  );

export const OutputAction = tag("Output");
export const Edit = InputAction(Input.Edit);


export const init =
  id => {
    const [input] = Input.init(0, '', true);
    const [output] = Output.init(0, null);
    const model =
      { id
      , input
      , output
      };

    const fx = Effects.none;

    return [model, fx];
  };

const updateInput = cursor
  ( { get: model => model.input
    , set: (model, input) => merge(model, {input})
    , tag: InputAction
    , update: Input.update
    }
  );

const updateOutput = cursor
  ( { get: model => model.output
    , set: (model, output) => merge(model, {output})
    , tag: OutputAction
    , update: Output.update
    }
  );

const print =
  (model, output) =>
  updateOutput(model, output);


export const update =
  (model, action) =>
  ( action.type === 'Input'
  ? updateInput(model, action.source)
  : action.type === 'Output'
  ? upadateOutput(model, action.source)
  : action.type === 'Print'
  ? print(model, action)
  : Unknown.update(model, aciton)
  );

const styleSheet = StyleSheet.create
  ( { base:
      { padding: '10px'
      , whiteSpace: 'pre'
      , borderLeft: '3px solid'
      , borderColor: '#073642'
      , borderLeftColor: '#073642'
      , borderBottom: '1px dotted #073642'
      }
    , editing:
      { borderLeftColor: '#586e75'
      }
    , modified:
      {
        borderLeftColor: '#b58900'
      }
    }
  );


export const render =
  (model, address) =>
  html.form
  ( { id: `cell-${model.id}`
    , style: Style
      ( styleSheet.base
      , ( model.input.isEditing
        ? styleSheet.editing
        : styleSheet.static
        )
      , ( model.input.version !== model.output.version
        ? styleSheet.modified
        : styleSheet.saved
        )
      )
    , onSubmit:
        event =>
        event.preventDefault()
    }
  , [ Input.view(model.input, forward(address, InputAction))
    , Output.view(model.output, forward(address, OutputAction))
    ]
  );

export const view =
  (model, address) =>
  thunk(model.id, render, model, address);
