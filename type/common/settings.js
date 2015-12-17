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


export type Settings = {
  [key:Name]:Value
}

export type Model = ?Settings


export type FetchResult =
  { type: "Fetched"
  , result: Result<Error, Settings>
  }

export type UpdateResult =
  { type: "Updated"
  , result: Result<Error, Settings>
  }

export type ChangeResult =
  { type: "Changed"
  , result: Result<Error, Settings>
  }

export type Action
  = FetchResult
  | UpdateResult
  | ChangeResult

export type Fetched = (result:Result<Error, Settings>) => FetchResult
export type Updated = (result:Result<Error, Settings>) => UpdateResult
export type Changed = (result:Result<Error, Settings>) => ChangeResult

export type fetch = (names:Array<Name>) => Task<Never, FetchResult>
export type change = (settings:Settings) => Task<Never, ChangeResult>
export type observe = (namePattern:string) => Task<Never, UpdateResult>

export type init = (names:Array<Name>) =>
  [Model, Effects<Action>]

export type update = (model:Model, action:Action) =>
  [Model, Effects<Action>]
