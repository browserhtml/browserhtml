/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


import {merge} from "../common/prelude";
import * as Unknown from "../common/unknown";
import {Effects} from "reflex";

/*:: import * as type from "../../type/common/focusable" */

export const blured/*:type.Model*/ = {isFocused: false};
export const focused/*:type.Model*/ = {isFocused: true};

export const initial = blured;

export const Focus/*:type.Focus*/ = {type:"Focus"};
export const Blur/*:type.Blur*/ = {type: "Blur"};

export const update/*:type.update*/ = (model, action) =>
    action.type === "Focus"
  ? [merge(model, {isFocused: true}), Effects.none]
  : action.type === "Blur"
  ? [merge(model, {isFocused: false}), Effects.none]
  : Unknown.update(model, action);
