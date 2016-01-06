/* @flow */

import type {Effects} from "reflex/type/effects"
import type {Address, VirtualTree} from "reflex/type"
import * as Toggle from "../../common/toggle"


export type Attach =
  { type: "Attach"
  }

export type Detach =
  { type: "Detach"
  }

export type Tagged <tag, action> =
  { type: tag
  , action: action
  }

export type ToggleAction = Tagged<"Toggle", Toggle.Action>


export type Action
  = Attach
  | Detach
  | ToggleAction

export type Model =
  { pin: Toggle.Model
  }

export type Toolbar = (data:Model) =>
  Model

export type init = () =>
  [Model, Effects<Action>]

export type update = (model:Model, action:Action) =>
  [Model, Effects<Action>]

export type view = (model:Model, address:Address<Action>) =>
  VirtualTree
