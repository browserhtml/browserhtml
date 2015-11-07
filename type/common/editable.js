/* @flow */


export type Direction
  = "forward"
  | "backward"
  | "none"

export type Selection = {
  start: number,
  end: number,
  direction: Direction
}

export type Model = {
  selection: ?Selection,
  value: string
}

export type Clear = {
  type: "Editable.Clear",
}

export type Select = {
  type: "Editable.Select",
  range: Selection
}

export type Change = {
  type: "Editable.Change",
  value: string,
  selection: Selection
}

export type Action
  = Select
  | Change
  | Clear

export type asSelect = (selection:Selection) => Select
export type asChange = (value:string, selection:Selection) => Change
export type asClear = () => Clear

// All editable models must intersect with `Model` type.
export type Editable <model>
  = Model
  & model

// Define generic `Update` method type as rest of the operations will be
// concretetions over it.
export type Update <model, action> = (state:Editable<model>, action:action) => Editable<model>

export type clear <model> = (state:Editable<model>) => Editable<model>
export type select <model> = Update<model, Select>
export type change <model> = Update<model, Change>
export type update <model> = Update<model, Action>
