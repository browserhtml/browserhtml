/* @flow */

import type {Address, VirtualTree} from "reflex/type"
import type {Effects} from "reflex/type/effects"
import type {ID} from "../../common/prelude"
import * as WebViews from "../web-views"
import * as Tab from "./tab"


type CloseAction =
  { type: "Close"
  , id:ID
  }
export type Close = (id:ID) =>
  CloseAction

type SelectAction =
  { type: "Select"
  , id: ID
  }
export type Select = (id:ID) =>
  SelectAction

type ActivateAction =
  { type: "Activate"
  , id: ID
  }
export type Activate = (id:ID) =>
  { type: "Activate"
  , id: ID
  }

type ByIDAction =
  { type: "ByID"
  , id: ID
  , action: Tab.Action
  }

export type ByID =
  (id:ID) =>
  (action:Tab.Action) =>
  CloseAction | SelectAction | ActivateAction | ByIDAction

export type Model = WebViews.Model

export type Action
  = CloseAction
  | SelectAction
  | ActivateAction
  | ByIDAction

export type update = (model:Model, action:Action) =>
  [Model, Effects<Action>]

export type view = (model:Model, address:Address<Action>) =>
  VirtualTree
