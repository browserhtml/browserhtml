/* @flow */

import type {Effects, Never} from "reflex/type/effects";
import type {Task} from "reflex";

export type Warned = {type: "Warned"}
export type Logged = {type: "Logged"}
export type Errored = {type: "Errored"}

export type warn = Task<Never, Warned>
export type log = Task<Never, Logged>
export type error = Task<Never, Errored>

export type Action
  = Warned
  | Logged
  | Errored

export type update <model, action> = (model:model, action:action) =>
  [model, Effects<action>]
