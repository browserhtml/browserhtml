/* @flow */

import type {Address, Task} from "reflex/type"
import type {Effects, Never} from "reflex/type/effects"
import type {Result} from "../common/result"

export type Name = string
export type Value
  = number
  | boolean
  | string
  | void


export type Settings =
  { [key:Name]: Value
  }

export type Model = ?Settings

export type ResultSettings =
  Result<Error, Settings>

export type FetchedAction =
  { type: "Fetched"
  , result: ResultSettings
  }

export type UpdatedAction =
  { type: "Updated"
  , result: ResultSettings
  }

export type ChangedAction =
  { type: "Changed"
  , result: ResultSettings
  }

export type Action
  = FetchedAction
  | UpdatedAction
  | ChangedAction

export type Fetched = (result:ResultSettings) =>
  FetchedAction
export type Updated = (result:ResultSettings) =>
  UpdatedAction
export type Changed = (result:ResultSettings) =>
  ChangedAction

export type fetch = (names:Array<Name>) =>
  Task<Never, ResultSettings>
export type change = (settings:Settings) =>
  Task<Never, ResultSettings>
export type observe = (namePattern:string) =>
  Task<Never, ResultSettings>

export type init = (names:Array<Name>) =>
  [Model, Effects<Action>]

export type update = (model:Model, action:Action) =>
  [Model, Effects<Action>]
