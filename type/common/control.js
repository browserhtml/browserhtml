/* @flow */

import {VirtualTree, Address} from "reflex/type";
import {Effects} from "reflex/type/effects";
import * as Target from "../common/target";
import * as Focusable from "../common/focusable";
import {Style} from "../common/style";

export type Model =
  { isDisabled: boolean
  }

export type Disable =
  { type: "Disable"
  }

export type Enable =
  { type: "Enable"
  }

export type Action
  = Enable
  | Disable

export type update =
  (model:Model, action:Action) =>
  [Model, Effects<Action>];
