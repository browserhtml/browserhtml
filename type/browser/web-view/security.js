/* @flow */

import type {Effects} from "reflex/type/effects"

export type Model = {
  state: string,
  secure: boolean,
  extendedValidation: boolean
};

export type LoadStart = {
  type: "LoadStart"
}

export type ChangedType = {
  type: "Changed",
  state: string,
  extendedValidation: boolean
};

export type Action
  = LoadStart
  | ChangedType

export type Changed = (state: string, extendedValidation: boolean) =>
  ChangedType;

export type init = () =>
  [Model, Effects<Action>]

export type update = (model:Model, action:Action) =>
  [Model, Effects<Action>]
