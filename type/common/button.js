/* @flow */

import type {VirtualTree, Address} from "reflex/type";
import type {Effects} from "reflex/type/effects";
import type {Tagged} from "../common/prelude";
import * as Target from "../common/target";
import * as Focusable from "../common/focusable";
import * as Control from "../common/control";
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

export type Enable = Tagged<"Control", Control.Enable>
export type Disable = Tagged<"Control", Control.Disable>


export type Action
  = Down
  | Up
  | Press
  | Tagged<"Control", Control.Action>
  | Tagged<"Focusable", Focusable.Action>
  | Tagged<"Target", Target.Action>

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
