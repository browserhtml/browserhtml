/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {html, forward, Effects} from 'reflex';
import {Style, StyleSheet} from '../common/style';
import {compose} from '../lang/functional';
import {tag, tagged, merge, always} from '../common/prelude';
import {cursor} from "../common/cursor"
import * as Unknown from '../common/unknown';
import * as Focusable from '../common/focusable';
import * as Editable from '../common/editable';
import * as Control from '../common/control';

// @FlowIssue: Ignore for now.
import {on, focus, selection} from 'driver';

/*::
import * as type from '../../type/common/text-input'
*/



const EditableAction = tag("Editable");
const FocusableAction = action =>
  ( action.type === "Focus"
  ? Focus
  : action.type === "Blur"
  ? Blur
  : tagged("Focusable", action)
  );
const ControlAction = tag("Control");

export const Change = Editable.Change;
export const Focus = tagged("Focus", Focusable.Focus);
export const Blur = tagged("Blur", Focusable.Blur);
export const Enable = ControlAction(Control.Enable);
export const Disable = ControlAction(Control.Disable);


export const init/*:type.init*/ =
  (value='', selection=null, placeholder='', isDisabled=false) =>
  [ { value
    , placeholder
    , selection
    , isDisabled
    , isFocused: false
    }
  , Effects.none
  ];

const enable =
  model =>
  [ merge(model, {isDisabled: false})
  , Effects.none
  ];

const disable =
  model =>
  [ merge(model, {isDisabled: true})
  , Effects.none
  ];

const updateEditable = cursor
  ( { tag: EditableAction
    , update: Editable.update
    }
  );

const updateFocusable = cursor
  ( { tag: FocusableAction
    , update: Focusable.update
    }
  );

const updateControl = cursor
  ( { tag: ControlAction
    , update: Control.update
    }
  );

export const update/*:type.update*/ =
  (model, action) =>
  ( action.type === 'Change'
  ? updateEditable(model, action)
  : action.type === 'Editable'
  ? updateEditable(model, action.source)
  : action.type === 'Focusable'
  ? updateFocusable(model, action.source)
  : action.type === 'Focus'
  ? updateFocusable(model, action.source)
  : action.type === 'Blur'
  ? updateFocusable(model, action.source)
  : action.type === 'Control'
  ? updateControl(model, action.source)
  : Unknown.update(model, action)
  );

const decodeSelection =
  ({target}) =>
  ( { start: target.selectionStart
    , end: target.selectionEnd
    , direction: target.selectionDirection
    }
  );

const decodeSelect =
  compose(EditableAction, Editable.Select, decodeSelection);

const decodeChange = compose
  ( EditableAction
  , event =>
    Change(event.target.value, decodeSelection(event))
  );


export const view/*:type.view*/ =
  (key, styleSheet) =>
  (model, address, contextStyle) =>
  html.input
  ( { key
    , type: 'input'
    , placeholder: model.placeholder
    , value: model.value
    , disabled:
      ( model.isDisabled
      ? true
      : void(0)
      )
    , isFocused: focus(model.isFocused)
    , selection: selection(model.selection)
    , onInput: on(address, decodeChange)
    , onKeyUp: on(address, decodeSelect)
    , onSelect: on(address, decodeSelect)
    , onFocus: forward(address, always(Focus))
    , onBlur: forward(address, always(Blur))
    , style: Style
      ( styleSheet.base
      , ( model.isDisabled
        ? styleSheet.disabled
        : styleSheet.enabled
        )
      , contextStyle
      )
    }
  )
