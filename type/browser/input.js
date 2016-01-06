/* @flow */

import {Effects} from "reflex/type/effects"
import {Address, VirtualTree} from "reflex/type"
import * as Editable from "../common/editable"
import * as Focusable from "../common/focusable"

export type Model
  = { isVisible: boolean
    , isFocused: boolean
    , value: string
    , selection: ?Editable.Selection
    }

export type Submit =
  { type: 'Submit'
  }

export type Abort =
  { type: 'Abort'
  }

export type Enter =
  { type: 'Enter'
  }

export type EnterSelectionAction =
  { type: 'EnterSelection'
  , value: string
  }

export type Show =
  { type: 'Show'
  }

export type Hide =
  { type: 'Hide'
  }

export type EnterSelection = (value:string) =>
  EnterSelectionAction

export type FocusableAction =
  { type: 'Focusable'
  , action: Focusable.Action
  }

export type EditableAction =
  { type: 'Editable'
  , action: Editable.Action
  }

export type Action
  = Submit
  | Abort
  | Enter
  | EnterSelection
  | Show | Hide
  | FocusableAction
  | EditableAction

export type init = (isVisible:boolean, isFocused:boolean, value?:string) =>
  [Model, Effects<Action>]

export type update = (model:Model, action:Action) =>
  [Model, Effects<Action>];

export type view = (model:Model, address:Address<Action>) =>
  VirtualTree
