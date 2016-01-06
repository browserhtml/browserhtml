/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*:: import * as type from "../../type/common/animation"; */
import {Task, Effects} from "reflex";
import {merge, always} from "../common/prelude";

export const End/*:type.End*/ = {
  type: "End"
}

export const Tick/*:type.Tick*/ = time =>
  ( { type: "Tick"
    , time
    }
  );


const endfx = Effects.task(Task.future(always(Promise.resolve(End))));

export const create/*:type.create*/ = (time, duration) =>
  ({start: time, now: time, end: time + duration});

export const init/*:type.init*/ = (time, duration) =>
  [
    create(time, duration),
    Effects.tick(Tick)
  ];


export const update/*:type.update*/ = (model, tick) => {
  if (tick.type === "Tick") {
    return [
      merge(model, {now: tick.time}),
      model.end > tick.time ?
        Effects.tick(Tick) :
        endfx
    ]
  } else {
    console.warn(`Animation module does not handle passed action:`, tick);
    return [model, Effects.none];
  }
};

export const progress/*:type.progress*/ = (model) =>
  model.now - model.start;

export const duration/*:type.duration*/ = (model) =>
  model.end - model.start;
