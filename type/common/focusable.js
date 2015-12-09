/* @flow */

export type Model = {
  isFocused: boolean
}


export type FocusRequest = {
  type: "Focusable.FocusRequest"
}

export type Focus = {
  type: "Focusable.Focus"
}

export type Blur = {
  type: "Focusable.Blur"
}

export type Action
  = FocusRequest
  | Focus
  | Blur

export type Focusable <model>
  = Model
  & model

export type asFocus = () => Focus
export type asBlur = () => Blur
export type asFocusRequest = () => FocusRequest

export type focus <model> = (state:Focusable<model>) => Focusable<model>
export type blur <model> = (state:Focusable<model>) => Focusable<model>
export type update <model> = (state:Focusable<model>, action:Action) => Focusable<model>
