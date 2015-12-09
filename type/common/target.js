/* @flow */

export type Model = {
  isPointerOver: boolean
}

export type Over = {
  type: "Target.Over"
}

export type Out = {
  type: "Target.Out"
}

export type Action
  = Over
  | Out

export type Target <model>
  = Model
  & model


export type asOver = () => Over
export type asOut = () => Out

export type over <model> = (model:Target<model>) => Target<model>
export type out <model> = (model:Target<model>) => Target<model>
export type update <model> = (model:Target<model>, action:Action) => Target<model>
