/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


import type {VirtualTree, Address} from "reflex/type"
import type {Effects} from "reflex/type/effects"
import type {Time} from "../common/prelude"
import * as Animation from "../common/animation"

export type Visible = 0.1
export type Invisible = 0

type Display =
  { opacity: Visible | Invisible
  }

export type Model =
  { display: Display
  , isCapturing: boolean
  , isVisible: boolean
  , animation: ?Animation.Model
  }

export type Overlay =
  (data:{isCapturing:boolean, isVisible:boolean}) =>
  Model;

export type Show = {type: "Overlay.Show", time: Time}
export type Hide = {type: "Overlay.Hide", time: Time}
export type Fade = {type: "Overlay.Fade", time: Time}
export type Click = {type: "Overlay.Click"}

export type asShow = (time:Time) => Show
export type asHide = (time:Time) => Hide
export type asFade = (time:Time) => Fade

export type Action
  = Show
  | Hide
  | Fade
  | Animation.Tick | Animation.End

export type Effect
  = Effects<Animation.Tick | Animation.End>

export type show = (model:Model, time:Time) =>
  [Model, Effect]

export type hide = (model:Model, time:Time) =>
  [Model, Effect]

export type fade = (model:Model, time:Time) =>
  [Model, Effect]

export type tick = (model:Model, action:Animation.Tick) =>
  [Model, Effect]

export type init = (isVisible:boolean, isCapturing:boolean) =>
  [Model, Effects<Action>]

export type update = (model:Model, action:Action) =>
  [Model, Effects<Action>]

export type view = (model:Model, address:Address<Action>) =>
  VirtualTree;
