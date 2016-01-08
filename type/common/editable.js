/* @flow */

import type {Effects} from "reflex/type/effects"

export type Direction
  = "forward"
  | "backward"
  | "none"

export type Selection = {
  start: number,
  end: number,
  direction: Direction
}

export type Editable = {
  selection: ?Selection,
  value: string
}

export type Model = Editable

export type Clear = {
  type: "Clear",
}

export type SelectType = {
  type: "Select",
  range: Selection
}

export type Select = (range:Selection) => SelectType

export type ChangeType = {
  type: "Change",
  value: string,
  selection: Selection
}

export type Change = (value:string, selection:Selection) => ChangeType

export type Action
  = SelectType
  | ChangeType
  | Clear

// Define generic `Update` method type as rest of the operations will be
// concretetions over it.
export type update <model:Editable> = (model:model, action:Action) =>
  [model, Effects<Action>]
