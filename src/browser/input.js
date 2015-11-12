/* @flow */

import {html, forward} from 'reflex';
import {on, focus, selection} from 'driver';
import {identity} from '../lang/functional';
import * as Focusable from '../common/focusable';
import * as Editable from '../common/editable';
import {KeyBindings} from '../common/keyboard';

/*:: import * as type from "../../type/browser/input" */

export const initial/*:type.Model*/ = {
  value: "",
  isFocused: false,
  selection: null
}

export const update/*:type.update*/ = (model, action) =>
  action.type === 'Keyboard.Command' && action.action.type === 'Focusable.Blur' ?
    Focusable.update(model, action.action) :
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
  model;

const Binding = KeyBindings({
  // 'up': _ => Suggestions.SelectPrevious(),
  // 'control p': _ => Suggestions.SelectPrevious(),
  // 'down': _ => Suggestions.SelectNext(),
  // 'control n': _ => Suggestions.SelectNext(),
  // 'enter': event => Input.Action({
  //   action: Input.Submit({value: event.target.value})
  // }),
  'escape': Focusable.asBlur,
});

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
    isFocused: focus(model.isFocused),
    // selection: selection(model.selection),
    onInput: on(forward(address, readChange), identity),
    onSelect: on(forward(address, readSelect), identity),
    onFocus: on(forward(address, Focusable.asFocus), identity),
    onBlur: on(forward(address, Focusable.asBlur), identity),
    onKeyDown: on(forward(address, Binding), identity),
  });