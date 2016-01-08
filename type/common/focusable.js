/* @flow */

import type {Effects} from "reflex/type/effects"

export type Model = {
  isFocused: boolean
}

export type Focus = {
  type: "Focus"
}

export type Blur = {
  type: "Blur"
}

export type Action
  = Focus
  | Blur


export type update <model:Model> = (model:model, action:Action) =>
  [model, Effects<Action>]
