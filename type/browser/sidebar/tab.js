/* @flow */

import type {Address, VirtualTree} from "reflex/type"
import type {Effects} from "reflex/type/effects"
import type {ID} from "../../common/prelude"
import * as WebView from "../../browser/web-view"

export type Close =
  { type: "Close"
  }

export type Select =
  { type: "Select"
  }

export type Activate =
  { type: "Activate"
  }

export type Unselect =
  { type: "Unselect"
  }

export type Deactivate =
  { type: "Deactivate"
  }

export type Action
  = Close
  | Select
  | Activate
  | Unselect
  | Deactivate

export type Model = WebView.Model

export type update = (model:Model, action:Action) =>
  [Model, Effects<Action>]

export type view = (model:Model, address:Address<Action>) =>
  VirtualTree
