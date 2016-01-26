/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type {VirtualTree, Address} from "reflex/type"
import type {Effects} from "reflex/type/effects"
import type {Style} from "../../common/style";
import * as Title from "./title";
import * as Suggestion from "./suggestion";

export type Action
  = Action

export type Model =
  { id: string
  , title: ?string
  , uri: string
  , isSelected: boolean
  }

export type view =
  (model:Model, address:Address<Action>) =>
  VirtualTree
