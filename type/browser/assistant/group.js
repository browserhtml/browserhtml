/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type {VirtualTree, Address} from "reflex/type"
import type {Effects} from "reflex/type/effects"
import type {Style} from "../../common/style";
import * as Title from "./title";
import * as Suggestion from "./suggestion";
import type {Tagged} from "../../common/prelude"

type ID = string

type Dict <key, value> =
  {[key:key]: value}

type Match <id> =
  { id: id
  , isVisible: boolean
  }

export type Model <model> =
  { items: Array<Match<ID>>
  , matches: Dict<ID, model>
  , selected: ?ID
  , size: number
  , limit: number
  }



// # Action

export type Action <model, action>
  = Tagged<"RelpaceMatches", Dict<ID, model>>
  | Tagged<"Match", {id: ID, action: action}>

export type Step <model, action> =
  [Model<model>, Effects<Action<action>>]

export type init = <model, action>
  (size:number, limit:number) =>
  Step<model, action>

export type update = <model, action>
  (model:Model<model>, action:action) =>
  Step<model, action>

export type view = <model, action>
  (model:Model<model>, address:Address<Action<model, action>>) =>
  VirtualTree
