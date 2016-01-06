/* @flow */

import type {Address, VirtualTree} from "reflex/type"
import type {Effects} from "reflex/type/effects"
import type {Version} from "../common/prelude"
import * as Devtools from "../common/devtools"
import * as Shell from "./shell"
import * as WebView from "./web-view"
import * as Updater from "./updater"
import * as WebViews from "./web-views"
import * as Input from "./input"
import * as Assistant from "./assistant"


export type Model = {
  version: Version,
  shell: Shell.Model,
  input: Input.Model,
  suggestions: Assistant.Model,
  webViews: WebViews.Model,

//  updates: Updater.Model,
  devtools: Devtools.Model
}

type TaggedAction <tag, action> =
  { type: tag
  , action: action
  }

export type CreateWebView =
  { type: "CreateWebView"
  }

export type EditWebView =
  { type: "EditWebView"
  }

export type ExitInput =
  { type: "ExitInput"
  }

export type SubmitInput =
  { type: "SubmitInput"
  }

export type InputAction = (action:Input.Action) =>
  SubmitInput | ExitInput | TaggedAction<"Input", action>

export type WebViewsAction = (action:WebViews.Action) =>
  TaggedAction<"WebViews", action>


export type Action
  = CreateWebView
  | EditWebView
  | ExitInput
  | SubmitInput
  | TaggedAction<"Shell", Shell.Action>
  | TaggedAction<"WebViews", action>
  | TaggedAction<"Input", Input.Action>
  | TaggedAction<"Devtools", Devtools.Action>



export type init = () =>
  [Model, Effects<Action>]

export type update = (model:Model, action:Action) =>
  [Model, Effects<Action>]

export type view = (model:Model, address:Address<Action>, children:Array<VirtualTree>) =>
  VirtualTree
