/* @flow */

import {VirtualTree, Address} from "reflex/type";
import {Effects} from "reflex/type/effects";
import * as Target from "../common/target";
import * as Focusable from "../common/focusable";
import {Style} from "../common/style";

export type Down =
  { type: "Down"
  }

export type Press =
  { type: "Press"
  }

export type Up =
  { type: "Up"
  }

export type Disable =
  { type: "Disable"
  }

export type Enable =
  { type: "Enable"
  }

type FocusableAction =
  { type: "Focusable"
  , action: Focusable.Action
  }

type TargetAction =
  { type: "Target"
  , action: Target.Action
  }

export type Action
  = Down
  | Up
  | Press
  | Disable
  | Enable
  | FocusableAction
  | TargetAction

export type Model =
  { isDisabled: boolean
  , isActive: boolean
  , isPointerOver: boolean
  , isFocused: boolean
  }

export type Button = (data:Model) =>
  Model

export type init = (isDisabled:boolean, isFocused:boolean, isActive:boolean, isPointerOver:boolean) =>
  [Model, Effects<Action>]

export type update = (model:Model, action:Action) =>
  [Model, Effects<Action>]


export type StyleSheet =
  { base: Style
  , focused?: Style
  , blured?: Style
  , enabled?: Style
  , disabled?: Style
  , over?: Style
  , out?: Style
  , active?: Style
  , inactive?: Style
  }


export type view =
  (key:string, styleSheet:StyleSheet) =>
  (model:Model, address:Address<Action>, contextStyle:?Style) =>
  VirtualTree
