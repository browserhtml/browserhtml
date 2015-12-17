/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Effects} from 'reflex';
import {merge, always} from "../common/prelude";
import * as Unknown from "../common/unknown";

export const Start = {type: "Start"};
export const End = {type: "End"};
export const Tick = time => ({type: "Tick", time});



export const start = () => [null, Effects.tick(Tick)];

export const update = (model, action) =>
    action.type === "End"
  ? [null, Effects.none]
  : action.type === "Start"
  ? [null, Effects.tick(Tick)]
  : action.type === "Tick"
  ? ( model == null
    ? [ {
          time: action.time,
          elapsed: 0
        }
      , Effects.tick(Tick)
      ]
    : [ merge(model, {
          time: action.time,
          elapsed: model.elapsed + (action.time - model.time)
        })
      , Effects.tick(Tick)
      ]
    )
  : Unknown.update(model, action);
