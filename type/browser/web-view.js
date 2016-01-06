/* @flow */

import type {Address, VirtualTree, Effects} from "reflex/type"
import type {ID, URI, Time} from "../common/prelude"

import * as Shell from "./web-view/shell"
import * as Progress from "./web-view/progress"
import * as Navigation from "./web-view/navigation"
import * as Security from "./web-view/security"
import * as Page from "./web-view/page"
import * as Rotation from "./web-view/rotation"
import * as Stopwatch from "../common/stopwatch"


export type Activate =
  { type: "Activate" }

export type Activated =
  { type: "Activated" }

export type Deactivate =
  { type: "Deactivate" }

export type Deactivated =
  { type: "Deactivated" }

export type Close =
  { type: "Close" }

export type Closed =
  { type: "Closed" }

export type Select =
  { type: "Select" }

export type Unselect =
  { type: "Unselect" }

export type Selected =
  { type: "Selected" }

export type Unselected =
  { type: "Unselected" }

export type Edit =
  { type: "Edit" }

export type ShowTabs =
  { type: "ShowTabs" }

export type Create =
  { type: "Create" }

export type Focus =
  { type: "Focus" }

type LoadAction =
  { type: "Load"
  , uri: URI
  }
export type Load = (uri:URI) =>
  LoadAction

type LoadStartAction =
  { type: "LoadStart"
  , time: Time
  }
export type LoadStart = (time:Time) =>
  LoadStartAction

type LoadEndAction =
  { type: "LoadEnd"
  , time: Time
  }

export type LoadEnd = (time:Time) =>
  LoadEndAction

type LocationChangedAction =
  { type: "LocationChanged"
  , uri: URI
  , time: Time
  }

export type LocationChanged = (uri:URI, time:Time) =>
  LocationChangedAction


type OpenSyncWithMyIFrameOptions
  = { frameElement: any }
  & NewWebViewOptions

type OpenSyncWithMyIFrameAction =
  { type: "Open!WithMyIFrameAndInTheCurrentTick"
  , options: OpenSyncWithMyIFrameOptions
  }


export type OpenSyncWithMyIFrame = (options:OpenSyncWithMyIFrameOptions) =>
  OpenSyncWithMyIFrameAction


type ContextMenuAction =
  { type: "ContextMenu"
  , detail: any
  }
export type ContextMenu = (detail:any) =>
  ContextMenuAction


type ModalPromptAction =
  { type: "ModalPrompt"
  , detail: any
  }
export type ModalPrompt = (detail:any) =>
  ModalPromptAction

type ErrorAction = {type: "Error", detail: any}
export type ReportError = (detail:any) =>
  ErrorAction

type AuthentificateAction =
  { type: "Authentificate"
  , detail: any
  }

export type Authentificate = (detail:any) =>
  AuthentificateAction

export type ShellAction <action> =
  { type: "Shell"
  , action: action
  }

export type ZoomIn = ShellAction<Shell.ZoomIn>
export type ZoomOut = ShellAction<Shell.ZoomOut>
export type ResetZoom = ShellAction<Shell.ResetZoom>
export type MakeVisibile = ShellAction<Shell.MakeVisible>
export type MakeNotVisible = ShellAction<Shell.MakeNotVisible>


export type NavigationAction <action> =
  { type: "Navigation"
  , action: action
  }
export type Stop = NavigationAction<Navigation.Stop>
export type Reload = NavigationAction<Navigation.Reload>
export type GoBack = NavigationAction<Navigation.GoBack>
export type GoForward = NavigationAction<Navigation.GoForward>

export type SecurityAction <action> =
  { type: "Security"
  , action: action
  }

export type PageAction <action> =
  { type: "Page"
  , action: action
  }

export type ProgressAction <action> =
  { type: "Progress"
  , action: action
  }


export type Display =
  { opacity: number }

export type Model =
  { id: ID
  , name: string
  , features: string
  , isSelected: boolean
  , isActive: boolean
  , shell: Shell.Model
  , navigation: Navigation.Model
  , security: Security.Model
  , page: Page.Model
  , progress: ?Progress.Model
  , display: Display
  , animation: Stopwatch.Model
  }

export type NewWebViewOptions =
  { uri: URI
  , inBackground: boolean
  , name: string
  , features: string
  }

export type AnimationAction <action> =
  { type: "Animation"
  , action: action
  }



export type Action
  = Select | Selected
  | Unselect | Unselected
  | Activate | Activated
  | Deactivate | Deactivated
  | Close | Closed
  | ShowTabs
  | Focus
  | OpenSyncWithMyIFrameAction
  | ModalPromptAction
  | ContextMenuAction
  | AuthentificateAction
  | ErrorAction
  | ProgressAction<Progress.Action>
  | ShellAction<Shell.Action>
  | NavigationAction<Navigation.Action>
  | SecurityAction<Security.Action>
  | PageAction<Page.Action>
  | AnimationAction<Stopwatch.Action>


export type readTitle = (model:Model, fallback: string) =>
  string

export type readFaviconURI = (model:Model) =>
  URI

export type isDark = (model:Model) =>
  boolean

export type init = (id:ID, options:NewWebViewOptions) =>
  [Model, Effects<Action>];

export type update = (model:Model, action:Action) =>
  [Model, Effects<Action>];

export type view = (model:Model, address:Address<Action>) =>
  VirtualTree
