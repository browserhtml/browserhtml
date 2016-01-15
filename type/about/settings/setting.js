/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {VirtualTree, Address} from "reflex/type";
import {Effects} from "reflex/type/effects";
import * as Target from "../../common/target";
import * as Focusable from "../../common/focusable";
import * as Control from "../../common/control";
import * as Editable from "../../common/editable";
import * as TextInput from "../../common/text-input";
import {Style} from "../../common/style";
import {Tagged} from "../../common/prelude";

export type Value
  = string
  | number
  | null
  | boolean

export type Model =
  { isEditing: boolean
  , value: Value
  , input: TextInput.Model
  }

export type Edit =
  { type: "Edit"
  }

export type Abort =
  { type: "Abort"
  }

export type Submit =
  { type: "Sumbit"
  }

export type Change =
  (value:Value) =>
  Tagged<"Changed", Value>

export type Action
 = Edit
 | Abort
 | Submit
 | Tagged<"Change", Value>
 | Tagged<"TextInput", TextInput.Action>

export type init =
  (value:Value) =>
  [Model, Effects<Action>]

export type update =
  (model:Model, action:Action) =>
  [Model, Effects<Action>]
