/* @flow */

import type {Effects} from "reflex/type/effects"

export type Model = {
  state: string,
  secure: boolean,
  extendedValidation: boolean
};

export type Changed = {
  type: "WebView.Security.Changed",
  state: string,
  extendedValidation: boolean
};

export type Action = Changed;

export type asChanged = (state: string, extendedValidation: boolean) => Changed;

export type initial = Model;
export type update = (model:Model, action:Action) => Model;
export type step = (model:Model, action:Action) => [Model, Effects<Action>];
