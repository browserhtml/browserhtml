/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type {Effects} from "reflex/type/effects"
import type {Time} from "../common/prelude"

export type Start =
  { type: "Start" }

export type End =
  { type: "End" }

export type TickAction =
  { type: "Tick"
  , time: Time
  }

export type Tick = (time:Time) =>
  TickAction

export type Action
  = Start
  | End
  | TickAction


export type Idle = null
export type Ticking =
  { time: Time
  , elapsed: Time
  }

export type Model
  = Idle
  | Ticking

export type init = () =>
  [Idle, Effects<Action>];

export type update = (model:Model, action:Action) =>
  [Model, Effects<Action>];
