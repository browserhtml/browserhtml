/* @flow */

import {VirtualTree, Address} from "reflex/type";
import {Effects} from "reflex/type/effects";
import * as Target from "../common/target";
import * as Focusable from "../common/focusable";
import * as Button from "../common/button";
import {Style} from "../common/style";

export type Model =
  { isDisabled: boolean
  , isFocused: boolean
  , isActive: boolean
  , isPointerOver: boolean
  , isChecked: boolean
  }

export type Toggle = (data:Model) =>
  Model


export type Press =
  { type: "Press"
  }

export type Check =
  { type: "Check"
  }

export type Uncheck =
  { type: "Uncheck"
  }

type TaggedAction <tag, action> =
  { type: tag
  , action: action
  }

export type ButtonAction = (action:Button.Action) =>
  TaggedAction<"Button", Button.Action>

export type Action
  = Check
  | Uncheck
  | Press
  | TaggedAction<"Focusable", Focusable.Action>
  | TaggedAction<"Target", Target.Action>
  | TaggedAction<"Button", Button.Action>

export type init = () =>
  [Model, Effects<Action>]

export type update = (model:Model, action:Action) =>
  [Model, Effects<Action>]

export type StyleSheet =
  { base: Style
  , focused?: Style
  , blured?: Style
  , disabled?: Style
  , enabled?: Style
  , over?: Style
  , out?: Style
  , active?: Style
  , inactive?: Style
  , checked?: Style
  , unchecked?: Style
  }

export type view =
  (key:string, styleSheet:StyleSheet) =>
  (model:Model, address:Address<Action>, contextStyle:?Style) =>
  VirtualTree
