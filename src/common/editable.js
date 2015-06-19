/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const {Record, Union} = require('common/typed');
  const {Element, VirtualAttribute} = require('./element');
  const Focusable = require('./focusable');

  // Model

  const Model = Record({
    isFocused: false,
    value: '',
    selectionStart: 0,
    selectionEnd: 0,
    selectionDirection: 'forward'
  });
  exports.Model = Model;

  // Actions

  const Select = Record({
    selectionStart: 0,
    selectionEnd: 0,
    selectionDirection: 'forward'
  }, 'Editable.Select');
  Select.All = () => Select({selectionEnd: Infinity});


  const Change = Record({value: String}, 'Editable.Change');

  const {Focus, Blur} = Focusable;
  const Action = Union({Change, Select});
  exports.Action = Action;

  // Update

  const select = (state, range) => state.merge({
    selectionStart: range.selectionStart,
    selectionEnd: range.selectionEnd,
    selectionDirection: range.selectionDirection
  });
  exports.select = select;

  const selectAll = state => state.merge({
    selectionStart: 0,
    selectionEnd: Infinity,
    selectionDirection: 'forward'
  });
  exports.selectAll = selectAll;

  const update = (state, action) =>
    action instanceof Change ? state.set('value', action.value) :
    action instanceof Select ? select(state, action) :
    Focusable.Action.isTypeOf(action) ? Focusable.update(state, action) :
    action;

  exports.update = update;

  // Field

  const setSelection = field => (node, current, past) => {
    if (current != past) {
      node[field] = current === Infinity ? node.value.length : current;
    }
  };

  const Field = {
    selectionStart: VirtualAttribute(setSelection('selectionStart')),
    selectionEnd: VirtualAttribute(setSelection('selectionEnd')),
    selectionDirection: VirtualAttribute((node, current, past) => {
      if (current !== past) {
        node.selectionDirection = current
      }
    })
  };
  exports.Field = Field;

  // View

  const view = Element('input', {
    isFocused: Focusable.Field.isFocused,
    selectionStart: Field.selectionStart,
    selectionEnd: Field.selectionEnd,
    selectionDirection: Field.selectionDirection
  });
  exports.view = view;
});
