/* @flow */

import {html, forward} from 'reflex';
import {on} from 'driver';
import {identity} from '../lang/functional';
import * as Focusable from '../common/focusable';
import * as Editable from '../common/editable';

/*:: import * as type from "../../type/browser/input" */

export const initial/*:type.Model*/ = {
  value: "",
  isFocused: false,
  selection: null
}

export const update/*:type.update*/ = (model, action) =>
  action.type === "Focusable.Blur" ?
    Focusable.update(model, action) :
  action.type === "Focusable.Focus" ?
    Focusable.update(model, action) :
  action.type === "Focusable.FocusRequest" ?
    Focusable.update(model, action) :
  action.type === "Editable.Clear" ?
    Editable.update(model, action) :
  action.type === "Editable.Select" ?
    Editable.update(model, action) :
  action.type === "Editable.Change" ?
    Editable.update(model, action) :
  Editable.update(model, action)

// Read a selection model from an event target.
// @TODO type signature
const readSelection = target => ({
  start: target.selectionStart,
  end: target.selectionEnd,
  direction: target.selectionDirection
});

// Read change action from a dom event.
// @TODO type signature
const readChange = ({target}) =>
  Editable.asChange(target.value, readSelection(target));

// Read select action from a dom event.
// @TODO type signature
const readSelect = ({target}) =>
  Editable.asSelect(readSelection(target));

export const view = (model, address) =>
  html.input({
    key: 'input',
    placeholder: 'Search or enter address',
    type: 'text',
    value: model.value,
    // @TODO figure out how to hook these up.
    // isFocused: focus(input.isFocused),
    // selection: selection(input.selection),
    onInput: on(forward(address, readChange), identity),
    onSelect: on(forward(address, readSelect), identity),
    onFocus: on(forward(address, Focusable.asFocus), identity),
    onBlur: on(forward(address, Focusable.asBlur), identity),
    // @TODO fix this. Do I need the keyboard stuff for this to work?
    // onKeyDown: forward(address, Binding),
  });