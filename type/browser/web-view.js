/* @flow */

import type {Address, VirtualTree, Effects} from "reflex/type"
import type {ID} from "../common/prelude"

import * as Shell from "./web-view/shell"
import * as Progress from "./web-view/progress"
import * as Navigation from "./web-view/navigation"
import * as Security from "./web-view/security"
import * as Page from "./web-view/page"
import * as Rotation from "./web-view/rotation"


export type Model = {
  id: ID,
  name: string,
  features: string,
  isSelected: boolean,
  isActive: boolean,
  shell: Shell.Model,
  progress: ?Progress.Model,
  navigation: Navigation.Model,
  security: Security.Model,
  page: ?Page.Model
}

export type NewWebViewOptions = {
  uri: URI,
  inBackground: boolean,
  name: string,
  features: string
}


export type Response
  = Navigation.Response
  | Page.Response
  | Rotation.Response


export type Action
  = Progress.Action
  | Shell.Action
  | Navigation.Action
  | Security.Action
  | Page.Action


export type open = (id:ID, options:NewWebViewOptions) => Model
export type select = (model:Model) => Model
export type unselect = (model:Model) => Model
export type activate = (model:Model) => Model
export type dectivate = (model:Model) => Model
export type readTitle = (model:Model) => string

export type step = (model:Model, action:Action) => [Model, Effects<Response>]

export type view = (model:Model, address:Address<Action>) => VirtualTree
