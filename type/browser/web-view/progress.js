/* @flow */

import type {VirtualTree} from "reflex/type"
import type {Effects} from "reflex/type/effects"
import type {Time} from "../../common/prelude"

export type Idle
  = void
  | null

export type Loading =
  { loadStart: Time
  , loadEnd: Time
  , connectTime: ?Time
  }
export type Model
  = Idle
  | Loading

export type StartAction =
  { type: "Start"
  , time: Time
  }

export type Start = (time:Time) =>
  StartAction

export type LoadEndAction =
  { type: "LoadEnd"
  , time: Time
  }

export type LoadEnd = (time:Time) =>
  LoadEndAction

export type ConnectAction =
  { type: "Connect"
  , time: Time
  }
export type Connect = (time:Time) =>
  ConnectAction

export type TickAction =
  { type: "Tick"
  , time: Time
  }

export type Tick = (time:Time) =>
  TickAction


export type Action
  = StartAction
  | ChangeAction
  | LoadEndAction
  | ConnectAction
  | TickAction



// Invoked on Start action and returns starting state tick requesting effect:
//  [
//    {
//      loadStart: timeStamp,
//      loadEnd: timeStamp + (10 * second),
//      updateTime: timeStamp
//    },
//    Effects.tick(asTick)
//  ]
export type start = (time:Time) =>
  [Model, Effects<Action>]

// Invoked on End action and returns model with updated `timeStamp`:
//  [
//    {...model, loadEnd: timeStamp},
//    Effects.none
//  ]
export type end = (time:Time, model:Loading) =>
  [Model, Effects<Action>]


// Invoked on every animation frame after load is started and returns
// [
//    {...model, updateTime: timeStamp},
//    Effects.tick(asTick)
// ]
export type tick = (timeStamp:Time, model:Loading) =>
  [Model, Effects<Action>]

export type init = () =>
  [Model, Effects<Action>]


export type Progress = number // Implied to be 0.0 - 1.0 range
// Invoked from the view function and returns calculated progress:
export type progress = (model: ?Model) => Progress


export type update = (model:Model, action:Action) =>
  [Model, Effects<Action>]


export type view = (model:Model) => VirtualTree
