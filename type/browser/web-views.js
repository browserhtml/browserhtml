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

export type ByID = {
  type: "WebViews.ByID",
  id: ID,
  action: WebView.Action
}

export type ByActive = {
  type: "WebViews.ByActive",
  action: WebView.Action
}

export type NewWebViewOptions = WebView.NewWebViewOptions

export type Open = {
  type: "WebViews.Open"
  options: NewWebViewOptions
}

export type NavigateTo = {
  type: "WebViews.NavigateTo",
  uri: URI
}

export type CloseActive = {
  type: "WebViews.CloseActive"
}

export type CloseByID = {
  type: "WebViews.CloseByID",
  id: ID
}

export type SelectByID = {
  type: "WebViews.SelectByID",
  id: ID
}

export type ActivateSelected = {
  type: "WebViews.ActivateSelected"
}

export type ActivateByID = {
  type: "WebViews.ActivateByID",
  id: ID
}

export type Action
  = ByID | ByActive
  | Open
  | CloseByID | CloseActive
  | SelectByID
  | ActivateSelected | ActivateByID

export type asByID = (id:ID) => (action:WebView.Action) => ByID
export type asByActive = (action:WebView.Action) => ByID
export type asNavigateTo = (uri:URI) => NavigateTo

export type indexByID = (model:Model, id:ID) => number
export type indexOfOffset = (index:number, size:number, offset:number, loop:boolean) => number
export type open = (model:Model, options:NewWebViewOptions) => Model

export type closeActive = (model:Model) => Model
export type closeByIndex = (model:Model, index:number) => Model
export type closeByID = (model:Model, id:ID) => Model

export type selectByID = (model:Model, id:ID) => Model
export type selectByIndex = (model:Model, index:number) => Model
export type selectByOffset = (model:Model, offset:number) => Model

export type activateSelected = (model:Model) => Model
export type activateByID = (model:Model, id:ID) => Model

export type step = (model:Model, action:Action) => [Model, Effects<Action>]
export type stepByID = (model:Model, id:ID, action:WebView.Action) => [Model, Effects<Action>]

export type view = (model:Model, address:Address<Action>) => VirtualTree
