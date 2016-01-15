/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {VirtualTree, Address} from "reflex/type";
import {Effects} from "reflex/type/effects";
import * as Target from "../common/target";
import * as Focusable from "../common/focusable";
import * as Control from "../common/control";
import * as Editable from "../common/editable";
import {Style} from "../common/style";
import {Tagged} from "../common/prelude";

export type Model =
  { value: string
  , selection: ?Editable.Selection
  , placeholder: ?string
  , isDisabled: boolean
  , isFocused: boolean
  }


export type Focus = Tagged<"Focusable", Focusable.Focus>;
export type Blur = Tagged<"Focusable", Focusable.Blur>;
export type Change = Editable.Change;
export type Enable = Tagged<"Control", Control.Enable>;
export type Disable = Tagged<"Control", Control.Disable>;

export type Action
  = Tagged<"Focusable", Focusable.Action>
  | Tagged<"Editable", Editable.Action>
  | Tagged<"Control", Control.Action>
  | Change

export type init =
  (value?:string, selection?:Editable.Selection, placeholder?:string) =>
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
