/* @flow */

import type {Address, VirtualTree, Effects} from "reflex/type"
import type {ID, URI} from "../common/prelude"
import * as WebView from "./web-view"
import * as Selector from "./selector"
import * as Stopwatch from "../common/stopwatch"

// # Model

export type Model =
  { nextID: ID
  , selector: ?Selector.Model<ID>
  , order: Array<ID>
  , entries: {[key:ID]: WebView.Model}
  , animation: Stopwatch.Model
  , display: { rightOffset: number }
  , isExpanded: boolean
  , isFolded: boolean
  }

// # Actions

// ### Navigate WebView

export type NavigateToAction =
  { type: "NavigateTo"
  , uri: URI
  }

export type NavigateTo = (uri:URI) =>
  NavigateToAction


// ### Open WebView

export type NewWebViewOptions = WebView.NewWebViewOptions

export type OpenAction =
  { type: "Open"
  , options: NewWebViewOptions
  }
export type Open = (options:NewWebViewOptions) =>
  OpenAction

// ### Close WebView

export type CloseActive =
  { type: "CloseActive"
  }

type CloseByIDAction =
  { type: "CloseByID"
  , id: ID
  }

export type CloseByID = (id:ID) =>
  CloseByIDAction

type ClosedAction =
  { type: "Closed"
  , id: ID
  }

export type Closed = (id:ID) =>
  ClosedAction

// ### Select WebView

type SelectByIDAction =
  { type: "SelectByID"
  , id: ID
  }

export type SelectByID = (id:ID) =>
  SelectByIDAction

type SelectRelativeAction =
  { type: "SelectRelative"
  , offset: number
  }

export type SelectRelative = (offset:number) =>
  SelectRelativeAction

export type SelectedAction =
  { type: "Selected"
  , id: ID
  }
export type Selected = (id:ID) =>
  SelectedAction

// ### Activate WebView

export type ActivateSelected =
  { type: "ActivateSelected"
  }

type ActivateByIDAction =
  { type: "ActivateByID"
  , id: ID
  }

export type ActivateByID = (id:ID) =>
  ActivateByIDAction


type ActivatedAction =
  { type: "Activated"
  , id: ID
  }
export type Activated = (id:ID) =>
  ActivatedAction

// ### Switch mode

// ZoomOut of the active WebView.
export type Unfold =
  { type: "Unfold"
  }

// ZoomIn into active WebView.
export type Fold =
  { type: "Fold"
  }

// Shrink view to accomodate sidebar on the right side.
export type Shrink =
  { type: "Shrink"
  }

// Expand view to disregard / cover sidebar on the right side.
export type Expand =
  { type: "Expand"
  }

// ### Tag WebView Action

export type ActiveWebViewAction =
  { type: "ActiveWebView"
  , action: WebView.Action
  }

export type WebViewAction =
  { type: "WebViewAction"
  , action: WebView.Action
  }


type ByIDAction
  = SelectedAction
  | ActivatedAction
  | ClosedAction
  | WebView.OpenSyncWithMyIFrame
  | WebViewAction

export type ByID =
  (id:ID) =>
  (action:WebView.Action) =>
  ByIDAction





export type Action
  = NavigateToAction
  | OpenAction

  | CloseActive
  | CloseByID
  | ClosedAction

  | SelectByIDAction
  | SelectRelativeAction
  | SelectedAction

  | ActivateSelected
  | ActivateByIDAction
  | ActivatedAction

  | Shrink
  | Expand

  | Fold
  | Unfold

  | ActiveWebViewAction
  | WebViewAction

export type getActiveURI <other> = (model:Model, fallback:other) =>
  URI | other

export type init = () =>
  [Model, Effects<Action>]

export type update = (model:Model, action:Action) =>
  [Model, Effects<Action>]

export type view = (model:Model, address:Address<Action>) =>
  VirtualTree
