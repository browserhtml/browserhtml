/* @flow */

/* this source code form is subject to the terms of the mozilla public
 * license, v. 2.0. if a copy of the mpl was not distributed with this
 * file, you can obtain one at http://mozilla.org/mpl/2.0/. */

/*:: import * as type from "../../type/common/keyboard" */

import {Effects} from "reflex";
import * as OS from './os';

const platform = OS.platform();


const readModifiers = ({type, metaKey, shiftKey, altKey, ctrlKey}) => {
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


const readKey = key => readKey.table[key] || key;

readKey.table = Object.assign(Object.create(null), {
  'ctrl': 'Control',
  'accel': platform == 'darwin' ? 'meta' : 'control',
  'ArrowLeft': 'Left',
  'ArrowRight': 'Right',
  'ArrowUp': 'Up',
  'ArrowDown': 'Down',
  'esc': 'Escape'
});

const readChord = input =>
  input
    .split(/\s+/)
    .map(readKey)
    .sort()
    .join(' ')
    .trim()
    .toLowerCase();

const writeChord = event => {
  const key = event.key
  const modifiers = readModifiers(event)
  const keys = modifiers.indexOf(key) < 0 ?
                [...modifiers, key] :
                modifiers;

  return keys
          .map(readKey)
          .join(' ')
          .toLowerCase()
          .split(' ')
          .sort()
          .join(' ');
};


export const bindings/*:type.keyBindings*/ = bindingTable => {
  const bindings = Object.create(null);
  Object.keys(bindingTable).forEach(key => {
    bindings[readChord(key)] = bindingTable[key];
  });

  return event => {
    const combination = writeChord(event);
    const binding = bindings[combination]

    if (binding == null) {
      return {
        type: event.type === "keyup" ?
                "Keyboard.KeyUp" :
              event.type === "keydown" ?
                "Keyboard.KeyDown" :
                "Keyboard.KeyPress",
        combination: combination,
        key: event.key,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        ctrlKey: event.ctrlKey
      }
    } else {
      event.stopPropagation();
      event.preventDefault();
      return binding(event);
    }
  }
}
