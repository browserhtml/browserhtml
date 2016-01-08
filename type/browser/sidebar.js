/* @flow */

import type {Effects} from "reflex/type/effects"
import type {Address, VirtualTree} from "reflex/type"
import type {ID} from "../common/prelude"
import * as Toolbar from "./sidebar/toolbar"
import * as Stopwatch from "../common/stopwatch"
import * as Tabs from "./sidebar/tabs"

type Display =
  { angle: number
  , x: number
  }

export type Model =
  { isAttached: boolean
  , isOpen: boolean
  , toolbar: Toolbar.Model
  , animation: Stopwatch.Model
  , display: Display
  }

export type Attach =
  { type: "Attach"
  }

export type Detach =
  { type: "Detach"
  }

export type Open =
  { type: "Open"
  }

export type Close =
  { type: "Close"
  }

export type Select =
  { type: "Select"
  }

export type Activate =
  { type: "Activate"
  }

export type CloseTab = (id:ID) =>
  CloseTabAction

type CloseTabAction =
  { type: "CloseTab"
  , id:ID
  }

export type SelectTab = (id:ID) =>
  SelectTabAction
type SelectTabAction =
  { type: "SelectTab"
  , id: ID
  };

export type ActivateTab = (id:ID) =>
  ActivateTabAction
type ActivateTabAction =
  { type: "ActivateTab"
  , id: ID
  }

type ToolbarAction =
  { type: "Toolbar"
  , action: Toolbar.Action
  }

type TabsAction =
  { type: "Tabs"
  , action: Tabs.Action
  }

type AnimationAction =
  { type: "Animation"
  , action: Stopwatch.Action
  }

export type AnimationEnd =
  { type: "AnimationEnd"
  }

export type Action
  = Attach
  | Detach
  | Open
  | Close
  | Select
  | Activate
  | CloseTabAction
  | SelectTabAction
  | ActivateTabAction
  | ToolbarAction
  | TabsAction
  | AnimationAction
  | AnimationEnd

export type init = () =>
  [Model, Effects<Action>]

export type update = (model:Model, action:Action) =>
  [Model, Effects<Action>]

export type view = (model:Model, address:Address<Action>) =>
  VirtualTree
