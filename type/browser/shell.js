/* @flow */

import {VirtualTree, Address} from "reflex/type"
import {Effects} from "reflex/type/effects"

import * as Focusable from "../common/focusable"
import * as Target from "../common/target"
import * as Runtime from "../common/runtime"
import * as Controls from "./shell/controls"

export type Focus = {type: "Focus"}
export type Blur = {type: "Blur"}
export type Close = {type: "Close"}
export type Minimize = {type: "Minimize"}
export type ToggleFullscreen = {type: "ToggleFullscreen"}
export type FullScreenToggled = {type: "FullScreenToggled"}

export type Closed = {type: "Closed"}
export type Minimized = Runtime.Minimized
export type FullscreenToggled = Runtime.FullscreenToggled

export type HasFocusType = {type: "HasFocus", value: boolean}
export type HasFocus = (value:boolean) => HasFocusType
export type Controls$Action = {type: "Controls", action: Controls.Action}

export type Model =
  { isMinimized: boolean
  , isMaximized: boolean
  , isFocused: boolean
  , controls: Controls.Model
  }


// Workaround for facebook/flow#957
// Flow fails on union of unions there for we manually unpack
// Each union instead of using Focusable.Action | Target.Action

export type Action
  = Focus
  | Blur
  | HasFocusType
  | Close | Minimze | ToggleFullscreen
  | Closed | Minimized | FullscreenToggled
  | Controls$Action

export type init = () =>
  [Model, Effects<Action>]

export type update = (model:Model, action:Action) =>
  [Model, Effects<Action>]

export type view = (model:Model, address:Address<Action>) =>
  VirtualTree
