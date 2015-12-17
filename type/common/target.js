/* @flow */

import {Effects} from "reflex/type/effects"

export type Model = {
  isPointerOver: boolean
}

export type Over = {type: "Over"}
export type Out = {type: "Out"}
export type Action
  = Over
  | Out

export type update <model:Model> = (model:model, action:Action) =>
  [model, Effects<Action>]
