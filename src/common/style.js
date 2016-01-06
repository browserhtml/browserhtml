/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*:: import * as type from "../../type/common/style" */

const composedStyles = Object.create(null);

const ID = Symbol('style-sheet/id');
var id = 0;

export const StyleSheet/*:type.StyleSheet*/ = {
  create: (sheet) => {
    const result = {}
    for (var name in sheet) {
      if (sheet.hasOwnProperty(name)) {
        const style = sheet[name]
        if (typeof(style) === 'object' && style != null) {
          // @FlowIssue: Flow does not work with symbols
          style[ID] = ++id;
          result[name] = style;
        }
        else {
          result[name] = style;
        }
      }
    }

    // @FlowIssue: Flow does not seem to get it's same type.
    return result
  }
}

// Mix multiple style objects together. Will memoize the combination of styles
// to minimize object creation. Returns style object that is the result of
// mixing styles together.
export const Style/*:type.mix*/ = (...styles) => {
  var length = styles.length;
  var index = 0;
  var id = null;
  while (index < length) {
    const style = styles[index];
    if (style) {
      // @FlowIssue: Flow isn't very friendly with symbols.
      if (style[ID]) {
        id = id ? `${id}+${style[ID]}` : style[ID];
      } else if (typeof(style) === "object") {
        id = null;
      } else {
        throw TypeError(`Style may only be given objects and falsy values`);
      }
      index = index + 1;
    } else {
      styles.splice(index, 1);
      length = length - 1;
    }
  }

  const composedStyle = id !== null ?
    composedStyles[id] :
    null;

  if (composedStyle != null) {
    return composedStyle
  }
  else if (id != null) {
    // @FlowIssue: Flow does not get spread here.
    const composedStyle = Object.assign({}, ...styles);
    composedStyle[ID] = id;
    composedStyles[id] = composedStyle;
    return composedStyle;
  }
  else {
    // @FlowIssue: Flow does not get spread here.
    const composedStyle = Object.assign({}, ...styles);
    composedStyle[ID] = null;
    return composedStyle;
  }
}
