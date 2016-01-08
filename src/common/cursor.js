/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


import * as Reflex from "reflex";

/*::
import type {Cursor} from "../../type/common/cursor"
import type {Effects} from "reflex/type/effects"
*/

export const cursor = /*::<from, to, in, out>*/ (config/*:Cursor*/)/*:(model:from, action:in) => [from, Effects<out>]*/ => {
  const get = config.get;
  const set = config.set;
  const update = config.update;
  const tag = config.tag;

  return (model, action) => {
    const previous
      = get == null
      ? model
      : get(model, action);

    const [next, fx] = update(previous, action);
    const state
      = set == null
      ? next
      : set(model, next);

    return [state, tag == null ? fx : fx.map(tag)]
  }
}


// @FlowIssue: Ignore for now
export const join = (cursorA, cursorB) => (model, action) => {
  const [stepA, fxA] = cursorA(model, action)
  const [stepB, fxB] = cursorB(model, action)
  return [stepB, Reflex.Effects.batch([fxA, fxB])];
}
