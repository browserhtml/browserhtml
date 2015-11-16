/* @flow */

import * as Focusable from "../common/focusable"
import * as Target from "../common/target"

export type Model
  = Focusable.Model
  // Shell is a Target because it keeps track of Window Control hover state.
  // @TODO we may want to break window control state out into its own field.
  & Target.Model

// Workaround for facebook/flow#957
// Flow fails on union of unions there for we manually unpack
// Each union instead of using Focusable.Action | Target.Action

export type Action
  = Focusable.Focus | Focusable.Blur | Focusable.FocusRequest
  | Target.Over | Target.Out

export type update = (model:Model, action:Action) => Model
