/* @flow */

import {VirtualTree, Address} from "reflex/type"
import {Effects} from "reflex/type/effects"
import * as Button from "../../common/button"
import * as Toggle from "../../common/toggle"

export type CloseWindow =
  { type: "CloseWindow"
  }

export type MinimizeWindow =
  { type: "MinimizeWindow"
  }

export type ToggleWindowFullscreen =
  { type: "ToggleWindowFullscreen"
  }

export type FullscreenToggled =
  { type: "FullscreenToggled"
  }

export type Ignore =
  { type: "Ignore"
  }

export type Over =
  { type: "Over"
  }

export type Out =
  { type: "Out"
  }

export type Enable =
  { type: "Enable"
  }

export type Disable =
  { type: "Disable"
  }

export type TaggedAction <name, action> =
  { type: name
  , action: action
  }

export type CloseButtonAction = TaggedAction<"CloseButton", Button.Action>
export type MinimizeButtonAction = TaggedAction<"MinimizeButton", Button.Action>
export type ToggleButtonAction = TaggedAction<"ToggleButton", Button.Action>

export type Action
  = CloseWindow
  | MinimizeWindow
  | ToggleWindowFullscreen
  | FullscreenToggled
  | Ignore
  | Over
  | Out
  | Enable
  | Disable
  | CloseButtonAction
  | MinimizeButtonAction
  | ToggleButtonAction

export type Model =
  { close: Button.Model
  , minimize: Button.Model
  , toggle: Toggle.Model
  }

export type Controls = (data:Model) =>
  Model

export type init = (isDisabled:boolean, isPointerOver:boolean, isMaximized:boolean) =>
  [Model, Effects<Action>]

export type update = (model:Model, action:Action) =>
  [Model, Effects<Action>]

export type view = (model:Model, address:Address<Action>) =>
  VirtualTree
