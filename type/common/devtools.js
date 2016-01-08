/* @flow */

import type {Address, VirtualTree} from "reflex/type"
import type {Effects} from "reflex/type/effects"
import * as Settings from "./settings"
import * as Focusable from "./focusable"

export type Model = {
  isActive: boolean,
  settings: ?
    { 'debugger.remote-mode': 'adb-devtools' | 'disabled'
    , 'apz.overscroll.enabled': boolean
    , 'debug.fps.enabled': boolean
    , 'debug.paint-flashing.enabled': boolean
    , 'layers.low-precision': boolean
    , 'layers.low-opacity': boolean
    , 'layers.draw-borders': boolean
    , 'layers.draw-tile-borders': boolean
    , 'layers.dump': boolean
    , 'layers.enable-tiles': boolean
    , 'layers.async-pan-zoom.enabled': boolean
    }
}

export type Toggle = {type: "Toggle"}
export type Restart = {type: "Restart"}
export type CleanRestart = {type: "CleanRestart"}
export type CleanReload = {type: "CleanReload"}
export type ChangeAction =
  { type: "Change"
  , name: Settings.Name
  , value: Settings.Value
  }
export type SettingsAction =
  { type: "Settings"
  , action: Settings.Action
  }

export type Action
  = Toggle
  | Restart
  | CleanRestart
  | CleanReload
  | ChangeAction
  | SettingsAction

export type init = () => [Model, Effects<Action>]
export type update = (model:Model, address:Address<Action>) =>
  [Model, Effects<Action>]

export type view = (model:Model, address:Address<Action>) =>
  VirtualTree
