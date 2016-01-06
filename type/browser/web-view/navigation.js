/* @flow */

import type {Task} from "reflex/type"
import type {Effects, Never} from "reflex/type/effects"
import type {ID, URI, Time} from "../../common/prelude"
import type {Result} from  "../../common/result"


export type Model = {
  id: ID,
  canGoBack: boolean,
  canGoForward: boolean,

  // URI of the page displayed by a web-view (although web view maybe still
  // loading & technically it won't be displayed). This uri updates during any
  // redirects or when user navigates away by going back / forward or by
  // navigating to a new uri.
  currentURI: URI,

  // URI that was entered in a location bar by a user. Note this may not be an
  // uri of currently loaded page as uri could have being redirect or user could
  // have navigated away by clicking a link or pressing go back / go forward
  // buttons. This pretty much represents `src` attribute of the iframe.
  initiatedURI: URI
}

// Action is triggered whenever web-view start loading a new URI. Passed URI
// directly corresponds `currentURI` in the model.
type LocationChangedAction = {
  type: "LocationChanged",
  uri: URI
}

export type LocationChanged = (uri:URI) =>
  LocationChangedAction

// Editing uri in the location bar causes `ChangeLocation` action. It's
// `uri` field directly corresponds to `initiatedURI` field on the model,
// althoug this action also updates `currentURI`.
type LoadAction =
  { type: "Load"
  , uri: URI
  }
export type Load = (uri:URI) => LoadAction



// When model is updated with above action Effects with following Response
// actions are triggered.
type CanGoBackResult = Result<string, boolean>
type CanGoBackChangedAction =
  { type: "CanGoBackChanged"
  , result: CanGoBackResult
  }
export type CanGoBackChanged = (result:CanGoBackResult) =>
  CanGoBackChangedAction

export type canGoBack = (id:ID) =>
  Task<Never, CanGoBackResult>


type CanGoForwardResult = Result<string, boolean>
type CanGoForwardChangedAction =
  { type: "CanGoForwardChanged"
  , result: CanGoForwardResult
  }
export type CanGoForwardChanged = (result:CanGoForwardResult) =>
  CanGoForwardChangedAction

export type canGoForward = (id:ID) =>
  Task<Never, CanGoForwardResult>


// User interaction interaction may be triggered by following actions:
type VoidResult = Result<string, void>

export type Stop = {type: "Stop"}
type StoppedAction =
  { type: "Stopped"
  , result: VoidResult
  }
export type Stopped = (result:VoidResult) =>
  StoppedAction
export type stop = (id:ID) => Task<Never, VoidResult>


export type Reload = {type: "Reload"}
type ReloadedAction =
  { type: "Reloaded"
  , result: VoidResult
  }
export type Reloaded = (result:VoidResult) =>
  ReloadedAction
export type reload = (id:ID) => Task<Never, VoidResult>

export type GoBack = {type: "GoBack"}
type WentBackAction =
  { type: "WentBack"
  , result: VoidResult
  }
export type WentBack = (result:VoidResult) =>
  WentBackAction
export type goBack = (id:ID) => Task<Never, VoidResult>

export type GoForward = {type: "GoForward"}
type WentForwardAction =
  { type: "WentForward"
  , result: VoidResult
  }
export type WentForward = (result:VoidResult) =>
  WentForwardAction
export type goForward = (id:ID) => Task<Never, VoidResult>





export type Action
  = Stop | Reload | GoBack | GoForward
  | LocationChangedAction
  | LoadAction

  | CanGoBackChangedAction | CanGoForwardChangedAction
  | StoppedAction | ReloadedAction | WentBackAction | WentForwardAction



export type init = (id:ID, uri:URI) =>
  [Model, Effects<Action>]

export type update = (model:Model, action:Action) =>
  [Model, Effects<Action>]
