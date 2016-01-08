/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type {Effects} from "reflex/type/effects"
import type {Time} from "../common/prelude"

export type Model = {
  start: Time,
  now: Time,
  end: Time
}

type TickAction = {
  type: "Tick",
  time: Time
}

export type Tick = (time:Time) =>
  TickAction

export type End = {
  type: "End"
}

export type Action
  = TickAction
  | End

export type create = (time:Time, duration:Time) => Model

export type init = (time:Time, duration:Time) =>
  [Model, Effects<Tick>]

export type update = (model:Model, action:Tick) =>
  [Model, Effects<Action>]

export type progress = (model:Model) => Time

export type duration = (model:Model) => Time
