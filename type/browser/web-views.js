/* @flow */

import type {Address, VirtualTree, Effects} from "reflex/type"
import type {ID, URI} from "../common/prelude"
import * as WebView from "./web-view"

export type Model = {
  nextID: ID,
  selected: number,
  active: number,
  entries: Array<WebView.Model>
}

export type ByID =
  { type: "ByID"
  , id: ID
  , action: WebView.Action
  }

export type ByActive =
  { type: "ByActive"
  , action: WebView.Action
  }

export type NewWebViewOptions = WebView.NewWebViewOptions

export type Open =
  { type: "Open"
  , options: NewWebViewOptions
  }

export type NavigateTo =
  { type: "NavigateTo"
  , uri: URI
  }


export type ActivateSelected = {
  type: "WebViews.ActivateSelected"
}

export type SelectRelative =
  { type: "WebViews.SelectRelative"
  , offset: number
  }

export type Action
  = ByID
  | ByActive
  | Open
  | SelectRelative
  | ActivateSelected

export type update = (model:Model, action:Action) => [Model, Effects<Action>]

export type view = (model:Model, address:Address<Action>) => VirtualTree
