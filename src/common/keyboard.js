/* @flow */

/* this source code form is subject to the terms of the mozilla public
 * license, v. 2.0. if a copy of the mpl was not distributed with this
 * file, you can obtain one at http://mozilla.org/mpl/2.0/. */

/*:: import * as type from "../../type/common/keyboard" */

import * as OS from './os';

const platform = OS.platform();

export const Key/*:type.Key*/ = {type: 'Keyboard.Key'};

export const asKey/*:type.asKey*/ = () => Key;

export const asCommand/*:type.asCommand*/ = (action, chord, key, metaKey, shiftKey, altKey, ctrlKey) => ({
  type: 'Keyboard.Command',
  action,
  chord, key, metaKey, shiftKey, altKey, ctrlKey
});

export const readModifiers = ({type, metaKey, shiftKey, altKey, ctrlKey}) => {
  const modifiers = [];
  // Modifier fields indicate if relevant modifier is pressed, in case
  // of 'keyup' event including those does not make sense.
  if (type != 'keyup') {
    if (metaKey) {
      modifiers.push('Meta');
    }
    if (ctrlKey) {
      modifiers.push('Control');
    }
    if (altKey) {
      modifiers.push('Alt');
    }
    if (shiftKey) {
      modifiers.push('Shift');
    }
  }
  return modifiers;
};


export const readKey = key => readKey.table[key] || key;
readKey.table = Object.assign(Object.create(null), {
  'ctrl': 'control',
  'accel': platform == 'darwin' ? 'meta' : 'control',
  'ArrowLeft': 'left',
  'ArrowRight': 'right',
  'ArrowUp': 'up',
  'ArrowDown': 'down',
  'esc': 'escape'
});

export const readChord = input =>
  input.trim()
  .toLowerCase()
  .split(/\s+/)
  .map(readKey)
  .sort()
  .join(' ');

export const writeChord = event =>
  [...readModifiers(event), readKey(event.key)]
    .join(' ')
    .toLowerCase()
    .split(' ')
    .sort()
    .join(' ');

export const KeyBindings = (bindingTable) => {
  const bindings = Object.create(null);
  Object.keys(bindingTable).forEach(key => {
    bindings[readChord(key)] = bindingTable[key];
  });

  const Binding = (event) => {
    const chord = writeChord(event);

    // @TODO can we simplify this or write some documentation?
    // At the moment, it's very magical.
    const read = bindings[chord] ||
                 bindings[`@${event.type} ${chord}`];

    if (read) {
      event.preventDefault();
      event.stopPropagation();
      return asCommand(
        read(event), chord,
        event.key, event.metaKey, event.shiftKey, event.altKey, event.ctrlKey
      );
    }
    else {
      return asKey();
    }
  };

  return Binding;
};

export const service = address => action => {
  if (action.type === "For" && action.target === "Keyboard") {
    address(action.action);
  }
}
